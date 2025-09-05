import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth-service'
import { AuditService } from '@/lib/audit-service'
import { PrismaClient } from '@prisma/client'
import { cookies } from 'next/headers'

const prisma = new PrismaClient()

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

    // Registrar que el usuario accedió a los logs de auditoría
    await AuditService.registrarAccion({
      usuarioId: user.id,
      accion: 'ACCEDER_AUDITORIA',
      tabla: 'sistema',
      direccionIP: request.headers.get('x-forwarded-for') || '::ffff:127.0.0.1'
    })

    // Obtener parámetros de la URL
    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')

    // Consultar logs reales de la base de datos
    const logs = await prisma.auditLogs.findMany({
      include: {
        usuario: {
          select: {
            nombre: true,
            apellido: true,
            email: true,
            rol: true
          }
        }
      },
      orderBy: {
        fechaCreacion: 'desc'
      },
      take: limit,
      skip: offset
    })

    // Obtener el total de logs para paginación
    const total = await prisma.auditLogs.count()

    console.log(`✅ Retrieved ${logs.length} audit logs (total: ${total})`)
    
    return NextResponse.json({
      success: true,
      logs: logs,
      total: total,
      limit: limit,
      offset: offset
    })

  } catch (error: any) {
    console.error('❌ Audit logs error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
