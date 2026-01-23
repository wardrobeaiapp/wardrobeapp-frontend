/**
 * Outfit Scoring Service
 * 
 * Handles final score calculations with outfit-based adjustments and penalties.
 * Extracted from outfitAnalysisOrchestrator.js to improve maintainability.
 */

const analyzeScenarioCoverageForScore = require('../utils/ai/analyzeScenarioCoverageForScore');

/**
 * Calculates final score with outfit-based adjustments for regular items
 * 
 * @param {Array} scenarioCoverage - Coverage analysis data
 * @param {Array} suitableScenarios - Scenarios from Claude
 * @param {Object} formData - Form data
 * @param {Array} userGoals - User goals
 * @param {Object} duplicateResult - Duplicate detection results
 * @param {Array} outfitCombinations - Generated outfits
 * @param {Array} coverageGapsWithNoOutfits - Coverage gaps with no outfits
 * @param {Array} scenarios - Valid scenario objects for validation
 * @returns {Object} Scoring results with analysis and reason
 */
function calculateFinalScoreWithOutfits(
  scenarioCoverage,
  suitableScenarios,
  formData,
  userGoals,
  duplicateResult,
  outfitCombinations,
  coverageGapsWithNoOutfits,
  scenarios
) {
  // Analyze scenario coverage to get score and objective reason
  // Pass duplicate analysis results to prioritize duplicate detection in scoring
  const duplicateAnalysisForScore = duplicateResult ? duplicateResult.duplicateAnalysis : null;
  
  // Prepare outfit data for scoring adjustments
  const outfitDataForScoring = {
    totalOutfits: outfitCombinations.reduce((sum, combo) => sum + (combo.outfits?.length || 0), 0),
    coverageGapsWithNoOutfits: coverageGapsWithNoOutfits || []
  };
  
  console.log('📊 Scoring data:', outfitDataForScoring.totalOutfits, 'outfits,', outfitDataForScoring.coverageGapsWithNoOutfits.length, 'gaps');
  
  const analysisResult = analyzeScenarioCoverageForScore(
    scenarioCoverage,
    suitableScenarios,
    formData,
    userGoals,
    duplicateAnalysisForScore,
    outfitDataForScoring,
    scenarios // Pass valid scenarios for validation
  );
  
  const objectiveFinalReason = analysisResult.reason;
  
  console.log('✅ Final score with outfits:', analysisResult.score);
  
  return {
    analysisResult,
    objectiveFinalReason
  };
}

/**
 * Calculates final score for accessories and outerwear without outfit-based penalties
 * 
 * @param {Array} scenarioCoverage - Coverage analysis data
 * @param {Array} suitableScenarios - Scenarios from Claude
 * @param {Object} formData - Form data
 * @param {Array} userGoals - User goals
 * @param {Object} duplicateResult - Duplicate detection results
 * @param {string} itemCategory - Item category (accessory or outerwear)
 * @param {number} totalCompatibleItems - Total number of compatible items found
 * @param {Array} scenarios - Valid scenario objects for validation
 * @returns {Object} Scoring results with analysis and reason
 */
function calculateFinalScoreWithoutOutfitPenalties(
  scenarioCoverage,
  suitableScenarios,
  formData,
  userGoals,
  duplicateResult,
  itemCategory,
  totalCompatibleItems = 0,
  scenarios = []
) {
  // Analyze scenario coverage to get score and objective reason
  // Pass duplicate analysis results to prioritize duplicate detection in scoring
  const duplicateAnalysisForScore = duplicateResult ? duplicateResult.duplicateAnalysis : null;
  
  // For accessories and outerwear, indicate that outfit generation is not applicable
  // but include compatibility information for penalty assessment
  const outfitDataForScoring = {
    totalOutfits: -1, // Special flag: -1 means "outfit analysis not applicable"
    coverageGapsWithNoOutfits: [], // No outfit gaps for accessories/outerwear
    isAccessoryOrOuterwear: true,
    itemCategory,
    totalCompatibleItems // Include compatibility info for potential penalty
  };
  
  console.log(`📊 Outfit data for ${itemCategory} scoring:`, {
    message: 'Outfit analysis not applicable for this item type',
    isAccessoryOrOuterwear: true,
    compatibleItems: totalCompatibleItems
  });
  
  const analysisResult = analyzeScenarioCoverageForScore(
    scenarioCoverage,
    suitableScenarios,
    formData,
    userGoals,
    duplicateAnalysisForScore,
    outfitDataForScoring,
    scenarios // Pass valid scenarios for validation
  );
  
  const objectiveFinalReason = analysisResult.reason;
  
  console.log(`✅ Final score for ${itemCategory} (no outfit penalties):`, analysisResult.score);
  
  return {
    analysisResult,
    objectiveFinalReason
  };
}

/**
 * Determines which scoring method to use based on item category
 * 
 * @param {string} itemCategory - Item category to check
 * @returns {boolean} True if item should use accessory/outerwear scoring
 */
function shouldUseSpecializedScoring(itemCategory) {
  return ['accessory', 'outerwear'].includes(itemCategory?.toLowerCase());
}

module.exports = {
  calculateFinalScoreWithOutfits,
  calculateFinalScoreWithoutOutfitPenalties,
  shouldUseSpecializedScoring
};
