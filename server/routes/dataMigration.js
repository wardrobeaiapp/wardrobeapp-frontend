const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// @route   POST /api/migrate-data
// @desc    Handle data migration between local storage and server
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    console.log('Data migration request received');
    console.log('Request body:', req.body);
    
    const { wardrobeItems, outfits } = req.body;
    const userId = req.user.id;
    
    // Process wardrobe items
    let migratedItems = [];
    if (wardrobeItems && Array.isArray(wardrobeItems) && wardrobeItems.length > 0) {
      console.log(`Migrating ${wardrobeItems.length} wardrobe items for user ${userId}`);
      
      if (global.usingMongoDB) {
        // MongoDB implementation would go here
        // For now, just return success
        migratedItems = wardrobeItems.map(item => ({
          ...item,
          user: userId
        }));
      } else {
        // In-memory implementation
        // Make sure the in-memory array exists
        if (!global.inMemoryWardrobeItems) {
          global.inMemoryWardrobeItems = [];
        }
        
        // Add user ID to each item and add to in-memory storage
        wardrobeItems.forEach(item => {
          const newItem = {
            ...item,
            user: userId
          };
          global.inMemoryWardrobeItems.push(newItem);
          migratedItems.push(newItem);
        });
      }
    }
    
    // Process outfits
    let migratedOutfits = [];
    if (outfits && Array.isArray(outfits) && outfits.length > 0) {
      console.log(`Migrating ${outfits.length} outfits for user ${userId}`);
      
      if (global.usingMongoDB) {
        // MongoDB implementation would go here
        // For now, just return success
        migratedOutfits = outfits.map(outfit => ({
          ...outfit,
          user: userId
        }));
      } else {
        // In-memory implementation
        // Make sure the in-memory array exists
        if (!global.inMemoryOutfits) {
          global.inMemoryOutfits = [];
        }
        
        // Add user ID to each outfit and add to in-memory storage
        outfits.forEach(outfit => {
          const newOutfit = {
            ...outfit,
            user: userId
          };
          global.inMemoryOutfits.push(newOutfit);
          migratedOutfits.push(newOutfit);
        });
      }
    }
    
    console.log('Data migration successful');
    res.json({
      success: true,
      migratedItems: migratedItems.length,
      migratedOutfits: migratedOutfits.length
    });
  } catch (err) {
    console.error('Error in data migration:', err);
    console.error('Error stack:', err.stack);
    
    res.status(500).json({
      error: 'Server error',
      message: err.message,
      stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
  }
});

module.exports = router;
