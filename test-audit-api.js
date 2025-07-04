const { AuthService } = require('./src/lib/auth-service.ts');

async function testAuditAPI() {
  try {
    console.log('🔍 Probando la API de auditoría...');
    
    // Crear un token de prueba
    const testUser = {
      id: 1,
      email: 'admin@saem.mx',
      nombre: 'Admin',
      apellido: 'Test',
      rol: 'ADMINISTRADOR',
      activo: true
    };
    
    const JWT_SECRET = process.env.JWT_SECRET || 'tu-clave-secreta-muy-segura';
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ userId: testUser.id }, JWT_SECRET, { expiresIn: '1h' });
    
    console.log('✅ Token generado:', token.substring(0, 50) + '...');
    
    // Probar el endpoint
    const response = await fetch('https://seguimiento.saem.gob.mx/api/audit-logs?limit=5', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    console.log('📊 Respuesta de la API:', { 
      status: response.status,
      headers: Object.fromEntries(response.headers),
      data: data 
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testAuditAPI();
