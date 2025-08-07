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

// In-memory stores for development (fallback if MongoDB not available)
global.inMemoryUsers = [];
global.inMemoryWardrobeItems = [];
global.inMemoryOutfits = [];
console.log('In-memory stores initialized as fallback');

// Mock User model
const User = {
  findOne: async (query) => {
    if (global.usingMongoDB) {
      // Use MongoDB
      return await mongoose.model('User').findOne(query);
    } else {
      // Use in-memory store
      return global.inMemoryUsers.find(user => 
        (query.email && user.email === query.email) || 
        (query._id && user.id === query._id)
      );
    }
  },
  findById: async (id) => {
    if (global.usingMongoDB) {
      // Use MongoDB
      return await mongoose.model('User').findById(id);
    } else {
      // Use in-memory store
      return global.inMemoryUsers.find(user => user.id === id);
    }
  },
  findByIdAndUpdate: async (id, update, options) => {
    if (global.usingMongoDB) {
      // Use MongoDB
      return await mongoose.model('User').findByIdAndUpdate(id, update, options);
    } else {
      // Use in-memory store
      const userIndex = global.inMemoryUsers.findIndex(user => user.id === id);
      if (userIndex !== -1) {
        const user = global.inMemoryUsers[userIndex];
        const updatedUser = { ...user, ...update };
        global.inMemoryUsers[userIndex] = updatedUser;
        return updatedUser;
      }
      return null;
    }
  }
};

// Mock bcrypt for development
global.bcrypt = {
  hash: (password) => `hashed_${password}`,
  compare: (password, hashedPassword) => hashedPassword === `hashed_${password}`
};

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Custom auth middleware for in-memory user store
const auth = async (req, res, next) => {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if no token
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'devjwtsecret');
    
    // Add user from payload
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Auth Routes

// Register a user
app.post('/api/auth/register', async (req, res) => {
  console.log('==== REGISTER ENDPOINT HIT ====');
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
      console.log('==== ATTEMPTING JWT SIGN ====');
      console.log('JWT Payload:', payload);
      console.log('JWT Secret:', process.env.JWT_SECRET || 'devjwtsecret');
      
      const token = jwt.sign(
        payload,
        process.env.JWT_SECRET || 'devjwtsecret',
        { expiresIn: '7d' }
      );
      
      console.log('==== TOKEN GENERATED SUCCESSFULLY ====');
      console.log('Token:', token);
      
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
  console.log('Login attempt for:', email);

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

    console.log('Login successful for:', email);

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
    console.error('Login error:', err.message);
    res.status(500).send('Server error');
  }
});

// Get user data
app.get('/api/auth/user', auth, async (req, res) => {
  try {
    console.log('Getting user data for ID:', req.user.id);
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error('Error getting user data:', err.message);
    res.status(500).send('Server error');
  }
});

// Complete onboarding
app.post('/api/auth/complete-onboarding', auth, async (req, res) => {
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
    console.error('Error completing onboarding:', err.message);
    res.status(500).send('Server error');
  }
});

// Update profile
app.post('/api/auth/update-profile', auth, async (req, res) => {
  try {
    const { preferences } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { 
        preferences,
        profileCompleted: true 
      },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (err) {
    console.error('Error updating profile:', err.message);
    res.status(500).send('Server error');
  }
});

// Wardrobe Item Routes
const WardrobeItem = {
  find: async (query) => {
    if (global.usingMongoDB) {
      // Use MongoDB
      return await mongoose.model('WardrobeItem').find(query);
    } else {
      // Use in-memory store
      return global.inMemoryWardrobeItems.filter(item => 
        (!query.userId || item.userId === query.userId)
      );
    }
  },
  findById: async (id) => {
    if (global.usingMongoDB) {
      // Use MongoDB
      return await mongoose.model('WardrobeItem').findById(id);
    } else {
      // Use in-memory store
      return global.inMemoryWardrobeItems.find(item => item.id === id);
    }
  },
  create: async (data) => {
    if (global.usingMongoDB) {
      // Use MongoDB
      return await mongoose.model('WardrobeItem').create(data);
    } else {
      // Use in-memory store
      const newItem = {
        id: Math.random().toString(36).substring(2, 15),
        ...data,
        createdAt: new Date()
      };
      global.inMemoryWardrobeItems.push(newItem);
      return newItem;
    }
  },
  findByIdAndUpdate: async (id, update) => {
    if (global.usingMongoDB) {
      // Use MongoDB
      return await mongoose.model('WardrobeItem').findByIdAndUpdate(id, update, { new: true });
    } else {
      // Use in-memory store
      const itemIndex = global.inMemoryWardrobeItems.findIndex(item => item.id === id);
      if (itemIndex !== -1) {
        const item = global.inMemoryWardrobeItems[itemIndex];
        const updatedItem = { ...item, ...update };
        global.inMemoryWardrobeItems[itemIndex] = updatedItem;
        return updatedItem;
      }
      return null;
    }
  },
  findByIdAndDelete: async (id) => {
    if (global.usingMongoDB) {
      // Use MongoDB
      return await mongoose.model('WardrobeItem').findByIdAndDelete(id);
    } else {
      // Use in-memory store
      const itemIndex = global.inMemoryWardrobeItems.findIndex(item => item.id === id);
      if (itemIndex !== -1) {
        const item = global.inMemoryWardrobeItems[itemIndex];
        global.inMemoryWardrobeItems.splice(itemIndex, 1);
        return item;
      }
      return null;
    }
  }
};

// Get all wardrobe items for a user
app.get('/api/wardrobe-items', auth, async (req, res) => {
  try {
    const items = await WardrobeItem.find({ userId: req.user.id });
    res.json(items);
  } catch (err) {
    console.error('Error getting wardrobe items:', err.message);
    res.status(500).send('Server error');
  }
});

// Add a new wardrobe item
app.post('/api/wardrobe-items', auth, async (req, res) => {
  try {
    const newItem = {
      ...req.body,
      userId: req.user.id
    };
    
    const item = await WardrobeItem.create(newItem);
    res.json(item);
  } catch (err) {
    console.error('Error adding wardrobe item:', err.message);
    res.status(500).send('Server error');
  }
});

// Update a wardrobe item
app.put('/api/wardrobe-items/:id', auth, async (req, res) => {
  try {
    const item = await WardrobeItem.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    if (item.userId !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    const updatedItem = await WardrobeItem.findByIdAndUpdate(req.params.id, req.body);
    res.json(updatedItem);
  } catch (err) {
    console.error('Error updating wardrobe item:', err.message);
    res.status(500).send('Server error');
  }
});

// Delete a wardrobe item
app.delete('/api/wardrobe-items/:id', auth, async (req, res) => {
  try {
    const item = await WardrobeItem.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    if (item.userId !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    await WardrobeItem.findByIdAndDelete(req.params.id);
    res.json({ message: 'Item removed' });
  } catch (err) {
    console.error('Error deleting wardrobe item:', err.message);
    res.status(500).send('Server error');
  }
});

// Routes
app.post('/api/outfit-suggestions', async (req, res) => {
  try {
    const { wardrobeItems, occasion, season, preferences } = req.body;

    // Create a prompt for Claude
    const prompt = `
      I have the following items in my wardrobe:
      ${wardrobeItems.map(item => `- ${item.name} (${item.category}, ${item.color})`).join('\n')}
      
      I'm looking for outfit suggestions for a ${occasion} during ${season}.
      
      My style preferences: ${preferences ? JSON.stringify(preferences) : 'Not specified'}
      
      Please suggest 3 outfits I can create with these items. For each outfit, explain why it works for the occasion and season.
    `;

    // Call Claude API
    const response = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    });

    // Parse Claude's response
    const suggestions = response.content[0].text;

    res.json({ suggestions });
  } catch (err) {
    console.error('Error generating outfit suggestions:', err.message);
    res.status(500).json({ error: 'Failed to generate outfit suggestions' });
  }
});
