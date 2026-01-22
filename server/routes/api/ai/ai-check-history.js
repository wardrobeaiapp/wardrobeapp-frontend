const express = require('express');
const auth = require('../../../middleware/auth');
const supabaseConfig = require('../../../shared/supabaseConfig');
const { 
  transformAnalysisForDatabase, 
  transformDatabaseToFrontend,
  calculateHistoryStats 
} = require('../../../utils/aiCheckTransforms');

const router = express.Router();

// Get Supabase client
const supabase = supabaseConfig.getClient();

// Routes for AI Check History management

// @route   POST /api/ai-check-history
// @desc    Save AI Check analysis result to history
// @access  Private (requires authentication)
router.post('/', auth, async (req, res) => {
  try {
    
    if (!supabaseConfig.isConfigured()) {
      return res.status(503).json({ 
        error: 'Database configuration not available',
        details: 'Supabase configuration is missing'
      });
    }

    if (!req.user) {
      console.error('❌ req.user is undefined - auth middleware failed');
      return res.status(401).json({ 
        error: 'Authentication failed - user not found',
        details: 'req.user is undefined'
      });
    }

    const { analysis_data, item_data } = req.body;
    const user_id = req.user.id;
    
    // Validate required fields
    if (!analysis_data) {
      return res.status(400).json({ 
        error: 'analysis_data is required' 
      });
    }
    
    if (!item_data || !item_data.id || !item_data.name) {
      return res.status(400).json({ 
        error: 'item_data with id and name is required' 
      });
    }
    
    if (typeof analysis_data.score !== 'number' || analysis_data.score < 0 || analysis_data.score > 10) {
      return res.status(400).json({ 
        error: 'analysis_data.score must be a number between 0 and 10' 
      });
    }

    // Transform analysis data for database storage
    let historyData;
    try {
      historyData = transformAnalysisForDatabase(analysis_data, item_data, user_id);
      
      // Debug log to verify analysis_data is included
      console.log('🔍 historyData includes analysis_data:', {
        hasAnalysisData: !!historyData.analysis_data,
        analysisDataSize: historyData.analysis_data ? JSON.stringify(historyData.analysis_data).length : 0,
        allFields: Object.keys(historyData)
      });
    } catch (transformError) {
      console.error('❌ Step 1: Data transformation failed:', transformError);
      throw transformError;
    }


    // Upsert history record (insert or update if exists) - SAME AS ANALYSIS-MOCKS
    const { data: historyRecord, error: historyError } = await supabase
      .from('ai_check_history')
      .upsert(historyData, { 
        onConflict: 'wardrobe_item_id,created_by', // SAME PATTERN AS MOCKS
        ignoreDuplicates: false 
      })
      .select('id, wardrobe_item_id, compatibility_score, created_at')
      .single();
      

    if (historyError) {
      console.error('Error saving AI Check history:', {
        error: historyError,
        code: historyError.code,
        message: historyError.message,
        details: historyError.details
      });
      return res.status(500).json({ 
        error: 'Failed to save AI Check history',
        details: historyError.message,
        code: historyError.code
      });
    }

    
    res.json({
      success: true,
      message: 'AI Check history saved successfully',
      history_record: historyRecord
    });

  } catch (error) {
    console.error('❌ Error in POST /api/ai-check-history:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

// @route   GET /api/ai-check-history
// @desc    Get AI Check history for authenticated user
// @access  Private (requires authentication)
router.get('/', auth, async (req, res) => {
  try {
    if (!supabaseConfig.isConfigured()) {
      return res.status(503).json({ 
        error: 'Database configuration not available',
        details: 'Supabase configuration is missing'
      });
    }

    const user_id = req.user.id;
    const { limit = 50, offset = 0, category, min_score, max_score } = req.query;
    
    // Build query
    // Query ALL 18 columns (complete ai_analysis_mocks structure + user_action_status)
    let query = supabase
      .from('ai_check_history')
      .select(`
        id, wardrobe_item_id, analysis_data, created_from_real_analysis, created_by,
        created_at, updated_at,
        compatibility_score, suitable_scenarios, item_subcategory, recommendation_action,
        recommendation_text, wishlist_status, has_compatible_items, outfit_combinations_count,
        analysis_error, analysis_error_details,
        user_action_status
      `)
      .eq('created_by', user_id) // SAME AS MOCKS: filter by created_by not user_id
      .order('created_at', { ascending: false });

    // Apply filters on JSONB analysis_data field (same as analysis-mocks approach)
    if (category) {
      query = query.contains('analysis_data', { itemDetails: { category } });
    }
    
    if (min_score !== undefined) {
      query = query.gte('analysis_data->score', parseFloat(min_score));
    }
    
    if (max_score !== undefined) {
      query = query.lte('analysis_data->score', parseFloat(max_score));
    }

    // Apply pagination
    query = query.range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    const { data: historyRecords, error: historyError } = await query;

    if (historyError) {
      console.error('❌ Error fetching AI Check history:', historyError);
      return res.status(500).json({ 
        error: 'Failed to fetch AI Check history',
        details: historyError.message 
      });
    }

    // Transform data back to frontend format
    const transformedRecords = historyRecords.map(record => transformDatabaseToFrontend(record));

    res.json({
      success: true,
      history: transformedRecords,
      total: transformedRecords.length,
      offset: parseInt(offset),
      limit: parseInt(limit)
    });

  } catch (error) {
    console.error('Error in GET /api/ai-check-history:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

// @route   GET /api/ai-check-history/:id
// @desc    Get specific AI Check history record
// @access  Private (requires authentication)
router.get('/:id', auth, async (req, res) => {
  try {
    if (!supabaseConfig.isConfigured()) {
      return res.status(503).json({ 
        error: 'Database configuration not available',
        details: 'Supabase configuration is missing'
      });
    }

    const { id } = req.params;
    const user_id = req.user.id;
    
    const { data: record, error: fetchError } = await supabase
      .from('ai_check_history')
      .select('*')
      .eq('id', id)
      .eq('user_id', user_id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return res.status(404).json({ 
          error: 'AI Check history record not found' 
        });
      }
      
      console.error('Error fetching AI Check history record:', fetchError);
      return res.status(500).json({ 
        error: 'Failed to fetch AI Check history record',
        details: fetchError.message 
      });
    }

    // Transform to frontend format (same as GET / route)
    const transformedRecord = {
      id: record.id,
      type: 'check',
      title: record.title,
      description: record.description,
      summary: record.summary,
      date: new Date(record.analysis_date),
      status: record.status,
      userActionStatus: record.user_action_status,
      
      // Core analysis results
      score: record.score,
      feedback: record.feedback,
      recommendationText: record.recommendation_text,
      
      // Item details
      itemId: record.item_id,
      itemName: record.item_name,
      itemCategory: record.item_category,
      itemSubcategory: record.item_subcategory,
      itemImageUrl: record.item_image_url,
      itemWishlistStatus: record.item_wishlist_status,
      
      // Analysis data (parse JSON)
      suitableScenarios: JSON.parse(record.suitable_scenarios || '[]'),
      compatibleItems: JSON.parse(record.compatible_items || '{}'),
      outfitCombinations: JSON.parse(record.outfit_combinations || '[]'),
      seasonScenarioCombinations: JSON.parse(record.season_scenario_combinations || '[]'),
      coverageGapsWithNoOutfits: JSON.parse(record.coverage_gaps_with_no_outfits || '[]'),
      
      // Raw analysis data
      rawAnalysis: record.raw_analysis,
      analysisMetadata: JSON.parse(record.analysis_metadata || '{}'),
      
      // Legacy support
      itemsChecked: record.items_checked,
      image: record.item_image_url,
      analysisResults: JSON.parse(record.legacy_analysis_results || '{}')
    };

    res.json({
      success: true,
      record: transformedRecord
    });

  } catch (error) {
    console.error('Error in GET /api/ai-check-history/:id:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

// @route   PUT /api/ai-check-history/:id/status
// @desc    Update user action status for AI Check history record
// @access  Private (requires authentication)
router.put('/:id/status', auth, async (req, res) => {
  try {
    if (!supabaseConfig.isConfigured()) {
      return res.status(503).json({ 
        error: 'Database configuration not available',
        details: 'Supabase configuration is missing'
      });
    }

    const { id } = req.params;
    const { user_action_status } = req.body;
    const user_id = req.user.id;
    
    // Validate status
    const validStatuses = ['saved', 'dismissed', 'pending', 'applied', 'obtained'];
    if (!validStatuses.includes(user_action_status)) {
      return res.status(400).json({ 
        error: 'Invalid user_action_status',
        valid_statuses: validStatuses
      });
    }

    const { data: updatedRecord, error: updateError } = await supabase
      .from('ai_check_history')
      .update({ user_action_status })
      .eq('id', id)
      .eq('created_by', user_id)
      .select('id, user_action_status, updated_at')
      .single();

    if (updateError) {
      console.error('Error updating AI Check history status:', updateError);
      return res.status(500).json({ 
        error: 'Failed to update AI Check history status',
        details: updateError.message 
      });
    }

    if (!updatedRecord) {
      return res.status(404).json({ 
        error: 'AI Check history record not found' 
      });
    }

    
    res.json({
      success: true,
      message: 'Status updated successfully',
      record: updatedRecord
    });

  } catch (error) {
    console.error('Error in PUT /api/ai-check-history/:id/status:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

module.exports = router;
