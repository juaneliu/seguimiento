import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function showDatabaseStats() {
  try {
    console.log('📊 ESTADÍSTICAS DE LA BASE DE DATOS SAEM')
    console.log('=' .repeat(50))
    
    // Usuarios
    const usuarios = await prisma.usuarios.findMany()
    console.log(`\n👥 USUARIOS (${usuarios.length} registros):`)
    usuarios.forEach(user => {
      console.log(`  - ${user.nombre} ${user.apellido} (${user.email}) - Rol: ${user.rol} - Activo: ${user.activo}`)
    })
    
    // Entes Públicos
    const entes = await prisma.entes_publicos.findMany()
    console.log(`\n🏛️  ENTES PÚBLICOS (${entes.length} registros):`)
    
    // Agrupar por poder de gobierno
    const entesPorPoder = entes.reduce((acc: any, ente) => {
      acc[ente.poderGobierno] = (acc[ente.poderGobierno] || 0) + 1
      return acc
    }, {})
    
    Object.entries(entesPorPoder).forEach(([poder, count]) => {
      console.log(`  - ${poder}: ${count} entes`)
    })
    
    // Directorio OIC
    const directorioOIC = await prisma.directorio_oic.findMany()
    console.log(`\n📋 DIRECTORIO OIC (${directorioOIC.length} registros):`)
    directorioOIC.slice(0, 5).forEach(oic => {
      console.log(`  - ${oic.nombre} (${oic.puesto}) - ${oic.oicNombre}`)
    })
    if (directorioOIC.length > 5) {
      console.log(`  ... y ${directorioOIC.length - 5} más`)
    }
    
    // Diagnósticos Municipales
    const diagnosticos = await prisma.diagnosticos_municipales.findMany()
    console.log(`\n🏘️  DIAGNÓSTICOS MUNICIPALES (${diagnosticos.length} registros):`)
    
    // Agrupar por estado
    const diagnosticosPorEstado = diagnosticos.reduce((acc: any, diag) => {
      acc[diag.estado] = (acc[diag.estado] || 0) + 1
      return acc
    }, {})
    
    Object.entries(diagnosticosPorEstado).forEach(([estado, count]) => {
      console.log(`  - ${estado}: ${count} diagnósticos`)
    })
    
    // Agrupar por municipio
    const diagnosticosPorMunicipio = diagnosticos.reduce((acc: any, diag) => {
      acc[diag.municipio] = (acc[diag.municipio] || 0) + 1
      return acc
    }, {})
    
    console.log(`\n📍 Diagnósticos municipales por municipio (top 10):`)
    Object.entries(diagnosticosPorMunicipio)
      .sort(([,a]: any, [,b]: any) => b - a)
      .slice(0, 10)
      .forEach(([municipio, count]) => {
        console.log(`  - ${municipio}: ${count} diagnósticos`)
      })

    // Diagnósticos de Entes
    const diagnosticosEntes = await prisma.diagnosticos_entes.findMany()
    console.log(`\n🏛️  DIAGNÓSTICOS DE ENTES (${diagnosticosEntes.length} registros):`)
    
    // Agrupar por estado
    const diagnosticosEntesPorEstado = diagnosticosEntes.reduce((acc: any, diag) => {
      acc[diag.estado] = (acc[diag.estado] || 0) + 1
      return acc
    }, {})
    
    Object.entries(diagnosticosEntesPorEstado).forEach(([estado, count]) => {
      console.log(`  - ${estado}: ${count} diagnósticos`)
    })
    
    // Agrupar por ente
    const diagnosticosPorEnte = diagnosticosEntes.reduce((acc: any, diag) => {
      acc[diag.entePublico] = (acc[diag.entePublico] || 0) + 1
      return acc
    }, {})
    
    console.log(`\n🏢 Diagnósticos de entes por ente (top 10):`)
    Object.entries(diagnosticosPorEnte)
      .sort(([,a]: any, [,b]: any) => b - a)
      .slice(0, 10)
      .forEach(([ente, count]) => {
        console.log(`  - ${ente}: ${count} diagnósticos`)
      })
    
    // Acuerdos de Seguimiento
    const acuerdos = await prisma.acuerdos_seguimiento.findMany()
    console.log(`\n📝 ACUERDOS DE SEGUIMIENTO (${acuerdos.length} registros):`)
    
    // Agrupar por estado
    const acuerdosPorEstado = acuerdos.reduce((acc: any, acuerdo) => {
      acc[acuerdo.estado] = (acc[acuerdo.estado] || 0) + 1
      return acc
    }, {})
    
    Object.entries(acuerdosPorEstado).forEach(([estado, count]) => {
      console.log(`  - ${estado}: ${count} acuerdos`)
    })
    
    // Seguimientos
    const seguimientos = await prisma.seguimientos.findMany()
    console.log(`\n🔍 SEGUIMIENTOS (${seguimientos.length} registros)`)
    
    // Logs de Auditoría
    const auditLogs = await prisma.auditLogs.findMany()
    console.log(`\n📜 LOGS DE AUDITORÍA (${auditLogs.length} registros)`)
    
    console.log('\n' + '='.repeat(50))
    console.log('✅ Consulta completada exitosamente')
    
  } catch (error) {
    console.error('❌ Error al consultar la base de datos:', error)
  } finally {
    await prisma.$disconnect()
  }
}

showDatabaseStats()
