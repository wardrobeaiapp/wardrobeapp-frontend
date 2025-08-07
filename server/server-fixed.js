const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { Anthropic } = require('@anthropic-ai/sdk');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
console.log('CORS enabled for all origins');

// Connect to MongoDB
const connectDB = async () => {
  try {
    if (process.env.MONGODB_URI) {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('MongoDB Connected...');
      return true;
    } else {
      console.log('No MongoDB URI provided, using in-memory storage');
      return false;
    }
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    console.log('Falling back to in-memory storage');
    return false;
  }
};

// Try to connect to MongoDB, fallback to in-memory if not available
global.usingMongoDB = false;
connectDB().then(connected => {
  global.usingMongoDB = connected;
  
  // Start the server after DB connection attempt
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

// Initialize in-memory stores for development
global.inMemoryUsers = [];
global.inMemoryProfiles = [];
global.inMemoryWardrobeItems = [];
global.inMemoryOutfits = [];
console.log('In-memory stores initialized as fallback');

// Mock User model for in-memory operations
global.User = {
  findOne(query) {
    return Promise.resolve(global.inMemoryUsers.find(user => user.email === query.email));
  },
  findById(id) {
    return Promise.resolve(global.inMemoryUsers.find(user => user.id === id));
  },
  findByIdAndUpdate(id, update, options) {
    const userIndex = global.inMemoryUsers.findIndex(user => user.id === id);
    if (userIndex === -1) return Promise.resolve(null);
    
    const updatedUser = { ...global.inMemoryUsers[userIndex], ...update };
    global.inMemoryUsers[userIndex] = updatedUser;
    
    return Promise.resolve(updatedUser);
  }
};

// Mock bcrypt for development
global.bcrypt = {
  hash(password) {
    return Promise.resolve(`hashed_${password}`);
  },
  compare(password, hashedPassword) {
    return Promise.resolve(hashedPassword === `hashed_${password}`);
  }
};

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Custom auth middleware for in-memory user store
const auth = (req, res, next) => {
  // Get token from header
  const token = req.header('x-auth-token');
  console.log('Auth middleware checking token');

  // Check if no token
  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'devjwtsecret');
    req.user = decoded.user;
    console.log('Token verified for user ID:', req.user.id);
    next();
  } catch (err) {
    console.error('Token verification failed:', err.message);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Auth Routes

// Register a user
app.post('/api/auth/register', async (req, res) => {
  console.log('Register endpoint hit');
  console.log('Request body:', req.body);
  console.log('Using in-memory mode:', !global.usingMongoDB);
  console.log('Global bcrypt:', global.bcrypt);
  console.log('inMemoryUsers:', global.inMemoryUsers);
  console.log('JWT Secret:', process.env.JWT_SECRET || 'devjwtsecret');
  
  // Log request headers to debug content-type issues
  console.log('Request headers:', req.headers);
  
  // Check if body is empty
  if (!req.body || Object.keys(req.body).length === 0) {
    console.error('Empty request body');
    return res.status(400).json({ error: 'Empty request body' });
  }
  
  const { name, email, password } = req.body;
  
  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password);
    
    // Create new user with UUID
    const userId = Math.random().toString(36).substring(2, 15);
    user = {
      id: userId,
      name,
      email,
      password: hashedPassword,
      profileCompleted: false,
      onboardingCompleted: false,
      preferences: {},
      createdAt: new Date()
    };

    // Save user to in-memory store
    global.inMemoryUsers.push(user);
    console.log('User registered:', user.email);

    // Create JWT payload
    const payload = {
      user: {
        id: user.id
      }
    };

    // Sign token using Promise approach instead of callback
    try {
      const token = jwt.sign(
        payload,
        process.env.JWT_SECRET || 'devjwtsecret',
        { expiresIn: '7d' }
      );
      
      console.log('Token generated successfully');
      
      // Send the response
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
    console.error('Registration error:', err.message);
    console.error('Error stack:', err.stack);
    console.error('Error object:', JSON.stringify(err, Object.getOwnPropertyNames(err)));
    res.status(500).json({ error: 'Server error', message: err.message });
  }
});

// Login user
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create JWT payload
    const payload = {
      user: {
        id: user.id
      }
    };

    // Sign token using Promise approach
    try {
      const token = jwt.sign(
        payload,
        process.env.JWT_SECRET || 'devjwtsecret',
        { expiresIn: '7d' }
      );
      
      console.log('Login token generated successfully');
      
      // Send the response
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
      console.error('Error signing JWT during login:', jwtErr);
      return res.status(500).json({ message: 'Server error during token generation' });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user
app.get('/api/auth/user', auth, async (req, res) => {
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

// Define Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/wardrobe-items', require('./routes/wardrobeItems'));
app.use('/api/outfits', require('./routes/outfits'));

// Routes
app.post('/api/outfit-suggestions', async (req, res) => {
  try {
    const { wardrobeItems, occasion, season, preferences } = req.body;

    // Create a prompt for Claude
    const prompt = `Generate 3 outfit suggestions based on the following wardrobe items:
    ${JSON.stringify(wardrobeItems)}
    
    Occasion: ${occasion}
    Season: ${season}
    User preferences: ${JSON.stringify(preferences)}
    
    Format your response as a JSON array of outfit objects with the following structure:
    [
      {
        "name": "Outfit name",
        "description": "Brief description of the outfit",
        "items": [ids of wardrobe items used],
        "occasion": "occasion",
        "season": "season"
      }
    ]`;

    // Call Claude API
    const response = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 1000,
      temperature: 0.7,
      system: "You are a helpful fashion assistant that creates outfit suggestions based on available wardrobe items. Always respond with valid JSON.",
      messages: [
        { role: "user", content: prompt }
      ]
    });

    // Parse Claude's response to extract JSON
    let outfitSuggestions;
    try {
      const responseText = response.content[0].text;
      // Extract JSON from the response
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        outfitSuggestions = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Could not extract JSON from Claude's response");
      }
    } catch (parseError) {
      console.error("Error parsing Claude's response:", parseError);
      return res.status(500).json({ error: "Failed to parse outfit suggestions" });
    }

    res.json(outfitSuggestions);
  } catch (err) {
    console.error("Error generating outfit suggestions:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// Catch-all route for debugging
app.use('*', (req, res) => {
  console.log('Catch-all route hit:', req.originalUrl);
  res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ message: 'Server error', error: err.message });
});
