// Simple script to test the login endpoint
const fetch = require('node-fetch');

async function testLogin() {
  try {
    console.log('Testing login endpoint...');
    
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test@test.net',
        password: 'test12345'
      })
    });
    
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    
    const data = await response.json().catch(e => {
      console.log('Error parsing JSON:', e.message);
      return null;
    });
    
    console.log('Response data:', data);
  } catch (error) {
    console.error('Error testing login:', error.message);
  }
}

testLogin();
