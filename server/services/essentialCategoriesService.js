/**
 * Essential Categories Service
 * 
 * Handles checking whether we have all essential categories needed
 * to create complete outfits for different item types.
 * 
 * Essential categories are the minimum wardrobe categories needed
 * to create a complete, wearable outfit around a specific item.
 */

/**
 * Check if we have all essential categories for a complete outfit
 * @param {Object} itemData - The item being analyzed (category, etc.)
 * @param {Array} allCompatibleItems - All compatible items from wardrobe
 * @param {string} season - The season to check for (e.g., 'winter', 'summer')
 * @returns {Object} Analysis of essential categories availability
 */
function checkEssentialCategories(itemData, allCompatibleItems, season) {
  // Define essential categories based on the item being analyzed
  const ESSENTIAL_CATEGORIES = {
    'dress': ['footwear'], // Dress just needs shoes
    'one_piece': ['footwear'], // One-piece (dress/jumpsuit) just needs shoes
    'top': ['bottoms', 'footwear'], // Top needs bottoms + shoes  
    'bottom': ['tops', 'footwear'], // Bottoms need tops + shoes
    'footwear': ['tops', 'bottoms'], // Shoes need top + bottom
    'outerwear': [], // Outerwear is layering - doesn't drive requirements
    'accessory': [] // Accessories don't drive requirements
  };
  
  const itemCategory = itemData.category?.toLowerCase();
  const requiredCategories = ESSENTIAL_CATEGORIES[itemCategory] || [];
  
  // Warn about unmapped categories
  if (!ESSENTIAL_CATEGORIES.hasOwnProperty(itemCategory)) {
    console.log(`⚠️  [checkEssentials] Unknown item category: ${itemCategory} - treating as no requirements`);
  }
  
  console.log(`🔍 [checkEssentials] Item category: ${itemCategory}, Required: [${requiredCategories.join(', ')}], Season: ${season}`);
  console.log(`🔍 [checkEssentials] All compatible items: ${allCompatibleItems.length} items`);
  
  // Get items that match this season
  const seasonItems = allCompatibleItems.filter(item => {
    const itemSeasons = item.seasons || item.season || [];
    let matches = false;
    
    if (typeof itemSeasons === 'string') {
      matches = itemSeasons.includes(season) || season.includes(itemSeasons);
    } else if (Array.isArray(itemSeasons)) {
      matches = itemSeasons.some(itemSeason => 
        itemSeason.includes(season) || season.includes(itemSeason)
      );
    }
    
    if (matches) {
      console.log(`    ✅ ${item.name} (${item.category}) - seasons: ${JSON.stringify(itemSeasons)}`);
    }
    
    return matches;
  });
  
  console.log(`🔍 [checkEssentials] Items matching season '${season}': ${seasonItems.length} items`);
  
  // Helper function to normalize category names for comparison
  const normalizeCategory = (category) => {
    const normalized = category?.toLowerCase();
    // Handle singular/plural mapping
    const categoryMap = {
      'top': 'tops',
      'tops': 'tops', 
      'bottom': 'bottoms',
      'bottoms': 'bottoms',
      'footwear': 'footwear',
      'accessory': 'accessories',
      'accessories': 'accessories',
      'outerwear': 'outerwear'
    };
    return categoryMap[normalized] || normalized;
  };

  // Check which required categories we have items for
  const availableCategories = [];
  const missingCategories = [];
  
  requiredCategories.forEach(requiredCategory => {
    const normalizedRequired = normalizeCategory(requiredCategory);
    
    const itemsInCategory = seasonItems.filter(item => 
      normalizeCategory(item.category) === normalizedRequired
    );
    
    if (itemsInCategory.length > 0) {
      console.log(`    ✅ Found ${requiredCategory}: ${itemsInCategory.map(i => i.name).join(', ')}`);
      availableCategories.push(requiredCategory);
    } else {
      console.log(`    ❌ Missing ${requiredCategory}`);
      missingCategories.push(requiredCategory);
    }
  });
  
  // Also track available non-essential categories for display (normalized)
  const allAvailableCategories = [...new Set(seasonItems.map(item => normalizeCategory(item.category)).filter(Boolean))];
  
  console.log(`🔍 [checkEssentials] Result: hasAllEssentials=${missingCategories.length === 0}, missing=[${missingCategories.join(', ')}]`);
  
  return {
    hasAllEssentials: missingCategories.length === 0,
    missingCategories,
    availableCategories: allAvailableCategories,
    requiredCategories
  };
}

module.exports = {
  checkEssentialCategories
};
