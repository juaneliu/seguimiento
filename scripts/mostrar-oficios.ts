import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function mostrarOficios() {
  try {
    console.log('📋 Oficios de seguimiento en la base de datos:\n')
    
    const oficios = await prisma.oficios_seguimiento.findMany({
      include: {
        ente: {
          select: {
            nombre: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    oficios.forEach((oficio, index) => {
      console.log(`${index + 1}. ID: ${oficio.id}`)
      console.log(`   Título: "${oficio.titulo}"`)
      console.log(`   Ente: ${oficio.ente.nombre}`)
      console.log(`   Sistema: ${oficio.sistema}`)
      console.log(`   Creado: ${oficio.createdAt}`)
      console.log(`   ---`)
    })
    
    console.log(`\n📊 Total: ${oficios.length} oficios`)
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

mostrarOficios()
