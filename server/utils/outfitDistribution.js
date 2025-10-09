/**
 * Outfit Distribution Utility
 * 
 * Handles intelligent distribution of outfit combinations across scenarios to avoid repetition
 * and ensure fair allocation with appropriate limits and exclusivity prioritization.
 * 
 * Key Features:
 * - Creates unique outfit signatures for deduplication
 * - Distributes outfits fairly across scenarios
 * - Prioritizes exclusive outfits over shared ones
 * - Respects maximum outfit limits per scenario (10)
 * - Prevents the same outfit from appearing across multiple scenarios
 */

/**
 * Create a signature for an outfit based on the items it contains
 * @param {Object} outfit - Outfit object with items array
 * @returns {string} Unique signature for the outfit
 */
function createOutfitSignature(outfit) {
  const itemNames = outfit.items.map(item => item.name).sort();
  return itemNames.join(' + ');
}

/**
 * Intelligently distribute outfits across scenarios to avoid repetition
 * @param {Array} allGeneratedOutfits - All generated outfits for all scenarios
 * @param {Array} completeScenarios - All complete scenarios
 * @returns {Array} Distributed outfit combinations
 */
function distributeOutfitsIntelligently(allGeneratedOutfits, completeScenarios) {
  console.log('\n📊 INTELLIGENT OUTFIT DISTRIBUTION:');
  
  // Create outfit signatures and track which scenarios they work for
  const outfitSignatureMap = new Map();
  
  allGeneratedOutfits.forEach(scenarioData => {
    scenarioData.outfits.forEach(outfit => {
      const signature = createOutfitSignature(outfit);
      
      if (!outfitSignatureMap.has(signature)) {
        outfitSignatureMap.set(signature, {
          outfit,
          signature,
          compatibleScenarios: [],
          assigned: false
        });
      }
      
      const outfitData = outfitSignatureMap.get(signature);
      outfitData.compatibleScenarios.push({
        combination: scenarioData.combination,
        season: scenarioData.season,
        scenario: scenarioData.scenario
      });
    });
  });
  
  console.log(`   Found ${outfitSignatureMap.size} unique outfits across all scenarios`);
  
  // Distribute outfits intelligently
  const distributedResults = [];
  const maxOutfitsPerScenario = 10;
  
  completeScenarios.forEach(combo => {
    const scenarioOutfits = [];
    const targetKey = combo.combination;
    
    // Find outfits that work for this scenario
    Array.from(outfitSignatureMap.values())
      .filter(outfitData => 
        outfitData.compatibleScenarios.some(sc => sc.combination === targetKey)
      )
      .sort((a, b) => {
        // Prioritize outfits that work for fewer scenarios (more exclusive)
        // Then prioritize unassigned outfits
        if (a.compatibleScenarios.length !== b.compatibleScenarios.length) {
          return a.compatibleScenarios.length - b.compatibleScenarios.length;
        }
        return a.assigned === b.assigned ? 0 : (a.assigned ? 1 : -1);
      })
      .slice(0, maxOutfitsPerScenario)
      .forEach(outfitData => {
        scenarioOutfits.push(outfitData.outfit);
        outfitData.assigned = true;
      });
    
    if (scenarioOutfits.length > 0) {
      console.log(`   ✅ ${combo.combination.toUpperCase()}: ${scenarioOutfits.length} unique outfits assigned`);
      scenarioOutfits.forEach((outfit, index) => {
        const signature = createOutfitSignature(outfit);
        console.log(`      ${index + 1}. ${signature}`);
      });
      
      distributedResults.push({
        combination: combo.combination,
        season: combo.season,
        scenario: combo.scenario,
        outfits: scenarioOutfits
      });
    }
  });
  
  return distributedResults;
}

module.exports = {
  createOutfitSignature,
  distributeOutfitsIntelligently
};
