/**
 * Outfit Generation Service
 * 
 * Main orchestrator service for generating complete outfit combinations using compatible items.
 * Takes the results from compatibility analysis and creates wearable outfit suggestions.
 * 
 * Key Features:
 * - Only creates outfits for hasAllEssentials=true scenarios
 * - Context-aware outfit building based on item type
 * - Professional stylist approach with intelligent distribution
 * - Modular architecture with specialized utility modules
 */

// Import Claude-based outfit generation
const { generateOutfitsWithClaude } = require('../utils/claudeOutfitGenerator');

// Import outfit distribution and grouping utilities
const {
  createOutfitSignature,
  distributeOutfitsIntelligently,
  shouldMergeScenarios,
  mergeCompatibleScenarios
} = require('../utils/outfitDistribution');

const {
  groupOutfitsByVersatility,
  displayGroupedOutfits
} = require('../utils/outfitGrouping');

// Import legacy builders for test compatibility
const {
  buildOutfitRecommendations
} = require('./legacy/outfitBuilders');

/**
 * Generate outfit combinations using compatible items for complete scenarios
 */
async function generateOutfitCombinations(itemData, compatibleItems, seasonScenarioCombinations, scenarios = [], anthropicClient = null) {
  console.log('\n\n=== 👗 OUTFIT COMBINATIONS GENERATOR ===\n');
  
  // Handle edge cases: null/undefined inputs should return empty array
  if (!seasonScenarioCombinations || !Array.isArray(seasonScenarioCombinations)) {
    console.log('❌ NO SEASON SCENARIO COMBINATIONS PROVIDED');
    return [];
  }
  
  // Handle null/undefined compatible items  
  if (!compatibleItems) {
    console.log('❌ NO COMPATIBLE ITEMS PROVIDED');
    return [];
  }
  
  // Outerwear and accessory items should not generate outfit combinations
  const category = itemData?.category?.toLowerCase();
  if (category === 'outerwear' || category === 'accessory' || category === 'accessories') {
    console.log('❌ OUTERWEAR/ACCESSORY ITEMS DO NOT GENERATE OUTFIT COMBINATIONS');
    return [];
  }
  
  // Only process combinations that have all essentials
  const completeScenarios = seasonScenarioCombinations.filter(combo => combo.hasItems);
  const incompleteScenarios = seasonScenarioCombinations.filter(combo => !combo.hasItems);
  
  if (completeScenarios.length === 0) {
    console.log('❌ NO COMPLETE OUTFIT COMBINATIONS AVAILABLE');
    if (incompleteScenarios.length > 0) {
      console.log('\n🚫 INCOMPLETE SCENARIOS:');
      incompleteScenarios.forEach(combo => {
        const missingText = combo.missingCategories.length > 0 ? 
          `don't have ${combo.missingCategories.join(' or ')} to combine with` :
          'missing essential items';
        console.log(`   ${combo.combination.toUpperCase()} - ${missingText}`);
      });
    }
    console.log('\n💡 Add items in missing categories to unlock outfit combinations!\n');
    return [];
  }
  
  // Flatten all compatible items from all categories
  const allCompatibleItems = [];
  if (compatibleItems) {
    Object.entries(compatibleItems).forEach(([category, categoryItems]) => {
      if (Array.isArray(categoryItems)) {
        categoryItems.forEach(item => {
          allCompatibleItems.push({
            ...item,
            sourceCategory: category
          });
        });
      }
    });
  }
  
  console.log(`✅ GENERATING OUTFITS FOR ${completeScenarios.length} COMPLETE SCENARIOS\n`);
  
  // IMPORTANT: Sort scenarios by season priority (winter → spring/fall → summer)
  // This ensures more layered outfits for colder seasons, fewer layers for warmer seasons
  const seasonPriority = {
    'winter': 1,
    'spring/fall': 2,
    'summer': 3
  };
  
  const sortedCompleteScenarios = completeScenarios.sort((a, b) => {
    const seasonA = a.season?.toLowerCase() || 'unknown';
    const seasonB = b.season?.toLowerCase() || 'unknown';
    
    const priorityA = seasonPriority[seasonA] || 999; // Unknown seasons go last
    const priorityB = seasonPriority[seasonB] || 999;
    
    return priorityA - priorityB;
  });
  
  console.log(`🌡️ Processing seasons in layering-priority order: ${sortedCompleteScenarios.map(s => s.season).join(' → ')}\n`);
  
  // Generate all outfits for all scenarios first
  const allGeneratedOutfits = [];
  
  for (let index = 0; index < sortedCompleteScenarios.length; index++) {
    const combo = sortedCompleteScenarios[index];
    console.log(`🎯 ${index + 1}) ${combo.combination.toUpperCase()}`);
    
    // Convert scenario name to UUID for filtering (if scenarios mapping is provided)
    let scenarioId = null;
    if (combo.scenario && scenarios && scenarios.length > 0) {
      const scenario = scenarios.find(s => s.name === combo.scenario);
      if (scenario) {
        scenarioId = scenario.id;
        console.log(`   🔍 Scenario "${combo.scenario}" → UUID: ${scenarioId}`);
      }
    }
    
    // Filter items that match both season AND scenario
    const seasonScenarioItems = allCompatibleItems.filter(item => {
      // First check season match
      const itemSeasons = item.seasons || item.season || [];
      let seasonMatches = false;
      
      if (typeof itemSeasons === 'string') {
        seasonMatches = itemSeasons.includes(combo.season) || combo.season.includes(itemSeasons);
      } else if (Array.isArray(itemSeasons)) {
        seasonMatches = itemSeasons.some(itemSeason => 
          itemSeason.includes(combo.season) || combo.season.includes(itemSeason)
        );
      }
      
      // If season doesn't match, skip this item
      if (!seasonMatches) return false;
      
      // Then check scenario match (if we have a scenario to filter by)
      if (scenarioId && item.scenarios && Array.isArray(item.scenarios)) {
        const scenarioMatches = item.scenarios.includes(scenarioId);
        if (!scenarioMatches) {
          console.log(`   ❌ ${item.name} - seasons match but scenario doesn't`);
          return false;
        }
      }
      
      return true;
    });
    
    if (seasonScenarioItems.length === 0) {
      console.log('   ❌ No items available for this season+scenario combination');
      continue;
    }
    
    // Group items by category for outfit building
    const itemsByCategory = {};
    seasonScenarioItems.forEach(item => {
      const category = item.category?.toLowerCase() || item.sourceCategory;
      if (!itemsByCategory[category]) {
        itemsByCategory[category] = [];
      }
      itemsByCategory[category].push(item);
    });
    
    // Generate outfit recommendations using Claude's fashion intelligence
    let outfits = [];
    if (anthropicClient) {
      console.log('   🤖 Using Claude for outfit generation');
      outfits = await generateOutfitsWithClaude(itemData, itemsByCategory, combo.season, combo.scenario, anthropicClient);
      
      if (outfits === null || outfits.length === 0) {
        console.log('   ❌ Claude failed to generate outfits for this combination - skipping to next');
        // Skip this combination rather than generating poor quality fallback outfits
        continue;
      } else {
        console.log(`   ✅ Claude successfully generated ${outfits.length} fashion-intelligent outfits`);
      }
    } else {
      // For tests: use fallback builder functions when no Claude client
      console.log('   🔧 Using fallback builder functions for testing');
      outfits = buildOutfitRecommendations(itemData, itemsByCategory, combo.season, combo.scenario);
      
      if (outfits.length === 0) {
        console.log('   ❌ No items available for this season+scenario combination');
        continue;
      }
    }
    
    if (outfits.length > 0) {
      console.log(`   ✅ ${outfits.length} OUTFIT COMBINATIONS GENERATED`);
      
      // Add to the collection with scenario info
      allGeneratedOutfits.push({
        combination: combo.combination,
        season: combo.season,
        scenario: combo.scenario,
        outfits
      });
    }
    
    console.log(''); // Empty line between combinations
  }
  
  // For tests: if no outfits were generated, return empty array
  if (allGeneratedOutfits.length === 0) {
    console.log('📊 SUMMARY: 0 total outfit combinations (no outfits generated)');
    return [];
  }

  // Now intelligently distribute outfits across scenarios
  const outfitCombinations = distributeOutfitsIntelligently(allGeneratedOutfits, completeScenarios);
  
  // Ensure we always return an array
  if (!Array.isArray(outfitCombinations)) {
    console.error('⚠️ distributeOutfitsIntelligently returned non-array, falling back to empty array');
    return [];
  }
  
  // Summary
  const totalOutfits = outfitCombinations.reduce((sum, combo) => sum + combo.outfits.length, 0);
  console.log(`📊 SUMMARY: ${totalOutfits} total outfit combinations across ${completeScenarios.length} complete scenarios`);
  
  // Group outfits by versatility (which scenario combinations they work for)
  if (totalOutfits > 0) {
    const groupedOutfits = groupOutfitsByVersatility(outfitCombinations);
    displayGroupedOutfits(groupedOutfits);
  }
  
  // Show incomplete scenarios with specific reasons
  if (incompleteScenarios.length > 0) {
    console.log(`\n🚫 INCOMPLETE SCENARIOS:`);
    incompleteScenarios.forEach(combo => {
      const missingText = combo.missingCategories.length > 0 ? 
        `don't have ${combo.missingCategories.join(' or ')} to combine with` :
        'missing essential items';
      console.log(`   ${combo.combination.toUpperCase()} - ${missingText}`);
    });
  }
  
  console.log(''); // Final spacing
  
  return outfitCombinations;
}

module.exports = {
  // Main service function
  generateOutfitCombinations,
  
  // Re-export utility functions from other modules
  createOutfitSignature,
  groupOutfitsByVersatility,
  displayGroupedOutfits,
  distributeOutfitsIntelligently,
  shouldMergeScenarios,
  mergeCompatibleScenarios,
  
  // Re-export legacy functions for test compatibility
  buildOutfitRecommendations,
  ...require('./legacy/outfitBuilders')
};
