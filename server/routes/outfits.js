const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Outfit = require('../models/Outfit');
const WardrobeItem = require('../models/WardrobeItem');

// @route   GET /api/outfits
// @desc    Get all outfits for a user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    console.log('GET /api/outfits - Getting outfits for user:', req.user.id);
    console.log('Using in-memory mode:', !global.usingMongoDB);
    
    if (global.usingMongoDB) {
      // MongoDB is available, use Mongoose
      const outfits = await Outfit.find({ user: req.user.id })
        .sort({ dateCreated: -1 })
        .populate('items', 'id name category color imageUrl');
      return res.json(outfits);
    } else {
      // Use in-memory storage
      console.log('Using in-memory outfits storage');
      const userOutfits = global.inMemoryOutfits.filter(outfit => outfit.user === req.user.id);
      // Sort by dateCreated (descending)
      userOutfits.sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated));
      return res.json(userOutfits);
    }
  } catch (err) {
    console.error('Error getting outfits:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/outfits
// @desc    Create a new outfit
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    console.log('POST /api/outfits - Creating outfit for user:', req.user.id);
    console.log('Using in-memory mode:', !global.usingMongoDB);
    console.log('Request body:', req.body);
    
    const {
      name,
      items,
      occasion,
      season,
      favorite,
      tags,
      notes,
      imageUrl
    } = req.body;

    if (global.usingMongoDB) {
      // MongoDB is available, use Mongoose
      
      // Verify all items belong to the user
      if (items && items.length > 0) {
        const itemsCount = await WardrobeItem.countDocuments({
          _id: { $in: items },
          user: req.user.id
        });
        
        if (itemsCount !== items.length) {
          return res.status(400).json({ message: 'One or more items do not belong to the user' });
        }
      }

      // Create new outfit
      const newOutfit = new Outfit({
        user: req.user.id,
        name,
        items,
        occasion,
        season: season || ['ALL_SEASON'],
        favorite: favorite || false,
        tags: tags || [],
        notes,
        imageUrl
      });

      // Save to database
      const outfit = await newOutfit.save();
      
      // Populate the items before sending response
      const populatedOutfit = await Outfit.findById(outfit._id)
        .populate('items', 'id name category color imageUrl');
      
      return res.json(populatedOutfit);
    } else {
      // Use in-memory storage
      console.log('Using in-memory outfits storage for creation');
      
      // Verify all items belong to the user if using in-memory storage
      if (items && items.length > 0) {
        const userItems = global.inMemoryWardrobeItems.filter(item => item.user === req.user.id);
        const userItemIds = userItems.map(item => item.id);
        const validItems = items.filter(itemId => userItemIds.includes(itemId));
        
        if (validItems.length !== items.length) {
          return res.status(400).json({ message: 'One or more items do not belong to the user' });
        }
      }
      
      // Create new outfit for in-memory storage
      const newOutfit = {
        id: `outfit-${Date.now()}`,
        user: req.user.id,
        name,
        items: items || [],
        occasion,
        season: season || ['ALL_SEASON'],
        favorite: favorite || false,
        tags: tags || [],
        notes,
        imageUrl,
        dateCreated: new Date(),
        timesWorn: 0
      };
      
      // Add to in-memory storage
      global.inMemoryOutfits.push(newOutfit);
      
      // Return the created outfit
      return res.json(newOutfit);
    }
  } catch (err) {
    console.error('Error creating outfit:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/outfits/:id
// @desc    Get a specific outfit
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    console.log(`GET /api/outfits/${req.params.id} - Getting outfit for user:`, req.user.id);
    console.log('Using in-memory mode:', !global.usingMongoDB);
    
    if (global.usingMongoDB) {
      // MongoDB is available, use Mongoose
      const outfit = await Outfit.findById(req.params.id)
        .populate('items', 'id name category color imageUrl');
      
      // Check if outfit exists
      if (!outfit) {
        return res.status(404).json({ message: 'Outfit not found' });
      }
      
      // Check if user owns the outfit
      if (outfit.user.toString() !== req.user.id) {
        return res.status(401).json({ message: 'Not authorized' });
      }
      
      return res.json(outfit);
    } else {
      // Use in-memory storage
      console.log('Using in-memory outfits storage for retrieval');
      
      // Find outfit by ID in in-memory storage
      const outfit = global.inMemoryOutfits.find(outfit => outfit.id === req.params.id);
      
      // Check if outfit exists
      if (!outfit) {
        return res.status(404).json({ message: 'Outfit not found' });
      }
      
      // Check if user owns the outfit
      if (outfit.user !== req.user.id) {
        return res.status(401).json({ message: 'Not authorized' });
      }
      
      // If items are included in the outfit, populate them with item details
      if (outfit.items && outfit.items.length > 0) {
        const populatedItems = outfit.items.map(itemId => {
          const item = global.inMemoryWardrobeItems.find(item => item.id === itemId);
          if (item) {
            return {
              id: item.id,
              name: item.name,
              category: item.category,
              color: item.color,
              imageUrl: item.imageUrl
            };
          }
          return null;
        }).filter(item => item !== null);
        
        const populatedOutfit = { ...outfit, items: populatedItems };
        return res.json(populatedOutfit);
      }
      
      return res.json(outfit);
    }
  } catch (err) {
    console.error('Error getting outfit by ID:', err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Outfit not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/outfits/:id
// @desc    Update an outfit
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    console.log(`PUT /api/outfits/${req.params.id} - Updating outfit for user:`, req.user.id);
    console.log('Using in-memory mode:', !global.usingMongoDB);
    console.log('Request body:', req.body);
    
    const {
      name,
      items,
      occasion,
      season,
      favorite,
      tags,
      notes,
      imageUrl
    } = req.body;
    
    if (global.usingMongoDB) {
      // MongoDB is available, use Mongoose
      let outfit = await Outfit.findById(req.params.id);
      
      // Check if outfit exists
      if (!outfit) {
        return res.status(404).json({ message: 'Outfit not found' });
      }
      
      // Check if user owns the outfit
      if (outfit.user.toString() !== req.user.id) {
        return res.status(401).json({ message: 'Not authorized' });
      }
      
      // Verify all items belong to the user
      if (items && items.length > 0) {
        const itemsCount = await WardrobeItem.countDocuments({
          _id: { $in: items },
          user: req.user.id
        });
        
        if (itemsCount !== items.length) {
          return res.status(400).json({ message: 'One or more items do not belong to the user' });
        }
      }
      
      // Build outfit object
      const outfitFields = {};
      if (name) outfitFields.name = name;
      if (items) outfitFields.items = items;
      if (occasion !== undefined) outfitFields.occasion = occasion;
      if (season) outfitFields.season = season;
      if (favorite !== undefined) outfitFields.favorite = favorite;
      if (tags) outfitFields.tags = tags;
      if (notes !== undefined) outfitFields.notes = notes;
      if (imageUrl) outfitFields.imageUrl = imageUrl;
      
      // Update outfit
      outfit = await Outfit.findByIdAndUpdate(
        req.params.id,
        { $set: outfitFields },
        { new: true }
      ).populate('items', 'id name category color imageUrl');
      
      return res.json(outfit);
    } else {
      // Use in-memory storage
      console.log('Using in-memory outfits storage for update');
      
      // Find outfit by ID in in-memory storage
      const outfitIndex = global.inMemoryOutfits.findIndex(outfit => outfit.id === req.params.id);
      
      // Check if outfit exists
      if (outfitIndex === -1) {
        return res.status(404).json({ message: 'Outfit not found' });
      }
      
      const outfit = global.inMemoryOutfits[outfitIndex];
      
      // Check if user owns the outfit
      if (outfit.user !== req.user.id) {
        return res.status(401).json({ message: 'Not authorized' });
      }
      
      // Verify all items belong to the user if using in-memory storage
      if (items && items.length > 0) {
        const userItems = global.inMemoryWardrobeItems.filter(item => item.user === req.user.id);
        const userItemIds = userItems.map(item => item.id);
        const validItems = items.filter(itemId => userItemIds.includes(itemId));
        
        if (validItems.length !== items.length) {
          return res.status(400).json({ message: 'One or more items do not belong to the user' });
        }
      }
      
      // Update outfit fields
      if (name) outfit.name = name;
      if (items) outfit.items = items;
      if (occasion !== undefined) outfit.occasion = occasion;
      if (season) outfit.season = season;
      if (favorite !== undefined) outfit.favorite = favorite;
      if (tags) outfit.tags = tags;
      if (notes !== undefined) outfit.notes = notes;
      if (imageUrl) outfit.imageUrl = imageUrl;
      
      // Update in-memory storage
      global.inMemoryOutfits[outfitIndex] = outfit;
      
      // If items are included in the outfit, populate them with item details
      if (outfit.items && outfit.items.length > 0) {
        const populatedItems = outfit.items.map(itemId => {
          const item = global.inMemoryWardrobeItems.find(item => item.id === itemId);
          if (item) {
            return {
              id: item.id,
              name: item.name,
              category: item.category,
              color: item.color,
              imageUrl: item.imageUrl
            };
          }
          return null;
        }).filter(item => item !== null);
        
        const populatedOutfit = { ...outfit, items: populatedItems };
        return res.json(populatedOutfit);
      }
      
      return res.json(outfit);
    }
  } catch (err) {
    console.error('Error updating outfit:', err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Outfit not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   DELETE /api/outfits/:id
// @desc    Delete an outfit
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    console.log(`DELETE /api/outfits/${req.params.id} - Deleting outfit for user:`, req.user.id);
    console.log('Using in-memory mode:', !global.usingMongoDB);
    
    if (global.usingMongoDB) {
      // MongoDB is available, use Mongoose
      const outfit = await Outfit.findById(req.params.id);
      
      // Check if outfit exists
      if (!outfit) {
        return res.status(404).json({ message: 'Outfit not found' });
      }
      
      // Check if user owns the outfit
      if (outfit.user.toString() !== req.user.id) {
        return res.status(401).json({ message: 'Not authorized' });
      }
      
      // Delete the outfit
      await outfit.remove();
      
      return res.json({ message: 'Outfit removed' });
    } else {
      // Use in-memory storage
      console.log('Using in-memory outfits storage for deletion');
      
      // Find outfit by ID in in-memory storage
      const outfitIndex = global.inMemoryOutfits.findIndex(outfit => outfit.id === req.params.id);
      
      // Check if outfit exists
      if (outfitIndex === -1) {
        return res.status(404).json({ message: 'Outfit not found' });
      }
      
      const outfit = global.inMemoryOutfits[outfitIndex];
      
      // Check if user owns the outfit
      if (outfit.user !== req.user.id) {
        return res.status(401).json({ message: 'Not authorized' });
      }
      
      // Remove from in-memory storage
      global.inMemoryOutfits.splice(outfitIndex, 1);
      
      return res.json({ message: 'Outfit removed' });
    }
  } catch (err) {
    console.error('Error deleting outfit:', err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Outfit not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/outfits/:id/wear
// @desc    Increment times worn counter and update last worn date for outfit and its items
// @access  Private
router.put('/:id/wear', auth, async (req, res) => {
  try {
    let outfit = await Outfit.findById(req.params.id);
    
    // Check if outfit exists
    if (!outfit) {
      return res.status(404).json({ message: 'Outfit not found' });
    }
    
    // Check if user owns the outfit
    if (outfit.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    // Update times worn and last worn date for the outfit
    outfit = await Outfit.findByIdAndUpdate(
      req.params.id,
      { 
        $inc: { timesWorn: 1 },
        $set: { lastWorn: new Date() }
      },
      { new: true }
    ).populate('items', 'id name category color imageUrl');
    
    // Update times worn and last worn date for all items in the outfit
    await WardrobeItem.updateMany(
      { _id: { $in: outfit.items } },
      { 
        $inc: { timesWorn: 1 },
        $set: { lastWorn: new Date() }
      }
    );
    
    res.json(outfit);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Outfit not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/outfits/:id/favorite
// @desc    Toggle favorite status of an outfit
// @access  Private
router.put('/:id/favorite', auth, async (req, res) => {
  try {
    let outfit = await Outfit.findById(req.params.id);
    
    // Check if outfit exists
    if (!outfit) {
      return res.status(404).json({ message: 'Outfit not found' });
    }
    
    // Check if user owns the outfit
    if (outfit.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    // Toggle favorite status
    outfit = await Outfit.findByIdAndUpdate(
      req.params.id,
      { $set: { favorite: !outfit.favorite } },
      { new: true }
    ).populate('items', 'id name category color imageUrl');
    
    res.json(outfit);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Outfit not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router;
