const express = require('express');
const router = express.Router();
const auth = require('../../../middleware/auth');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'https://gujpqecwdftbwkcnwiup.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1anBxZWN3ZGZ0YndrY253aXVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MTU0NDksImV4cCI6MjA2ODA5MTQ0OX0.1_ViFuaH4PAiTk_QkSm7S9srp1rQa_Zv7D2a8pJx5So';
const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔴 TRYING TO IMPORT scenarioCoverageTriggers...');
const { onItemAdded, onItemUpdated, onItemDeleted } = require('../../../utils/scenarioCoverageTriggers');
console.log('🟢 SUCCESS: scenarioCoverageTriggers imported:', { onItemAdded, onItemUpdated, onItemDeleted });

// @route   GET /api/wardrobe-items
// @desc    Get all wardrobe items for user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    // Use in-memory storage for tests
    if (process.env.NODE_ENV === 'test' && global.inMemoryWardrobeItems) {
      const userItems = global.inMemoryWardrobeItems
        .filter(item => item.user === req.user.id)
        .sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded)); // Sort newest first
      return res.json(userItems);
    }

    // Get items from Supabase database
    const { data, error } = await supabase
      .from('wardrobe_items')
      .select('*')
      .eq('user_id', req.user.id)
      .order('date_added', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Failed to fetch items from database' });
    }

    res.json(data || []);
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
      closure, // Added closure field!
      details,
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
      closure, // Added closure field!
      details,
      season: season || [],
      scenarios: scenarios || [],
      wishlist: wishlist === true || wishlist === 'true', // Handle boolean conversion
      imageUrl,
      tags: tags || {},
      dateAdded: new Date().toISOString()
    };

    console.log('[API] Creating item with closure:', newItem.closure);

    // Map fields for Supabase (convert camelCase to snake_case)
    const supabaseData = {
      user_id: req.user.id,
      name: newItem.name,
      category: newItem.category,
      subcategory: newItem.subcategory,
      color: newItem.color,
      pattern: newItem.pattern,
      material: newItem.material,
      brand: newItem.brand,
      silhouette: newItem.silhouette,
      length: newItem.length,
      sleeves: newItem.sleeves,
      style: newItem.style,
      rise: newItem.rise,
      neckline: newItem.neckline,
      heel_height: newItem.heelHeight,
      boot_height: newItem.bootHeight,
      type: newItem.type,
      closure: newItem.closure, // The key field!
      details: newItem.details,
      season: newItem.season,
      scenarios: newItem.scenarios,
      image_url: newItem.imageUrl,
      wishlist: newItem.wishlist,
      date_added: newItem.dateAdded,
      tags: newItem.tags
    };

    // Use in-memory storage for tests
    if (process.env.NODE_ENV === 'test' && global.inMemoryWardrobeItems) {
      // Create test item with proper structure
      const testItem = {
        id: `test-item-${Date.now()}-${Math.random()}`,
        ...newItem,
        user: req.user.id,
        userId: req.user.id,
        dateAdded: new Date().toISOString()
      };
      
      global.inMemoryWardrobeItems.push(testItem);
      console.log('Item saved to in-memory storage (TEST MODE)');
      return res.json(testItem);
    }

    // Remove undefined fields
    Object.keys(supabaseData).forEach(key => {
      if (supabaseData[key] === undefined) {
        delete supabaseData[key];
      }
    });

    // Save to Supabase database
    console.log('Saving item to Supabase with closure:', supabaseData.closure);
    const { data, error } = await supabase
      .from('wardrobe_items')
      .insert([supabaseData])
      .select();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Failed to save item to database', details: error.message });
    }

    const savedItem = data[0];
    console.log('Item saved successfully to Supabase with closure:', savedItem.closure);

    // Trigger scenario coverage recalculation (async, don't block response)
    onItemAdded(req.user.id, savedItem).catch(error => {
      console.error('Failed to update scenario coverage after item addition:', error);
    });

    res.json(savedItem);
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
      closure, // Added closure field for updates!
      details,
      season, 
      scenarios,
      wishlist,
      imageUrl,
      tags
    } = req.body;

    console.log('[API] Updating item with closure:', closure);

    // Build update object with only provided fields
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (category !== undefined) updateData.category = category;
    if (subcategory !== undefined) updateData.subcategory = subcategory;
    if (color !== undefined) updateData.color = color;
    if (pattern !== undefined) updateData.pattern = pattern;
    if (material !== undefined) updateData.material = material;
    if (brand !== undefined) updateData.brand = brand;
    if (silhouette !== undefined) updateData.silhouette = silhouette;
    if (length !== undefined) updateData.length = length;
    if (sleeves !== undefined) updateData.sleeves = sleeves;
    if (style !== undefined) updateData.style = style;
    if (rise !== undefined) updateData.rise = rise;
    if (neckline !== undefined) updateData.neckline = neckline;
    if (heelHeight !== undefined) updateData.heel_height = heelHeight;
    if (bootHeight !== undefined) updateData.boot_height = bootHeight;
    if (type !== undefined) updateData.type = type;
    if (closure !== undefined) updateData.closure = closure; // THE KEY FIELD!
    if (details !== undefined) updateData.details = details;
    if (season !== undefined) updateData.season = season;
    if (scenarios !== undefined) updateData.scenarios = scenarios;
    if (wishlist !== undefined) updateData.wishlist = wishlist === true || wishlist === 'true';
    if (imageUrl !== undefined) updateData.image_url = imageUrl;
    if (tags !== undefined) updateData.tags = tags;

    console.log('[API] Updating Supabase with closure:', updateData.closure);

    // Use in-memory storage for tests
    if (process.env.NODE_ENV === 'test' && global.inMemoryWardrobeItems) {
      const item = global.inMemoryWardrobeItems.find(item => item.id === id);
      if (!item) {
        return res.status(404).json({ message: 'Item not found' });
      }
      // Check if user owns the item
      if (item.user !== req.user.id) {
        return res.status(401).json({ message: 'Not authorized' });
      }
      
      // Update the item - map camelCase back to match in-memory structure
      const itemIndex = global.inMemoryWardrobeItems.findIndex(item => item.id === id);
      const mappedUpdate = { ...updateData };
      if (mappedUpdate.heel_height !== undefined) {
        mappedUpdate.heelHeight = mappedUpdate.heel_height;
        delete mappedUpdate.heel_height;
      }
      if (mappedUpdate.boot_height !== undefined) {
        mappedUpdate.bootHeight = mappedUpdate.boot_height;
        delete mappedUpdate.boot_height;
      }
      if (mappedUpdate.image_url !== undefined) {
        mappedUpdate.imageUrl = mappedUpdate.image_url;
        delete mappedUpdate.image_url;
      }
      
      const updatedItem = { ...global.inMemoryWardrobeItems[itemIndex], ...mappedUpdate };
      global.inMemoryWardrobeItems[itemIndex] = updatedItem;
      console.log('[API] Item updated in in-memory storage (TEST MODE)');
      return res.json(updatedItem);
    }

    // Update in Supabase database
    const { data, error } = await supabase
      .from('wardrobe_items')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select();

    if (error) {
      console.error('Supabase update error:', error);
      return res.status(500).json({ error: 'Failed to update item in database', details: error.message });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ message: 'Item not found' });
    }

    const updatedItem = data[0];
    console.log('[API] Item updated successfully with closure:', updatedItem.closure);

    // Trigger scenario coverage recalculation (async, don't block response)
    // Note: oldItem comparison skipped for now - using frontend Supabase service instead
    onItemUpdated(req.user.id, {}, updatedItem).catch(error => {
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
    
    // Use in-memory storage for tests
    if (process.env.NODE_ENV === 'test' && global.inMemoryWardrobeItems) {
      const item = global.inMemoryWardrobeItems.find(item => item.id === id);
      if (!item) {
        return res.status(404).json({ message: 'Item not found' });
      }
      // Check if user owns the item
      if (item.user !== req.user.id) {
        return res.status(401).json({ message: 'Not authorized' });
      }
      
      // Delete the item
      const itemIndex = global.inMemoryWardrobeItems.findIndex(item => item.id === id);
      global.inMemoryWardrobeItems.splice(itemIndex, 1);
      return res.json({ message: 'Item removed' });
    }

    // Delete from Supabase database
    const { data, error } = await supabase
      .from('wardrobe_items')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select();

    if (error) {
      console.error('Supabase delete error:', error);
      return res.status(500).json({ error: 'Failed to delete item from database', details: error.message });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ message: 'Item not found' });
    }

    const deletedItem = data[0];

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
