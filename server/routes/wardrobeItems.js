const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const WardrobeItem = require('../models/WardrobeItem');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const fetch = require('node-fetch');

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Simplified multer configuration
const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
      const uniqueName = `image-${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname) || '.jpg'}`;
      cb(null, uniqueName);
    }
  }),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// @route   GET /api/wardrobe-items
// @desc    Get all wardrobe items for a user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    if (global.usingMongoDB) {
      const wardrobeItems = await WardrobeItem.find({ user: req.user.id }).sort({ dateAdded: -1 });
      res.json(wardrobeItems);
    } else {
      // Filter items for the current user from in-memory storage
      const userItems = global.inMemoryWardrobeItems.filter(item => item.user === req.user.id);
      // Sort by dateAdded (newest first)
      userItems.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
      res.json(userItems);
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/wardrobe-items
// @desc    Add a new wardrobe item
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    console.log('=== POST /api/wardrobe-items START ===');
    console.log('Request body keys:', Object.keys(req.body));
    console.log('Request has image?', req.body.imageUrl ? 'YES' : 'NO');
    console.log('Request file:', req.file);
    
    // Basic validation
    if (!req.body.name || !req.body.category || !req.body.color) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Extract basic fields
    const name = req.body.name;
    const category = req.body.category;
    const color = req.body.color;
    
    // Handle arrays with safe defaults
    let season = ['ALL_SEASON'];
    
    // Try to parse season if provided
    if (req.body.season) {
      try {
        season = JSON.parse(req.body.season);
      } catch (err) {
        console.log('Using default season due to parsing error');
      }
    }
    
    // Handle image URL
    let imageUrl = null;
    
    console.log('Checking for image in request...');
    console.log('Request body keys:', Object.keys(req.body));
    console.log('Request body imageUrl type:', typeof req.body.imageUrl);
    console.log('Request body imageUrl starts with data:image?', req.body.imageUrl && req.body.imageUrl.startsWith('data:image'));
    
    // Check if we have a file from multer
    if (req.file) {
      console.log('Found file from multer:', req.file.filename);
      // Use absolute URL with hostname for client compatibility
      // Use the request's host and protocol to build the full URL
      const host = req.get('host');
      const protocol = req.protocol;
      imageUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
      console.log('Image saved to:', imageUrl);
    } 
    // Check if we have a base64 image in the request body
    else if (req.body.imageUrl && req.body.imageUrl.startsWith('data:image')) {
      console.log('Found base64 image in request body');
      try {
        // Extract the base64 data and file type
        const matches = req.body.imageUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        
        if (!matches || matches.length !== 3) {
          console.log('Invalid base64 image format');
        } else {
          // Extract content type and base64 data
          const contentType = matches[1];
          const base64Data = matches[2];
          console.log('Image content type:', contentType);
          console.log('Base64 data length:', base64Data.length);
          
          const buffer = Buffer.from(base64Data, 'base64');
          
          // Generate a unique filename
          const filename = `image-${Date.now()}-${Math.round(Math.random() * 1E9)}.${contentType.split('/')[1] || 'jpg'}`;
          const filepath = path.join(uploadDir, filename);
          console.log('Saving image to path:', filepath);
          
          // Check if directory exists and is writable
          try {
            console.log('Upload directory exists:', fs.existsSync(uploadDir));
            console.log('Upload directory writable:', fs.accessSync(uploadDir, fs.constants.W_OK) === undefined);
          } catch (err) {
            console.error('Directory access error:', err);
          }
          
          // Save the file
          try {
            fs.writeFileSync(filepath, buffer);
            console.log('File saved successfully to:', filepath);
            console.log('File exists after save:', fs.existsSync(filepath));
            console.log('File size:', fs.statSync(filepath).size, 'bytes');
          } catch (saveErr) {
            console.error('Error saving file:', saveErr);
            throw saveErr;
          }
          
          // Set the image URL - use absolute URL with hostname for client compatibility
          const host = req.get('host');
          const protocol = req.protocol;
          imageUrl = `${protocol}://${host}/uploads/${filename}`;
          console.log('Base64 image saved to:', imageUrl);
        }
      } catch (error) {
        console.error('Error saving base64 image:', error);
        console.error('Error details:', error.message);
      }
    } else {
      console.log('No image received in request');
    }
    
    // Create the item object
    const itemData = {
      user: req.user.id,
      name,
      category,
      color,
      season,
      imageUrl,
      wishlist: req.body.wishlist === true || req.body.wishlist === 'true'
    };
    
    console.log('Wishlist property in request:', req.body.wishlist);
    console.log('Wishlist property type:', typeof req.body.wishlist);
    
    console.log('Creating wardrobe item with data:');
    console.log('- name:', name);
    console.log('- category:', category);
    console.log('- color:', color);
    console.log('- season:', season);
    console.log('- imageUrl:', imageUrl);
    console.log('- wishlist:', itemData.wishlist);
    
    // Store the item (MongoDB or in-memory)
    if (global.usingMongoDB) {
      const newItem = new WardrobeItem(itemData);
      const item = await newItem.save();
      console.log('Item saved successfully with ID:', item.id);
      console.log('Final imageUrl in saved item:', item.imageUrl);
      console.log('=== POST /api/wardrobe-items END ===');
      return res.json(item);
    } else {
      // In-memory storage
      const newItem = {
        ...itemData,
        id: `item-${Date.now()}`,
        dateAdded: new Date().toISOString(),
        timesWorn: 0
      };
      
      // Make sure the in-memory array exists
      if (!global.inMemoryWardrobeItems) {
        global.inMemoryWardrobeItems = [];
      }
      
      global.inMemoryWardrobeItems.push(newItem);
      console.log('Item saved successfully with ID:', newItem.id);
      console.log('Final imageUrl in saved item:', newItem.imageUrl);
      console.log('=== POST /api/wardrobe-items END ===');
      return res.json(newItem);
    }
  } catch (err) {
    console.error('Error adding wardrobe item:', err);
    console.error('Error stack:', err.stack);
    
    // Send detailed error response for debugging
    res.status(500).send({
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
    const item = await WardrobeItem.findById(req.params.id);
    
    // Check if item exists
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    // Check if user owns the item
    if (item.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    res.json(item);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/wardrobe-items/:id
// @desc    Update a wardrobe item
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    if (global.usingMongoDB) {
      let item = await WardrobeItem.findById(req.params.id);

      // Check if item exists
      if (!item) {
        return res.status(404).json({ message: 'Item not found' });
      }

      // Check if user owns the item
      if (item.user.toString() !== req.user.id) {
        return res.status(401).json({ message: 'Not authorized' });
      }

      // Update item
      item = await WardrobeItem.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true }
      );

      res.json(item);
    } else {
      // Find item in in-memory storage
      const itemIndex = global.inMemoryWardrobeItems.findIndex(item => item.id === req.params.id);
      
      // Check if item exists
      if (itemIndex === -1) {
        return res.status(404).json({ message: 'Item not found' });
      }
      
      // Check if user owns the item
      if (global.inMemoryWardrobeItems[itemIndex].user !== req.user.id) {
        return res.status(401).json({ message: 'Not authorized' });
      }
      
      // Update item
      global.inMemoryWardrobeItems[itemIndex] = {
        ...global.inMemoryWardrobeItems[itemIndex],
        ...req.body,
        id: req.params.id // Ensure ID doesn't change
      };
      
      res.json(global.inMemoryWardrobeItems[itemIndex]);
    }
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   DELETE /api/wardrobe-items/:id
// @desc    Delete a wardrobe item
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    if (global.usingMongoDB) {
      const item = await WardrobeItem.findById(req.params.id);
      
      // Check if item exists
      if (!item) {
        return res.status(404).json({ message: 'Item not found' });
      }
      
      // Check if user owns the item
      if (item.user.toString() !== req.user.id) {
        return res.status(401).json({ message: 'Not authorized' });
      }
      
      // Delete the item
      await item.remove();
      
      res.json({ message: 'Item removed' });
    } else {
      // Find item in in-memory storage
      const itemIndex = global.inMemoryWardrobeItems.findIndex(item => item.id === req.params.id);
      
      // Check if item exists
      if (itemIndex === -1) {
        return res.status(404).json({ message: 'Item not found' });
      }
      
      // Check if user owns the item
      if (global.inMemoryWardrobeItems[itemIndex].user !== req.user.id) {
        return res.status(401).json({ message: 'Not authorized' });
      }
      
      // Delete the item
      global.inMemoryWardrobeItems.splice(itemIndex, 1);
      
      res.json({ message: 'Item removed' });
    }
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/wardrobe-items/:id/wear
// @desc    Increment times worn counter and update last worn date
// @access  Private
router.put('/:id/wear', auth, async (req, res) => {
  try {
    let item = await WardrobeItem.findById(req.params.id);
    
    // Check if item exists
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    // Check if user owns the item
    if (item.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    // Update times worn and last worn date
    item = await WardrobeItem.findByIdAndUpdate(
      req.params.id,
      { 
        $inc: { timesWorn: 1 },
        $set: { lastWorn: new Date() }
      },
      { new: true }
    );
    
    res.json(item);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST /api/wardrobe-items/test-image
// @desc    Test endpoint for image upload
// @access  Public
router.post('/test-image', async (req, res) => {
  try {
    console.log('POST /api/wardrobe-items/test-image received');
    console.log('Request body keys:', Object.keys(req.body));
    
    if (!req.body.image) {
      return res.status(400).json({ error: 'No image data provided' });
    }
    
    // Extract the base64 data
    const matches = req.body.image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ error: 'Invalid image format' });
    }
    
    // Extract content type and base64 data
    const contentType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Ensure uploads directory exists
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      console.log('Creating uploads directory...');
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    // Generate a unique filename
    const filename = `test-image-${Date.now()}.${contentType.split('/')[1] || 'jpg'}`;
    const filepath = path.join(uploadDir, filename);
    
    // Save the file
    fs.writeFileSync(filepath, buffer);
    console.log('Test image saved to:', filepath);
    
    // Return the FULL URL to the saved image (including hostname)
    const host = req.get('host');
    const protocol = req.protocol;
    const imageUrl = `${protocol}://${host}/uploads/${filename}`;
    console.log('Returning full image URL:', imageUrl);
    
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
    
    console.log('[Server] Downloading image from URL:', imageUrl);
    
    // Download the image from external URL
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }
    
    // Get the image buffer
    const imageBuffer = await response.buffer();
    
    // Determine file extension from content type or URL
    let fileExt = 'jpg'; // default
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('image/png')) fileExt = 'png';
    else if (contentType?.includes('image/gif')) fileExt = 'gif';
    else if (contentType?.includes('image/webp')) fileExt = 'webp';
    else if (contentType?.includes('image/jpeg')) fileExt = 'jpg';
    else {
      // Try to extract from URL
      const urlExt = imageUrl.split('.').pop()?.split('?')[0]?.toLowerCase();
      if (urlExt && ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(urlExt)) {
        fileExt = urlExt === 'jpeg' ? 'jpg' : urlExt;
      }
    }
    
    // Generate unique filename
    const uniqueName = `downloaded-${Date.now()}-${Math.round(Math.random() * 1E9)}.${fileExt}`;
    const filePath = path.join(uploadDir, uniqueName);
    
    // Save the image to disk
    fs.writeFileSync(filePath, imageBuffer);
    
    // Return the relative URL path for the stored image
    const imageUrlPath = `/uploads/${uniqueName}`;
    
    console.log('[Server] Image downloaded and saved successfully:', imageUrlPath);
    
    res.json({
      success: true,
      imageUrl: imageUrlPath,
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
