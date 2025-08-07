const fetch = require('node-fetch');

// Set a longer timeout for the test
const timeoutMs = 10000;
let timeoutId = setTimeout(() => {
  console.error('Test timed out after', timeoutMs, 'ms');
  process.exit(1);
}, timeoutMs);

// Test user data
const testUser = {
  name: 'Test User',
  email: `test${Date.now()}@example.com`,
  password: 'password123'
};

console.log('Testing registration with user:', testUser);

// Test registration endpoint
fetch('http://localhost:5000/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(testUser)
})
.then(response => {
  console.log('Response status:', response.status);
  return response.json();
})
.then(data => {
  console.log('Registration successful!');
  console.log('Response data:', data);
  
  // Now test login with the same user
  return fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: testUser.email,
      password: testUser.password
    })
  });
})
.then(response => {
  console.log('Login response status:', response.status);
  return response.json();
})
.then(data => {
  console.log('Login successful!');
  console.log('Login response data:', data);
  
  // Test adding a wardrobe item
  return fetch('http://localhost:5000/api/wardrobe-items', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-auth-token': data.token
    },
    body: JSON.stringify({
      name: 'Test Item',
      category: 'Tops',
      color: 'Blue',
      season: 'Summer'
    })
  });
})
.then(response => {
  console.log('Add wardrobe item response status:', response.status);
  return response.json();
})
.then(data => {
  console.log('Wardrobe item added successfully!');
  console.log('Wardrobe item data:', data);
})
.catch(error => {
  console.error('Error:', error);
})
.finally(() => {
  // Clear the timeout when the test completes
  clearTimeout(timeoutId);
  console.log('Test completed');
});
