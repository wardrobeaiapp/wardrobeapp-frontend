/**
 * Season Scenario Service
 * 
 * Handles creation and analysis of season + scenario combinations.
 * This service determines which combinations of seasons and scenarios
 * can form complete outfits based on available wardrobe items.
 */

const { checkEssentialCategories } = require('./essentialCategoriesService');

/**
 * Create and log season + scenario combinations with item availability check
 * @param {Object} itemData - Item data with seasons and scenarios
 * @param {Object} compatibleItems - Compatible items organized by category
 * @returns {Array} Array of season + scenario combination objects
 */
function createSeasonScenarioCombinations(itemData, compatibleItems) {
  const seasonScenarioCombinations = [];
  
  // Get seasons from itemData
  const seasons = itemData.seasons || [];
  
  // Try to get scenarios from multiple sources
  let scenarios = itemData.scenarios || itemData.suitableScenarios || [];
  
  // Handle scenario objects (extract names)
  if (scenarios.length > 0 && typeof scenarios[0] === 'object') {
    scenarios = scenarios.map(s => s.name || s);
  }
  
  if (seasons.length > 0 && scenarios.length > 0) {
    // Flatten compatible items from all categories
    const allCompatibleItems = [];
    if (compatibleItems) {
      Object.values(compatibleItems).forEach(categoryItems => {
        if (Array.isArray(categoryItems)) {
          allCompatibleItems.push(...categoryItems);
        }
      });
    }
    
    console.log(`\n🎯 SEASON + SCENARIO COMBINATIONS (${seasons.length * scenarios.length} total):`);
    
    seasons.forEach(season => {
      scenarios.forEach(scenario => {
        const combination = `${season} + ${scenario}`;
        
        // Check essential categories for complete outfit (pass scenario for home detection)
        const { hasAllEssentials, missingCategories, availableCategories } = checkEssentialCategories(
          itemData, allCompatibleItems, season, scenario
        );
        
        const status = hasAllEssentials ? '✅' : '❌';
        const comboIndex = seasonScenarioCombinations.length + 1;
        
        let statusMessage;
        if (hasAllEssentials) {
          statusMessage = 'COMPLETE';
        } else if (missingCategories.length > 0) {
          statusMessage = `MISSING ${missingCategories.join(', ').toUpperCase()}`;
        } else {
          statusMessage = 'NO ITEMS';
        }
        
        // Add available categories info if there are some items
        if (availableCategories.length > 0 && !hasAllEssentials) {
          statusMessage += ` (has: ${availableCategories.join(', ')})`;
        }
        
        console.log(`  ${comboIndex}) ${combination} ${status} ${statusMessage}`);
        
        seasonScenarioCombinations.push({
          combination,
          season,
          scenario,
          hasItems: hasAllEssentials,
          missingCategories,
          availableCategories
        });
      });
    });
    
    const totalWithItems = seasonScenarioCombinations.filter(combo => combo.hasItems).length;
    console.log(`\n📊 COVERAGE: ${totalWithItems}/${seasonScenarioCombinations.length} combinations have complete outfits`);
    
  } else {
    console.log(`\n🎯 SEASON + SCENARIO COMBINATIONS: Cannot create - missing data`);
    console.log(`  - Seasons: ${seasons.length > 0 ? seasons.join(', ') : 'not available'}`);
    console.log(`  - Scenarios: ${scenarios.length > 0 ? scenarios.join(', ') : 'not available'}`);
    console.log(`🔍 DEBUG - seasons array:`, seasons);
    console.log(`🔍 DEBUG - scenarios array:`, scenarios);
    console.log(`🔍 DEBUG - itemData keys:`, Object.keys(itemData));
    console.log(`🔍 DEBUG - itemData.seasons raw:`, itemData.seasons);
    console.log(`🔍 DEBUG - itemData.scenarios raw:`, itemData.scenarios);
    console.log(`🔍 DEBUG - itemData.suitableScenarios raw:`, itemData.suitableScenarios);
  }
  
  return seasonScenarioCombinations;
}

module.exports = {
  createSeasonScenarioCombinations
};
