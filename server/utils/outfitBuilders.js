/**
 * Outfit Builders Utility
 * 
 * Contains specialized functions for building different types of outfit combinations.
 * Each function creates complete, professional outfit suggestions based on the analyzed item type.
 * 
 * Key Features:
 * - Professional stylist approach (complete outfits preferred)
 * - Systematic variety through rotation
 * - Duplication prevention (no base + layered versions)
 * - Context-aware outfit building
 * - Home scenario support (footwear optional)
 */

/**
 * Check if a scenario is home-based (doesn't require footwear)
 * Backend version matching the frontend function
 * @param {string} scenarioName - Name of the scenario
 * @returns {boolean} true if it's a home scenario
 */
function isHomeScenario(scenarioName) {
  if (!scenarioName) return false;
  
  const name = scenarioName.toLowerCase();
  const HOME_KEYWORDS = ['home', 'house', 'remote work'];
  
  return HOME_KEYWORDS.some(keyword => name.includes(keyword));
}

/**
 * Build dress-based outfit combinations with professional stylist variety
 */
function buildDressOutfits(itemData, itemsByCategory, season, scenario) {
  const outfits = [];
  const footwear = itemsByCategory.footwear || [];
  const outerwear = itemsByCategory.outerwear || [];
  const accessories = itemsByCategory.accessory || [];
  
  // Essential: dress + footwear (footwear optional for home scenarios)
  const isHome = isHomeScenario(scenario);
  const shoesToUse = footwear.length > 0 ? footwear : (isHome ? [null] : []);
  
  if (shoesToUse.length === 0) {
    console.log(`   ❌ No footwear available for non-home scenario "${scenario}"`);
    return outfits;
  }
  
  shoesToUse.forEach((shoes, shoeIndex) => {
    const baseItems = [{ ...itemData, compatibilityTypes: ['base-item'] }];
    
    // Add shoes if available (not null for home scenarios)
    if (shoes) {
      baseItems.push(shoes);
    } else if (isHome) {
      console.log(`   🏠 Home scenario "${scenario}" - creating outfit without footwear`);
    }
    
    // Create the most complete version available
    let finalOutfit = {
      type: isHome && !shoes ? 'dress-based-home' : 'dress-based',
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
  
  // Essential: top + bottom + footwear (footwear optional for home scenarios)
  const isHome = isHomeScenario(scenario);
  const shoesToUse = footwear.length > 0 ? footwear : (isHome ? [null] : []);
  
  if (shoesToUse.length === 0) {
    console.log(`   ❌ No footwear available for non-home scenario "${scenario}"`);
    return outfits;
  }
  
  bottoms.forEach((bottom, bottomIndex) => {
    shoesToUse.forEach((shoes, shoeIndex) => {
      const baseItems = [
        { ...itemData, compatibilityTypes: ['base-item'] },
        bottom
      ];
      
      // Add shoes if available (not null for home scenarios)
      if (shoes) {
        baseItems.push(shoes);
      } else if (isHome) {
        console.log(`   🏠 Home scenario "${scenario}" - creating outfit without footwear`);
      }
      
      // Prefer layered version when outerwear is available
      if (outerwear.length > 0) {
        // Use different outerwear pieces for variety
        const outerwearIndex = (bottomIndex + shoeIndex) % outerwear.length;
        const jacket = outerwear[outerwearIndex];
        
        const layeredOutfit = {
          type: isHome && !shoes ? 'top-based-layered-home' : 'top-based-layered',
          items: [...baseItems, jacket]
        };
        outfits.push(layeredOutfit);
      } else {
        // Only create base version if no outerwear available
        const baseOutfit = {
          type: isHome && !shoes ? 'top-based-home' : 'top-based',
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
  
  // Essential: bottom + top + footwear (footwear optional for home scenarios)
  const isHome = isHomeScenario(scenario);
  const shoesToUse = footwear.length > 0 ? footwear : (isHome ? [null] : []);
  
  if (shoesToUse.length === 0) {
    console.log(`   ❌ No footwear available for non-home scenario "${scenario}"`);
    return outfits;
  }
  
  tops.forEach((top, topIndex) => {
    shoesToUse.forEach((shoes, shoeIndex) => {
      const baseItems = [
        { ...itemData, compatibilityTypes: ['base-item'] },
        top
      ];
      
      // Add shoes if available (not null for home scenarios)
      if (shoes) {
        baseItems.push(shoes);
      } else if (isHome) {
        console.log(`   🏠 Home scenario "${scenario}" - creating outfit without footwear`);
      }
      
      // Prefer layered version when outerwear is available
      if (outerwear.length > 0) {
        // Use different outerwear pieces for variety
        const outerwearIndex = (topIndex + shoeIndex) % outerwear.length;
        const jacket = outerwear[outerwearIndex];
        
        const layeredOutfit = {
          type: isHome && !shoes ? 'bottom-based-layered-home' : 'bottom-based-layered',
          items: [...baseItems, jacket]
        };
        outfits.push(layeredOutfit);
      } else {
        // Only create base version if no outerwear available
        const baseOutfit = {
          type: isHome && !shoes ? 'bottom-based-home' : 'bottom-based',
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

module.exports = {
  buildDressOutfits,
  buildTopOutfits,
  buildBottomOutfits,
  buildFootwearOutfits,
  buildGeneralOutfits
};
