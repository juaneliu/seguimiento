import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedDiagnosticosEntes() {
  console.log('🌱 Insertando datos de ejemplo para Diagnósticos de Entes...')
  
  const diagnosticosEjemplo = [
    {
      nombreActividad: 'Evaluación de Control Interno 2025',
      entePublico: 'Secretaría de Educación',
      actividad: 'Evaluación de Control Interno',
      unidadAdministrativa: 'Dirección de Auditoría Interna',
      evaluacion: 8.5,
      observaciones: 'Se requiere mejorar los procesos de documentación',
      estado: 'Completado',
      creadoPor: 'admin@saem.gob.mx'
    },
    {
      nombreActividad: 'Auditoría de Gestión Financiera',
      entePublico: 'Secretaría de Hacienda',
      actividad: 'Auditoría de Gestión',
      unidadAdministrativa: 'Órgano Interno de Control',
      evaluacion: 7.8,
      observaciones: 'Cumplimiento satisfactorio con observaciones menores',
      estado: 'En Proceso',
      creadoPor: 'admin@saem.gob.mx'
    },
    {
      nombreActividad: 'Diagnóstico de Transparencia',
      entePublico: 'Instituto de Transparencia',
      actividad: 'Evaluación de Transparencia',
      unidadAdministrativa: 'Dirección de Evaluación',
      evaluacion: 9.2,
      observaciones: 'Excelente cumplimiento de las obligaciones de transparencia',
      estado: 'Completado',
      creadoPor: 'admin@saem.gob.mx'
    },
    {
      nombreActividad: 'Revisión de Procesos Administrativos',
      entePublico: 'Secretaría de Administración',
      actividad: 'Revisión de Procesos',
      unidadAdministrativa: 'Dirección de Mejora Continua',
      evaluacion: 6.5,
      observaciones: 'Se identificaron áreas de mejora en los procesos',
      estado: 'Pendiente',
      creadoPor: 'admin@saem.gob.mx'
    },
    {
      nombreActividad: 'Evaluación de Sistemas de Información',
      entePublico: 'Instituto de Tecnología',
      actividad: 'Diagnóstico Institucional',
      unidadAdministrativa: 'Coordinación de TI',
      evaluacion: 8.0,
      observaciones: 'Sistemas actualizados y funcionando correctamente',
      estado: 'En Proceso',
      creadoPor: 'admin@saem.gob.mx'
    }
  ]

  try {
    for (const diagnostico of diagnosticosEjemplo) {
      await prisma.diagnosticos_entes.create({
        data: {
          ...diagnostico,
          fechaActualizacion: new Date()
        }
      })
    }
    
    console.log(`✅ Se insertaron ${diagnosticosEjemplo.length} diagnósticos de entes de ejemplo`)
    
    // Mostrar estadísticas
    const total = await prisma.diagnosticos_entes.count()
    const completados = await prisma.diagnosticos_entes.count({ where: { estado: 'Completado' } })
    const enProceso = await prisma.diagnosticos_entes.count({ where: { estado: 'En Proceso' } })
    const pendientes = await prisma.diagnosticos_entes.count({ where: { estado: 'Pendiente' } })
    
    console.log('\n📊 Estadísticas de Diagnósticos de Entes:')
    console.log(`  Total: ${total}`)
    console.log(`  Completados: ${completados}`)
    console.log(`  En Proceso: ${enProceso}`)
    console.log(`  Pendientes: ${pendientes}`)
    
  } catch (error) {
    console.error('❌ Error al insertar datos:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedDiagnosticosEntes()
