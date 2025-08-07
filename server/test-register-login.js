// Script to test registration and login flow
const fetch = require('node-fetch');

async function testRegistrationAndLogin() {
  try {
    // Step 1: Register a new user
    console.log('Step 1: Testing registration endpoint...');
    
    const registerResponse = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@test.net',
        password: 'test12345'
      })
    });
    
    console.log('Registration Status:', registerResponse.status);
    console.log('Registration Status Text:', registerResponse.statusText);
    
    const registerData = await registerResponse.json().catch(e => {
      console.log('Error parsing registration JSON:', e.message);
      return null;
    });
    
    console.log('Registration response data:', registerData);
    
    if (registerResponse.status !== 200) {
      console.log('Registration failed, skipping login test');
      return;
    }
    
    // Step 2: Login with the newly registered user
    console.log('\nStep 2: Testing login endpoint...');
    
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test@test.net',
        password: 'test12345'
      })
    });
    
    console.log('Login Status:', loginResponse.status);
    console.log('Login Status Text:', loginResponse.statusText);
    
    const loginData = await loginResponse.json().catch(e => {
      console.log('Error parsing login JSON:', e.message);
      return null;
    });
    
    console.log('Login response data:', loginData);
    
  } catch (error) {
    console.error('Error testing registration and login flow:', error.message);
  }
}

testRegistrationAndLogin();
