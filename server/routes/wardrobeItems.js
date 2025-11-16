const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Import our new services and utilities
const imageService = require('../services/imageService');
const supabaseService = require('../services/supabaseService');
const { mapItemDataForSupabase, processItemRequestData } = require('../utils/dataMappers');
const { isValidItemId, validateRequiredFields, validateImageData, userOwnsItem } = require('../utils/validation');

// Create multer upload middleware
const upload = imageService.createMulterConfig().single('image');

// @route   GET /api/wardrobe-items
// @desc    Get all wardrobe items for a user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    // Use in-memory storage for tests
    if (process.env.NODE_ENV === 'test' && global.inMemoryWardrobeItems) {
      const userItems = global.inMemoryWardrobeItems.filter(item => item.user === req.user.id);
      return res.json(userItems);
    }
    
    const items = await supabaseService.getUserWardrobeItems(req.user.id);
    res.json(items);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// @route   POST /api/wardrobe-items
// @desc    Add a new wardrobe item
// @access  Private
router.post('/', auth, upload, async (req, res) => {
  try {
    console.log('=== POST /api/wardrobe-items START ===');
    console.log('Request body keys:', Object.keys(req.body));
    console.log('Request has image?', req.body.imageUrl ? 'YES' : 'NO');
    console.log('Request file:', req.file);
    
    // Validate required fields
    const validation = validateRequiredFields(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ error: 'Missing required fields', details: validation.errors });
    }
    
    // Process item data from request
    const itemData = processItemRequestData(req.body);
    
    // Process image
    const imageUrl = await imageService.processImageFromRequest(req);
    itemData.imageUrl = imageUrl;
    
    console.log('Creating wardrobe item with data:');
    console.log('- name:', itemData.name);
    console.log('- category:', itemData.category);
    console.log('- color:', itemData.color);
    console.log('- season:', itemData.season);
    console.log('- closure:', itemData.closure);
    console.log('- imageUrl:', imageUrl);
    console.log('- wishlist:', itemData.wishlist);
    
    // Use in-memory storage for tests
    if (process.env.NODE_ENV === 'test' && global.inMemoryWardrobeItems) {
      // Create test item with proper structure
      const testItem = {
        id: `test-item-${Date.now()}-${Math.random()}`,
        ...itemData,
        user: req.user.id,
        userId: req.user.id,
        dateAdded: new Date().toISOString()
      };
      
      global.inMemoryWardrobeItems.push(testItem);
      console.log('=== POST /api/wardrobe-items END (TEST MODE) ===');
      return res.status(201).json(testItem);
    }
    
    // Map data for Supabase
    const supabaseData = mapItemDataForSupabase(itemData, req.user.id);
    
    // Save to database
    const newItem = await supabaseService.createWardrobeItem(supabaseData);
    
    console.log('=== POST /api/wardrobe-items END ===');
    return res.status(201).json(newItem);
  } catch (err) {
    console.error('Error adding wardrobe item:', err);
    console.error('Error stack:', err.stack);
    
    res.status(500).json({
      error: 'Server error',
      message: err.message,
      stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
  }
});

// @route   GET /api/wardrobe-items/:id
// @desc    Get a specific wardrobe item
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const itemId = req.params.id;
    
    // Validate item ID
    if (!isValidItemId(itemId)) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    // Use in-memory storage for tests
    if (process.env.NODE_ENV === 'test' && global.inMemoryWardrobeItems) {
      const item = global.inMemoryWardrobeItems.find(item => item.id === itemId && item.user === req.user.id);
      if (!item) {
        return res.status(404).json({ message: 'Item not found' });
      }
      return res.json(item);
    }
    
    // Get item from database
    const item = await supabaseService.getWardrobeItemById(itemId, req.user.id);
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    res.json(item);
  } catch (err) {
    console.error(err.message);
    if (err.message.includes('Invalid ID format') || 
        err.name === 'ValidationError') {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.status(500).json({ error: err.message });
  }
});

// @route   PUT /api/wardrobe-items/:id
// @desc    Update a wardrobe item
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const itemId = req.params.id;
    
    // Validate item ID
    if (!isValidItemId(itemId)) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    // Use in-memory storage for tests
    if (process.env.NODE_ENV === 'test' && global.inMemoryWardrobeItems) {
      const itemIndex = global.inMemoryWardrobeItems.findIndex(item => item.id === itemId && item.user === req.user.id);
      if (itemIndex === -1) {
        return res.status(404).json({ message: 'Item not found' });
      }
      
      // Update the item
      const updatedItem = { ...global.inMemoryWardrobeItems[itemIndex], ...req.body };
      global.inMemoryWardrobeItems[itemIndex] = updatedItem;
      return res.json(updatedItem);
    }
    
    // Update item in database
    const updatedItem = await supabaseService.updateWardrobeItem(itemId, req.user.id, req.body);
    
    if (!updatedItem) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    res.json(updatedItem);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// @route   DELETE /api/wardrobe-items/:id
// @desc    Delete a wardrobe item
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const itemId = req.params.id;
    
    // Validate item ID
    if (!isValidItemId(itemId)) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    // Use in-memory storage for tests
    if (process.env.NODE_ENV === 'test' && global.inMemoryWardrobeItems) {
      const itemIndex = global.inMemoryWardrobeItems.findIndex(item => item.id === itemId && item.user === req.user.id);
      if (itemIndex === -1) {
        return res.status(404).json({ message: 'Item not found' });
      }
      
      // Delete the item
      global.inMemoryWardrobeItems.splice(itemIndex, 1);
      return res.json({ message: 'Item removed' });
    }
    
    // Delete item from database
    const deleted = await supabaseService.deleteWardrobeItem(itemId, req.user.id);
    
    if (!deleted) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    res.json({ message: 'Item removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// @route   PUT /api/wardrobe-items/:id/wear
// @desc    Increment times worn counter and update last worn date
// @access  Private
router.put('/:id/wear', auth, async (req, res) => {
  try {
    const itemId = req.params.id;
    
    // Validate item ID
    if (!isValidItemId(itemId)) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    // Get current item
    const currentItem = await supabaseService.getWardrobeItemById(itemId, req.user.id);
    if (!currentItem) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    // Update wear data
    const wearData = {
      times_worn: (currentItem.times_worn || 0) + 1,
      last_worn: new Date().toISOString()
    };
    
    const updatedItem = await supabaseService.updateWardrobeItem(itemId, req.user.id, wearData);
    
    res.json(updatedItem);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// @route   POST /api/wardrobe-items/test-image
// @desc    Test endpoint for image upload
// @access  Public
router.post('/test-image', async (req, res) => {
  try {
    console.log('POST /api/wardrobe-items/test-image received');
    console.log('Request body keys:', Object.keys(req.body));
    
    const validation = validateImageData(req.body.image);
    if (!validation.isValid) {
      return res.status(400).json({ error: validation.error });
    }
    
    // Process the base64 image
    const imageUrl = await imageService.processBase64Image(req.body.image, req);
    
    if (!imageUrl) {
      return res.status(500).json({ error: 'Failed to process image' });
    }
    
    return res.json({ success: true, imageUrl });
  } catch (err) {
    console.error('Error in test image upload:', err);
    return res.status(500).json({ error: 'Server error', message: err.message });
  }
});

// @route   POST /api/wardrobe-items/download-image
// @desc    Download external image and store it locally (bypasses CORS)
// @access  Private
router.post('/download-image', auth, async (req, res) => {
  try {
    const { imageUrl } = req.body;
    
    if (!imageUrl) {
      return res.status(400).json({ error: 'Image URL is required' });
    }
    
    const localImageUrl = await imageService.downloadExternalImage(imageUrl, req);
    
    res.json({
      success: true,
      imageUrl: localImageUrl,
      originalUrl: imageUrl
    });
    
  } catch (err) {
    console.error('[Server] Error downloading image:', err);
    res.status(500).json({
      error: 'Failed to download image',
      message: err.message
    });
  }
});

module.exports = router;
