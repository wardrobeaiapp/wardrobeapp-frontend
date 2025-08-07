const fetch = require('node-fetch');

async function testRegistration() {
  try {
    console.log('Sending registration request...');
    
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test20@example.com',
        password: 'password123'
      })
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    
    const data = await response.json();
    console.log('Response data:', data);
    
    return data;
  } catch (error) {
    console.error('Error testing registration:', error);
  }
}

// Run the test
testRegistration().then(result => {
  console.log('Test completed with result:', result);
  process.exit(0);
}).catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
