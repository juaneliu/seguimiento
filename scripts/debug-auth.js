const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function debugAuth() {
  try {
    // Verificar usuario admin
    const admin = await prisma.usuarios.findUnique({
      where: { email: 'admin@saem.gob.mx' }
    })
    
    if (!admin) {
      console.log('Usuario admin@saem.gob.mx no encontrado')
      
      // Buscar usuarios administradores
      const admins = await prisma.usuarios.findMany({
        where: { rol: 'ADMINISTRADOR' }
      })
      
      console.log('Usuarios administradores encontrados:', admins.map(u => u.email))
      return
    }
    
    console.log('Usuario admin@saem.gob.mx encontrado:', {
      id: admin.id,
      email: admin.email,
      nombre: admin.nombre,
      apellido: admin.apellido,
      rol: admin.rol,
      activo: admin.activo,
      hasPassword: !!admin.password
    })
    
    // Verificar contraseña
    if (admin.password) {
      const isValidPassword = await bcrypt.compare('admin123', admin.password)
      console.log('Contraseña admin123 válida:', isValidPassword)
    } else {
      console.log('Usuario sin contraseña')
    }
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugAuth()
