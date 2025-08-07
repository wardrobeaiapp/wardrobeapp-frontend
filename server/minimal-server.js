const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

// Create a minimal Express app
const app = express();
const PORT = 5002;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Initialize in-memory users store
const inMemoryUsers = [];

// Register endpoint with Promise-based JWT signing
app.post('/api/auth/register', async (req, res) => {
  console.log('Register endpoint hit with body:', req.body);
  
  try {
    const { name, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = inMemoryUsers.find(user => user.email === email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Create mock user
    const user = {
      id: Math.random().toString(36).substring(2, 15),
      name,
      email,
      password: `hashed_${password}`,
      profileCompleted: false,
      onboardingCompleted: false
    };
    
    // Save user to in-memory store
    inMemoryUsers.push(user);
    console.log('User registered:', user.email);
    console.log('Current users:', inMemoryUsers);
    
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

// Wardrobe Items endpoint
app.post('/api/wardrobe-items', (req, res) => {
  console.log('Wardrobe items endpoint hit with body:', req.body);
  
  // Just return success for testing
  return res.json({ success: true, item: req.body });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Minimal test server running on port ${PORT}`);
  console.log(`Test the registration endpoint with: curl -X POST -H "Content-Type: application/json" -d '{"name":"Test User","email":"test@example.com","password":"password123"}' http://localhost:${PORT}/api/auth/register`);
});
