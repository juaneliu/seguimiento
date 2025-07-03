import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rate limiting store (en producción usar Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Configuración de rate limiting por ruta
const RATE_LIMITS = {
  '/api/auth/login': { requests: 5, window: 15 * 60 * 1000 }, // 5 intentos por 15 minutos
  '/api/users': { requests: 30, window: 60 * 1000 }, // 30 requests por minuto
  '/api/diagnosticos': { requests: 50, window: 60 * 1000 }, // 50 requests por minuto
  '/api/directorio-oic': { requests: 50, window: 60 * 1000 },
  '/api/entes': { requests: 50, window: 60 * 1000 },
  default: { requests: 100, window: 60 * 1000 } // Default: 100 requests por minuto
}

// Lista de IPs bloqueadas (en producción usar base de datos)
const BLOCKED_IPS = new Set<string>()

// Limpiar IPs locales que pudieron ser bloqueadas por error
if (BLOCKED_IPS.has('::1')) BLOCKED_IPS.delete('::1')
if (BLOCKED_IPS.has('127.0.0.1')) BLOCKED_IPS.delete('127.0.0.1')

// Limpieza automática de IPs bloqueadas en desarrollo
if (process.env.NODE_ENV !== 'production') {
  BLOCKED_IPS.clear();
}

// User agents sospechosos
const SUSPICIOUS_USER_AGENTS = [
  'curl',
  'wget',
  'python-requests',
  'bot',
  'crawler',
  'spider'
]

// Configuración de seguridad adicional
const CSRF_HEADER = 'x-csrf-token'
const CSRF_COOKIE = 'csrf-token'
const HONEYPOT_PATHS = [
  '/admin',
  '/wp-admin',
  '/wp-login.php',
  '/.env',
  '/config.php',
  '/phpinfo.php'
]

// Store para tracking de intentos de ataque
const securityEventStore = new Map<string, { 
  events: string[]
  lastEvent: number
  count: number
}>()

function getRealIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const xClientIP = request.headers.get('x-client-ip')
  
  if (forwarded && typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP && typeof realIP === 'string') {
    return realIP
  }
  
  if (xClientIP && typeof xClientIP === 'string') {
    return xClientIP
  }
  
  // Fallback para desarrollo local
  return '127.0.0.1'
}

function getRateLimit(pathname: string) {
  // Buscar rate limit específico para la ruta
  for (const [route, limit] of Object.entries(RATE_LIMITS)) {
    if (route !== 'default' && pathname.startsWith(route)) {
      return limit
    }
  }
  return RATE_LIMITS.default
}

function isRateLimited(ip: string, pathname: string): boolean {
  const limit = getRateLimit(pathname)
  const key = `${ip}:${pathname}`
  const now = Date.now()
  
  const current = rateLimitStore.get(key)
  
  if (!current || now > current.resetTime) {
    // Primera request o ventana expirada
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + limit.window
    })
    return false
  }
  
  if (current.count >= limit.requests) {
    return true
  }
  
  // Incrementar contador
  current.count++
  rateLimitStore.set(key, current)
  return false
}

function isSuspiciousUserAgent(userAgent: string): boolean {
  // En desarrollo, permitir todos los user agents
  if (process.env.NODE_ENV === 'development') {
    return false
  }
  
  const agent = userAgent.toLowerCase()
  return SUSPICIOUS_USER_AGENTS.some(suspicious => agent.includes(suspicious))
}

function validateRequest(request: NextRequest): { valid: boolean; reason?: string } {
  const userAgent = request.headers.get('user-agent') || ''
  const referer = request.headers.get('referer')
  const origin = request.headers.get('origin')
  const url = new URL(request.url)
  
  // Verificar User-Agent sospechoso
  if (isSuspiciousUserAgent(userAgent)) {
    return { valid: false, reason: 'Suspicious user agent' }
  }
  
  // Validar métodos HTTP
  if (!['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'].includes(request.method)) {
    return { valid: false, reason: 'Invalid HTTP method' }
  }
  
  // Validar Content-Type para requests con body
  if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
    const contentType = request.headers.get('content-type')
    if (contentType && !contentType.includes('application/json') && 
        !contentType.includes('application/x-www-form-urlencoded') &&
        !contentType.includes('multipart/form-data')) {
      return { valid: false, reason: 'Invalid content type' }
    }
  }
  
  // Validar rutas de API (menos estricto para navegadores)
  if (url.pathname.startsWith('/api/')) {
    // Solo verificar Accept header para requests explícitos, no para navegadores
    const userAgent = request.headers.get('user-agent') || ''
    const isApiClient = userAgent.includes('fetch') || 
                       userAgent.includes('axios') || 
                       userAgent.includes('XMLHttpRequest') ||
                       request.headers.get('x-requested-with') === 'XMLHttpRequest'
    
    if (isApiClient && !request.headers.get('accept')?.includes('application/json') && 
        request.method !== 'OPTIONS') {
      return { valid: false, reason: 'API requests must accept JSON' }
    }
  }
  
  // Validar tamaño de URL (prevenir ataques de URL largos)
  if (request.url.length > 2048) {
    return { valid: false, reason: 'URL too long' }
  }
  
  // Validar solo URLs con parámetros o contenido que pueda ser malicioso
  const hasQueryParams = url.search.length > 0
  const hasFragment = url.hash.length > 0
  
  if (hasQueryParams || hasFragment) {
    const dangerousPatterns = [
      /<script[^>]*>/i,
      /javascript:/i,
      /data:text\/html/i,
      /vbscript:/i,
      /\.\.\/\.\.\//,  // Path traversal específico (../../)
      /\.\.%2f\.\.%2f/i,
      /%00/,
      /%2e%2e%2f%2e%2e/i,
      /eval\(/i,
      /expression\(/i,
      /onload=/i,
      /onerror=/i,
      /alert\(/i,
      /confirm\(/i
    ]
    
    const urlToCheck = decodeURIComponent(request.url)
    if (dangerousPatterns.some(pattern => pattern.test(urlToCheck))) {
      return { valid: false, reason: 'Potentially malicious URL' }
    }
  }
  
  // Para requests POST/PUT/DELETE, verificar origen
  if (['POST', 'PUT', 'DELETE'].includes(request.method)) {
    const url = new URL(request.url)
    const allowedOrigins = [
      url.origin,
      'http://localhost:3000',
      'https://localhost:3000',
      'http://localhost:3001',
      'https://localhost:3001',
      'http://192.168.1.132:3000',
      'https://192.168.1.132:3000',
      'http://192.168.1.132:3001',
      'https://192.168.1.132:3001',
      'http://192.168.1.131:3000',
      'https://192.168.1.131:3000',
      'http://192.168.1.131:3001',
      'https://192.168.1.131:3001',
      'https://seguimiento.saem.gob.mx'
    ]
    
    // En desarrollo, ser más permisivo con los orígenes
    if (process.env.NODE_ENV === 'development') {
      // Permitir cualquier origen de la red local en desarrollo
      if (origin) {
        const originUrl = new URL(origin)
        const isLocalhost = originUrl.hostname === 'localhost' || originUrl.hostname === '127.0.0.1'
        const isLocalNetwork = originUrl.hostname.startsWith('192.168.') || 
                              originUrl.hostname.startsWith('10.') || 
                              originUrl.hostname.startsWith('172.')
        
        if (!isLocalhost && !isLocalNetwork && !allowedOrigins.includes(origin)) {
          return { valid: false, reason: 'Invalid origin' }
        }
      }
    } else if (origin && !allowedOrigins.includes(origin)) {
      return { valid: false, reason: 'Invalid origin' }
    }
  }
  
  return { valid: true }
}

function trackSecurityEvent(ip: string, event: string) {
  const key = ip
  const now = Date.now()
  
  const current = securityEventStore.get(key) || {
    events: [],
    lastEvent: 0,
    count: 0
  }
  
  current.events.push(`${new Date().toISOString()}: ${event}`)
  current.lastEvent = now
  current.count++
  
  // Mantener solo los últimos 10 eventos
  if (current.events.length > 10) {
    current.events = current.events.slice(-10)
  }
  
  securityEventStore.set(key, current)
  
  // Auto-bloquear IPs con demasiados eventos de seguridad
  if (current.count > 5) {
    BLOCKED_IPS.add(ip)
    console.warn(`🚨 [Security] IP ${ip} blocked due to multiple security events`)
  }
}

function isHoneypotPath(pathname: string): boolean {
  return HONEYPOT_PATHS.some(path => pathname.includes(path))
}

function generateCSRFToken(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

function validateCSRF(request: NextRequest): boolean {
  // Solo validar CSRF para requests que modifican estado
  if (!['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
    return true
  }
  
  // Skip CSRF for login endpoint (necesita token inicial)
  if (request.nextUrl.pathname === '/api/auth/login') {
    return true
  }
  
  // Deshabilitar CSRF en desarrollo para evitar problemas
  if (process.env.NODE_ENV === 'development') {
    return true
  }
  
  const token = request.headers.get(CSRF_HEADER)
  const cookieToken = request.cookies.get(CSRF_COOKIE)?.value
  
  return !!(token && cookieToken && token === cookieToken)
}

export function middleware(request: NextRequest) {
  // Minimal middleware for debugging
  console.log(`🔒 [Middleware] ${request.method} ${request.nextUrl.pathname}`)
  
  // En desarrollo, solo pasar las requests sin restricciones
  if (process.env.NODE_ENV === 'development') {
    return NextResponse.next()
  }
  
  // En producción, ser más permisivo temporalmente para debug
  const response = NextResponse.next()
  
  // Headers básicos de seguridad
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico|icons|img).*)',
  ],
}
