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
const analyzeScenarioCoverageForScore = require('../utils/ai/analyzeScenarioCoverageForScore');

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
 * @returns {Object} Complete outfit analysis results
 */
function orchestrateOutfitAnalysis({
  formData,
  preFilledData,
  suitableScenarios,
  consolidatedCompatibleItems,
  scenarioCoverage,
  userGoals,
  duplicateResult
}) {
  console.log('\n=== 👗 OUTFIT ANALYSIS ORCHESTRATOR ===');
  console.log('🔍 [orchestrateOutfitAnalysis] Input debug:');
  console.log('   - suitableScenarios:', suitableScenarios ? suitableScenarios.length : 'missing', suitableScenarios);
  console.log('   - preFilledData exists:', !!preFilledData);
  if (preFilledData) {
    console.log('   - preFilledData.scenarios:', preFilledData.scenarios);
    console.log('   - preFilledData.scenarios type:', typeof preFilledData.scenarios);
    console.log('   - preFilledData keys:', Object.keys(preFilledData));
  }
  
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
    ...formData,
    ...preFilledData,
    scenarios: finalScenarios
  };
  
  // Debug: Check if seasons data exists
  console.log('🔍 [orchestrateOutfitAnalysis] itemDataWithScenarios debug:');
  console.log('   - scenarios:', itemDataWithScenarios.scenarios ? itemDataWithScenarios.scenarios.length : 'missing');
  console.log('   - seasons:', itemDataWithScenarios.seasons ? itemDataWithScenarios.seasons.length : 'missing');
  console.log('   - seasons array:', itemDataWithScenarios.seasons);
  console.log('   - formData.seasons:', formData?.seasons);
  console.log('   - preFilledData.seasons:', preFilledData?.seasons);
  
  // Ensure seasons is always an array (fix for missing seasons data)
  if (!itemDataWithScenarios.seasons || !Array.isArray(itemDataWithScenarios.seasons)) {
    console.log('⚠️ [orchestrateOutfitAnalysis] Missing or invalid seasons data - attempting to fix...');
    
    // Try to get seasons from either source
    const seasonsFromForm = formData?.seasons;
    const seasonsFromPreFilled = preFilledData?.seasons;
    
    if (seasonsFromForm && Array.isArray(seasonsFromForm) && seasonsFromForm.length > 0) {
      itemDataWithScenarios.seasons = seasonsFromForm;
      console.log('✅ [orchestrateOutfitAnalysis] Using seasons from formData:', seasonsFromForm);
    } else if (seasonsFromPreFilled && Array.isArray(seasonsFromPreFilled) && seasonsFromPreFilled.length > 0) {
      itemDataWithScenarios.seasons = seasonsFromPreFilled;
      console.log('✅ [orchestrateOutfitAnalysis] Using seasons from preFilledData:', seasonsFromPreFilled);
    } else {
      // Fallback: use default seasons based on item category if still missing
      const defaultSeasons = ['summer', 'spring/fall', 'winter'];
      itemDataWithScenarios.seasons = defaultSeasons;
      console.log('⚠️ [orchestrateOutfitAnalysis] No seasons found - using default seasons:', defaultSeasons);
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
    
    console.log(`🔗 Compatible items found: ${totalCompatibleItems} total across all categories`);
    
    // Calculate scoring without outfit penalties but with compatibility check for accessories/outerwear
    const scoringResults = calculateFinalScoreWithoutOutfitPenalties(
      scenarioCoverage,
      suitableScenarios,
      formData,
      userGoals,
      duplicateResult,
      itemCategory,
      totalCompatibleItems
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
    seasonScenarioCombinations = createSeasonScenarioCombinations(itemDataWithScenarios, consolidatedCompatibleItems);
    
    // Generate outfit combinations for complete scenarios only
    outfitCombinations = generateOutfitCombinations(itemDataWithScenarios, consolidatedCompatibleItems, seasonScenarioCombinations);
    
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
      coverageGapsWithNoOutfits
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

/**
 * Performs cross-reference analysis between coverage gaps and outfit generation results
 * @param {Array} scenarioCoverage - Coverage analysis data
 * @param {Array} outfitCombinations - Generated outfit combinations
 * @returns {Array} Coverage gaps that have no outfit matches
 */
function performCoverageOutfitCrossReference(scenarioCoverage, outfitCombinations) {
  const coverageGapsWithNoOutfits = [];
  
  if (!scenarioCoverage || scenarioCoverage.length === 0) {
    console.log('   ℹ️  No scenario coverage data for cross-reference');
    return coverageGapsWithNoOutfits;
  }
  
  console.log('🔍 COVERAGE VS OUTFIT GENERATION CROSS-REFERENCE:');
  
  // Find coverage items with specific season+scenario and gap types that suggest room for improvement
  const relevantCoverageItems = scenarioCoverage.filter(item => 
    item.gapType && ['critical', 'improvement', 'expansion'].includes(item.gapType) &&
    item.season && item.season !== 'All seasons' &&
    item.scenarioName && item.scenarioName !== 'All scenarios'
  );
  
  if (relevantCoverageItems.length === 0) {
    console.log('   ℹ️  No specific season+scenario coverage gaps found for cross-reference');
    return coverageGapsWithNoOutfits;
  }
  
  console.log(`📊 Found ${relevantCoverageItems.length} coverage items with gaps and specific season+scenario:`);
  
  relevantCoverageItems.forEach(coverageItem => {
    const { season, scenarioName, gapType, category, gapCount, coveragePercent } = coverageItem;
    
    // Look for matching outfit combinations for this season+scenario
    const matchingOutfitCombos = outfitCombinations.filter(combo => 
      combo.season && combo.season.toLowerCase() === season.toLowerCase() &&
      combo.scenario && combo.scenario.toLowerCase() === scenarioName.toLowerCase()
    );
    
    const totalOutfitsFound = matchingOutfitCombos.reduce((sum, combo) => 
      sum + (combo.outfits ? combo.outfits.length : 0), 0);
    
    // Log the cross-reference result
    if (totalOutfitsFound > 0) {
      console.log(`   ✅ Coverage: "${category} for ${season} for ${scenarioName}" (${gapType}) → Found ${totalOutfitsFound} outfit(s)`);
    } else {
      console.log(`   ❌ Coverage: "${category} for ${season} for ${scenarioName}" (${gapType}) → Found 0 outfits despite coverage gap`);
      
      // Collect gaps with no outfits for frontend
      coverageGapsWithNoOutfits.push({
        category,
        season,
        scenarioName,
        gapType,
        gapCount: gapCount || 0,
        coveragePercent: coveragePercent || 0,
        description: `${category} for ${season} for ${scenarioName}`
      });
    }
  });
  
  return coverageGapsWithNoOutfits;
}

/**
 * Calculates final score with outfit-based adjustments
 * @param {Array} scenarioCoverage - Coverage analysis data
 * @param {Array} suitableScenarios - Scenarios from Claude
 * @param {Object} formData - Form data
 * @param {Array} userGoals - User goals
 * @param {Object} duplicateResult - Duplicate detection results
 * @param {Array} outfitCombinations - Generated outfits
 * @param {Array} coverageGapsWithNoOutfits - Coverage gaps with no outfits
 * @returns {Object} Scoring results
 */
function calculateFinalScoreWithOutfits(
  scenarioCoverage,
  suitableScenarios,
  formData,
  userGoals,
  duplicateResult,
  outfitCombinations,
  coverageGapsWithNoOutfits
) {
  // Analyze scenario coverage to get score and objective reason
  // Pass duplicate analysis results to prioritize duplicate detection in scoring
  const duplicateAnalysisForScore = duplicateResult ? duplicateResult.duplicateAnalysis : null;
  
  // Prepare outfit data for scoring adjustments
  const outfitDataForScoring = {
    totalOutfits: outfitCombinations.reduce((sum, combo) => sum + (combo.outfits?.length || 0), 0),
    coverageGapsWithNoOutfits: coverageGapsWithNoOutfits || []
  };
  
  console.log('📊 Outfit data for scoring:', {
    totalOutfits: outfitDataForScoring.totalOutfits,
    gapsWithNoOutfits: outfitDataForScoring.coverageGapsWithNoOutfits.length
  });
  
  const analysisResult = analyzeScenarioCoverageForScore(
    scenarioCoverage,
    suitableScenarios,
    formData,
    userGoals,
    duplicateAnalysisForScore,
    outfitDataForScoring
  );
  
  const objectiveFinalReason = analysisResult.reason;
  
  console.log('✅ Final score with outfit adjustments:', analysisResult.score);
  console.log('✅ Final objective reason:', objectiveFinalReason);
  
  return {
    analysisResult,
    objectiveFinalReason
  };
}

/**
 * Calculates final score for accessories and outerwear without outfit-based penalties
 * @param {Array} scenarioCoverage - Coverage analysis data
 * @param {Array} suitableScenarios - Scenarios from Claude
 * @param {Object} formData - Form data
 * @param {Array} userGoals - User goals
 * @param {Object} duplicateResult - Duplicate detection results
 * @param {string} itemCategory - Item category (accessory or outerwear)
 * @param {number} totalCompatibleItems - Total number of compatible items found
 * @returns {Object} Scoring results
 */
function calculateFinalScoreWithoutOutfitPenalties(
  scenarioCoverage,
  suitableScenarios,
  formData,
  userGoals,
  duplicateResult,
  itemCategory,
  totalCompatibleItems = 0
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
    outfitDataForScoring
  );
  
  const objectiveFinalReason = analysisResult.reason;
  
  console.log(`✅ Final score for ${itemCategory} (no outfit penalties):`, analysisResult.score);
  console.log('✅ Final objective reason:', objectiveFinalReason);
  
  return {
    analysisResult,
    objectiveFinalReason
  };
}

module.exports = {
  orchestrateOutfitAnalysis,
  performCoverageOutfitCrossReference,
  calculateFinalScoreWithOutfits,
  calculateFinalScoreWithoutOutfitPenalties
};
