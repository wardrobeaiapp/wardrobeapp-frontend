/**
 * Coverage Outfit Cross-Reference Service
 * 
 * Handles cross-referencing scenario coverage gaps with generated outfit combinations
 * to identify gaps that have no practical outfit solutions.
 * Extracted from outfitAnalysisOrchestrator.js to improve maintainability.
 */

/**
 * Performs cross-reference analysis between coverage gaps and outfit combinations
 * 
 * @param {Array} scenarioCoverage - Coverage analysis data with gaps
 * @param {Array} outfitCombinations - Generated outfit combinations by season/scenario
 * @returns {Array} Coverage gaps that have no matching outfit combinations
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
  
  console.log(`📊 Cross-referencing ${relevantCoverageItems.length} coverage gaps with outfit generation:`);
  
  relevantCoverageItems.forEach(coverageItem => {
    const { season, scenarioName, gapType, category, gapCount, coveragePercent } = coverageItem;
    
    // Look for matching outfit combinations for this season+scenario
    const matchingOutfitCombos = outfitCombinations.filter(combo => 
      combo.season && combo.season.toLowerCase() === season.toLowerCase() &&
      combo.scenario && combo.scenario.toLowerCase() === scenarioName.toLowerCase()
    );
    
    const totalOutfitsFound = matchingOutfitCombos.reduce((sum, combo) => 
      sum + (combo.outfits ? combo.outfits.length : 0), 0);
    
    // Collect gaps with no outfits for frontend
    if (totalOutfitsFound === 0) {
      console.log(`   ❌ Gap: ${category}/${season}/${scenarioName} (${gapType}) - no outfits`);
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
 * Validates input data for coverage-outfit cross-reference
 * 
 * @param {Array} scenarioCoverage - Coverage data to validate
 * @param {Array} outfitCombinations - Outfit combinations to validate
 * @returns {boolean} True if data is valid for cross-reference analysis
 */
function validateCrossReferenceData(scenarioCoverage, outfitCombinations) {
  return Array.isArray(scenarioCoverage) && Array.isArray(outfitCombinations);
}

module.exports = {
  performCoverageOutfitCrossReference,
  validateCrossReferenceData
};
