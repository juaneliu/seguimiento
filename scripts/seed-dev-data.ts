import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedBasicData() {
  try {
    console.log('🌱 Iniciando carga de datos básicos...')

    // Crear algunos entes públicos de ejemplo
    const entesPublicos = await prisma.entePublico.createMany({
      data: [
        {
          nombre: 'Municipio de Cuernavaca',
          ambitoGobierno: 'Municipal',
          poderGobierno: 'Ejecutivo',
          municipio: 'Cuernavaca',
          entidad: { estado: 'Morelos', region: 'Centro' },
          controlOIC: true,
          sistema1: true,
          sistema2: true
        },
        {
          nombre: 'Municipio de Temixco',
          ambitoGobierno: 'Municipal',
          poderGobierno: 'Ejecutivo',
          municipio: 'Temixco',
          entidad: { estado: 'Morelos', region: 'Centro' },
          controlOIC: true,
          sistema1: true
        },
        {
          nombre: 'Municipio de Tepoztlán',
          ambitoGobierno: 'Municipal',
          poderGobierno: 'Ejecutivo',
          municipio: 'Tepoztlán',
          entidad: { estado: 'Morelos', region: 'Norte' },
          controlOIC: false,
          sistema2: true
        }
      ]
    })

    console.log(`✅ ${entesPublicos.count} entes públicos creados`)

    // Crear algunos diagnósticos municipales de ejemplo
    const diagnosticos = await prisma.diagnosticoMunicipal.createMany({
      data: [
        {
          nombreActividad: 'Diagnóstico de Transparencia Municipal',
          municipio: 'Cuernavaca',
          actividad: 'Diagnóstico',
          solicitudUrl: 'https://example.com/solicitud1',
          respuestaUrl: 'https://example.com/respuesta1',
          unidadAdministrativa: 'Dirección de Administración',
          evaluacion: 85,
          observaciones: 'Buen nivel de cumplimiento',
          acciones: [{
            id: 'action1',
            descripcion: 'Revisar portal de transparencia',
            completada: true,
            fechaLimite: '2025-07-01'
          }],
          estado: 'Completado'
        },
        {
          nombreActividad: 'Indicador de Participación Ciudadana',
          municipio: 'Temixco',
          actividad: 'Indicador',
          solicitudUrl: 'https://example.com/solicitud2',
          unidadAdministrativa: 'Dirección de Participación Social',
          evaluacion: 70,
          observaciones: 'Cumplimiento regular',
          acciones: [{
            id: 'action2',
            descripcion: 'Mejorar mecanismos de participación',
            completada: false,
            fechaLimite: '2025-07-15'
          }],
          estado: 'En Proceso'
        }
      ]
    })

    console.log(`✅ ${diagnosticos.count} diagnósticos municipales creados`)

    // Crear algunos diagnósticos adicionales para diferentes municipios
    const diagnosticosAdicionales = await prisma.diagnosticoMunicipal.createMany({
      data: [
        {
          nombreActividad: 'Evaluación de Gestión Pública',
          municipio: 'Yautepec',
          actividad: 'Evaluación',
          solicitudUrl: 'https://example.com/solicitud3',
          respuestaUrl: 'https://example.com/respuesta3',
          unidadAdministrativa: 'Dirección de Gestión Pública',
          evaluacion: 78,
          observaciones: 'Gestión pública con oportunidades de mejora',
          acciones: [{
            id: 'action3',
            descripcion: 'Implementar sistema de seguimiento',
            completada: false,
            fechaLimite: '2025-08-15'
          }, {
            id: 'action4',
            descripcion: 'Capacitar al personal',
            completada: true,
            fechaLimite: '2025-06-30'
          }],
          estado: 'En Proceso'
        },
        {
          nombreActividad: 'Diagnóstico de Servicios Públicos',
          municipio: 'Jiutepec',
          actividad: 'Diagnóstico',
          solicitudUrl: 'https://example.com/solicitud4',
          unidadAdministrativa: 'Dirección de Servicios Públicos',
          evaluacion: 92,
          observaciones: 'Excelente calidad en servicios públicos',
          acciones: [{
            id: 'action5',
            descripcion: 'Mantener estándares de calidad',
            completada: true,
            fechaLimite: '2025-07-01'
          }],
          estado: 'Completado'
        },
        {
          nombreActividad: 'Indicador de Eficiencia Operativa',
          municipio: 'Cuautla',
          actividad: 'Indicador',
          solicitudUrl: 'https://example.com/solicitud5',
          unidadAdministrativa: 'Dirección de Operaciones',
          evaluacion: 65,
          observaciones: 'Eficiencia operativa requiere atención',
          acciones: [{
            id: 'action6',
            descripcion: 'Optimizar procesos operativos',
            completada: false,
            fechaLimite: '2025-09-01'
          }, {
            id: 'action7',
            descripcion: 'Implementar indicadores de gestión',
            completada: false,
            fechaLimite: '2025-08-30'
          }],
          estado: 'En Proceso'
        },
        {
          nombreActividad: 'Evaluación de Transparencia Activa',
          municipio: 'Temixco',
          actividad: 'Evaluación',
          solicitudUrl: 'https://example.com/solicitud6',
          respuestaUrl: 'https://example.com/respuesta6',
          unidadAdministrativa: 'Unidad de Transparencia',
          evaluacion: 88,
          observaciones: 'Buen nivel de transparencia activa',
          acciones: [{
            id: 'action8',
            descripcion: 'Actualizar portal de transparencia',
            completada: true,
            fechaLimite: '2025-06-15'
          }],
          estado: 'Completado'
        }
      ]
    })

    console.log(`✅ ${diagnosticosAdicionales.count} diagnósticos adicionales creados`)

    console.log('🎉 Datos básicos cargados exitosamente!')

  } catch (error) {
    console.error('❌ Error cargando datos básicos:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedBasicData()
