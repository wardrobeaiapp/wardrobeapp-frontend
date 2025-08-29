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
  defaultHeaders: {
    'anthropic-version': '2023-06-01',
    'Content-Type': 'application/json'
  }
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

// Wardrobe Item Routes
app.get('/api/wardrobe-items', auth, async (req, res) => {
  try {
    // Return in-memory wardrobe items for the authenticated user
    const userItems = global.inMemoryWardrobeItems.filter(item => item.userId === req.user.id);
    res.json(userItems);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/wardrobe-items', auth, async (req, res) => {
  try {
    const { name, category, color, season, occasion, image } = req.body;
    
    // Create new wardrobe item
    const newItem = {
      id: Math.random().toString(36).substring(2, 15),
      userId: req.user.id,
      name,
      category,
      color,
      season,
      occasion,
      image,
      createdAt: new Date()
    };
    
    // Save to in-memory store
    global.inMemoryWardrobeItems.push(newItem);
    console.log('Wardrobe item added:', newItem);
    
    res.json(newItem);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/wardrobe-items/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, color, season, occasion, image } = req.body;
    
    // Find item index
    const itemIndex = global.inMemoryWardrobeItems.findIndex(
      item => item.id === id && item.userId === req.user.id
    );
    
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    // Update item
    const updatedItem = {
      ...global.inMemoryWardrobeItems[itemIndex],
      name,
      category,
      color,
      season,
      occasion,
      image,
      updatedAt: new Date()
    };
    
    global.inMemoryWardrobeItems[itemIndex] = updatedItem;
    console.log('Wardrobe item updated:', updatedItem);
    
    res.json(updatedItem);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/wardrobe-items/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find item index
    const itemIndex = global.inMemoryWardrobeItems.findIndex(
      item => item.id === id && item.userId === req.user.id
    );
    
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    // Remove item
    global.inMemoryWardrobeItems.splice(itemIndex, 1);
    console.log('Wardrobe item deleted:', id);
    
    res.json({ message: 'Item removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Analyze wardrobe item with Claude
app.post('/api/analyze-wardrobe-item', async (req, res) => {
  try {
    const { imageBase64, detectedTags } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Image data is required' });
    }

    // Extract base64 data without prefix if present and ensure it's properly formatted
    let base64Data = imageBase64;
    
    // Handle data URI format (e.g., data:image/jpeg;base64,/9j/4AAQ...)
    if (base64Data.startsWith('data:')) {
      const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        base64Data = matches[2];
      } else {
        return res.status(400).json({ 
          error: 'Invalid image data format', 
          details: 'The provided image data is not in a valid base64 format',
          analysis: 'Error analyzing image. Please try again later.',
          score: 5.0,
          feedback: 'Could not process the image analysis.'
        });
      }
    }
    
    // Ensure we have enough data to process (at least 100 chars for a tiny image)
    if (base64Data.length < 100) {
      return res.status(400).json({ 
        error: 'Insufficient image data', 
        details: 'The provided image data is too small to be a valid image',
        analysis: 'Error analyzing image. The image data appears to be incomplete.',
        score: 5.0,
        feedback: 'Please provide a complete image.'
      });
    }

    // Build a prompt for Claude
    let systemPrompt = "You are a fashion expert and personal stylist analyzing wardrobe items. ";
    systemPrompt += "Provide a comprehensive analysis of this clothing item or outfit including: ";
    systemPrompt += "(1) What type of item it is, (2) Its style characteristics, ";
    systemPrompt += "(3) Color analysis and how versatile it is, (4) Quality assessment based on visible details, ";
    systemPrompt += "(5) Styling recommendations and what it pairs well with, ";
    systemPrompt += "(6) Appropriate occasions or seasons to wear it.";
    
    if (detectedTags) {
      systemPrompt += "\n\nHere are tags that were automatically detected in the image: " + JSON.stringify(detectedTags);
    }
    
    systemPrompt += "\n\nProvide a score from 1-10 on how versatile and valuable this item is for a wardrobe. ";
    systemPrompt += "Format your response with three sections: ANALYSIS, SCORE, and FEEDBACK. ";
    systemPrompt += "Keep your total response under 300 words.";

    // Call Claude API
    const response = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 1024,
      temperature: 0.7,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: "image/jpeg",
                data: base64Data
              }
            },
            {
              type: "text",
              text: "Please analyze this wardrobe item."
            }
          ]
        }
      ]
    });

    const content = response.content[0].text;
    
    // Parse the response to extract analysis, score, and feedback
    const analysisMatch = content.match(/ANALYSIS:\s*([\s\S]*?)(?=SCORE:|$)/i);
    const scoreMatch = content.match(/SCORE:\s*([\d.]+)/i);
    const feedbackMatch = content.match(/FEEDBACK:\s*([\s\S]*?)(?=$)/i);

    const analysis = analysisMatch ? analysisMatch[1].trim() : content;
    const scoreText = scoreMatch ? scoreMatch[1] : "7.5";
    const score = parseFloat(scoreText);
    const feedback = feedbackMatch ? feedbackMatch[1].trim() : "";

    // Return structured response
    res.json({
      analysis,
      score: isNaN(score) ? 7.5 : score,
      feedback
    });
  } catch (err) {
    console.error("Error analyzing wardrobe item:", err);
    res.status(500).json({ 
      error: "Error analyzing wardrobe item", 
      details: err.message,
      analysis: 'Error analyzing image. Please try again later.',
      score: 5.0,
      feedback: 'Could not process the image analysis.'
    });
  }
});

// Outfit Suggestions
app.post('/api/outfit-suggestions', auth, async (req, res) => {
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

// Simple 404 handler for undefined routes
app.use((req, res) => {
  console.log('Route not found:', req.originalUrl);
  res.status(404).json({ message: 'Route not found' });
});
