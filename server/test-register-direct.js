const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

// Create a minimal Express app for testing
const app = express();
app.use(bodyParser.json());

// Test registration endpoint with Promise-based JWT signing
app.post('/api/auth/register', async (req, res) => {
  console.log('Register endpoint hit with body:', req.body);
  
  try {
    const { name, email, password } = req.body;
    
    // Create mock user
    const user = {
      id: Math.random().toString(36).substring(2, 15),
      name,
      email,
      password: `hashed_${password}`,
      profileCompleted: false,
      onboardingCompleted: false
    };
    
    console.log('Created user:', user);
    
    // Create JWT payload
    const payload = {
      user: {
        id: user.id
      }
    };
    
    // Sign token using Promise-based approach
    try {
      console.log('Attempting to sign JWT...');
      const token = jwt.sign(
        payload,
        'devjwtsecret',
        { expiresIn: '7d' }
      );
      
      console.log('JWT signed successfully:', token);
      
      // Send response
      return res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          profileCompleted: user.profileCompleted,
          onboardingCompleted: user.onboardingCompleted
        }
      });
    } catch (jwtErr) {
      console.error('Error signing JWT:', jwtErr);
      return res.status(500).json({ message: 'Server error during token generation' });
    }
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Start the server
const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
  console.log(`Test the registration endpoint with: curl -X POST -H "Content-Type: application/json" -d '{"name":"Test User","email":"test@example.com","password":"password123"}' http://localhost:${PORT}/api/auth/register`);
});
