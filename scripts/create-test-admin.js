const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

// Configurar explícitamente la URL de la base de datos
process.env.DATABASE_URL = "postgresql://admin:SeguimientoSAEM2025@localhost:5432/tablero_estadistico_prod"

const prisma = new PrismaClient()

async function createTestAdmin() {
  try {
    // Verificar si el usuario ya existe
    const existingUser = await prisma.usuarios.findUnique({
      where: { email: 'test@saem.mx' }
    })
    
    if (existingUser) {
      console.log('Usuario test@saem.mx ya existe, eliminando...')
      await prisma.usuarios.delete({ where: { email: 'test@saem.mx' } })
    }
    
    // Crear nuevo usuario administrador
    const hashedPassword = await bcrypt.hash('test123', 10)
    
    const admin = await prisma.usuarios.create({
      data: {
        email: 'test@saem.mx',
        nombre: 'Test',
        apellido: 'Admin',
        password: hashedPassword,
        rol: 'ADMINISTRADOR',
        activo: true,
        updatedAt: new Date()
      }
    })
    
    console.log('Usuario de prueba creado:', admin.email)
    console.log('Credenciales: test@saem.mx / test123')
    
    // Verificar que la contraseña funciona
    const isValidPassword = await bcrypt.compare('test123', admin.password)
    console.log('Verificación de contraseña:', isValidPassword)
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestAdmin()
