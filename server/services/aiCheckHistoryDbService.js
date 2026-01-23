/**
 * AI Check History Database Service
 * 
 * Handles all database operations for AI Check History records.
 * Extracted from ai-check-history.js routes to improve maintainability.
 */

const supabaseConfig = require('../shared/supabaseConfig');
const { 
  transformAnalysisForDatabase, 
  transformDatabaseToFrontend,
  calculateHistoryStats 
} = require('../utils/aiCheckTransforms');

// Get Supabase client
const supabase = supabaseConfig.getClient();

/**
 * Saves AI Check analysis result to history database
 * 
 * @param {Object} analysisData - Analysis data with score, feedback, etc.
 * @param {Object} itemData - Optional item data (null for image-only analyses)
 * @param {string} userId - User ID from authentication
 * @returns {Object} Created/updated history record
 */
async function saveAnalysisToHistory(analysisData, itemData, userId) {
  // Transform analysis data for database storage
  const historyData = transformAnalysisForDatabase(analysisData, itemData, userId);
  console.log('🔍 historyData prepared for database');

  let historyRecord, historyError;
  
  // For image-only analyses (placeholder wardrobe_item_id), always insert new records
  // For wardrobe item analyses, upsert to avoid duplicates
  if (itemData && itemData.id) {
    // Wardrobe item analysis - upsert to prevent duplicates
    const { data, error } = await supabase
      .from('ai_check_history')
      .upsert(historyData, {
        onConflict: 'wardrobe_item_id,created_by',
        ignoreDuplicates: false
      })
      .select('id, wardrobe_item_id, compatibility_score, created_at')
      .single();
    
    historyRecord = data;
    historyError = error;
  } else {
    // Image-only analysis - always insert new record
    const { data, error } = await supabase
      .from('ai_check_history')
      .insert(historyData)
      .select('id, wardrobe_item_id, compatibility_score, created_at')
      .single();
    
    historyRecord = data;
    historyError = error;
  }

  if (historyError) {
    console.error('Error saving AI Check history:', {
      error: historyError,
      code: historyError.code,
      message: historyError.message,
      details: historyError.details
    });
    throw new Error(`Failed to save AI Check history: ${historyError.message}`);
  }

  return historyRecord;
}

/**
 * Gets AI Check history records for a user with pagination and filtering
 * 
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @param {number} options.page - Page number (1-based)
 * @param {number} options.limit - Records per page
 * @param {string} options.wardrobeItemId - Optional filter by wardrobe item ID
 * @returns {Object} History records with stats and pagination info
 */
async function getHistoryForUser(userId, options = {}) {
  const { page = 1, limit = 50, wardrobeItemId } = options;
  const offset = (page - 1) * limit;

  // Build query with optional filtering
  let query = supabase
    .from('ai_check_history')
    .select(`
      id,
      wardrobe_item_id,
      compatibility_score,
      user_action_status,
      created_at,
      updated_at,
      analysis_data,
      wardrobeItems:wardrobe_item_id (
        id,
        name,
        category,
        subcategory,
        brand,
        image_url
      )
    `)
    .eq('created_by', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  // Add optional wardrobe item filter
  if (wardrobeItemId) {
    query = query.eq('wardrobe_item_id', wardrobeItemId);
  }

  const { data: historyRecords, error: historyError } = await query;

  if (historyError) {
    console.error('❌ Error fetching AI Check history:', historyError);
    throw new Error(`Failed to fetch AI Check history: ${historyError.message}`);
  }

  // Transform records for frontend
  const transformedRecords = historyRecords.map(record => 
    transformDatabaseToFrontend(record)
  );

  // Calculate stats
  const stats = calculateHistoryStats(transformedRecords);

  return {
    records: transformedRecords,
    stats,
    pagination: {
      page,
      limit,
      hasMore: historyRecords.length === limit
    }
  };
}

/**
 * Gets a specific AI Check history record by ID
 * 
 * @param {string} recordId - History record ID
 * @param {string} userId - User ID for authorization
 * @returns {Object} History record with full details
 */
async function getHistoryById(recordId, userId) {
  const { data: historyRecord, error: fetchError } = await supabase
    .from('ai_check_history')
    .select(`
      *,
      wardrobeItems:wardrobe_item_id (
        id,
        name,
        category,
        subcategory,
        brand,
        color,
        image_url,
        purchase_date,
        cost,
        tags,
        notes
      )
    `)
    .eq('id', recordId)
    .eq('created_by', userId)
    .single();

  if (fetchError) {
    if (fetchError.code === 'PGRST116') {
      return null; // Record not found
    }
    console.error('Error fetching AI Check history record:', fetchError);
    throw new Error(`Failed to fetch AI Check history record: ${fetchError.message}`);
  }

  // Transform for frontend
  return transformDatabaseToFrontend(historyRecord);
}

/**
 * Updates user action status for AI Check history record
 * 
 * @param {string} recordId - History record ID
 * @param {string} userId - User ID for authorization
 * @param {string} status - New status ('purchased', 'skipped', 'considering')
 * @returns {Object} Updated history record
 */
async function updateHistoryStatus(recordId, userId, status) {
  const { data: updatedRecord, error: updateError } = await supabase
    .from('ai_check_history')
    .update({ 
      user_action_status: status,
      updated_at: new Date().toISOString()
    })
    .eq('id', recordId)
    .eq('created_by', userId)
    .select('id, user_action_status, updated_at')
    .single();

  if (updateError) {
    console.error('Error updating AI Check history status:', updateError);
    throw new Error(`Failed to update AI Check history status: ${updateError.message}`);
  }

  return updatedRecord;
}

/**
 * Cleans up rich data and breaks foreign key reference for AI Check history record
 * 
 * @param {string} recordId - History record ID
 * @param {string} userId - User ID for authorization
 * @returns {Object} Updated history record
 */
async function cleanupHistoryRichData(recordId, userId) {
  const { data: updatedRecord, error: updateError } = await supabase
    .from('ai_check_history')
    .update({ 
      analysis_data: null, // Remove rich analysis data
      wardrobe_item_id: null, // Break foreign key reference
      updated_at: new Date().toISOString()
    })
    .eq('id', recordId)
    .eq('created_by', userId)
    .select('id, updated_at')
    .single();

  if (updateError) {
    console.error('Error cleaning up AI Check history rich data:', updateError);
    throw new Error(`Failed to clean up AI Check history rich data: ${updateError.message}`);
  }

  return updatedRecord;
}

/**
 * Validates if Supabase is properly configured
 * 
 * @returns {boolean} True if Supabase is configured
 */
function isDbConfigured() {
  return supabaseConfig.isConfigured();
}

module.exports = {
  saveAnalysisToHistory,
  getHistoryForUser,
  getHistoryById,
  updateHistoryStatus,
  cleanupHistoryRichData,
  isDbConfigured
};
