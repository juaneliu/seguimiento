const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

// Configurar explícitamente la URL de la base de datos
process.env.DATABASE_URL = "postgresql://admin:SeguimientoSAEM2025@localhost:5432/tablero_estadistico_prod"

const prisma = new PrismaClient()

async function checkAndCreateAdmin() {
  try {
    // Verificar si hay usuarios administradores
    const admins = await prisma.usuarios.findMany({
      where: { rol: 'ADMINISTRADOR' }
    })
    
    console.log('Usuarios administradores encontrados:', admins.length)
    
    if (admins.length === 0) {
      console.log('No hay usuarios administradores, creando uno...')
      
      const hashedPassword = await bcrypt.hash('admin123', 10)
      
      const admin = await prisma.usuarios.create({
        data: {
          email: 'admin@saem.mx',
          nombre: 'Administrador',
          apellido: 'Sistema',
          password: hashedPassword,
          rol: 'ADMINISTRADOR',
          activo: true,
          updatedAt: new Date()
        }
      })
      
      console.log('Usuario administrador creado:', admin.email)
    } else {
      console.log('Usuarios administradores existentes:')
      admins.forEach(admin => {
        console.log(`- ${admin.email} (${admin.nombre} ${admin.apellido}) - Activo: ${admin.activo}`)
      })
    }
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkAndCreateAdmin()
