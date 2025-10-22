/**
 * Outfit Grouping Utility
 * 
 * Handles grouping and display of outfit combinations for better visualization.
 * Groups outfits by versatility and provides clean display formatting.
 * 
 * Key Features:
 * - Groups identical outfits by signature across scenarios
 * - Sorts by versatility (number of scenarios each outfit works for)
 * - Shows comma-separated scenario headers for versatile outfits
 * - Eliminates duplicate outfit suggestions
 */

const { createOutfitSignature } = require('./outfitDistribution');

/**
 * Group identical outfits by their signatures and collect their applicable scenarios
 * @param {Array} outfitCombinations - Array of outfit combinations
 * @returns {Array} Grouped outfits by signature with their applicable scenarios
 */
function groupOutfitsByVersatility(outfitCombinations) {
  const outfitSignatureGroups = new Map();
  
  // Group outfits by their signature (identical outfits)
  outfitCombinations.forEach(combo => {
    combo.outfits.forEach(outfit => {
      const signature = createOutfitSignature(outfit);
      
      if (!outfitSignatureGroups.has(signature)) {
        outfitSignatureGroups.set(signature, {
          signature,
          scenarios: [],
          versatilityScore: 0
        });
      }
      
      const group = outfitSignatureGroups.get(signature);
      // Add scenario if not already present
      if (!group.scenarios.some(s => s.combination === combo.combination)) {
        group.scenarios.push({
          combination: combo.combination,
          season: combo.season,
          scenario: combo.scenario
        });
        group.versatilityScore = group.scenarios.length;
      }
    });
  });
  
  // Convert to array and sort by versatility score (number of scenarios they work for)
  return Array.from(outfitSignatureGroups.values())
    .sort((a, b) => b.versatilityScore - a.versatilityScore);
}

/**
 * Display grouped outfits in the desired format showing versatility
 * @param {Array} groupedOutfits - Array of grouped outfit objects with scenarios
 */
function displayGroupedOutfits(groupedOutfits) {
  console.log('\n\n=== 👗 GROUPED OUTFITS BY VERSATILITY ===\n');
  
  groupedOutfits.forEach((group, index) => {
    // Create scenario combination header (comma-separated)
    const scenarioHeader = group.scenarios
      .map(s => s.combination.toUpperCase())
      .join(',\n');
    
    console.log(scenarioHeader);
    
    // Display the outfit signature with numbering
    console.log(`${index + 1}. ${group.signature}`);
    
    // Show versatility info if outfit works for multiple scenarios
    if (group.versatilityScore > 1) {
      console.log(`   👁️ (Works for ${group.versatilityScore} scenarios)`);
    }
    
    console.log(''); // Empty line between groups
  });
}

module.exports = {
  groupOutfitsByVersatility,
  displayGroupedOutfits
};
