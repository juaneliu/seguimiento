import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth-service'
import { AuditService } from '@/lib/audit-service'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Audit stats endpoint called...')
    
    // Obtener token del header Authorization o cookies
    const authHeader = request.headers.get('authorization')
    let token = authHeader?.replace('Bearer ', '')
    
    if (!token) {
      const cookieStore = await cookies()
      token = cookieStore.get('auth-token')?.value
    }
    
    if (!token) {
      return NextResponse.json({ error: 'Token no proporcionado' }, { status: 401 })
    }

    // Verificar autenticación
    const user = await AuthService.verifyToken(token)
    
    if (!user || !['ADMINISTRADOR', 'SEGUIMIENTO'].includes(user.rol)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    // Obtener parámetros de consulta
    const url = new URL(request.url)
    const fechaDesde = url.searchParams.get('fechaDesde') ? new Date(url.searchParams.get('fechaDesde')!) : undefined
    const fechaHasta = url.searchParams.get('fechaHasta') ? new Date(url.searchParams.get('fechaHasta')!) : undefined

    // Obtener estadísticas de auditoría (simplificadas por ahora)
    const stats = {
      totalLogs: 0,
      loginExitoso: 0,
      loginFallido: 0,
      accionesPorUsuario: [],
      accionesPorTabla: []
    }
    
    return NextResponse.json({
      success: true,
      stats
    })

  } catch (error: any) {
    console.error('❌ Audit stats error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
