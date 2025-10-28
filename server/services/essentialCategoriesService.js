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
 * Check if a scenario is home-based (doesn't require footwear)
 * Simple backend version of the frontend function
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
 * Check if we have all essential categories for a complete outfit
 * @param {Object} itemData - The item being analyzed (category, etc.)
 * @param {Array} allCompatibleItems - All compatible items from wardrobe
 * @param {string} season - The season to check for (e.g., 'winter', 'summer')
 * @param {string} scenarioName - The scenario name (optional) for home scenario detection
 * @param {Array} scenarios - Array of scenario objects with id and name (optional) for UUID-to-name mapping
 * @returns {Object} Analysis of essential categories availability
 */
function checkEssentialCategories(itemData, allCompatibleItems, season, scenarioName = null, scenarios = []) {
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
  let requiredCategories = ESSENTIAL_CATEGORIES[itemCategory] || [];
  
  // 🏠 HOME SCENARIO LOGIC: Remove footwear requirement for home scenarios
  const isHome = isHomeScenario(scenarioName);
  if (isHome && requiredCategories.includes('footwear')) {
    requiredCategories = requiredCategories.filter(category => category !== 'footwear');
    console.log(`🏠 [checkEssentials] Home scenario "${scenarioName}" - removed footwear requirement`);
  }
  
  // Warn about unmapped categories
  if (!ESSENTIAL_CATEGORIES.hasOwnProperty(itemCategory)) {
    console.log(`⚠️  [checkEssentials] Unknown item category: ${itemCategory} - treating as no requirements`);
  }
  
  console.log(`🔍 [checkEssentials] Item category: ${itemCategory}, Required: [${requiredCategories.join(', ')}], Season: ${season}, Scenario: ${scenarioName}`);
  console.log(`🔍 [checkEssentials] All compatible items: ${allCompatibleItems.length} items`);
  
  // Convert scenario name to UUID for filtering (if scenarios mapping is provided)
  let scenarioId = null;
  if (scenarioName && scenarios && scenarios.length > 0) {
    const scenario = scenarios.find(s => s.name === scenarioName);
    if (scenario) {
      scenarioId = scenario.id;
      console.log(`🔍 [checkEssentials] Scenario "${scenarioName}" → UUID: ${scenarioId}`);
    } else {
      console.log(`⚠️  [checkEssentials] Scenario "${scenarioName}" not found in scenarios mapping`);
    }
  }
  
  // Get items that match both season and scenario
  const seasonScenarioItems = allCompatibleItems.filter(item => {
    // First check season match
    const itemSeasons = item.seasons || item.season || [];
    let seasonMatches = false;
    
    if (typeof itemSeasons === 'string') {
      seasonMatches = itemSeasons.includes(season) || season.includes(itemSeasons);
    } else if (Array.isArray(itemSeasons)) {
      seasonMatches = itemSeasons.some(itemSeason => 
        itemSeason.includes(season) || season.includes(itemSeason)
      );
    }
    
    // If season doesn't match, skip this item
    if (!seasonMatches) {
      return false;
    }
    
    // Then check scenario match (if we have a scenario to filter by)
    let scenarioMatches = true; // Default to true if no scenario filtering needed
    if (scenarioId && item.scenarios && Array.isArray(item.scenarios)) {
      scenarioMatches = item.scenarios.includes(scenarioId);
      
      if (!scenarioMatches) {
        console.log(`    ❌ ${item.name} (${item.category}) - seasons match but scenario doesn't: item scenarios: ${JSON.stringify(item.scenarios)}, needed: ${scenarioId}`);
        return false;
      }
    }
    
    console.log(`    ✅ ${item.name} (${item.category}) - seasons: ${JSON.stringify(itemSeasons)}, scenarios: ${JSON.stringify(item.scenarios)}`);
    return true;
  });
  
  console.log(`🔍 [checkEssentials] Items matching season '${season}' and scenario '${scenarioName}': ${seasonScenarioItems.length} items`);
  
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
    
    const itemsInCategory = seasonScenarioItems.filter(item => 
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
  const allAvailableCategories = [...new Set(seasonScenarioItems.map(item => normalizeCategory(item.category)).filter(Boolean))];
  
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
