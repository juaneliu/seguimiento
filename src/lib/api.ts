// Utilidades para realizar solicitudes API con protección CSRF

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

export async function apiRequest(url: string, options: RequestInit = {}): Promise<Response> {
  const csrfToken = getCsrfToken()
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
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
