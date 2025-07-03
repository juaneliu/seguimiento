// Script de debug para probar login
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function testLogin() {
  try {
    console.log('🔍 Debugging login process...')
    
    // 1. Verificar conexión a la base de datos
    console.log('\n1. Testing database connection...')
    const userCount = await prisma.usuarios.count()
    console.log(`✅ Database connected. Found ${userCount} users.`)
    
    // 2. Buscar el usuario admin
    console.log('\n2. Finding admin user...')
    const admin = await prisma.usuarios.findUnique({
      where: { email: 'admin@saem.gob.mx' }
    })
    
    if (!admin) {
      console.log('❌ Admin user not found')
      return
    }
    
    console.log(`✅ Admin user found:`)
    console.log(`   - ID: ${admin.id}`)
    console.log(`   - Email: ${admin.email}`)
    console.log(`   - Activo: ${admin.activo}`)
    console.log(`   - Has password: ${admin.password ? 'Yes' : 'No'}`)
    
    // 3. Test password (assuming default password)
    const testPasswords = ['admin123', 'admin', 'password', '123456']
    
    console.log('\n3. Testing passwords...')
    for (const testPassword of testPasswords) {
      if (admin.password) {
        const isValid = await bcrypt.compare(testPassword, admin.password)
        console.log(`   - "${testPassword}": ${isValid ? '✅ VALID' : '❌ Invalid'}`)
        if (isValid) {
          console.log(`\n🎉 Login would work with password: "${testPassword}"`)
          break
        }
      }
    }
    
    // 4. Test JWT
    console.log('\n4. Testing JWT...')
    const jwt = require('jsonwebtoken')
    const JWT_SECRET = process.env.JWT_SECRET || 'tu-clave-secreta-muy-segura'
    
    try {
      const token = jwt.sign(
        { userId: admin.id, email: admin.email, rol: admin.rol },
        JWT_SECRET,
        { expiresIn: '24h' }
      )
      console.log('✅ JWT token generation: OK')
      
      const decoded = jwt.verify(token, JWT_SECRET)
      console.log('✅ JWT token verification: OK')
    } catch (jwtError) {
      console.log('❌ JWT error:', jwtError.message)
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testLogin()
