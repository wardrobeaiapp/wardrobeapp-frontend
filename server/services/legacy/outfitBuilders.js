/**
 * Legacy Outfit Builders
 * 
 * These are backwards-compatible builder functions maintained for testing purposes.
 * In production, outfit generation uses Claude AI for fashion-intelligent combinations.
 * These builders provide basic algorithmic fallbacks for test environments.
 */

/**
 * Route to correct outfit builder based on item category
 */
function buildOutfitRecommendations(itemData, itemsByCategory, season, scenario) {
  const category = itemData.category?.toLowerCase();
  
  // Outerwear and accessory items should not generate outfit combinations
  if (category === 'outerwear' || category === 'accessory' || category === 'accessories') {
    return [];
  }
  
  // For tests: return empty array if no essential categories (except for footwear items themselves)
  const hasEssentials = itemsByCategory.footwear || itemsByCategory.shoes || category === 'footwear';
  if (!hasEssentials) return [];
  
  // Mock outfit based on item category
  if (category === 'dress' || category === 'one_piece') {
    return buildDressOutfits(itemData, itemsByCategory, season, scenario);
  } else if (category === 'top') {
    return buildTopOutfits(itemData, itemsByCategory, season, scenario);
  } else if (category === 'bottom') {
    return buildBottomOutfits(itemData, itemsByCategory, season, scenario);
  } else if (category === 'footwear') {
    return buildFootwearOutfits(itemData, itemsByCategory, season, scenario);
  }
  return buildGeneralOutfits(itemData, itemsByCategory, season, scenario);
}

/**
 * Build dress + footwear combinations with optional outerwear/accessories
 */
function buildDressOutfits(itemData, itemsByCategory, season, scenario) {
  const footwear = itemsByCategory.footwear || itemsByCategory.shoes || [];
  if (footwear.length === 0) return [];
  
  return footwear.map((shoe, index) => {
    const outfit = {
      type: 'dress-based',
      items: [
        { ...itemData, compatibilityType: 'base-item' },
        { ...shoe, compatibilityType: 'complementing' }
      ]
    };
    
    // Add outerwear for cooler seasons - prioritize outerwear over accessories
    const outerwear = itemsByCategory.outerwear || [];
    if ((season === 'spring/fall' || season === 'spring' || season === 'fall' || season === 'winter') && outerwear.length > 0) {
      const outerIndex = index % outerwear.length;
      outfit.items.push({ ...outerwear[outerIndex], compatibilityType: 'outerwear' });
      outfit.type = 'dress-based-layered'; // Update type when outerwear is added
    } else {
      // Only add accessories when no outerwear
      const accessories = itemsByCategory.accessory || itemsByCategory.accessories || [];
      if (accessories.length > 0) {
        const accessoryIndex = index % accessories.length;
        outfit.items.push({ ...accessories[accessoryIndex], compatibilityType: 'complementing' });
      }
    }
    
    return outfit;
  });
}

/**
 * Build top + bottom + footwear combinations with optional outerwear
 */
function buildTopOutfits(itemData, itemsByCategory, season, scenario) {
  const bottoms = itemsByCategory.bottoms || itemsByCategory.bottom || [];
  const footwear = itemsByCategory.footwear || itemsByCategory.shoes || [];
  
  if (bottoms.length === 0 || footwear.length === 0) return [];
  
  const outfits = [];
  const outerwear = itemsByCategory.outerwear || [];
  const hasOuterwear = outerwear.length > 0;
  
  bottoms.forEach((bottom, bottomIndex) => {
    footwear.forEach((shoe, shoeIndex) => {
      const outfit = {
        type: hasOuterwear ? 'top-based-layered' : 'top-based',
        items: [
          { ...itemData, compatibilityType: 'base-item' },
          { ...bottom, compatibilityType: 'complementing' },
          { ...shoe, compatibilityType: 'complementing' }
        ]
      };
      
      // Add outerwear when available (prioritize layered version)
      if (hasOuterwear) {
        const outerIndex = (bottomIndex + shoeIndex) % outerwear.length;
        outfit.items.push({ ...outerwear[outerIndex], compatibilityType: 'layering' });
      }
      
      outfits.push(outfit);
    });
  });
  
  return outfits;
}

/**
 * Build bottom + top + footwear combinations
 */
function buildBottomOutfits(itemData, itemsByCategory, season, scenario) {
  const tops = itemsByCategory.tops || itemsByCategory.top || [];
  const footwear = itemsByCategory.footwear || itemsByCategory.shoes || [];
  
  if (tops.length === 0 || footwear.length === 0) return [];
  
  const outfits = [];
  tops.forEach((top) => {
    footwear.forEach((shoe) => {
      outfits.push({
        type: 'bottom-based',
        items: [
          { ...itemData, compatibilityType: 'base-item' },
          { ...top, compatibilityType: 'complementing' },
          { ...shoe, compatibilityType: 'complementing' }
        ]
      });
    });
  });
  
  return outfits;
}

/**
 * Build footwear + top + bottom combinations
 */
function buildFootwearOutfits(itemData, itemsByCategory, season, scenario) {
  const tops = itemsByCategory.tops || itemsByCategory.top || [];
  const bottoms = itemsByCategory.bottoms || itemsByCategory.bottom || [];
  
  if (tops.length === 0 || bottoms.length === 0) return [];
  
  const outfits = [];
  tops.forEach((top) => {
    bottoms.forEach((bottom) => {
      outfits.push({
        type: 'footwear-based',
        items: [
          { ...itemData, compatibilityType: 'base-item' },
          { ...top, compatibilityType: 'complementing' },
          { ...bottom, compatibilityType: 'complementing' }
        ]
      });
    });
  });
  
  return outfits;
}

/**
 * Build general combinations with available items (max 3 additional)
 */
function buildGeneralOutfits(itemData, itemsByCategory, season, scenario) {
  // Collect all available items (max 3 additional items)
  const allItems = [];
  Object.values(itemsByCategory).forEach(categoryItems => {
    if (Array.isArray(categoryItems)) {
      allItems.push(...categoryItems);
    }
  });
  
  if (allItems.length === 0) return [];
  
  const selectedItems = allItems.slice(0, 3); // Max 3 additional items
  
  return [{
    type: 'general',
    items: [
      { ...itemData, compatibilityType: 'base-item' },
      ...selectedItems.map(item => ({ ...item, compatibilityType: 'complementing' }))
    ]
  }];
}

module.exports = {
  buildOutfitRecommendations,
  buildDressOutfits,
  buildTopOutfits,
  buildBottomOutfits,
  buildFootwearOutfits,
  buildGeneralOutfits
};
