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
  
  const outfitCombinations = [];
  
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
    
    // Generate outfit recommendations based on the analyzed item type
    const outfits = buildOutfitRecommendations(itemData, itemsByCategory, combo.season, combo.scenario);
    
    if (outfits.length > 0) {
      console.log(`   ✅ ${outfits.length} GOOD OUTFIT COMBINATION${outfits.length > 1 ? 'S' : ''} FOUND:`);
      outfits.forEach((outfit, outfitIndex) => {
        // Create concise format: Item1 + Item2 + Item3
        const itemNames = outfit.items.map(item => item.name);
        const conciseFormat = itemNames.join(' + ');
        console.log(`      ${outfitIndex + 1}. ${conciseFormat}`);
      });
      
      outfitCombinations.push({
        combination: combo.combination,
        season: combo.season,
        scenario: combo.scenario,
        outfits
      });
    }
    
    console.log(''); // Empty line between combinations
  });
  
  // Summary
  const totalOutfits = outfitCombinations.reduce((sum, combo) => sum + combo.outfits.length, 0);
  console.log(`📊 SUMMARY: ${totalOutfits} total outfit combinations across ${completeScenarios.length} complete scenarios`);
  
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
  
  // Filter to only return good combinations (limit to top 3 per scenario)
  return outfits.slice(0, 3);
}

/**
 * Build dress-based outfit combinations
 */
function buildDressOutfits(itemData, itemsByCategory, season, scenario) {
  const outfits = [];
  const footwear = itemsByCategory.footwear || [];
  
  // Essential: dress + footwear
  footwear.forEach(shoes => {
    const outfit = {
      type: 'dress-based',
      items: [
        { ...itemData, compatibilityTypes: ['base-item'] },
        shoes
      ]
    };
    
    // Add optional outerwear if available and appropriate
    const outerwear = itemsByCategory.outerwear || [];
    if (outerwear.length > 0 && (season.includes('fall') || season.includes('winter') || season.includes('spring'))) {
      const jacket = outerwear[0]; // Take the first compatible outerwear
      outfit.items.push(jacket);
    }
    
    // Add optional accessories
    const accessories = itemsByCategory.accessory || [];
    if (accessories.length > 0) {
      const accessory = accessories[0]; // Take the first compatible accessory
      outfit.items.push(accessory);
    }
    
    outfits.push(outfit);
  });
  
  return outfits;
}

/**
 * Build top-based outfit combinations
 */
function buildTopOutfits(itemData, itemsByCategory, season, scenario) {
  const outfits = [];
  const bottoms = itemsByCategory.bottoms || itemsByCategory.bottom || [];
  const footwear = itemsByCategory.footwear || [];
  
  // Essential: top + bottom + footwear
  bottoms.forEach(bottom => {
    footwear.forEach(shoes => {
      const outfit = {
        type: 'top-based',
        items: [
          { ...itemData, compatibilityTypes: ['base-item'] },
          bottom,
          shoes
        ]
      };
      
      // Add optional outerwear
      const outerwear = itemsByCategory.outerwear || [];
      if (outerwear.length > 0) {
        const jacket = outerwear[0];
        outfit.items.push(jacket);
      }
      
      outfits.push(outfit);
    });
  });
  
  return outfits;
}

/**
 * Build bottom-based outfit combinations
 */
function buildBottomOutfits(itemData, itemsByCategory, season, scenario) {
  const outfits = [];
  const tops = itemsByCategory.tops || itemsByCategory.top || [];
  const footwear = itemsByCategory.footwear || [];
  
  // Essential: bottom + top + footwear
  tops.forEach(top => {
    footwear.forEach(shoes => {
      const outfit = {
        type: 'bottom-based',
        items: [
          { ...itemData, compatibilityTypes: ['base-item'] },
          top,
          shoes
        ]
      };
      
      outfits.push(outfit);
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

module.exports = {
  generateOutfitCombinations,
  buildOutfitRecommendations,
  buildDressOutfits,
  buildTopOutfits,
  buildBottomOutfits,
  buildFootwearOutfits,
  buildGeneralOutfits
};
