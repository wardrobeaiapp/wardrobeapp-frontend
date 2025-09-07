const express = require('express');
const router = express.Router();
const auth = require('../../../middleware/auth');

// @route   GET /api/wardrobe-items
// @desc    Get all wardrobe items for user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    // Return in-memory wardrobe items for the authenticated user
    const userItems = global.inMemoryWardrobeItems.filter(item => item.userId === req.user.id);
    res.json(userItems);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/wardrobe-items
// @desc    Add a new wardrobe item
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { name, category, color, season, occasion, image } = req.body;
    
    // Create a simple item object
    const newItem = {
      id: Date.now().toString(),
      userId: req.user.id,
      name,
      category,
      color,
      season: season || [],
      occasion: occasion || [],
      image,
      dateAdded: new Date().toISOString()
    };

    // Add item to in-memory store
    global.inMemoryWardrobeItems.push(newItem);

    res.json(newItem);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/wardrobe-items/:id
// @desc    Update a wardrobe item
// @access  Private
router.put('/:id', auth, async (req, res) => {
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
      name: name || global.inMemoryWardrobeItems[itemIndex].name,
      category: category || global.inMemoryWardrobeItems[itemIndex].category,
      color: color || global.inMemoryWardrobeItems[itemIndex].color,
      season: season || global.inMemoryWardrobeItems[itemIndex].season,
      occasion: occasion || global.inMemoryWardrobeItems[itemIndex].occasion,
      image: image || global.inMemoryWardrobeItems[itemIndex].image,
    };

    global.inMemoryWardrobeItems[itemIndex] = updatedItem;

    res.json(updatedItem);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/wardrobe-items/:id
// @desc    Delete a wardrobe item
// @access  Private
router.delete('/:id', auth, async (req, res) => {
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

    res.json({ message: 'Item removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
