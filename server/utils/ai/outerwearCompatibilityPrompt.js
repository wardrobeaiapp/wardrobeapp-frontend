/**
 * Outerwear Compatibility Check - Determines which outerwear items work well with a given item
 * Focuses on style compatibility while avoiding physical incompatibilities
 */

/**
 * Check if an item is suitable for outerwear compatibility analysis
 */
function isItemSuitableForOuterwear(itemData, extractedCharacteristics) {
  const category = itemData.category?.toLowerCase();
  
  // Most items can work with outerwear (except other outerwear)
  const unsuitableItems = {
    'outerwear': ['coat', 'puffer', 'parka', 'trench'], // Heavy outerwear doesn't work with other outerwear
    'other': ['misc'] // Other category doesn't work with outerwear
  };
  
  // Check if item is in unsuitable categories
  if (unsuitableItems[category]) {
    const subcategory = itemData.subcategory?.toLowerCase();
    const unsuitableSubcategories = unsuitableItems[category];
    if (unsuitableSubcategories.includes(subcategory)) {
      return false;
    }
  }
  
  return true;
}

/**
 * Get outerwear items from styling context for compatibility checking
 */
function getOuterwearItemsFromContext(stylingContext, newItemCategory) {
  if (!stylingContext || stylingContext.length === 0) {
    return [];
  }
  
  // Filter only outerwear items from styling context
  const outerwearItems = stylingContext.filter(item => {
    const existingCategory = item.category?.toLowerCase();
    return existingCategory === 'outerwear';
  });
  
  return outerwearItems;
}

/**
 * Build prompt for outerwear compatibility analysis using incompatibilities data
 */
function buildOuterwearCompatibilityPrompt(itemData, outerwearItems) {
  if (!outerwearItems || outerwearItems.length === 0) {
    return '';
  }

  // Group outerwear items by category
  const groupedItems = groupOuterwearItemsByCategory(outerwearItems);
  
  let prompt = '\n\n=== 🧥 OUTERWEAR COMPATIBILITY CHECK ===\n\n';
  
  prompt += '**CURRENT ITEM DETAILS:**\n';
  if (itemData.name) prompt += `- Name: ${itemData.name}\n`;
  if (itemData.category) prompt += `- Category: ${itemData.category}\n`;
  if (itemData.subcategory) prompt += `- Subcategory: ${itemData.subcategory}\n`;
  if (itemData.color) prompt += `- Color: ${itemData.color}\n`;
  if (itemData.seasons) prompt += `- Seasons: ${itemData.seasons.join(', ')}\n`;
  if (itemData.pattern) prompt += `- Pattern: ${itemData.pattern}\n`;
  if (itemData.material) prompt += `- Material: ${itemData.material}\n`;
  if (itemData.brand) prompt += `- Brand: ${itemData.brand}\n`;
  if (itemData.style) prompt += `- Style: ${itemData.style}\n`;
  if (itemData.silhouette) prompt += `- Silhouette: ${itemData.silhouette}\n`;
  if (itemData.fit) prompt += `- Fit: ${itemData.fit}\n`;
  if (itemData.length) prompt += `- Length: ${itemData.length}\n`;
  if (itemData.sleeves) prompt += `- Sleeves: ${itemData.sleeves}\n`;
  if (itemData.neckline) prompt += `- Neckline: ${itemData.neckline}\n`;
  if (itemData.rise) prompt += `- Rise: ${itemData.rise}\n`;
  if (itemData.type) prompt += `- Type: ${itemData.type}\n`;
  if (itemData.heelHeight) prompt += `- Heel Height: ${itemData.heelHeight}\n`;
  if (itemData.bootHeight) prompt += `- Boot Height: ${itemData.bootHeight}\n`;
  if (itemData.size) prompt += `- Size: ${itemData.size}\n`;
  
  prompt += '\n**OUTERWEAR ITEMS TO EVALUATE:**\n\n';
  
  // Present items grouped by category
  Object.entries(groupedItems).forEach(([category, items]) => {
    if (items && items.length > 0) {
      prompt += `**${category.toUpperCase()}** (${items.length} items):\n`;
      items.forEach((item, index) => {
        prompt += `${index + 1}. ${item.name} - ${item.color} (${item.subcategory}`;
        if (item.brand) prompt += `, ${item.brand}`;
        if (item.material) prompt += `, ${item.material}`;
        if (item.style) prompt += `, ${item.style}`;
        if (item.fit) prompt += `, ${item.fit} fit`;
        if (item.silhouette) prompt += `, ${item.silhouette}`;
        if (item.length) prompt += `, ${item.length}`;
        if (item.sleeves) prompt += `, ${item.sleeves} sleeves`;
        if (item.neckline) prompt += `, ${item.neckline}`;
        if (item.pattern) prompt += `, ${item.pattern}`;
        if (item.type) prompt += `, ${item.type}`;
        if (item.season && item.season.length > 0) {
          prompt += `, ${item.season.join('/')}`; 
        }
        prompt += ')\n';
      });
      prompt += '\n';
    }
  });
  
  prompt += '**ANALYSIS INSTRUCTIONS:**\n';
  prompt += '- **PRIMARY: Find outerwear items that would LOOK GOOD and STYLE WELL with the current item**\n';
  prompt += '- **Color coordination** - Do colors work harmoniously together?\n';
  prompt += '- **Style harmony** - Do the pieces share compatible aesthetic levels and style philosophies?\n';
  prompt += '- **Seasonal appropriateness** - Are both items suitable for the same seasons?\n';
  prompt += '- **Occasion matching** - Would these pieces work for similar scenarios and formality levels?\n';
  prompt += '- **Material compatibility** - Do fabric weights and textures complement each other?\n';
  prompt += '- **Brand aesthetic harmony** - Do the styling philosophies work together?\n';
  prompt += '- **SECONDARY: Avoid physical incompatibilities** (sleeve conflicts, volume issues, length proportions)\n';
  prompt += '- Focus on pieces that would realistically be worn together and complement each other\n';
  prompt += '- Skip items with significant style conflicts or physical incompatibilities (mention why)\n\n';
  
  prompt += '**RESPONSE FORMAT:**\n';
  prompt += '🚨 **CRITICAL**: Provide ALL good recommendations, not just a few examples.\n';
  prompt += '✅ **REQUIREMENT**: You must evaluate EVERY SINGLE outerwear item listed above.\n';
  prompt += '✅ **REQUIREMENT**: Recommend ALL items that work well - do NOT limit yourself to 2-3 examples.\n';
  prompt += '✅ **REQUIREMENT**: If 5+ items work well, recommend ALL 5+. If only 1 works, recommend only that 1.\n';
  prompt += '✅ **REQUIREMENT**: If NO items work well, write "outerwear: none" and explain why.\n';
  prompt += '❌ **FORBIDDEN**: Do NOT give "a few good options" - give ALL good options.\n\n';
  prompt += 'COMPATIBLE OUTERWEAR ITEMS:\n';
  prompt += 'outerwear: [COMPLETE LIST of ALL compatible items by name, comma-separated, OR write "none" if no good matches]\n';
  prompt += '\nFor each item, briefly state: COMPATIBLE (reason) or EXCLUDED (reason).';
  
  return prompt;
}

/**
 * Group outerwear items by their type/category
 */
function groupOuterwearItemsByCategory(outerwearItems) {
  const grouped = {};
  
  outerwearItems.forEach(item => {
    const category = 'outerwear'; // All are outerwear
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(item);
  });
  
  return grouped;
}

/**
 * Parse Claude's outerwear compatibility response and match names to full item objects
 * @param {string} claudeResponse - Claude's response text
 * @param {Array} stylingContext - Full item objects for matching
 * @returns {Object} - Compatible items organized by category with full objects
 */
function parseOuterwearCompatibilityResponse(claudeResponse, stylingContext = []) {
  try {
    // Look for the COMPATIBLE OUTERWEAR ITEMS section
    const compatibleSection = claudeResponse.match(/COMPATIBLE OUTERWEAR ITEMS:\s*\n?((?:.*\n?)*?)(?=\n\n|```|$)/im);
    
    if (!compatibleSection || !compatibleSection[1]) {
      console.log('[outerwear] No compatible outerwear items section found in response');
      return {};
    }
    
    const itemsText = compatibleSection[1].trim();
    const lines = itemsText.split('\n').filter(line => line.trim());
    const compatibleItems = {};
    
    lines.forEach((line) => {
      // Stop processing if we hit explanatory text
      if (line.toLowerCase().includes('these items') || line.toLowerCase().includes('because') || line.toLowerCase().includes('analysis')) {
        return;
      }
      
      // Parse format like "outerwear: Navy Cardigan, Denim Jacket"
      const match = line.match(/^\s*(\w+):\s*(.+)$/i);
      if (match) {
        const category = match[1].toLowerCase();
        const itemsStr = match[2].trim();
        
        if (itemsStr && !['none', '-', 'no items'].includes(itemsStr.toLowerCase())) {
          const itemNames = itemsStr.split(',').map(item => item.trim()).filter(Boolean);
          
          if (itemNames.length > 0) {
            // Match item names to full objects from styling context
            const fullItemObjects = itemNames.map(itemName => {
              // Find matching item in styling context by name
              // Use flexible matching: either full name contains partial name, or vice versa
              const fullItem = stylingContext.find(item => {
                if (!item.name || !itemName) return false;
                
                const itemNameLower = item.name.toLowerCase();
                const searchNameLower = itemName.toLowerCase();
                
                // Try bidirectional partial matching
                return itemNameLower.includes(searchNameLower) || 
                       searchNameLower.includes(itemNameLower) ||
                       // Also try word-by-word matching for better flexibility
                       searchNameLower.split(' ').every(word => 
                         word.length > 2 && itemNameLower.includes(word)
                       );
              });
              
              if (fullItem) {
                // Return full item object with all properties needed for cards
                return {
                  ...fullItem,
                  // Add compatibility type for frontend display
                  compatibilityTypes: ['outerwear']
                };
              } else {
                // Skip items that don't match any real wardrobe items - don't create fake items
                console.log(`⚠️ No matching item found for: "${itemName}" - skipping fake item creation`);
                return null;
              }
            }).filter(Boolean);
            
            if (fullItemObjects.length > 0) {
              compatibleItems[category] = fullItemObjects;
            }
          } else if (itemsStr.toLowerCase() === 'none') {
            // Explicitly handle the "none" case - don't add empty array, let the system know no compatible items found
            console.log('[outerwear-compatibility] No compatible outerwear items found');
          }
        }
      }
    });
    
    return compatibleItems;
    
  } catch (error) {
    console.error('❌ Error parsing outerwear compatibility response:', error);
    return {};
  }
}

module.exports = {
  isItemSuitableForOuterwear,
  buildOuterwearCompatibilityPrompt,
  parseOuterwearCompatibilityResponse,
  getOuterwearItemsFromContext
};
