/**
 * Utility functions for consolidating and processing compatibility analysis results
 */

/**
 * Consolidate all compatibility results by category for frontend popup display
 * @param {Object} compatibleComplementingItems - Results from complementing compatibility check
 * @param {Object} compatibleLayeringItems - Results from layering compatibility check  
 * @param {Object} compatibleOuterwearItems - Results from outerwear compatibility check
 * @returns {Object} Consolidated results organized by category with compatibility type labels
 */
function consolidateCompatibilityResults(compatibleComplementingItems, compatibleLayeringItems, compatibleOuterwearItems) {
  const consolidatedResults = {};
  
  // Helper to safely add items to category
  const addItemsToCategory = (category, items, compatibilityType) => {
    if (!consolidatedResults[category]) {
      consolidatedResults[category] = [];
    }
    // Handle both string arrays and object arrays
    const labeledItems = items.map(item => {
      // If item is a string, convert to object (legacy support)
      if (typeof item === 'string') {
        return {
          name: item,
          compatibilityTypes: [compatibilityType]
        };
      }
      // If item is already an object with full card data
      return {
        ...item,
        compatibilityTypes: item.compatibilityTypes || [compatibilityType]
      };
    });
    consolidatedResults[category] = consolidatedResults[category].concat(labeledItems);
  };
  
  // Merge complementing items (tops, bottoms, footwear, accessories)
  if (compatibleComplementingItems) {
    Object.keys(compatibleComplementingItems).forEach(category => {
      if (compatibleComplementingItems[category] && compatibleComplementingItems[category].length > 0) {
        addItemsToCategory(category, compatibleComplementingItems[category], 'complementing');
      }
    });
  }
  
  // Merge layering items (cardigans, blazers, etc.)
  if (compatibleLayeringItems) {
    Object.keys(compatibleLayeringItems).forEach(category => {
      if (compatibleLayeringItems[category] && compatibleLayeringItems[category].length > 0) {
        addItemsToCategory(category, compatibleLayeringItems[category], 'layering');
      }
    });
  }
  
  // Merge outerwear items (coats, jackets, etc.)
  if (compatibleOuterwearItems) {
    Object.keys(compatibleOuterwearItems).forEach(category => {
      if (compatibleOuterwearItems[category] && compatibleOuterwearItems[category].length > 0) {
        addItemsToCategory(category, compatibleOuterwearItems[category], 'outerwear');
      }
    });
  }
  
  // Remove duplicates within each category (same item might appear in multiple compatibility types)
  Object.keys(consolidatedResults).forEach(category => {
    const uniqueItems = [];
    const seenNames = new Set();
    
    consolidatedResults[category].forEach(item => {
      const itemName = item.name || item.id || JSON.stringify(item);
      if (!seenNames.has(itemName)) {
        seenNames.add(itemName);
        // If item appears in multiple compatibility types, combine them
        const allCompatibilityTypes = consolidatedResults[category]
          .filter(i => (i.name || i.id || JSON.stringify(i)) === itemName)
          .map(i => i.compatibilityType);
        
        uniqueItems.push({
          ...item,
          compatibilityTypes: allCompatibilityTypes // Array of all compatibility types
        });
      }
    });
    
    consolidatedResults[category] = uniqueItems;
  });
  
  return consolidatedResults;
}

module.exports = {
  consolidateCompatibilityResults
};
