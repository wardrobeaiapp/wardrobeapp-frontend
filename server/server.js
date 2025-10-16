const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const { Anthropic } = require('@anthropic-ai/sdk');

// Import fetch for making HTTP requests
const fetch = require('node-fetch');

// Load environment variables from project root
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware Configuration
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));
app.use(cors());

// Request logging middleware
app.use((req, res, next) => {
  // Log AI analyze endpoints with special highlighting
  if (req.path.includes('/api/analyze') || req.path.includes('/api/ai')) {
    console.log(`🎯 AI ENDPOINT HIT: ${req.method} ${req.path}`);
  }
  
  // Log request size if large
  const contentLength = req.headers['content-length'];
  if (contentLength && parseInt(contentLength) > 1000000) {
    console.log(`📦 Large request: ${parseInt(contentLength) / 1000000} MB`);
  }
  next();
});

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

// Import route handlers
const auth = require('./middleware/auth');
const outfitSuggestionsRouter = require('./routes/outfitSuggestions');
const styleAdviceRouter = require('./routes/styleAdvice');
const extractFashionTagsRouter = require('./routes/extractFashionTags');

// Register routes
app.use('/api/outfit-suggestions', outfitSuggestionsRouter);
app.use('/api/style-advice', styleAdviceRouter);
app.use('/api/extract-fashion-tags', extractFashionTagsRouter);

// Register routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/wardrobe-items', require('./routes/api/wardrobe/items'));
app.use('/api/outfits', require('./routes/outfits'));
app.use('/api/capsules', require('./routes/capsules'));
app.use('/api/migrate-data', require('./routes/dataMigration'));
app.use('/api/analyze-wardrobe-item-simple', require('./routes/api/ai/analyze-simple'));
app.use('/api/ai-analysis-mocks', require('./routes/api/ai/analysis-mocks'));

// Check Supabase configuration on startup
const checkSupabaseConfig = () => {
  const supabaseUrl = process.env.SUPABASE_URL || 'https://gujpqecwdftbwkcnwiup.supabase.co';
  const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1anBxZWN3ZGZ0YndrY253aXVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MTU0NDksImV4cCI6MjA2ODA5MTQ0OX0.1_ViFuaH4PAiTk_QkSm7S9srp1rQa_Zv7D2a8pJx5So';
  
  console.log('🗂️ Supabase Configuration Check:');
  console.log('  ✅ URL configured:', !!supabaseUrl);
  console.log('  ✅ API Key configured:', !!supabaseKey);
  console.log('  ✅ Analysis Mocks route: /api/ai-analysis-mocks');
};

checkSupabaseConfig();

// Debug in-memory users
console.log('In-memory users at startup:', global.inMemoryUsers);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
