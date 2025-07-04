// Servicio de auditoría simplificado
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface AuditLogData {
  usuarioId: number
  accion: string
  tabla: string
  registroId?: number
  valoresAnteriores?: any
  valoresNuevos?: any
  direccionIP?: string
}

export class AuditService {
  static async registrarAccion(data: AuditLogData): Promise<void> {
    try {
      // Por ahora, solo logueamos a la consola
      console.log('📋 Audit Log:', {
        usuario: data.usuarioId,
        accion: data.accion,
        tabla: data.tabla,
        registroId: data.registroId,
        fecha: new Date().toISOString()
      })
      
      // TODO: Implementar escritura real a la base de datos cuando esté disponible
      // await prisma.auditLogs.create({ ... })
    } catch (error) {
      console.error('Error al registrar log de auditoría:', error)
    }
  }
}