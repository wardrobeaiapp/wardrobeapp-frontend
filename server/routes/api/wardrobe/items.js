const express = require('express');
const router = express.Router();
const auth = require('../../../middleware/auth');

console.log('🔴 TRYING TO IMPORT scenarioCoverageTriggers...');
const { onItemAdded, onItemUpdated, onItemDeleted } = require('../../../utils/scenarioCoverageTriggers');
console.log('🟢 SUCCESS: scenarioCoverageTriggers imported:', { onItemAdded, onItemUpdated, onItemDeleted });

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
    console.log('[API] POST /api/wardrobe-items received:', req.body);
    
    const { 
      name, 
      category, 
      subcategory, 
      color, 
      pattern,
      material,
      brand,
      silhouette,
      length,
      sleeves,
      style,
      rise,
      neckline,
      heelHeight,
      bootHeight,
      type,
      season, 
      scenarios,
      wishlist,
      imageUrl,
      tags
    } = req.body;
    
    // Create a comprehensive item object
    const newItem = {
      id: Date.now().toString(),
      userId: req.user.id,
      name,
      category,
      subcategory,
      color,
      pattern,
      material,
      brand,
      silhouette,
      length,
      sleeves,
      style,
      rise,
      neckline,
      heelHeight,
      bootHeight,
      type,
      details,
      season: season || [],
      scenarios: scenarios || [],
      wishlist: wishlist === true || wishlist === 'true', // Handle boolean conversion
      imageUrl,
      tags: tags || {},
      dateAdded: new Date().toISOString()
    };

    console.log('[API] Creating item with wishlist:', newItem.wishlist);

    // Add item to in-memory store
    global.inMemoryWardrobeItems.push(newItem);

    // Trigger scenario coverage recalculation (async, don't block response)
    onItemAdded(req.user.id, newItem).catch(error => {
      console.error('Failed to update scenario coverage after item addition:', error);
    });

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
    console.log('[API] PUT /api/wardrobe-items/:id received:', req.body);
    
    const { 
      name, 
      category, 
      subcategory, 
      color, 
      pattern,
      material,
      brand,
      silhouette,
      length,
      sleeves,
      style,
      rise,
      neckline,
      heelHeight,
      bootHeight,
      type,
      details,
      season, 
      scenarios,
      wishlist,
      imageUrl,
      tags
    } = req.body;

    // Find item index
    const itemIndex = global.inMemoryWardrobeItems.findIndex(
      item => item.id === id && item.userId === req.user.id
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Store old item for coverage recalculation
    const oldItem = { ...global.inMemoryWardrobeItems[itemIndex] };

    // Update item with all fields
    const updatedItem = {
      ...global.inMemoryWardrobeItems[itemIndex],
      name: name !== undefined ? name : global.inMemoryWardrobeItems[itemIndex].name,
      category: category !== undefined ? category : global.inMemoryWardrobeItems[itemIndex].category,
      subcategory: subcategory !== undefined ? subcategory : global.inMemoryWardrobeItems[itemIndex].subcategory,
      color: color !== undefined ? color : global.inMemoryWardrobeItems[itemIndex].color,
      pattern: pattern !== undefined ? pattern : global.inMemoryWardrobeItems[itemIndex].pattern,
      material: material !== undefined ? material : global.inMemoryWardrobeItems[itemIndex].material,
      brand: brand !== undefined ? brand : global.inMemoryWardrobeItems[itemIndex].brand,
      silhouette: silhouette !== undefined ? silhouette : global.inMemoryWardrobeItems[itemIndex].silhouette,
      length: length !== undefined ? length : global.inMemoryWardrobeItems[itemIndex].length,
      sleeves: sleeves !== undefined ? sleeves : global.inMemoryWardrobeItems[itemIndex].sleeves,
      style: style !== undefined ? style : global.inMemoryWardrobeItems[itemIndex].style,
      rise: rise !== undefined ? rise : global.inMemoryWardrobeItems[itemIndex].rise,
      neckline: neckline !== undefined ? neckline : global.inMemoryWardrobeItems[itemIndex].neckline,
      heelHeight: heelHeight !== undefined ? heelHeight : global.inMemoryWardrobeItems[itemIndex].heelHeight,
      bootHeight: bootHeight !== undefined ? bootHeight : global.inMemoryWardrobeItems[itemIndex].bootHeight,
      type: type !== undefined ? type : global.inMemoryWardrobeItems[itemIndex].type,
      details: details !== undefined ? details : global.inMemoryWardrobeItems[itemIndex].details,
      season: season !== undefined ? season : global.inMemoryWardrobeItems[itemIndex].season,
      scenarios: scenarios !== undefined ? scenarios : global.inMemoryWardrobeItems[itemIndex].scenarios,
      wishlist: wishlist !== undefined ? (wishlist === true || wishlist === 'true') : global.inMemoryWardrobeItems[itemIndex].wishlist,
      imageUrl: imageUrl !== undefined ? imageUrl : global.inMemoryWardrobeItems[itemIndex].imageUrl,
      tags: tags !== undefined ? tags : global.inMemoryWardrobeItems[itemIndex].tags
    };

    global.inMemoryWardrobeItems[itemIndex] = updatedItem;

    // Trigger scenario coverage recalculation (async, don't block response)
    console.log('🔵 ABOUT TO CALL onItemUpdated with:', {
      userId: req.user.id,
      oldItemName: oldItem.name,
      newItemName: updatedItem.name,
      oldOccasion: oldItem.occasion,
      newOccasion: updatedItem.occasion
    });
    
    onItemUpdated(req.user.id, oldItem, updatedItem).catch(error => {
      console.error('Failed to update scenario coverage after item update:', error);
    });

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

    // Store deleted item for coverage recalculation
    const deletedItem = { ...global.inMemoryWardrobeItems[itemIndex] };

    // Remove item
    global.inMemoryWardrobeItems.splice(itemIndex, 1);

    // Trigger scenario coverage recalculation (async, don't block response)
    onItemDeleted(req.user.id, deletedItem).catch(error => {
      console.error('Failed to update scenario coverage after item deletion:', error);
    });

    res.json({ message: 'Item removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
