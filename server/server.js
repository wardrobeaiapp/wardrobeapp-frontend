const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const { Anthropic } = require('@anthropic-ai/sdk');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Log request size for debugging
app.use((req, res, next) => {
  const contentLength = req.headers['content-length'];
  if (contentLength && parseInt(contentLength) > 1000000) {
    console.log(`Large request received: ${parseInt(contentLength) / 1000000} MB`);
  }
  next();
});

// Enable CORS for all origins
app.use(cors());
console.log('CORS enabled for all origins');

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
console.log('Static file serving enabled for uploads directory');
console.log('Uploads directory path:', path.join(__dirname, 'uploads'));

// Check if uploads directory exists and is accessible
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  console.log('Creating uploads directory...');
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Verify the directory is writable
try {
  fs.accessSync(uploadsDir, fs.constants.W_OK);
  console.log('Uploads directory is writable');
} catch (err) {
  console.error('WARNING: Uploads directory is not writable:', err.message);
}

// Create a test file to verify static serving
const testFilePath = path.join(uploadsDir, 'test-static.txt');
fs.writeFileSync(testFilePath, 'This is a test file to verify static file serving');
console.log('Created test file at:', testFilePath);
console.log('Test file should be accessible at: http://localhost:5000/uploads/test-static.txt');

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
});

// In-memory stores for development (fallback if MongoDB not available)
global.inMemoryUsers = [];
global.inMemoryWardrobeItems = [];
global.inMemoryOutfits = [];
console.log('In-memory stores initialized as fallback');

// Mock User model
const User = {
  findOne: async (query) => {
    return global.inMemoryUsers.find(user => user.email === query.email);
  },
  findById: async (id) => {
    const user = global.inMemoryUsers.find(user => user.id === id);
    if (user) {
      // Create a user object with a select method to mimic Mongoose
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        profileCompleted: user.profileCompleted,
        onboardingCompleted: user.onboardingCompleted,
        preferences: user.preferences
      };
    }
    return null;
  },
  findByIdAndUpdate: async (id, update, options) => {
    const userIndex = global.inMemoryUsers.findIndex(user => user.id === id);
    if (userIndex !== -1) {
      global.inMemoryUsers[userIndex] = { ...global.inMemoryUsers[userIndex], ...update };
      // Return user without password to mimic Mongoose select('-password')
      const { password, ...userWithoutPassword } = global.inMemoryUsers[userIndex];
      return userWithoutPassword;
    }
    return null;
  }
};

// Mock bcrypt for development
global.bcrypt = {
  hash: async (password) => `hashed_${password}`,
  compare: async (password, hashedPassword) => hashedPassword === `hashed_${password}`
};

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Middleware
app.use(cors());
app.use(express.json());

// Log all requests for debugging
console.log('CORS enabled for all origins');

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Define Routes
app.use('/api/users', require('./routes/users'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/wardrobe-items', require('./routes/wardrobeItems'));
app.use('/api/outfits', require('./routes/outfits'));
app.use('/api/capsules', require('./routes/capsules'));
app.use('/api/migrate-data', require('./routes/dataMigration'));

// JWT already imported at the top of the file

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
  console.log('==== LOGIN ENDPOINT HIT ====');
  console.log('Request body:', req.body);
  console.log('Request headers:', req.headers);
  console.log('Using in-memory mode:', !global.usingMongoDB);
  
  // Check if req.body is undefined or empty
  if (!req.body || Object.keys(req.body).length === 0) {
    console.error('Request body is empty or undefined');
    return res.status(400).json({ message: 'Missing request body' });
  }
  
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
    console.error('Login error:', err.message);
    res.status(500).send('Server error');
  }
});

// Get user data
app.get('/api/auth/user', auth, async (req, res) => {
  try {
    console.log('Getting user data for ID:', req.user.id);
    
    // Check if we're using in-memory storage
    if (!global.usingMongoDB) {
      console.log('Using in-memory storage for user lookup');
      const user = global.inMemoryUsers.find(u => u.id === req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found in memory store' });
      }
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      return res.json(userWithoutPassword);
    }
    
    // Using MongoDB
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found in database' });
    }
    res.json(user);
  } catch (err) {
    console.error('Error getting user data:', err.message);
    res.status(500).send('Server error');
  }
});

// Complete user onboarding
app.put('/api/auth/onboarding', auth, async (req, res) => {
  const { preferences } = req.body;
  console.log('Completing onboarding for user ID:', req.user.id);
  console.log('Preferences:', preferences);

  try {
    // Find user in memory
    const userIndex = inMemoryUsers.findIndex(user => user.id === req.user.id);
    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update user
    inMemoryUsers[userIndex].onboardingCompleted = true;
    inMemoryUsers[userIndex].preferences = preferences;
    
    // Return user without password
    const { password, ...userWithoutPassword } = inMemoryUsers[userIndex];
    console.log('Onboarding completed for user:', userWithoutPassword.email);
    
    res.json(userWithoutPassword);
  } catch (err) {
    console.error('Onboarding error:', err.message);
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
      ${JSON.stringify(wardrobeItems, null, 2)}
      
      ${occasion ? `I need an outfit for this occasion: ${occasion}` : ''}
      ${season ? `The current season is: ${season}` : ''}
      ${preferences ? `My style preferences: ${preferences}` : ''}
      
      Please suggest an outfit using only the items in my wardrobe. 
      Provide a name for the outfit, the items to use, and some style advice.
      Format your response as a JSON object with the following structure:
      {
        "outfitSuggestion": {
          "name": "Outfit name",
          "items": ["item1_id", "item2_id", ...],
          "occasion": "occasion",
          "season": ["season1", "season2", ...],
          "favorite": false,
          "dateCreated": "ISO date string"
        },
        "styleAdvice": "Your style advice here",
        "message": "Any additional message"
      }
    `;

    // Call the Claude API
    const response = await anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Parse the response to extract the JSON
    const content = response.content[0];
    
    if (content.type === 'text') {
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        return res.json(JSON.parse(jsonMatch[0]));
      }
    }

    // If no JSON is found, return a default response
    return res.json({
      message: 'Could not generate outfit suggestion. Please try again.',
    });
  } catch (error) {
    console.error('Error calling Claude API:', error);
    res.status(500).json({
      message: 'Error connecting to Claude API. Please check your API key and try again.',
    });
  }
});

app.post('/api/style-advice', async (req, res) => {
  try {
    const { outfit, wardrobeItems } = req.body;

    // Find the actual wardrobe items from the outfit's item IDs
    const outfitItems = outfit.items
      .map(id => wardrobeItems.find(item => item.id === id))
      .filter(item => item !== undefined);

    // Create a prompt for Claude
    const prompt = `
      I have created the following outfit named "${outfit.name}":
      ${JSON.stringify(outfitItems, null, 2)}
      
      Please provide style advice for this outfit. Include suggestions for:
      1. How to accessorize
      2. Alternative items that could work well
      3. Occasions where this outfit would be appropriate
    `;

    // Call the Claude API
    const response = await anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = response.content[0];
    
    if (content.type === 'text') {
      return res.json({ styleAdvice: content.text });
    }

    return res.json({ 
      styleAdvice: 'Could not generate style advice. Please try again.' 
    });
  } catch (error) {
    console.error('Error calling Claude API:', error);
    res.status(500).json({
      message: 'Error connecting to Claude API. Please check your API key and try again.',
    });
  }
});

// Register routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/wardrobe-items', require('./routes/wardrobeItems'));
app.use('/api/outfits', require('./routes/outfits'));
app.use('/api/capsules', require('./routes/capsules'));
app.use('/api/migrate-data', require('./routes/dataMigration'));

// Debug in-memory users
console.log('In-memory users at startup:', global.inMemoryUsers);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
