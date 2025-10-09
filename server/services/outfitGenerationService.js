/**
 * Outfit Generation Service
 * 
 * Service for generating complete outfit combinations using compatible items.
 * Takes the results from compatibility analysis and creates wearable outfit suggestions.
 * 
 * Key Features:
 * - Only creates outfits for hasAllEssentials=true scenarios
 * - Context-aware outfit building based on item type
 * - Concise logging with Item1 + Item2 + Item3 format
 * - Limits to top 3 outfits per scenario for quality over quantity
 */

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

/**
 * Build outfit recommendations based on item type and available compatible items
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

/**
 * Build dress-based outfit combinations with professional stylist variety
 */
function buildDressOutfits(itemData, itemsByCategory, season, scenario) {
  const outfits = [];
  const footwear = itemsByCategory.footwear || [];
  const outerwear = itemsByCategory.outerwear || [];
  const accessories = itemsByCategory.accessory || [];
  
  // Essential: dress + footwear
  footwear.forEach((shoes, shoeIndex) => {
    const baseItems = [
      { ...itemData, compatibilityTypes: ['base-item'] },
      shoes
    ];
    
    // Create the most complete version available
    let finalOutfit = {
      type: 'dress-based',
      items: [...baseItems]
    };
    
    // Add outerwear if available and appropriate for season
    if (outerwear.length > 0 && (season.includes('fall') || season.includes('winter') || season.includes('spring'))) {
      const outerwearIndex = shoeIndex % outerwear.length;
      const jacket = outerwear[outerwearIndex];
      finalOutfit.items.push(jacket);
      finalOutfit.type = 'dress-based-layered';
    }
    // Otherwise, add accessories if available (for summer/no outerwear)
    else if (accessories.length > 0) {
      const accessoryIndex = shoeIndex % accessories.length;
      const accessory = accessories[accessoryIndex];
      finalOutfit.items.push(accessory);
      finalOutfit.type = 'dress-based-accessorized';
    }
    
    outfits.push(finalOutfit);
  });
  
  return outfits;
}

/**
 * Build top-based outfit combinations with professional stylist variety
 */
function buildTopOutfits(itemData, itemsByCategory, season, scenario) {
  const outfits = [];
  const bottoms = itemsByCategory.bottoms || itemsByCategory.bottom || [];
  const footwear = itemsByCategory.footwear || [];
  const outerwear = itemsByCategory.outerwear || [];
  
  // Essential: top + bottom + footwear
  bottoms.forEach((bottom, bottomIndex) => {
    footwear.forEach((shoes, shoeIndex) => {
      const baseItems = [
        { ...itemData, compatibilityTypes: ['base-item'] },
        bottom,
        shoes
      ];
      
      // Prefer layered version when outerwear is available
      if (outerwear.length > 0) {
        // Use different outerwear pieces for variety
        const outerwearIndex = (bottomIndex + shoeIndex) % outerwear.length;
        const jacket = outerwear[outerwearIndex];
        
        const layeredOutfit = {
          type: 'top-based-layered',
          items: [...baseItems, jacket]
        };
        outfits.push(layeredOutfit);
      } else {
        // Only create base version if no outerwear available
        const baseOutfit = {
          type: 'top-based',
          items: baseItems
        };
        outfits.push(baseOutfit);
      }
    });
  });
  
  return outfits;
}

/**
 * Build bottom-based outfit combinations with professional stylist variety
 */
function buildBottomOutfits(itemData, itemsByCategory, season, scenario) {
  const outfits = [];
  const tops = itemsByCategory.tops || itemsByCategory.top || [];
  const footwear = itemsByCategory.footwear || [];
  const outerwear = itemsByCategory.outerwear || [];
  
  // Essential: bottom + top + footwear
  tops.forEach((top, topIndex) => {
    footwear.forEach((shoes, shoeIndex) => {
      const baseItems = [
        { ...itemData, compatibilityTypes: ['base-item'] },
        top,
        shoes
      ];
      
      // Prefer layered version when outerwear is available
      if (outerwear.length > 0) {
        // Use different outerwear pieces for variety
        const outerwearIndex = (topIndex + shoeIndex) % outerwear.length;
        const jacket = outerwear[outerwearIndex];
        
        const layeredOutfit = {
          type: 'bottom-based-layered',
          items: [...baseItems, jacket]
        };
        outfits.push(layeredOutfit);
      } else {
        // Only create base version if no outerwear available
        const baseOutfit = {
          type: 'bottom-based',
          items: baseItems
        };
        outfits.push(baseOutfit);
      }
    });
  });
  
  return outfits;
}

/**
 * Build footwear-based outfit combinations
 */
function buildFootwearOutfits(itemData, itemsByCategory, season, scenario) {
  const outfits = [];
  const tops = itemsByCategory.tops || itemsByCategory.top || [];
  const bottoms = itemsByCategory.bottoms || itemsByCategory.bottom || [];
  
  // Essential: footwear + top + bottom
  tops.forEach(top => {
    bottoms.forEach(bottom => {
      const outfit = {
        type: 'footwear-based',
        items: [
          { ...itemData, compatibilityTypes: ['base-item'] },
          top,
          bottom
        ]
      };
      
      outfits.push(outfit);
    });
  });
  
  return outfits;
}

/**
 * Build general outfit combinations for other item types
 */
function buildGeneralOutfits(itemData, itemsByCategory, season, scenario) {
  const outfits = [];
  
  // Try to create a basic combination with available items
  const availableCategories = Object.keys(itemsByCategory);
  if (availableCategories.length > 0) {
    const items = [{ ...itemData, compatibilityTypes: ['base-item'] }];
    
    // Add one item from each available category (max 4 total items)
    availableCategories.slice(0, 3).forEach(category => {
      const categoryItems = itemsByCategory[category];
      if (categoryItems.length > 0) {
        items.push(categoryItems[0]);
      }
    });
    
    outfits.push({
      type: 'general',
      items
    });
  }
  
  return outfits;
}

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
  generateOutfitCombinations,
  buildOutfitRecommendations,
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
