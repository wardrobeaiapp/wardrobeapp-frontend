const jwt = require('jsonwebtoken');

// Test JWT signing
const payload = {
  user: {
    id: '123456'
  }
};

try {
  console.log('Attempting to sign JWT...');
  const token = jwt.sign(
    payload,
    'devjwtsecret',
    { expiresIn: '7d' }
  );
  console.log('JWT signed successfully:', token);
} catch (err) {
  console.error('Error signing JWT:', err);
}
