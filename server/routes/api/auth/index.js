const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const auth = require('../../../middleware/auth');

// @route   POST /api/auth/register
// @desc    Register a user
// @access  Public
router.post('/register', async (req, res) => {
  console.log('Register endpoint hit');
  console.log('Request body:', req.body);
  
  const { name, email, password } = req.body;

  try {
    // Simple validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Check if user already exists
    const userExists = global.inMemoryUsers.some(user => user.email === email);
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create a simple user object
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password, // In a real app, this would be hashed
      profileCompleted: false,
      onboardingCompleted: false,
      dateCreated: new Date().toISOString()
    };

    // Add user to in-memory store
    global.inMemoryUsers.push(newUser);

    // Create JWT payload
    const payload = {
      user: {
        id: newUser.id
      }
    };

    // Sign the token
    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'devjwtsecret',
      { expiresIn: '5h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/login
// @desc    Login a user
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Simple validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Check if user exists
    const user = global.inMemoryUsers.find(user => user.email === email);
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password (in a real app, this would compare hashed passwords)
    if (user.password !== password) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create JWT payload
    const payload = {
      user: {
        id: user.id
      }
    };

    // Sign the token
    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'devjwtsecret',
      { expiresIn: '5h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/auth/user
// @desc    Get current user
// @access  Private
router.get('/user', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      profileCompleted: user.profileCompleted,
      onboardingCompleted: user.onboardingCompleted
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/auth/test-token
// @desc    Get a test token (for testing only)
// @access  Public
router.get('/test-token', async (req, res) => {
  try {
    const testUser = global.inMemoryUsers.find(user => user.id === 'test-user-123');
    if (!testUser) {
      return res.status(404).json({ message: 'Test user not found' });
    }
    
    // Create JWT payload
    const payload = {
      user: {
        id: testUser.id
      }
    };
    
    // Sign the token
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'devjwtsecret',
      { expiresIn: '5h' }
    );
    
    console.log('Generated test token for user:', testUser.id);
    res.json({ token });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/complete-onboarding
// @desc    Complete user onboarding
// @access  Private
router.post('/complete-onboarding', auth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { onboardingCompleted: true },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
