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

/**
 * Generate outfit combinations using compatible items for complete scenarios
 */
async function generateOutfitCombinations(itemData, compatibleItems, seasonScenarioCombinations, scenarios = [], anthropicClient = null) {
  console.log('\n\n=== 👗 OUTFIT COMBINATIONS GENERATOR ===\n');
  
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
  
  // Generate all outfits for all scenarios first
  const allGeneratedOutfits = [];
  
  for (let index = 0; index < completeScenarios.length; index++) {
    const combo = completeScenarios[index];
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
      return;
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
        console.log('   ❌ Claude failed to generate outfits for this combination');
        // Skip this combination rather than generating poor quality fallback outfits
        return;
      } else {
        console.log(`   ✅ Claude successfully generated ${outfits.length} fashion-intelligent outfits`);
      }
    } else {
      console.error('   ❌ No Claude API client available - outfit generation requires AI analysis');
      // Skip this combination - we need Claude for quality outfit generation
      return;
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
  
  // Now intelligently distribute outfits across scenarios
  const outfitCombinations = distributeOutfitsIntelligently(allGeneratedOutfits, completeScenarios);
  
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

// Note: distributeOutfitsIntelligently function moved to /utils/outfitDistribution.js

// Note: Outfit generation now uses Claude AI for fashion-intelligent combinations
// - All algorithmic outfit builders have been removed in favor of AI analysis
// - Claude considers weather appropriateness, occasion suitability, and fashion sense
// - Distribution and grouping utilities remain for organizing AI-generated outfits

module.exports = {
  generateOutfitCombinations,
  createOutfitSignature,
  groupOutfitsByVersatility,
  displayGroupedOutfits,
  distributeOutfitsIntelligently,
  shouldMergeScenarios,
  mergeCompatibleScenarios
};
