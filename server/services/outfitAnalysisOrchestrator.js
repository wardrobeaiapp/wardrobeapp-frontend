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
  
  // Extract combined item data for analysis
  const itemDataWithScenarios = {
    ...formData,
    ...preFilledData,
    scenarios: suitableScenarios
  };
  
  // Check if this is an accessory or outerwear item - these don't need outfit generation
  const itemCategory = (formData?.category || preFilledData?.category || '').toLowerCase();
  const isAccessoryOrOuterwear = ['accessory', 'outerwear'].includes(itemCategory);
  
  if (isAccessoryOrOuterwear) {
    console.log(`💎/🧥 ACCESSORY/OUTERWEAR ITEM: Skipping outfit analysis - these complement existing outfits`);
    
    // Calculate scoring without outfit penalties for accessories/outerwear
    const scoringResults = calculateFinalScoreWithoutOutfitPenalties(
      scenarioCoverage,
      suitableScenarios,
      formData,
      userGoals,
      duplicateResult,
      itemCategory
    );
    
    return {
      outfitCombinations: [],
      seasonScenarioCombinations: [],
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
 * @returns {Object} Scoring results
 */
function calculateFinalScoreWithoutOutfitPenalties(
  scenarioCoverage,
  suitableScenarios,
  formData,
  userGoals,
  duplicateResult,
  itemCategory
) {
  // Analyze scenario coverage to get score and objective reason
  // Pass duplicate analysis results to prioritize duplicate detection in scoring
  const duplicateAnalysisForScore = duplicateResult ? duplicateResult.duplicateAnalysis : null;
  
  // For accessories and outerwear, indicate that outfit generation is not applicable
  const outfitDataForScoring = {
    totalOutfits: -1, // Special flag: -1 means "outfit analysis not applicable"
    coverageGapsWithNoOutfits: [], // No outfit gaps for accessories/outerwear
    isAccessoryOrOuterwear: true,
    itemCategory
  };
  
  console.log(`📊 Outfit data for ${itemCategory} scoring:`, {
    message: 'Outfit analysis not applicable for this item type',
    isAccessoryOrOuterwear: true
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
