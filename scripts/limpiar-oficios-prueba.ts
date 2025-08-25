import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function limpiarOficiosPrueba() {
  try {
    console.log('🧹 Iniciando limpieza de oficios de prueba...')
    
    // Eliminar todos los oficios que contienen "Ejemplo" en el título
    const oficiosEliminados = await prisma.oficios_seguimiento.deleteMany({
      where: {
        titulo: {
          contains: 'Ejemplo'
        }
      }
    })
    
    console.log(`✅ Se eliminaron ${oficiosEliminados.count} oficios de prueba`)
    
    // También podemos eliminar oficios que contengan "Prueba" en el título
    const oficiosPruebaEliminados = await prisma.oficios_seguimiento.deleteMany({
      where: {
        titulo: {
          contains: 'Prueba'
        }
      }
    })
    
    console.log(`✅ Se eliminaron ${oficiosPruebaEliminados.count} oficios adicionales con "Prueba"`)
    
    // Mostrar estadísticas finales
    const totalOficios = await prisma.oficios_seguimiento.count()
    console.log(`📊 Total de oficios restantes: ${totalOficios}`)
    
    console.log('🎉 Limpieza completada exitosamente')
    
  } catch (error) {
    console.error('❌ Error durante la limpieza:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar el script
limpiarOficiosPrueba()
