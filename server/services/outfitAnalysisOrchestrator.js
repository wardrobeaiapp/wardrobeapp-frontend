/**
 * Outfit Analysis Orchestrator Service
 * 
 * Orchestrates the complete outfit analysis workflow including:
 * - Season + scenario combination creation
 * - Outfit generation 
 * - Coverage vs outfit cross-reference analysis
 * - Final scoring with outfit-based adjustments
 */

const { createSeasonScenarioCombinations } = require('./compatibilityAnalysisService');
const { generateOutfitCombinations } = require('./outfitGenerationService');
const { performCoverageOutfitCrossReference } = require('./coverageOutfitCrossReferenceService');
const { calculateFinalScoreWithOutfits, calculateFinalScoreWithoutOutfitPenalties } = require('./outfitScoringService');

/**
 * Orchestrates the complete outfit analysis workflow
 * @param {Object} params - Analysis parameters
 * @param {Object} params.formData - Form data with category, subcategory, etc.
 * @param {Object} params.preFilledData - Pre-filled item data (for wishlist items)
 * @param {Array} params.suitableScenarios - Scenarios from Claude analysis
 * @param {Object} params.consolidatedCompatibleItems - Compatible items by category
 * @param {Array} params.scenarioCoverage - Coverage analysis data
 * @param {Array} params.userGoals - User goals affecting scoring
 * @param {Object} params.duplicateResult - Duplicate detection results
 * @param {Array} params.scenarios - Array of scenario objects with id and name for UUID mapping
 * @returns {Object} Complete outfit analysis results
 */
async function orchestrateOutfitAnalysis({
  formData,
  preFilledData,
  suitableScenarios,
  consolidatedCompatibleItems,
  scenarioCoverage,
  userGoals,
  duplicateResult,
  scenarios,
  anthropicClient = null
}) {
  console.log('\n=== 👗 OUTFIT ANALYSIS ORCHESTRATOR ===');
  console.log('🔍 Input:', suitableScenarios?.length || 0, 'scenarios,', !!preFilledData ? 'wishlist item' : 'uploaded item');
  
  // Extract combined item data for analysis
  // For wishlist items, use pre-selected scenarios; otherwise use AI-extracted scenarios
  const isWishlistItem = !!preFilledData;
  let finalScenarios = suitableScenarios;
  
  if (isWishlistItem && preFilledData.scenarios && Array.isArray(preFilledData.scenarios)) {
    // Extract scenario names if they're objects
    if (preFilledData.scenarios.length > 0 && typeof preFilledData.scenarios[0] === 'object') {
      finalScenarios = preFilledData.scenarios.map(s => s.name || s);
    } else {
      finalScenarios = preFilledData.scenarios;
    }
    console.log('🏷️ [orchestrateOutfitAnalysis] Using wishlist scenarios:', finalScenarios);
  } else if (!suitableScenarios || suitableScenarios.length === 0) {
    console.log('⚠️ [orchestrateOutfitAnalysis] No scenarios from AI analysis and no wishlist scenarios');
  } else {
    console.log('🤖 [orchestrateOutfitAnalysis] Using AI-extracted scenarios:', finalScenarios);
  }
  
  const itemDataWithScenarios = {
    ...formData, // Use the enhanced formData that includes image and name for uploaded images
    ...preFilledData,
    scenarios: finalScenarios
  };
  
  // Verify item data completeness
  console.log('📦 Item:', itemDataWithScenarios.name || 'Unnamed', `(${itemDataWithScenarios.category})`, 
    'scenarios:', itemDataWithScenarios.scenarios?.length || 0, 'seasons:', itemDataWithScenarios.seasons?.length || 0);
  
  // Ensure seasons is always an array (fix for missing seasons data)
  if (!itemDataWithScenarios.seasons || !Array.isArray(itemDataWithScenarios.seasons)) {
    const seasonsFromForm = formData?.seasons;
    const seasonsFromPreFilled = preFilledData?.seasons;
    
    if (seasonsFromForm && Array.isArray(seasonsFromForm) && seasonsFromForm.length > 0) {
      itemDataWithScenarios.seasons = seasonsFromForm;
      console.log('✅ Using form seasons:', seasonsFromForm.length, 'seasons');
    } else if (seasonsFromPreFilled && Array.isArray(seasonsFromPreFilled) && seasonsFromPreFilled.length > 0) {
      itemDataWithScenarios.seasons = seasonsFromPreFilled;
      console.log('✅ Using wishlist seasons:', seasonsFromPreFilled.length, 'seasons');
    } else {
      itemDataWithScenarios.seasons = ['summer', 'spring/fall', 'winter'];
      console.log('⚠️ Using default seasons (3 seasons)');
    }
  }
  
  // Check if this is an accessory or outerwear item - these don't need seasonal breakdown
  // Accessories (jewelry, bags, belts) and outerwear (jackets, blazers) are versatile pieces
  // that complement MANY different outfits across MULTIPLE seasons and scenarios
  const itemCategory = (formData?.category || preFilledData?.category || '').toLowerCase();
  const isAccessoryOrOuterwear = ['accessory', 'outerwear'].includes(itemCategory);
  
  if (isAccessoryOrOuterwear) {
    console.log(`💎/🧥 ACCESSORY/OUTERWEAR ITEM: Skipping season+scenario combinations AND outfit analysis`);
    console.log(`📝 These pieces work across multiple seasons and scenarios - no need for specific combinations`);
    
    // Check if this accessory/outerwear has any compatible items at all
    let totalCompatibleItems = 0;
    if (consolidatedCompatibleItems) {
      Object.values(consolidatedCompatibleItems).forEach(categoryItems => {
        if (Array.isArray(categoryItems)) {
          totalCompatibleItems += categoryItems.length;
        }
      });
    }
    
    console.log(`🔗 Compatible items: ${totalCompatibleItems} total`);
    
    // Calculate scoring without outfit penalties but with compatibility check for accessories/outerwear
    const scoringResults = calculateFinalScoreWithoutOutfitPenalties(
      scenarioCoverage,
      suitableScenarios,
      formData,
      userGoals,
      duplicateResult,
      formData.category,
      totalCompatibleItems,
      scenarios
    );
    
    return {
      outfitCombinations: [],
      seasonScenarioCombinations: [], // Empty - accessories/outerwear don't need specific combinations
      coverageGapsWithNoOutfits: [],
      analysisResult: scoringResults.analysisResult,
      objectiveFinalReason: scoringResults.objectiveFinalReason
    };
  }
  
  // Initialize results for core items (dress, top, bottom, footwear)
  let outfitCombinations = [];
  let seasonScenarioCombinations = [];
  let coverageGapsWithNoOutfits = [];
  
  try {
    // ===== STEP 1: GENERATE OUTFIT COMBINATIONS =====
    console.log('\n=== STEP: Generating Outfit Combinations ===');
    
    // Create season + scenario combinations with essential categories check
    seasonScenarioCombinations = createSeasonScenarioCombinations(itemDataWithScenarios, consolidatedCompatibleItems, scenarios);
    
    // Generate outfit combinations for complete scenarios only
    outfitCombinations = await generateOutfitCombinations(itemDataWithScenarios, consolidatedCompatibleItems, seasonScenarioCombinations, scenarios, anthropicClient);
    
    // ===== STEP 2: COVERAGE VS OUTFIT CROSS-REFERENCE =====
    console.log('\n=== STEP: Coverage vs Outfit Cross-Reference ===');
    coverageGapsWithNoOutfits = performCoverageOutfitCrossReference(
      scenarioCoverage,
      outfitCombinations
    );
    
    // ===== STEP 3: FINAL SCORING WITH OUTFIT ADJUSTMENTS =====
    console.log('\n=== STEP: Final Scoring with Outfit Data ===');
    const scoringResults = calculateFinalScoreWithOutfits(
      scenarioCoverage,
      suitableScenarios,
      formData,
      userGoals,
      duplicateResult,
      outfitCombinations,
      coverageGapsWithNoOutfits,
      scenarios // Pass valid scenarios for validation
    );
    
    return {
      outfitCombinations,
      seasonScenarioCombinations,
      coverageGapsWithNoOutfits,
      analysisResult: scoringResults.analysisResult,
      objectiveFinalReason: scoringResults.objectiveFinalReason
    };
    
  } catch (error) {
    console.error('❌ Error in outfit analysis orchestration:', error);
    return {
      outfitCombinations: [],
      seasonScenarioCombinations: [],
      coverageGapsWithNoOutfits: [],
      analysisResult: { score: 5.0, reason: 'Error in outfit analysis' },
      objectiveFinalReason: 'Error in outfit analysis'
    };
  }
}



module.exports = {
  orchestrateOutfitAnalysis
};
