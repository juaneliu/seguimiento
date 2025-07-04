// Utilidades para realizar solicitudes API con protección CSRF y autenticación JWT

function getCsrfToken(): string | null {
  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=')
    if (name === 'csrf-token') {
      return decodeURIComponent(value)
    }
  }
  return null
}

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('token')
}

export async function apiRequest(url: string, options: RequestInit = {}): Promise<Response> {
  const csrfToken = getCsrfToken()
  const authToken = getAuthToken()
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  }
  
  // Agregar token de autenticación JWT si está disponible
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`
  }
  
  // Agregar token CSRF para solicitudes que modifican estado
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(options.method?.toUpperCase() || 'GET')) {
    if (csrfToken) {
      headers['x-csrf-token'] = csrfToken
    }
  }
  
  return fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Incluir cookies en las peticiones
  })
}

// Funciones específicas para diferentes métodos HTTP
export const apiGet = (url: string, options: RequestInit = {}) => 
  apiRequest(url, { ...options, method: 'GET' })

export const apiPost = (url: string, data?: any, options: RequestInit = {}) => 
  apiRequest(url, { 
    ...options, 
    method: 'POST', 
    body: data ? JSON.stringify(data) : undefined 
  })

export const apiPut = (url: string, data?: any, options: RequestInit = {}) => 
  apiRequest(url, { 
    ...options, 
    method: 'PUT', 
    body: data ? JSON.stringify(data) : undefined 
  })

export const apiDelete = (url: string, options: RequestInit = {}) => 
  apiRequest(url, { ...options, method: 'DELETE' })

export const apiPatch = (url: string, data?: any, options: RequestInit = {}) => 
  apiRequest(url, { 
    ...options, 
    method: 'PATCH', 
    body: data ? JSON.stringify(data) : undefined 
  })
