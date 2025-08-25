import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function limpiarOficiosDePrueba() {
  try {
    console.log('🧹 Eliminando oficios de prueba...\n')
    
    // Eliminar oficios que contienen "Invitación de interconexión"
    const invitaciones = await prisma.oficios_seguimiento.deleteMany({
      where: {
        titulo: {
          contains: 'Invitación de interconexión'
        }
      }
    })
    console.log(`✅ Eliminadas ${invitaciones.count} invitaciones de interconexión`)
    
    // Eliminar oficios que contienen "Notificación de Cumplimiento"
    const notificaciones = await prisma.oficios_seguimiento.deleteMany({
      where: {
        titulo: {
          contains: 'Notificación de Cumplimiento'
        }
      }
    })
    console.log(`✅ Eliminadas ${notificaciones.count} notificaciones de cumplimiento`)
    
    // Mostrar oficios restantes
    const oficiosRestantes = await prisma.oficios_seguimiento.count()
    console.log(`\n📊 Oficios restantes en la base de datos: ${oficiosRestantes}`)
    
    console.log('\n🎉 Limpieza de oficios de prueba completada')
    
  } catch (error) {
    console.error('❌ Error durante la limpieza:', error)
  } finally {
    await prisma.$disconnect()
  }
}

limpiarOficiosDePrueba()
