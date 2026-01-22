/**
 * Outfit Validator for Claude Outfit Generation
 * 
 * Validates that an outfit has all essential components and follows
 * fashion rules like proper layering and closure requirements.
 */

/**
 * Validate that an outfit has all essential components
 * @param {Array} outfitItems - Items in the outfit
 * @param {string} baseItemCategory - Category of the base item being analyzed
 * @param {string} scenario - Scenario context
 * @returns {Object} { isValid: boolean, reason?: string }
 */
function validateOutfitCompleteness(outfitItems, baseItemCategory, scenario) {
  const isHomeScenario = scenario && (
    scenario.toLowerCase().includes('home') || 
    scenario.toLowerCase().includes('staying at home')
  );
  
  // Check if footwear is present (required for non-home scenarios)
  const hasFootwear = outfitItems.some(item => 
    item.category?.toLowerCase() === 'footwear'
  );
  
  if (!isHomeScenario && !hasFootwear) {
    return {
      isValid: false,
      reason: `Missing required footwear for "${scenario}" scenario`
    };
  }
  
  // Check category-specific requirements
  const baseCategory = baseItemCategory?.toLowerCase();
  
  if (baseCategory === 'top') {
    // Tops need bottoms + footwear
    const hasBottoms = outfitItems.some(item => 
      ['bottom', 'bottoms'].includes(item.category?.toLowerCase())
    );
    if (!hasBottoms) {
      return {
        isValid: false,
        reason: 'Top-based outfit missing bottoms'
      };
    }
  }
  
  if (baseCategory === 'bottom') {
    // Bottoms need tops + footwear  
    const hasTops = outfitItems.some(item => 
      ['top', 'tops'].includes(item.category?.toLowerCase())
    );
    if (!hasTops) {
      return {
        isValid: false,
        reason: 'Bottom-based outfit missing tops'
      };
    }
  }
  
  if (baseCategory === 'footwear') {
    // Footwear needs BOTH tops AND bottoms to make a complete outfit
    // Note: Multiple tops are allowed for proper layering (e.g., t-shirt + blazer)
    const topItems = outfitItems.filter(item => 
      ['top', 'tops'].includes(item.category?.toLowerCase())
    );
    const hasBottoms = outfitItems.some(item => 
      ['bottom', 'bottoms'].includes(item.category?.toLowerCase())
    );
    
    if (topItems.length === 0) {
      return {
        isValid: false,
        reason: 'Footwear-based outfit missing tops (cannot wear just shoes and bottoms)'
      };
    }
    if (!hasBottoms) {
      return {
        isValid: false,
        reason: 'Footwear-based outfit missing bottoms (cannot wear just shoes and tops)'
      };
    }
  }
  
  if (baseCategory === 'outerwear') {
    // Smart outerwear validation based on item type and styling approach
    const hasBottoms = outfitItems.some(item => 
      ['bottom', 'bottoms'].includes(item.category?.toLowerCase())
    );
    
    // Bottoms are always required for outerwear-based outfits
    if (!hasBottoms) {
      return {
        isValid: false,
        reason: 'Outerwear-based outfit missing bottoms (need complete outfit underneath)'
      };
    }
    
    // For tops: Blazers and cardigans can be worn standalone if they have button/zip closures
    // Heavy jackets and coats typically need base layers
    const baseItem = outfitItems.find(item => item.category?.toLowerCase() === 'outerwear');
    const isBlazerId = baseItem?.subcategory?.toLowerCase() === 'blazer';
    const isCardigan = baseItem?.subcategory?.toLowerCase() === 'cardigan';
    const hasButtonOrZip = baseItem?.closure && ['Buttons', 'Zipper'].includes(baseItem.closure);
    
    const hasTops = outfitItems.some(item => 
      ['top', 'tops'].includes(item.category?.toLowerCase())
    );
    
    // Heavy jackets/coats need base layers, but blazers/cardigans with proper closures can go standalone
    const canGoStandalone = (isBlazerId || isCardigan) && hasButtonOrZip;
    
    if (!hasTops && !canGoStandalone) {
      return {
        isValid: false,
        reason: `${baseItem?.subcategory || 'Outerwear'} requires base layer underneath (missing top)`
      };
    }
  }
  
  // SAFETY NET: Check for multiple bottoms violation  
  const bottomItems = outfitItems.filter(item => {
    const category = item.category?.toLowerCase();
    return category === 'bottom' || category === 'bottoms';
  });
  
  if (bottomItems.length > 1) {
    const bottomNames = bottomItems.map(item => `${item.name}`).join(' + ');
    return {
      isValid: false,
      reason: `Invalid multiple bottoms: ${bottomNames} - can only wear one bottom per outfit`
    };
  }

  // SAFETY NET: Check for double outer layer violations
  const outerLayerItems = outfitItems.filter(item => {
    const subcategory = item.subcategory?.toLowerCase() || '';
    const isOuterLayer = ['hoodie', 'sweatshirt', 'sweater', 'cardigan', 'blazer', 'jacket', 'coat'].includes(subcategory);
    return isOuterLayer;
  });
  
  if (outerLayerItems.length > 1) {
    const outerLayerNames = outerLayerItems.map(item => `${item.name} (${item.subcategory})`).join(' + ');
    return {
      isValid: false,
      reason: `Invalid double outer layers: ${outerLayerNames} - choose only one outer layer per outfit`
    };
  }

  // SAFETY NET: Final closure rule validation to catch any AI mistakes
  const invalidClosureItems = outfitItems.filter(item => {
    const subcategory = item.subcategory?.toLowerCase();
    const isCardigan = subcategory === 'cardigan';
    const isBlazer = subcategory === 'blazer';
    const isVest = subcategory === 'vest';
    const isHoodie = subcategory === 'hoodie';
    const isOpenFront = ['Open Front', 'Wrap Style'].includes(item.closure);
    const isZipHoodie = isHoodie && item.closure === 'Zipper';
    
    // Check cardigans/blazers/vests with open front OR zip hoodies (both need base layers)
    return ((isCardigan || isBlazer || isVest) && isOpenFront) || isZipHoodie;
  });
  
  if (invalidClosureItems.length > 0) {
    // Check if there's an underneath layer for the open front items
    const hasUnderneathLayer = outfitItems.some(item => 
      ['t-shirt', 'shirt', 'blouse', 'tank top', 'camisole'].includes(item.subcategory?.toLowerCase())
    );
    
    if (!hasUnderneathLayer) {
      const invalidNames = invalidClosureItems.map(item => `${item.name} (${item.closure || item.subcategory})`).join(', ');
      return {
        isValid: false,
        reason: `Items requiring base layer underneath: ${invalidNames}`
      };
    }
  }
  
  // Outfit is valid
  return { isValid: true };
}

module.exports = {
  validateOutfitCompleteness
};
