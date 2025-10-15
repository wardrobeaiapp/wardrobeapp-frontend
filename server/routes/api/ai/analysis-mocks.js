const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const router = express.Router();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase configuration for ai-analysis-mocks');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// @route   POST /api/ai-analysis-mocks
// @desc    Save AI analysis result as mock data for demo use
// @access  Private (requires authentication)
router.post('/', async (req, res) => {
  try {
    const { wardrobe_item_id, analysis_data, user_id } = req.body;
    
    console.log('Saving AI analysis mock:', {
      wardrobe_item_id,
      user_id,
      analysis_data_keys: analysis_data ? Object.keys(analysis_data) : null
    });
    
    // Validate required fields
    if (!wardrobe_item_id) {
      return res.status(400).json({ 
        error: 'wardrobe_item_id is required' 
      });
    }
    
    if (!analysis_data) {
      return res.status(400).json({ 
        error: 'analysis_data is required' 
      });
    }
    
    if (!user_id) {
      return res.status(400).json({ 
        error: 'user_id is required' 
      });
    }

    // Verify the wardrobe item belongs to the user
    const { data: wardrobeItem, error: itemError } = await supabase
      .from('wardrobe_items')
      .select('id, user_id')
      .eq('id', wardrobe_item_id)
      .eq('user_id', user_id)
      .single();
    
    if (itemError || !wardrobeItem) {
      return res.status(404).json({ 
        error: 'Wardrobe item not found or access denied' 
      });
    }

    // Insert or update the mock data (upsert)
    const { data: mockData, error: mockError } = await supabase
      .from('ai_analysis_mocks')
      .upsert(
        {
          wardrobe_item_id,
          analysis_data,
          created_from_real_analysis: true,
          created_by: user_id,
          updated_at: new Date().toISOString()
        },
        { 
          onConflict: 'wardrobe_item_id',
          returning: 'minimal'
        }
      );

    if (mockError) {
      console.error('Error saving analysis mock:', mockError);
      return res.status(500).json({ 
        error: 'Failed to save analysis mock',
        details: mockError.message 
      });
    }

    console.log('Analysis mock saved successfully for item:', wardrobe_item_id);
    
    res.json({
      success: true,
      message: 'Analysis mock saved successfully',
      wardrobe_item_id
    });

  } catch (error) {
    console.error('Error in POST /api/ai-analysis-mocks:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

// @route   GET /api/ai-analysis-mocks/:itemId
// @desc    Get mock analysis data for a specific wardrobe item
// @access  Public (for demo use)
router.get('/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;
    
    console.log('Fetching analysis mock for item:', itemId);
    
    if (!itemId) {
      return res.status(400).json({ 
        error: 'Item ID is required' 
      });
    }

    // Get the mock data for this item
    const { data: mockData, error: mockError } = await supabase
      .from('ai_analysis_mocks')
      .select('analysis_data, created_at, updated_at')
      .eq('wardrobe_item_id', itemId)
      .single();

    if (mockError) {
      if (mockError.code === 'PGRST116') {
        // No mock data found - not an error, just return null
        return res.json({ 
          success: true,
          mock_data: null,
          message: 'No mock data available for this item'
        });
      }
      
      console.error('Error fetching analysis mock:', mockError);
      return res.status(500).json({ 
        error: 'Failed to fetch analysis mock',
        details: mockError.message 
      });
    }

    console.log('Analysis mock found for item:', itemId);
    
    res.json({
      success: true,
      mock_data: mockData.analysis_data,
      created_at: mockData.created_at,
      updated_at: mockData.updated_at
    });

  } catch (error) {
    console.error('Error in GET /api/ai-analysis-mocks/:itemId:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

// @route   GET /api/ai-analysis-mocks/check-multiple
// @desc    Check which items from a list have mock data available
// @access  Public (for demo use)
router.post('/check-multiple', async (req, res) => {
  try {
    const { item_ids } = req.body;
    
    console.log('Checking mock availability for items:', item_ids?.length || 0);
    
    if (!item_ids || !Array.isArray(item_ids) || item_ids.length === 0) {
      return res.status(400).json({ 
        error: 'item_ids array is required' 
      });
    }

    // Get mock data availability for multiple items
    const { data: mockData, error: mockError } = await supabase
      .from('ai_analysis_mocks')
      .select('wardrobe_item_id, created_at')
      .in('wardrobe_item_id', item_ids);

    if (mockError) {
      console.error('Error checking mock availability:', mockError);
      return res.status(500).json({ 
        error: 'Failed to check mock availability',
        details: mockError.message 
      });
    }

    // Create a map of item_id -> has_mock_data
    const mockAvailability = {};
    item_ids.forEach(itemId => {
      mockAvailability[itemId] = false;
    });
    
    mockData.forEach(mock => {
      mockAvailability[mock.wardrobe_item_id] = true;
    });

    console.log(`Mock availability checked: ${mockData.length}/${item_ids.length} items have mocks`);
    
    res.json({
      success: true,
      mock_availability: mockAvailability,
      total_items: item_ids.length,
      items_with_mocks: mockData.length
    });

  } catch (error) {
    console.error('Error in POST /api/ai-analysis-mocks/check-multiple:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

module.exports = router;
