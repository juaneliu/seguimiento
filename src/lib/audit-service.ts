// Servicio de auditoría funcional
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
      console.log('📋 Registrando Audit Log:', {
        usuario: data.usuarioId,
        accion: data.accion,
        tabla: data.tabla,
        registroId: data.registroId,
        fecha: new Date().toISOString()
      })
      
      // Escribir a la base de datos
      await prisma.auditLogs.create({
        data: {
          usuarioId: data.usuarioId,
          accion: data.accion,
          tabla: data.tabla,
          registroId: data.registroId,
          valoresAnteriores: data.valoresAnteriores || undefined,
          valoresNuevos: data.valoresNuevos || undefined,
          direccionIP: data.direccionIP || '127.0.0.1'
        }
      })
      
      console.log('✅ Audit Log registrado exitosamente')
    } catch (error) {
      console.error('❌ Error al registrar log de auditoría:', error)
    }
  }
}