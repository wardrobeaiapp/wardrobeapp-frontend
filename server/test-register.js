const http = require('http');

const data = JSON.stringify({
  name: 'Test User',
  email: 'test15@example.com',
  password: 'password123'
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  },
  timeout: 10000 // 10 second timeout
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
  
  let responseData = '';
  
  res.on('data', (chunk) => {
    responseData += chunk;
    console.log('Received chunk:', chunk.toString());
  });
  
  res.on('end', () => {
    console.log('RESPONSE BODY:', responseData);
    try {
      const parsedData = JSON.parse(responseData);
      console.log('Parsed response:', parsedData);
    } catch (e) {
      console.log('Could not parse response as JSON');
    }
    process.exit(0);
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
  process.exit(1);
});

req.on('timeout', () => {
  console.log('Request timed out after 10 seconds');
  req.abort();
  process.exit(1);
});

// Write data to request body
req.write(data);
req.end();

console.log('Request sent, waiting for response...');

// Fallback timeout in case the request hangs
setTimeout(() => {
  console.log('Global timeout reached after 15 seconds');
  process.exit(1);
}, 15000);
