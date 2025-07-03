// Test API connection
const fetch = require('node-fetch');

async function testAPI() {
  try {
    console.log('🧪 Testing API connection...')
    
    // Test 1: Basic API connectivity
    console.log('\n1. Testing basic API connectivity...')
    const healthResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'OPTIONS'
    })
    console.log(`OPTIONS /api/auth/login: ${healthResponse.status}`)
    
    // Test 2: Actual login
    console.log('\n2. Testing login endpoint...')
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@saem.gob.mx',
        password: 'admin123'
      })
    })
    
    console.log(`Login response status: ${loginResponse.status}`)
    console.log(`Login response headers:`, Object.fromEntries(loginResponse.headers.entries()))
    
    const loginData = await loginResponse.text()
    console.log(`Login response body:`, loginData)
    
  } catch (error) {
    console.error('❌ API Test Error:', error.message)
  }
}

// Wait a bit for server to be ready
setTimeout(testAPI, 5000)
