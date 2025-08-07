const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

// @route   POST /api/auth/register
// @desc    Register a user
// @access  Public
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    if (global.usingMongoDB) {
      // MongoDB mode
      // Check if user already exists
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Create new user
      user = new User({
        name,
        email,
        password
      });

      // Save user to database
      await user.save();

      // Create JWT payload
      const payload = {
        user: {
          id: user.id
        }
      };

      // Sign token
      jwt.sign(
        payload,
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '7d' },
        (err, token) => {
          if (err) throw err;
          res.json({ 
            token,
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              profileCompleted: user.profileCompleted,
              onboardingCompleted: user.onboardingCompleted
            }
          });
        }
      );
    } else {
      // In-memory mode
      // Check if user already exists
      const existingUser = global.inMemoryUsers.find(u => u.email === email);
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Create new user with ID
      const userId = `user-${Date.now()}`;
      const newUser = {
        id: userId,
        name,
        email,
        password, // In a real app, we would hash this
        profileCompleted: false,
        onboardingCompleted: false,
        dateCreated: new Date().toISOString()
      };

      // Add to in-memory users array
      global.inMemoryUsers.push(newUser);

      // Create JWT payload
      const payload = {
        user: {
          id: userId
        }
      };

      // Sign token
      jwt.sign(
        payload,
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '7d' },
        (err, token) => {
          if (err) throw err;
          res.json({ 
            token,
            user: {
              id: userId,
              name: newUser.name,
              email: newUser.email,
              profileCompleted: newUser.profileCompleted,
              onboardingCompleted: newUser.onboardingCompleted
            }
          });
        }
      );
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    if (global.usingMongoDB) {
      // MongoDB mode
      // Check if user exists
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Check password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Create JWT payload
      const payload = {
        user: {
          id: user.id
        }
      };

      // Sign token
      jwt.sign(
        payload,
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '7d' },
        (err, token) => {
          if (err) throw err;
          res.json({ 
            token,
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              profileCompleted: user.profileCompleted,
              onboardingCompleted: user.onboardingCompleted
            }
          });
        }
      );
    } else {
      // In-memory mode
      // Check if user exists
      const user = global.inMemoryUsers.find(u => u.email === email);
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Check password (simple comparison for in-memory mode)
      if (user.password !== password) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Create JWT payload
      const payload = {
        user: {
          id: user.id
        }
      };

      // Sign token
      jwt.sign(
        payload,
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '7d' },
        (err, token) => {
          if (err) throw err;
          res.json({ 
            token,
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              profileCompleted: user.profileCompleted,
              onboardingCompleted: user.onboardingCompleted
            }
          });
        }
      );
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/auth/user
// @desc    Get user data
// @access  Private
router.get('/user', auth, async (req, res) => {
  try {
    console.log('GET /api/auth/user - User ID from token:', req.user.id);
    console.log('Using MongoDB:', global.usingMongoDB);
    
    let userData;
    
    if (global.usingMongoDB) {
      // MongoDB mode
      userData = await User.findById(req.user.id).select('-password');
      console.log('MongoDB user found:', userData ? 'Yes' : 'No');
    } else {
      // In-memory mode - use the User mock object defined in server.js
      // This avoids direct dependency on the global.inMemoryUsers array
      userData = await User.findById(req.user.id);
      console.log('In-memory user found:', userData ? 'Yes' : 'No');
    }
    
    if (!userData) {
      console.log('User not found for ID:', req.user.id);
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Return the user data
    res.json(userData);
  } catch (err) {
    console.error('Error in GET /api/auth/user:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   PUT /api/auth/onboarding
// @desc    Complete user onboarding
// @access  Private
router.put('/onboarding', auth, async (req, res) => {
  const { preferences } = req.body;

  try {
    // Update user
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { 
        onboardingCompleted: true,
        preferences
      },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile preferences
// @access  Private
router.put('/profile', auth, async (req, res) => {
  const { preferences } = req.body;

  try {
    // Update user preferences
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { preferences },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
