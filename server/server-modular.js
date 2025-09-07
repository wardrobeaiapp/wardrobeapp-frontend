const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Anthropic } = require('@anthropic-ai/sdk');

// Load environment variables
dotenv.config();

// Import config and utilities
const connectDB = require('./config/db');
const { initializeInMemoryStores, setupMockModels } = require('./utils/inMemoryStorage');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json({ limit: '50mb' })); // Increased limit for base64 images
app.use(express.urlencoded({ extended: true }));
app.use(cors());
console.log('CORS enabled for all origins');

// Connect to DB and initialize storage
(async () => {
  // Try to connect to MongoDB first
  global.usingMongoDB = await connectDB();
  
  // Initialize in-memory storage
  initializeInMemoryStores();
  
  // Setup mock models
  setupMockModels();
  
  // Start server
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})();

// Define Routes
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/wardrobe-items', require('./routes/api/wardrobe/items'));
app.use('/api/user/style-preferences', require('./routes/api/user/style-preferences'));
app.use('/api/analyze-wardrobe-item', require('./routes/api/ai/analyze'));
app.use('/api/outfit-suggestions', require('./routes/api/outfits/suggestions'));

// Simple 404 handler for undefined routes
app.use((req, res) => {
  console.log('Route not found:', req.originalUrl);
  res.status(404).json({ message: 'Route not found' });
});

// Export app for testing
module.exports = app;
