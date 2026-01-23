/**
 * AI History Service
 * 
 * Handles saving AI analysis results to the ai_check_history database table.
 * Extracted from analyze-simple.js to improve maintainability.
 */

/**
 * Saves analysis results to AI history database
 * 
 * @param {Object} options - History saving options
 * @param {string} options.userId - User ID
 * @param {string} options.analysisResponse - Cleaned analysis response
 * @param {Object} options.analysisResult - Analysis result with score
 * @param {string} options.objectiveFinalReason - Final recommendation reason
 * @param {Array} options.suitableScenarios - Suitable scenarios for the item
 * @param {Object} options.consolidatedCompatibleItems - Compatible items by category
 * @param {Array} options.outfitCombinations - Generated outfit combinations
 * @param {Array} options.seasonScenarioCombinations - Season/scenario combinations
 * @param {Array} options.coverageGapsWithNoOutfits - Coverage gaps without outfits
 * @param {Object} options.formData - Form data for the analysis
 * @returns {Object|null} History record or null if failed/skipped
 */
async function saveAnalysisToHistory({
  userId,
  analysisResponse,
  analysisResult,
  objectiveFinalReason,
  suitableScenarios,
  consolidatedCompatibleItems,
  outfitCombinations,
  seasonScenarioCombinations,
  coverageGapsWithNoOutfits,
  formData
}) {
  console.log('\n=== STEP: Save Image-Only Analysis to History ===');
  
  // Save analysis results to ai_check_history for future reference
  if (!userId) {
    console.log('ℹ️ No userId provided - skipping history save');
    return null;
  }

  try {
    const supabase = require('../shared/supabaseConfig').getClient();
    const { transformAnalysisForDatabase } = require('../utils/aiCheckTransforms');
    
    // Prepare analysis data for history saving
    const historyAnalysisData = {
      analysis: analysisResponse,
      score: analysisResult.score,
      feedback: objectiveFinalReason,
      recommendationText: objectiveFinalReason,
      suitableScenarios: suitableScenarios,
      compatibleItems: consolidatedCompatibleItems,
      outfitCombinations: outfitCombinations,
      seasonScenarioCombinations: seasonScenarioCombinations,
      coverageGapsWithNoOutfits: coverageGapsWithNoOutfits
    };
    
    // Transform for database using formData for image-only analysis  
    // formData contains category/subcategory from the popup selection
    const historyData = transformAnalysisForDatabase(historyAnalysisData, formData, userId);
    
    // Insert new history record (always insert for image-only analyses)
    const { data: historyRecord, error: historyError } = await supabase
      .from('ai_check_history')
      .insert(historyData)
      .select('id, wardrobe_item_id, compatibility_score, created_at')
      .single();
      
    if (historyError) {
      console.warn('⚠️ Failed to save image-only analysis to history:', historyError.message);
      return null;
    } else {
      console.log('✅ Image-only analysis saved to history with ID:', historyRecord.id);
      return historyRecord;
    }
  } catch (historyError) {
    console.warn('⚠️ Error saving to AI history:', historyError.message);
    // Don't fail the request if history saving fails
    return null;
  }
}

/**
 * Validates that all required data is present for history saving
 * 
 * @param {Object} data - Data to validate
 * @returns {boolean} True if data is valid for history saving
 */
function validateHistoryData(data) {
  const required = ['userId', 'analysisResponse', 'analysisResult', 'formData'];
  return required.every(field => data[field] !== undefined && data[field] !== null);
}

module.exports = {
  saveAnalysisToHistory,
  validateHistoryData
};
