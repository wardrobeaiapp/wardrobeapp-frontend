const express = require('express');
const router = express.Router();
const bcrypt = global.bcrypt || require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');

// @route   POST /api/users
// @desc    Register a user
// @access  Public
router.post(
  '/',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
  ],
  async (req, res) => {
    console.log('Register user request received');
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      // Check if user exists
      let user = null;
      
      if (global.usingMongoDB) {
        // MongoDB implementation would go here
        // For now, just return success
      } else {
        // In-memory implementation
        if (!global.inMemoryUsers) {
          global.inMemoryUsers = [];
        }
        
        user = global.inMemoryUsers.find(u => u.email === email);
      }

      if (user) {
        return res.status(400).json({ errors: [{ msg: 'User already exists' }] });
      }

      // Create user object
      user = {
        id: `user-${Date.now()}`,
        name,
        email,
        password,
        date: new Date().toISOString(),
        onboardingCompleted: false
      };

      // Encrypt password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      if (global.usingMongoDB) {
        // MongoDB implementation would go here
      } else {
        // In-memory implementation
        global.inMemoryUsers.push(user);
        console.log('User registered in-memory:', user.email);
      }

      // Return JWT
      const payload = {
        user: {
          id: user.id
        }
      };

      const jwtSecret = process.env.JWT_SECRET || 'mysecrettoken';
      
      // Use Promise-based JWT signing instead of callback
      const token = await new Promise((resolve, reject) => {
        jwt.sign(
          payload,
          jwtSecret,
          { expiresIn: '5 days' },
          (err, token) => {
            if (err) reject(err);
            resolve(token);
          }
        );
      });
      
      res.json({ token });
    } catch (err) {
      console.error('Error in user registration:', err);
      console.error('Error stack:', err.stack);
      res.status(500).json({ 
        error: 'Server error',
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack
      });
    }
  }
);

module.exports = router;
