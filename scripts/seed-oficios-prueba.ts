import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Sembrando datos de oficios de seguimiento para pruebas...')

  // Obtener algunos entes para agregar oficios
  const entes = await prisma.entes_publicos.findMany({
    take: 5,
    where: {
      OR: [
        { sistema1: true },
        { sistema2: true },
        { sistema3: true },
        { sistema6: true }
      ]
    }
  })

  if (entes.length === 0) {
    console.log('❌ No se encontraron entes con sistemas para agregar oficios')
    return
  }

  // Datos de oficios de prueba
  const oficiosData = [
    {
      titulo: "Oficio de Seguimiento - Transparencia",
      urlPdf: "https://ejemplo.com/oficio-transparencia.pdf",
      sistema: "sistema1"
    },
    {
      titulo: "Notificación de Cumplimiento",
      urlPdf: "https://ejemplo.com/notificacion-cumplimiento.pdf",
      sistema: "sistema2"
    },
    {
      titulo: "Requerimiento Sistema 3",
      urlPdf: "https://ejemplo.com/requerimiento-s3.pdf",
      sistema: "sistema3"
    },
    {
      titulo: "Seguimiento Portal de Obligaciones",
      urlPdf: "https://ejemplo.com/seguimiento-s6.pdf",
      sistema: "sistema6"
    },
    {
      titulo: "Oficio Complementario Sistema 1",
      urlPdf: "https://ejemplo.com/oficio-complementario-s1.pdf",
      sistema: "sistema1"
    }
  ]

  let oficiosCreados = 0

  for (const ente of entes) {
    // Determinar qué sistemas tiene habilitados
    const sistemasDisponibles = []
    if (ente.sistema1) sistemasDisponibles.push('sistema1')
    if (ente.sistema2) sistemasDisponibles.push('sistema2')
    if (ente.sistema3) sistemasDisponibles.push('sistema3')
    if (ente.sistema6) sistemasDisponibles.push('sistema6')

    // Crear algunos oficios para cada sistema disponible
    for (const sistema of sistemasDisponibles) {
      const oficiosParaSistema = oficiosData.filter(o => o.sistema === sistema)
      
      for (const oficioData of oficiosParaSistema.slice(0, 2)) { // Máximo 2 oficios por sistema
        try {
          await prisma.oficios_seguimiento.create({
            data: {
              titulo: `${oficioData.titulo} - ${ente.nombre}`,
              urlPdf: oficioData.urlPdf,
              sistema: oficioData.sistema,
              enteId: ente.id!,
              fechaOficio: new Date(),
              updatedAt: new Date()
            }
          })
          oficiosCreados++
        } catch (error) {
          console.error(`Error creando oficio para ${ente.nombre}:`, error)
        }
      }
    }
  }

  console.log(`✅ Se crearon ${oficiosCreados} oficios de seguimiento de prueba`)
  
  // Mostrar resumen
  const totalOficios = await prisma.oficios_seguimiento.count()
  console.log(`📊 Total de oficios en la base de datos: ${totalOficios}`)
  
  const oficiosPorSistema = await prisma.oficios_seguimiento.groupBy({
    by: ['sistema'],
    _count: {
      id: true
    }
  })
  
  console.log('📋 Oficios por sistema:')
  oficiosPorSistema.forEach((grupo: any) => {
    console.log(`  - ${grupo.sistema.toUpperCase()}: ${grupo._count.id} oficios`)
  })
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
