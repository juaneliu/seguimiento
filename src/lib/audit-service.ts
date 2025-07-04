import { PrismaClient } from '@prisma/client'
import { NextRequest } from 'next/server'

const prisma = new PrismaClient()

export interface AuditLogData {
  usuarioId: number
  accion: string
  tabla: string
  registroId?: number
  datosAnteriores?: any
  datosNuevos?: any
  direccionIP?: string
  userAgent?: string
}

export class AuditService {
  /**
   * Registra una acción de auditoría
   */
  static async registrarAccion(data: AuditLogData): Promise<void> {
    try {
      await prisma.audit_logs.create({
        data: {
          usuarioId: data.usuarioId,
          accion: data.accion,
          tabla: data.tabla,
          registroId: data.registroId,
          datosAnteriores: data.datosAnteriores,
          datosNuevos: data.datosNuevos,
          direccionIP: data.direccionIP,
          userAgent: data.userAgent,
        }
      })
    } catch (error) {
      console.error('Error al registrar log de auditoría:', error)
    }
  }

  /**
   * Registra una acción desde una Request de Next.js
   */
  static async registrarAccionDesdeRequest(
    request: NextRequest,
    usuarioId: number,
    accion: string,
    tabla: string,
    registroId?: number,
    datosAnteriores?: any,
    datosNuevos?: any
  ): Promise<void> {
    const direccionIP = request.headers.get('x-forwarded-for') || 
                       request.headers.get('x-real-ip') || 
                       'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    await this.registrarAccion({
      usuarioId,
      accion,
      tabla,
      registroId,
      datosAnteriores,
      datosNuevos,
      direccionIP,
      userAgent
    })
  }

  /**
   * Obtiene logs de auditoría con filtros
   */
  static async obtenerLogs(filtros: {
    usuarioId?: number
    tabla?: string
    accion?: string
    fechaDesde?: Date
    fechaHasta?: Date
    limite?: number
    offset?: number
  }) {
    const where: any = {}

    if (filtros.usuarioId) {
      where.usuarioId = filtros.usuarioId
    }

    if (filtros.tabla) {
      where.tabla = filtros.tabla
    }

    if (filtros.accion) {
      where.accion = filtros.accion
    }

    if (filtros.fechaDesde || filtros.fechaHasta) {
      where.fechaCreacion = {}
      if (filtros.fechaDesde) {
        where.fechaCreacion.gte = filtros.fechaDesde
      }
      if (filtros.fechaHasta) {
        where.fechaCreacion.lte = filtros.fechaHasta
      }
    }

    const logs = await prisma.audit_logs.findMany({
      where,
      include: {
        usuario: {
          select: {
            id: true,
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
      take: filtros.limite || 50,
      skip: filtros.offset || 0
    })

    const total = await prisma.audit_logs.count({ where })

    return {
      logs,
      total,
      hasMore: (filtros.offset || 0) + logs.length < total
    }
  }

  /**
   * Obtiene estadísticas de auditoría
   */
  static async obtenerEstadisticas() {
    const [
      totalLogs,
      logsPorAccion,
      logsPorTabla,
      logsRecientes
    ] = await Promise.all([
      prisma.audit_logs.count(),
      prisma.audit_logs.groupBy({
        by: ['accion'],
        _count: {
          id: true
        },
        orderBy: {
          _count: {
            id: 'desc'
          }
        }
      }),
      prisma.audit_logs.groupBy({
        by: ['tabla'],
        _count: {
          id: true
        },
        orderBy: {
          _count: {
            id: 'desc'
          }
        }
      }),
      prisma.audit_logs.count({
        where: {
          fechaCreacion: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Últimas 24 horas
          }
        }
      })
    ])

    return {
      totalLogs,
      logsPorAccion,
      logsPorTabla,
      logsRecientes
    }
  }

  /**
   * Limpia logs antiguos (opcional, para mantenimiento)
   */
  static async limpiarLogsAntiguos(diasAntiguedad: number = 90) {
    const fechaLimite = new Date(Date.now() - diasAntiguedad * 24 * 60 * 60 * 1000)
    
    const resultado = await prisma.audit_logs.deleteMany({
      where: {
        fechaCreacion: {
          lt: fechaLimite
        }
      }
    })

    return resultado.count
  }
}

// Funciones de conveniencia para acciones comunes
export const auditarCreacion = async (
  usuarioId: number,
  tabla: string,
  registroId: number,
  datosNuevos: any,
  request?: NextRequest
) => {
  if (request) {
    await AuditService.registrarAccionDesdeRequest(
      request,
      usuarioId,
      'CREAR',
      tabla,
      registroId,
      null,
      datosNuevos
    )
  } else {
    await AuditService.registrarAccion({
      usuarioId,
      accion: 'CREAR',
      tabla,
      registroId,
      datosNuevos
    })
  }
}

export const auditarActualizacion = async (
  usuarioId: number,
  tabla: string,
  registroId: number,
  datosAnteriores: any,
  datosNuevos: any,
  request?: NextRequest
) => {
  if (request) {
    await AuditService.registrarAccionDesdeRequest(
      request,
      usuarioId,
      'ACTUALIZAR',
      tabla,
      registroId,
      datosAnteriores,
      datosNuevos
    )
  } else {
    await AuditService.registrarAccion({
      usuarioId,
      accion: 'ACTUALIZAR',
      tabla,
      registroId,
      datosAnteriores,
      datosNuevos
    })
  }
}

export const auditarEliminacion = async (
  usuarioId: number,
  tabla: string,
  registroId: number,
  datosAnteriores: any,
  request?: NextRequest
) => {
  if (request) {
    await AuditService.registrarAccionDesdeRequest(
      request,
      usuarioId,
      'ELIMINAR',
      tabla,
      registroId,
      datosAnteriores,
      null
    )
  } else {
    await AuditService.registrarAccion({
      usuarioId,
      accion: 'ELIMINAR',
      tabla,
      registroId,
      datosAnteriores
    })
  }
}

export const auditarLogin = async (
  usuarioId: number,
  exitoso: boolean,
  request?: NextRequest
) => {
  if (request) {
    await AuditService.registrarAccionDesdeRequest(
      request,
      usuarioId,
      exitoso ? 'LOGIN_EXITOSO' : 'LOGIN_FALLIDO',
      'usuarios',
      usuarioId
    )
  } else {
    await AuditService.registrarAccion({
      usuarioId,
      accion: exitoso ? 'LOGIN_EXITOSO' : 'LOGIN_FALLIDO',
      tabla: 'usuarios',
      registroId: usuarioId
    })
  }
}

export const auditarLogout = async (
  usuarioId: number,
  request?: NextRequest
) => {
  if (request) {
    await AuditService.registrarAccionDesdeRequest(
      request,
      usuarioId,
      'LOGOUT',
      'usuarios',
      usuarioId
    )
  } else {
    await AuditService.registrarAccion({
      usuarioId,
      accion: 'LOGOUT',
      tabla: 'usuarios',
      registroId: usuarioId
    })
  }
}
