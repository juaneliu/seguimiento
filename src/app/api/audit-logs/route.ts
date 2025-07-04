import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { AuthService } from '@/lib/auth-service'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // Obtener token del header
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token no proporcionado' },
        { status: 401 }
      )
    }

    const user = await AuthService.verifyToken(token)
    
    if (!user || user.rol !== 'ADMINISTRADOR') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')

    // Por ahora, devolver datos mock hasta que implementemos completamente la auditoría
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
        accion: 'CREAR',
        tabla: 'usuarios',
        registroId: null,
        direccionIP: '192.168.1.1',
        fechaCreacion: new Date(Date.now() - 3600000),
        usuario: {
          nombre: user.nombre,
          apellido: user.apellido,
          email: user.email,
          rol: user.rol
        }
      },
      {
        id: 3,
        usuarioId: user.id,
        accion: 'ACTUALIZAR',
        tabla: 'acuerdos_seguimiento',
        registroId: 1,
        direccionIP: '192.168.1.1',
        fechaCreacion: new Date(Date.now() - 7200000),
        usuario: {
          nombre: user.nombre,
          apellido: user.apellido,
          email: user.email,
          rol: user.rol
        }
      }
    ]

    return NextResponse.json({
      logs: mockLogs.slice(offset, offset + limit),
      total: mockLogs.length,
      hasMore: offset + limit < mockLogs.length
    })

  } catch (error) {
    console.error('Error al obtener logs de auditoría:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
