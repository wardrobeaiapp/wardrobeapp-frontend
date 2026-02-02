const express = require('express');
const auth = require('../../../middleware/auth');
const aiCheckHistoryDbService = require('../../../services/aiCheckHistoryDbService');

const router = express.Router();

// Routes for AI Check History management

// @route   POST /api/ai-check-history
// @desc    Save AI Check analysis result to history
// @access  Private (requires authentication)
router.post('/', auth, async (req, res) => {
  try {
    
    if (!aiCheckHistoryDbService.isDbConfigured()) {
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
    
    // item_data is optional for image-only analyses (wardrobe_item_id will be null)
    // But if provided, it must have required fields
    if (item_data && (!item_data.id || !item_data.name)) {
      return res.status(400).json({ 
        error: 'item_data must include id and name if provided' 
      });
    }
    
    if (typeof analysis_data.score !== 'number' || analysis_data.score < 0 || analysis_data.score > 10) {
      return res.status(400).json({ 
        error: 'analysis_data.score must be a number between 0 and 10' 
      });
    }

    // Save analysis to history using database service
    const historyRecord = await aiCheckHistoryDbService.saveAnalysisToHistory(
      analysis_data, 
      item_data, 
      user_id
    );

    
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
    if (!aiCheckHistoryDbService.isDbConfigured()) {
      return res.status(503).json({ 
        error: 'Database configuration not available',
        details: 'Supabase configuration is missing'
      });
    }

    const user_id = req.user.id;
    const { limit = 50, offset = 0 } = req.query;
    
    // Calculate page from offset
    const page = Math.floor(parseInt(offset) / parseInt(limit)) + 1;
    
    // Get history using database service
    const result = await aiCheckHistoryDbService.getHistoryForUser(user_id, {
      page,
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      history: result.records,
      stats: result.stats,
      total: result.records.length,
      offset: parseInt(offset),
      limit: parseInt(limit),
      hasMore: result.pagination.hasMore
    });

  } catch (error) {
    console.error('Error in GET /api/ai-check-history:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

// @route   GET /api/ai-check-history/by-wardrobe-item/:wardrobeItemId
// @desc    Get most recent AI Check history record for a wardrobe item
// @access  Private (requires authentication)
router.get('/by-wardrobe-item/:wardrobeItemId', auth, async (req, res) => {
  try {
    if (!aiCheckHistoryDbService.isDbConfigured()) {
      return res.status(503).json({
        error: 'Database configuration not available',
        details: 'Supabase configuration is missing'
      });
    }

    const { wardrobeItemId } = req.params;
    const user_id = req.user.id;

    const record = await aiCheckHistoryDbService.getHistoryByWardrobeItemId(wardrobeItemId, user_id);

    if (!record) {
      return res.status(404).json({
        error: 'AI Check history record not found'
      });
    }

    res.json({
      success: true,
      record
    });
  } catch (error) {
    console.error('Error in GET /api/ai-check-history/by-wardrobe-item/:wardrobeItemId:', error);
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
    if (!aiCheckHistoryDbService.isDbConfigured()) {
      return res.status(503).json({ 
        error: 'Database configuration not available',
        details: 'Supabase configuration is missing'
      });
    }

    const { id } = req.params;
    const user_id = req.user.id;
    
    // Get record using database service
    const record = await aiCheckHistoryDbService.getHistoryById(id, user_id);
    
    if (!record) {
      return res.status(404).json({ 
        error: 'AI Check history record not found' 
      });
    }

    res.json({
      success: true,
      record: record
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
    if (!aiCheckHistoryDbService.isDbConfigured()) {
      return res.status(503).json({ 
        error: 'Database configuration not available',
        details: 'Supabase configuration is missing'
      });
    }

    const { id } = req.params;
    const { user_action_status } = req.body;
    const user_id = req.user.id;
    
    // Validate status
    const validStatuses = ['saved', 'dismissed', 'pending', 'applied'];
    if (!validStatuses.includes(user_action_status)) {
      return res.status(400).json({ 
        error: 'Invalid user_action_status',
        valid_statuses: validStatuses
      });
    }

    // Update status using database service
    const updatedRecord = await aiCheckHistoryDbService.updateHistoryStatus(id, user_id, user_action_status);

    if (!updatedRecord) {
      return res.status(404).json({ 
        error: 'AI Check history record not found' 
      });
    }

    res.json({
      success: true,
      message: 'Status updated successfully',
      data: updatedRecord
    });

  } catch (error) {
    console.error('Error in PUT /ai/ai-check-history/:id/status:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

// @route   PUT /api/ai-check-history/:id/detach
// @desc    Detach history record from wardrobe item (set wardrobe_item_id to null) to prevent cascade delete
// @access  Private (requires authentication)
router.put('/:id/detach', auth, async (req, res) => {
  try {
    if (!aiCheckHistoryDbService.isDbConfigured()) {
      return res.status(503).json({
        error: 'Database configuration not available',
        details: 'Supabase configuration is missing'
      });
    }

    const { id } = req.params;
    const user_id = req.user.id;

    const updatedRecord = await aiCheckHistoryDbService.detachHistoryWardrobeItem(id, user_id);

    if (!updatedRecord) {
      return res.status(404).json({
        error: 'AI Check history record not found'
      });
    }

    res.json({
      success: true,
      message: 'History record detached successfully',
      data: updatedRecord
    });
  } catch (error) {
    console.error('Error in PUT /api/ai-check-history/:id/detach:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
});

// @route   PUT /api/ai-check-history/:id/cleanup
// @desc    Clean up rich data and break foreign key reference to prevent cascade delete
// @access  Private (requires authentication)
router.put('/:id/cleanup', auth, async (req, res) => {
  try {
    console.log('🔄 Cleanup route hit for ID:', req.params.id, 'user:', req.user?.id);
    
    if (!aiCheckHistoryDbService.isDbConfigured()) {
      return res.status(503).json({ 
        error: 'Database configuration not available',
        details: 'Supabase configuration is missing'
      });
    }

    const { id } = req.params;
    const user_id = req.user.id;
    
    console.log('🔍 About to call cleanupHistoryRichData with:', { id, user_id });
    
    // Clean up rich data using database service
    const updatedRecord = await aiCheckHistoryDbService.cleanupHistoryRichData(id, user_id);
    
    console.log('✅ Cleanup completed successfully:', updatedRecord);
    
    if (!updatedRecord) {
      return res.status(404).json({ 
        error: 'AI Check history record not found' 
      });
    }

    res.json({
      success: true,
      message: 'Rich data cleaned up and foreign key reference removed successfully',
      data: updatedRecord
    });

  } catch (error) {
    console.error('❌ Error in PUT /api/ai-check-history/:id/cleanup:', {
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

module.exports = router;
