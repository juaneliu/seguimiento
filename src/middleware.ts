import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Solo aplicar middleware en rutas que lo necesiten, evitar archivos estáticos
  const { pathname } = request.nextUrl
  
  // Excluir archivos estáticos y API públicas
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/public') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico' ||
    pathname.startsWith('/lib/') ||
    pathname.startsWith('/sw.js')
  ) {
    return NextResponse.next()
  }

  // Crear respuesta y agregar headers de seguridad
  const response = NextResponse.next()
  
  // Remover cualquier CSP existente y agregar el correcto
  response.headers.delete('content-security-policy')
  response.headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.amcharts.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self';")
  
  response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - lib folder (for AmCharts and other assets)
     */
    '/((?!_next/static|_next/image|favicon.ico|public|lib).*)',
  ]
}
