import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth-service'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Audit logs endpoint called...')
    
    const authHeader = request.headers.get('authorization')
    let token = authHeader?.replace('Bearer ', '')
    
    if (!token) {
      const cookieStore = await cookies()
      token = cookieStore.get('auth-token')?.value
    }
    
    if (!token) {
      return NextResponse.json({ error: 'Token no proporcionado' }, { status: 401 })
    }

    const user = await AuthService.verifyToken(token)
    
    if (!user || !['ADMINISTRADOR', 'SEGUIMIENTO'].includes(user.rol)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const mockLogs = [
      {
        id: 1,
        usuarioId: user.id,
        accion: 'LOGIN_EXITOSO',
        tabla: 'usuarios',
        registroId: user.id,
        direccionIP: request.headers.get('x-forwarded-for') || 'unknown',
        fechaCreacion: new Date(),
        usuario: {
          nombre: user.nombre,
          apellido: user.apellido,
          email: user.email,
          rol: user.rol
        }
      },
      {
        id: 2,
        usuarioId: user.id,
        accion: 'ACCEDER_AUDITORIA',
        tabla: 'sistema',
        registroId: null,
        direccionIP: request.headers.get('x-forwarded-for') || 'unknown',
        fechaCreacion: new Date(Date.now() - 900000),
        usuario: {
          nombre: user.nombre,
          apellido: user.apellido,
          email: user.email,
          rol: user.rol
        }
      }
    ]
    
    return NextResponse.json({
      success: true,
      logs: mockLogs,
      total: mockLogs.length
    })

  } catch (error: any) {
    console.error('❌ Audit logs error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
