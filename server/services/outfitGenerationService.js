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

// Import specialized utility modules
const {
  buildDressOutfits,
  buildTopOutfits,
  buildBottomOutfits,
  buildFootwearOutfits,
  buildGeneralOutfits
} = require('../utils/outfitBuilders');

const {
  createOutfitSignature,
  distributeOutfitsIntelligently
} = require('../utils/outfitDistribution');

const {
  groupOutfitsByVersatility,
  displayGroupedOutfits
} = require('../utils/outfitGrouping');

/**
 * Generate outfit combinations using compatible items for complete scenarios
 */
function generateOutfitCombinations(itemData, compatibleItems, seasonScenarioCombinations) {
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
  
  completeScenarios.forEach((combo, index) => {
    console.log(`🎯 ${index + 1}) ${combo.combination.toUpperCase()}`);
    
    // Filter items that match this season
    const seasonItems = allCompatibleItems.filter(item => {
      const itemSeasons = item.seasons || item.season || [];
      if (typeof itemSeasons === 'string') {
        return itemSeasons.includes(combo.season) || combo.season.includes(itemSeasons);
      }
      if (Array.isArray(itemSeasons)) {
        return itemSeasons.some(itemSeason => 
          itemSeason.includes(combo.season) || combo.season.includes(itemSeason)
        );
      }
      return false;
    });
    
    if (seasonItems.length === 0) {
      console.log('   ❌ No items available for this season');
      return;
    }
    
    // Group items by category for outfit building
    const itemsByCategory = {};
    seasonItems.forEach(item => {
      const category = item.category?.toLowerCase() || item.sourceCategory;
      if (!itemsByCategory[category]) {
        itemsByCategory[category] = [];
      }
      itemsByCategory[category].push(item);
    });
    
    // Generate ALL outfit recommendations (professional stylist approach)
    const outfits = buildOutfitRecommendations(itemData, itemsByCategory, combo.season, combo.scenario);
    
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
  });
  
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

/**
 * Build outfit recommendations based on item type and available compatible items
 * Routes to appropriate specialized builder functions from outfitBuilders utility
 */
function buildOutfitRecommendations(itemData, itemsByCategory, season, scenario) {
  const itemCategory = itemData.category?.toLowerCase();
  const outfits = [];
  
  // Define outfit building strategies based on the analyzed item
  switch (itemCategory) {
    case 'dress':
    case 'one_piece':
      // Dress-based outfits: dress + shoes + optional accessories/outerwear
      outfits.push(...buildDressOutfits(itemData, itemsByCategory, season, scenario));
      break;
      
    case 'top':
      // Top-based outfits: top + bottom + shoes + optional accessories/outerwear
      outfits.push(...buildTopOutfits(itemData, itemsByCategory, season, scenario));
      break;
      
    case 'bottom':
      // Bottom-based outfits: bottom + top + shoes + optional accessories/outerwear
      outfits.push(...buildBottomOutfits(itemData, itemsByCategory, season, scenario));
      break;
      
    case 'footwear':
      // Shoe-based outfits: shoes + top + bottom + optional accessories/outerwear
      outfits.push(...buildFootwearOutfits(itemData, itemsByCategory, season, scenario));
      break;
      
    default:
      // For other items, try to build general combinations
      outfits.push(...buildGeneralOutfits(itemData, itemsByCategory, season, scenario));
  }
  
  // Return all good combinations (let the caller handle reasonable limits)
  return outfits;
}

// Note: All outfit building functions have been moved to specialized utility modules:
// - buildDressOutfits, buildTopOutfits, etc. → /utils/outfitBuilders.js
// - createOutfitSignature, distributeOutfitsIntelligently → /utils/outfitDistribution.js
// - groupOutfitsByVersatility, displayGroupedOutfits → /utils/outfitGrouping.js

module.exports = {
  generateOutfitCombinations,
  buildOutfitRecommendations,
  // Re-export functions from utility modules for backward compatibility
  buildDressOutfits,
  buildTopOutfits,
  buildBottomOutfits,
  buildFootwearOutfits,
  buildGeneralOutfits,
  createOutfitSignature,
  groupOutfitsByVersatility,
  displayGroupedOutfits,
  distributeOutfitsIntelligently
};
