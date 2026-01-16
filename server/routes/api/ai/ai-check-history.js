const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const auth = require('../../../middleware/auth');

const router = express.Router();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'https://gujpqecwdftbwkcnwiup.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1anBxZWN3ZGZ0YndrY253aXVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MTU0NDksImV4cCI6MjA2ODA5MTQ0OX0.1_ViFuaH4PAiTk_QkSm7S9srp1rQa_Zv7D2a8pJx5So';

// Use service role key for server-side operations to bypass RLS
const supabaseKey = supabaseServiceKey || supabaseAnonKey;

console.log('🔑 Supabase client for ai-check-history using:', 
  process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SERVICE_ROLE_KEY (can bypass RLS)' : 'ANON_KEY (RLS applied)');

let supabase = null;
let supabaseConfigured = false;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase configuration for ai-check-history');
  supabaseConfigured = false;
} else {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    supabaseConfigured = true;
    console.log('Supabase client initialized for ai-check-history');
  } catch (error) {
    console.error('Failed to initialize Supabase client for ai-check-history:', error);
    supabaseConfigured = false;
  }
}

/**
 * Transform WardrobeItemAnalysis data to database format
 */
function transformAnalysisForDatabase(analysisData, itemData) {
  const now = new Date().toISOString();
  
  // Generate title using item name
  const title = `AI Check: ${itemData.name}`;
  
  // Create description from core analysis
  const description = analysisData.feedback || 'AI analysis completed';
  
  // Create summary from score and key findings
  let summary = `Score: ${analysisData.score}/10`;
  if (analysisData.suitableScenarios && analysisData.suitableScenarios.length > 0) {
    summary += ` | Suitable for: ${analysisData.suitableScenarios.slice(0, 2).join(', ')}`;
    if (analysisData.suitableScenarios.length > 2) {
      summary += ` and ${analysisData.suitableScenarios.length - 2} more`;
    }
  }
  
  return {
    // Base fields
    title,
    description,
    summary,
    analysis_date: now,
    status: itemData.wishlistStatus || null,
    user_action_status: 'pending', // Default to pending
    
    // Core analysis results
    score: analysisData.score,
    feedback: analysisData.feedback || '',
    recommendation_text: analysisData.recommendationText || null,
    
    // Item details
    item_id: itemData.id,
    item_name: itemData.name,
    item_category: itemData.category,
    item_subcategory: itemData.subcategory || null,
    item_image_url: itemData.imageUrl || null,
    item_wishlist_status: itemData.wishlistStatus || null,
    
    // Analysis data (stored as JSON)
    suitable_scenarios: JSON.stringify(analysisData.suitableScenarios || []),
    compatible_items: JSON.stringify(analysisData.compatibleItems || {}),
    outfit_combinations: JSON.stringify(analysisData.outfitCombinations || []),
    season_scenario_combinations: JSON.stringify(analysisData.seasonScenarioCombinations || []),
    coverage_gaps_with_no_outfits: JSON.stringify(analysisData.coverageGapsWithNoOutfits || []),
    
    // Raw analysis data
    raw_analysis: analysisData.analysis || null,
    analysis_metadata: JSON.stringify({
      analysisVersion: '1.0',
      aiModel: 'claude-3',
      processingTimeMs: analysisData.processingTimeMs || null,
      tokensUsed: analysisData.tokensUsed || null
    }),
    
    // Legacy support
    items_checked: 1,
    legacy_analysis_results: JSON.stringify({
      recommendations: analysisData.recommendationText ? [analysisData.recommendationText] : [],
      issues: [],
      suggestions: analysisData.suitableScenarios || []
    })
  };
}

// @route   POST /api/ai-check-history
// @desc    Save AI Check analysis result to history
// @access  Private (requires authentication)
router.post('/', auth, async (req, res) => {
  try {
    console.log('🎯 AI Check History route executing');
    console.log('🔍 req.user exists:', !!req.user);
    console.log('🔍 req.user:', req.user);
    
    if (!supabaseConfigured) {
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
    
    console.log('Saving AI Check history:', {
      user_id,
      item_name: item_data?.name,
      item_id: item_data?.id,
      analysis_score: analysis_data?.score
    });
    
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
    console.log('🔄 Step 1: Starting data transformation');
    let historyData;
    try {
      historyData = transformAnalysisForDatabase(analysis_data, item_data);
      historyData.user_id = user_id;
      console.log('✅ Step 1: Data transformation successful');
    } catch (transformError) {
      console.error('❌ Step 1: Data transformation failed:', transformError);
      throw transformError;
    }

    console.log('🔍 Transformed history data:', {
      title: historyData.title,
      score: historyData.score,
      suitable_scenarios_count: JSON.parse(historyData.suitable_scenarios).length,
      has_outfit_combinations: JSON.parse(historyData.outfit_combinations).length > 0
    });

    // Insert history record
    console.log('🔄 Step 2: Starting database insert');
    const { data: historyRecord, error: historyError } = await supabase
      .from('ai_check_history')
      .insert(historyData)
      .select('id, title, score, created_at')
      .single();
      
    console.log('🔍 Database operation result:', {
      hasData: !!historyRecord,
      hasError: !!historyError,
      errorDetails: historyError
    });

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

    console.log('AI Check history saved successfully:', {
      id: historyRecord.id,
      title: historyRecord.title,
      score: historyRecord.score
    });
    
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
    if (!supabaseConfigured) {
      return res.status(503).json({ 
        error: 'Database configuration not available',
        details: 'Supabase configuration is missing'
      });
    }

    const user_id = req.user.id;
    const { limit = 50, offset = 0, category, min_score, max_score } = req.query;
    
    console.log('Fetching AI Check history for user:', user_id);

    // Build query
    let query = supabase
      .from('ai_check_history')
      .select(`
        id, title, description, summary, analysis_date, status, user_action_status,
        score, feedback, recommendation_text,
        item_id, item_name, item_category, item_subcategory, item_image_url, item_wishlist_status,
        suitable_scenarios, compatible_items, outfit_combinations,
        season_scenario_combinations, coverage_gaps_with_no_outfits,
        raw_analysis, analysis_metadata, items_checked,
        created_at, updated_at
      `)
      .eq('user_id', user_id)
      .order('analysis_date', { ascending: false });

    // Apply filters
    if (category) {
      query = query.eq('item_category', category);
    }
    
    if (min_score !== undefined) {
      query = query.gte('score', parseFloat(min_score));
    }
    
    if (max_score !== undefined) {
      query = query.lte('score', parseFloat(max_score));
    }

    // Apply pagination
    query = query.range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    const { data: historyRecords, error: historyError } = await query;

    if (historyError) {
      console.error('Error fetching AI Check history:', historyError);
      return res.status(500).json({ 
        error: 'Failed to fetch AI Check history',
        details: historyError.message 
      });
    }

    // Transform data back to frontend format
    const transformedRecords = historyRecords.map(record => ({
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
      image: record.item_image_url, // Legacy field mapping
      analysisResults: JSON.parse(record.legacy_analysis_results || '{}')
    }));

    console.log(`Fetched ${transformedRecords.length} AI Check history records for user ${user_id}`);
    
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
    if (!supabaseConfigured) {
      return res.status(503).json({ 
        error: 'Database configuration not available',
        details: 'Supabase configuration is missing'
      });
    }

    const { id } = req.params;
    const user_id = req.user.id;
    
    console.log('Fetching AI Check history record:', { id, user_id });

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

    console.log('Fetched AI Check history record successfully');
    
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
    if (!supabaseConfigured) {
      return res.status(503).json({ 
        error: 'Database configuration not available',
        details: 'Supabase configuration is missing'
      });
    }

    const { id } = req.params;
    const { user_action_status } = req.body;
    const user_id = req.user.id;
    
    console.log('Updating AI Check history status:', { id, user_action_status, user_id });

    // Validate status
    const validStatuses = ['saved', 'dismissed', 'pending', 'applied'];
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
      .eq('user_id', user_id)
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

    console.log('AI Check history status updated successfully');
    
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
