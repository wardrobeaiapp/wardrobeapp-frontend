/**
 * Outfit Distribution Utility
 * 
 * Handles intelligent distribution of outfit combinations across scenarios to avoid repetition
 * and ensure fair allocation with appropriate limits and exclusivity prioritization.
 * 
 * Key Features:
 * - Creates unique outfit signatures for deduplication
 * - Merges scenarios with identical outfit sets (e.g., "SPRING/FALL/WINTER + STAYING AT HOME")
 * - Distributes outfits with STRICT exclusivity (no duplicates across scenarios)
 * - Prioritizes exclusive outfits (fewer compatible scenarios first)
 * - Respects maximum outfit limits per scenario (10)
 * - Once assigned, outfits are excluded from other scenarios completely
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
 * Check if two scenarios should be merged (have identical outfit sets)
 * @param {Array} scenarios1 - Compatible scenarios for outfit set 1
 * @param {Array} scenarios2 - Compatible scenarios for outfit set 2  
 * @returns {boolean} true if scenarios should be merged
 */
function shouldMergeScenarios(scenarios1, scenarios2) {
  if (scenarios1.length !== scenarios2.length) return false;
  
  // Check if both sets contain the same scenario combinations
  const combinations1 = scenarios1.map(s => s.combination).sort();
  const combinations2 = scenarios2.map(s => s.combination).sort();
  
  return combinations1.every((combo, index) => combo === combinations2[index]);
}

/**
 * Merge compatible scenarios into combined season/scenario labels
 * @param {Array} scenarios - Array of scenario objects to merge
 * @returns {Object} Merged scenario object
 */
function mergeCompatibleScenarios(scenarios) {
  // Extract unique seasons and scenarios
  const seasons = [...new Set(scenarios.map(s => s.season))].sort();
  const scenarioNames = [...new Set(scenarios.map(s => s.scenario))].sort();
  
  // Create combined labels
  const combinedSeason = seasons.join('/');
  const combinedScenario = scenarioNames.join('/');
  const combinedCombination = `${combinedSeason} + ${combinedScenario}`;
  
  return {
    combination: combinedCombination,
    season: combinedSeason,
    scenario: combinedScenario,
    mergedFromScenarios: scenarios
  };
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
  
  // Check if scenarios should be merged (when they have identical outfit sets)
  const scenarioGroups = [];
  const processedScenarios = new Set();
  
  completeScenarios.forEach(scenario => {
    if (processedScenarios.has(scenario.combination)) return;
    
    // Find all outfits that work for this scenario
    const scenarioOutfits = Array.from(outfitSignatureMap.values())
      .filter(outfitData => 
        outfitData.compatibleScenarios.some(sc => sc.combination === scenario.combination)
      );
    
    // Find other scenarios with identical outfit sets
    const identicalScenarios = [scenario];
    completeScenarios.forEach(otherScenario => {
      if (otherScenario.combination === scenario.combination || processedScenarios.has(otherScenario.combination)) return;
      
      const otherScenarioOutfits = Array.from(outfitSignatureMap.values())
        .filter(outfitData => 
          outfitData.compatibleScenarios.some(sc => sc.combination === otherScenario.combination)
        );
      
      // Check if outfit sets are identical
      if (scenarioOutfits.length === otherScenarioOutfits.length && 
          scenarioOutfits.every(outfit => 
            otherScenarioOutfits.some(otherOutfit => 
              outfit.signature === otherOutfit.signature
            )
          )) {
        identicalScenarios.push(otherScenario);
        processedScenarios.add(otherScenario.combination);
      }
    });
    
    processedScenarios.add(scenario.combination);
    
    if (identicalScenarios.length > 1) {
      // Merge scenarios with identical outfits
      const mergedScenario = mergeCompatibleScenarios(identicalScenarios);
      console.log(`   🔗 MERGING: ${identicalScenarios.map(s => s.combination.toUpperCase()).join(' + ')} → ${mergedScenario.combination.toUpperCase()}`);
      scenarioGroups.push(mergedScenario);
    } else {
      // Keep scenario as-is
      scenarioGroups.push(scenario);
    }
  });
  
  console.log(`   Distributing to ${scenarioGroups.length} scenario groups with strict exclusivity (no duplicates)`);
  
  // Distribute outfits intelligently
  const distributedResults = [];
  const maxOutfitsPerScenario = 10;
  
  scenarioGroups.forEach(combo => {
    const scenarioOutfits = [];
    const targetKey = combo.combination;
    
    // For merged scenarios, check compatibility against any of the original scenarios
    const originalCombinations = combo.mergedFromScenarios 
      ? combo.mergedFromScenarios.map(s => s.combination)
      : [combo.combination];
    
    // Find outfits that work for this scenario group AND haven't been assigned yet
    const availableOutfits = Array.from(outfitSignatureMap.values())
      .filter(outfitData => 
        outfitData.compatibleScenarios.some(sc => originalCombinations.includes(sc.combination)) && 
        !outfitData.assigned  // STRICT: Only include unassigned outfits
      );
    
    console.log(`   📋 ${targetKey.toUpperCase()}: ${availableOutfits.length} available unassigned outfits`);
    
    availableOutfits
      .sort((a, b) => {
        // Prioritize outfits that work for fewer scenarios (more exclusive)
        return a.compatibleScenarios.length - b.compatibleScenarios.length;
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
    } else {
      console.log(`   ⚠️ ${combo.combination.toUpperCase()}: No unique outfits available (all were assigned to previous scenarios)`);
    }
  });
  
  return distributedResults;
}

module.exports = {
  createOutfitSignature,
  distributeOutfitsIntelligently,
  // Helper functions for scenario merging
  shouldMergeScenarios,
  mergeCompatibleScenarios
};
