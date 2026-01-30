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
  
  // For wardrobe item analyses, upsert to avoid duplicates
  // For image-only analyses, always insert new records
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
      wishlist_status,
      image_url,
      wardrobeItems:wardrobe_item_id (
        id,
        name,
        category,
        subcategory,
        image_url,
        brand
      )
    `)
    .eq('id', recordId)
    .eq('created_by', userId);

  // Supabase v2 supports maybeSingle(); keep a safe fallback for older clients.
  let historyRecord;
  let fetchError;
  if (typeof query.maybeSingle === 'function') {
    ({ data: historyRecord, error: fetchError } = await query.maybeSingle());
  } else {
    const resp = await query.limit(1);
    historyRecord = resp.data && resp.data.length > 0 ? resp.data[0] : null;
    fetchError = resp.error;
  }

  if (fetchError) {
    if (fetchError.code === 'PGRST116') {
      return null; // Record not found
    }
    console.error('Error fetching AI Check history record:', fetchError);
    throw new Error(`Failed to fetch AI Check history record: ${fetchError.message}`);
  }

  if (!historyRecord) return null;

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
  console.log('🔄 Starting cleanup for record:', recordId, 'user:', userId);
  console.log('🔍 About to fetch current record for essential data...');
  
  try {
    // First get the current record to preserve essential fields
    const { data: currentRecord, error: fetchError } = await supabase
      .from('ai_check_history')
      .select('analysis_data, wishlist_status, user_action_status')
      .eq('id', recordId)
      .eq('created_by', userId)
      .single();

    if (fetchError) {
      console.error('❌ Error fetching current record:', fetchError);
      throw new Error(`Failed to fetch current record: ${fetchError.message}`);
    }

    console.log('🔍 Current record fetched successfully');

    // Prepare cleaned analysis_data with only essential fields
    let cleanedAnalysisData = null;
    if (currentRecord.analysis_data) {
      cleanedAnalysisData = {
        // Keep only essential fields
        recommendation_block: currentRecord.analysis_data.recommendation_block,
        score: currentRecord.analysis_data.score,
        // Keep item name to prevent "unknown item" display
        itemDetails: currentRecord.analysis_data.itemDetails ? {
          name: currentRecord.analysis_data.itemDetails.name
          // Remove other heavy fields like imageUrl, etc.
        } : undefined,
        // Remove heavy data fields like compatibleItems, outfitCombinations, full itemDetails, images, etc.
      };
    }

    console.log('🔍 About to update record with cleaned data...');

    // Update record - set wardrobe_item_id to null, keep only essential analysis_data, and clear image_url
    const { data: updatedRecord, error: updateError } = await supabase
      .from('ai_check_history')
      .update({ 
        wardrobe_item_id: null, // Set to null as requested
        analysis_data: cleanedAnalysisData, // Keep only essential fields
        image_url: null, // Clear the image_url column as well
        updated_at: new Date().toISOString()
      })
      .eq('id', recordId)
      .eq('created_by', userId)
      .select('id, updated_at, wardrobe_item_id, analysis_data, wishlist_status, user_action_status, image_url')
      .single();

    console.log('🔍 Supabase update operation completed');
    console.log('🔍 Update result:', { updatedRecord, updateError });

    if (updateError) {
      console.error('❌ Supabase update error:', updateError);
      throw new Error(`Failed to clean up AI Check history rich data: ${updateError.message}`);
    }

    console.log('✅ AI Check history cleaned up - wardrobe_item_id set to null, essential data preserved');
    return updatedRecord;
  } catch (err) {
    console.error('❌ Exception in cleanupHistoryRichData:', err);
    throw err;
  }
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
