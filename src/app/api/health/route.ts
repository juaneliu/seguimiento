import { NextRequest, NextResponse } from 'next/server'

/**
 * Health Check endpoint para monitoreo
 * Este endpoint se usa para verificar que la aplicación está funcionando correctamente
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar conexión a base de datos (opcional)
    // Aquí podrías agregar checks adicionales como conectividad a DB, etc.
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    }, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    console.error('Health check failed:', error)
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { 
      status: 503 
    })
  }
}
