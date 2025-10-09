/**
 * Outfit Grouping Utility
 * 
 * Handles grouping and display of outfit combinations for better visualization.
 * Groups outfits by versatility and provides clean display formatting.
 * 
 * Key Features:
 * - Groups outfits by scenario combinations
 * - Sorts by versatility (number of outfits)
 * - Clean console display format
 * - Eliminates repetitive scenario headers
 */

const { createOutfitSignature } = require('./outfitDistribution');

/**
 * Group outfits by their scenario combinations
 * @param {Array} outfitCombinations - Array of outfit combinations
 * @returns {Array} Grouped outfits by scenario combination
 */
function groupOutfitsByVersatility(outfitCombinations) {
  const scenarioGroups = new Map();
  
  // Group outfits by their scenario combination
  outfitCombinations.forEach(combo => {
    const scenarioKey = combo.combination;
    
    if (!scenarioGroups.has(scenarioKey)) {
      scenarioGroups.set(scenarioKey, {
        scenarioKey,
        outfits: []
      });
    }
    
    const group = scenarioGroups.get(scenarioKey);
    combo.outfits.forEach(outfit => {
      group.outfits.push(createOutfitSignature(outfit));
    });
  });
  
  // Convert to array and sort by number of outfits (most versatile first)
  return Array.from(scenarioGroups.values())
    .sort((a, b) => b.outfits.length - a.outfits.length);
}

/**
 * Display grouped outfits in the desired format
 * @param {Array} groupedOutfits - Array of grouped outfit objects
 */
function displayGroupedOutfits(groupedOutfits) {
  console.log('\n\n=== 👗 GROUPED OUTFITS BY VERSATILITY ===\n');
  
  groupedOutfits.forEach(group => {
    // Display scenario combination header
    console.log(group.scenarioKey.toUpperCase());
    
    // Display all outfits for this scenario combination
    group.outfits.forEach(outfitSignature => {
      console.log(outfitSignature);
    });
    
    console.log(''); // Empty line between groups
  });
}

module.exports = {
  groupOutfitsByVersatility,
  displayGroupedOutfits
};
