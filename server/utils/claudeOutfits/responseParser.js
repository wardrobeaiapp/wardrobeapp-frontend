/**
 * Response Parser for Claude Outfit Generation
 * 
 * Parses Claude's outfit response back into expected format with proper
 * item matching and null safety validation.
 */

// Import validation function
const { validateOutfitCompleteness } = require('./outfitValidator');

/**
 * Parse Claude's outfit response back into expected format
 * @param {string} claudeResponse - Raw response from Claude API
 * @param {Object} baseItemData - The analyzed item (base item)
 * @param {Object} itemsByCategory - Available compatible items organized by category
 * @param {string} scenario - Scenario context for validation
 * @returns {Array} Array of parsed outfit objects
 */
function parseClaudeOutfitResponse(claudeResponse, baseItemData, itemsByCategory, scenario) {
  const outfits = [];
  
  // Handle null/undefined response
  if (!claudeResponse || typeof claudeResponse !== 'string') {
    console.log('   ⚠️ Empty or invalid Claude response');
    return outfits;
  }
  
  // Split response into outfit sections
  const outfitSections = claudeResponse.split(/OUTFIT \d+:/i).slice(1);
  
  console.log(`   🔍 Parsing ${outfitSections.length} outfit sections from Claude response`);
  
  outfitSections.forEach((section, index) => {
    const lines = section.split('\n').map(line => line.trim()).filter(line => line);
    if (lines.length === 0) return;
    
    const itemsLine = lines[0];
    const explanation = lines.find(line => line.toLowerCase().startsWith('explanation:')) || '';
    
    // Parse item names from the line
    const itemNames = itemsLine.split('+').map(name => name.trim()).filter(name => name && name.length > 0);
    const outfitItems = [];
    
    // Add base item first (with null safety)
    if (baseItemData) {
      const baseItemForOutfit = {
        ...baseItemData,
        compatibilityTypes: ['base-item']
      };
      
      console.log(`   📦 Adding base item to outfit ${index + 1}:`);
      console.log('     - Name:', baseItemForOutfit.name || 'MISSING NAME');
      console.log('     - Category:', baseItemForOutfit.category || 'MISSING CATEGORY');
      console.log('     - Has imageUrl:', !!baseItemForOutfit.imageUrl);
      console.log('     - ImageUrl preview:', baseItemForOutfit.imageUrl ? baseItemForOutfit.imageUrl.substring(0, 50) + '...' : 'NO IMAGE URL');
      
      outfitItems.push(baseItemForOutfit);
    } else {
      console.log(`   ❌ NO BASE ITEM DATA for outfit ${index + 1}`);
    }
    
    // Find matching items from available items
    itemNames.forEach(itemName => {
      if (!itemName || typeof itemName !== 'string') return; // Skip invalid item names
      if (baseItemData && baseItemData.name && itemName.toLowerCase() === baseItemData.name.toLowerCase()) return; // Skip base item
      
      // Search for this item in available items (with null safety)
      if (itemsByCategory && typeof itemsByCategory === 'object') {
        Object.values(itemsByCategory).forEach(categoryItems => {
          if (Array.isArray(categoryItems)) {
            const matchedItem = categoryItems.find(item => 
              item && item.name && typeof item.name === 'string' &&
              (item.name.toLowerCase().includes(itemName.toLowerCase()) ||
               itemName.toLowerCase().includes(item.name.toLowerCase()))
            );
            if (matchedItem && matchedItem.name && !outfitItems.find(existing => existing.name === matchedItem.name)) {
              outfitItems.push(matchedItem);
            }
          }
        });
      }
    });
    
    // Validate outfit completeness before adding
    const isValidOutfit = validateOutfitCompleteness(outfitItems, baseItemData?.category, scenario);
    
    if (outfitItems.length > 1 && isValidOutfit.isValid) { // Must have base item + at least one other item + be complete
      outfits.push({
        type: `claude-generated-${index + 1}`,
        items: outfitItems,
        explanation: explanation.replace(/explanation:\s*/i, '').trim()
      });
    } else if (!isValidOutfit.isValid) {
      console.log(`   ⚠️ Skipping incomplete outfit: ${itemsLine.substring(0, 100)} - ${isValidOutfit.reason}`);
    }
  });
  
  return outfits;
}

module.exports = {
  parseClaudeOutfitResponse
};
