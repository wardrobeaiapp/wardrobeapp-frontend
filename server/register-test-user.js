const fetch = require('node-fetch');

// Register a test user
async function registerTestUser() {
  console.log('Registering test user...');
  
  try {
    const response = await fetch('http://localhost:5000/api/auth/register', {
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
    
    const data = await response.json();
    console.log('Registration response:', data);
    
    if (response.ok) {
      console.log('Test user registered successfully!');
      console.log('You can now log in with:');
      console.log('Email: test@test.net');
      console.log('Password: test12345');
    } else {
      console.error('Failed to register test user:', data.message);
    }
  } catch (error) {
    console.error('Error registering test user:', error.message);
  }
}

// Run the registration
registerTestUser();
