/**
 * Layering compatibility checking prompt builder
 * Evaluates both style compatibility AND physical wearability
 */

/**
 * Check if item is suitable for layering (not standalone)
 */
function isItemSuitableForLayering(itemData, extractedCharacteristics) {
  const category = itemData.category?.toLowerCase();
  const subcategory = itemData.subcategory?.toLowerCase();
  
  // Items that are typically standalone (cannot be layered effectively)
  const standaloneItems = {
    'one_piece': ['dress', 'jumpsuit', 'romper', 'bodysuit'],
    'outerwear': ['coat', 'puffer', 'parka', 'trench'], // Heavy outerwear is typically outermost
    'bottom': ['shorts'], // Shorts are typically not layered over
    'footwear': ['boots', 'sandals', 'heels'], // Footwear doesn't layer typically
    'accessory': ['hat', 'bag', 'jewelry'] // Accessories don't layer typically
  };
  
  // Check if item is in standalone categories
  if (standaloneItems[category]) {
    const standaloneSubcategories = standaloneItems[category];
    if (standaloneSubcategories.includes(subcategory)) {
      return false;
    }
  }
  
  // Check extracted characteristics for layering capability
  if (extractedCharacteristics) {
    // Look for layering-related characteristics
    const layeringCapability = extractedCharacteristics.layeringCapability;
    if (layeringCapability === 'standalone') {
      return false;
    }
  }
  
  return true;
}

/**
 * Build layering compatibility checking prompt
 */
function buildLayeringCompatibilityPrompt(itemData, layeringItems) {
  if (!layeringItems || layeringItems.length === 0) {
    return '';
  }

  // Building layering compatibility prompt

  // Group layering items by category
  const groupedItems = groupLayeringItemsByCategory(layeringItems);
  
  let prompt = '\n\n=== 🧥 LAYERING ITEMS COMPATIBILITY CHECK ===\n\n';
  
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
  
  prompt += '\n**LAYERING ITEMS TO EVALUATE:**\n\n';
  
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
  
  prompt += '**LAYERING COMPATIBILITY EVALUATION INSTRUCTIONS:**\n\n';
  prompt += 'Please evaluate which layering items would create BOTH stylistically good AND physically wearable combinations with the current item.\n\n';
  
  prompt += '**STYLE COMPATIBILITY** - Consider:\n';
  prompt += '• **Color harmony** - Do colors work together in layered looks?\n';
  prompt += '• **Style cohesion** - Do the pieces work together stylistically?\n';
  prompt += '• **Seasonal appropriateness** - Appropriate layering for the same seasons?\n';
  prompt += '• **Proportions** - Do silhouettes work well when layered?\n';
  prompt += '• **Material harmony** - Do fabric weights layer appropriately?\n';
  prompt += '• **Brand aesthetic** - Do pieces share compatible styling philosophies?\n\n';
  
  prompt += '**PHYSICAL WEARABILITY** - CRITICAL - Consider:\n';
  prompt += '• **Sleeve compatibility** - Can sleeves fit comfortably under/over each other?\n';
  prompt += '  * Fitted sleeves under loose sleeves ✓\n';
  prompt += '  * Puffy/voluminous sleeves under fitted blazers/jackets ❌\n';
  prompt += '  * Long sleeves under sleeveless items ✓\n';
  prompt += '• **Fit compatibility** - Can items physically layer without being too tight?\n';
  prompt += '  * Fitted items under loose items ✓\n';
  prompt += '  * Bulky items under fitted items ❌\n';
  prompt += '• **Length compatibility** - Do lengths work for layering without awkward proportions?\n';
  prompt += '• **Neckline compatibility** - Can necklines layer appropriately without bunching?\n';
  prompt += '• **Fabric thickness** - Can fabrics layer without being too bulky or restrictive?\n';
  prompt += '• **Material texture** - Do textures complement rather than compete when layered?\n\n';
  
  prompt += '**EXCLUDE items that create:**\n';
  prompt += '• **Physical impossibilities** - Cannot physically wear together\n';
  prompt += '• **Extreme bulk** - Too many thick layers\n';
  prompt += '• **Sleeve conflicts** - Puffy sleeves under fitted arms\n';
  prompt += '• **Fit conflicts** - Tight over bulky items\n';
  prompt += '• **Style clashes** - Incompatible formality levels\n';
  prompt += '• **Color conflicts** - Clashing or muddy combinations\n\n';
  
  prompt += '**REQUIRED RESPONSE FORMAT:**\n\n';
  prompt += 'Return your layering selections in this exact format:\n\n';
  prompt += '```\n';
  prompt += 'COMPATIBLE LAYERING ITEMS:\n';
  
  Object.keys(groupedItems).forEach(category => {
    if (groupedItems[category] && groupedItems[category].length > 0) {
      prompt += `${category}: [list compatible item names, separated by commas]\n`;
    }
  });
  
  prompt += '```\n\n';
  prompt += 'Only list items that create genuinely GOOD and PHYSICALLY WEARABLE layered combinations!\n\n';
  
  return prompt;
}

/**
 * Group layering items by category
 */
function groupLayeringItemsByCategory(items) {
  const grouped = {};
  
  items.forEach(item => {
    const category = item.category?.toLowerCase();
    let groupKey;
    
    switch (category) {
      case 'top':
        groupKey = 'tops';
        break;
      case 'outerwear':
        groupKey = 'outerwear';
        break;
      case 'accessory':
        // Only certain accessories can layer (scarves, cardigans worn as accessories)
        if (['scarf', 'wrap', 'shawl'].includes(item.subcategory?.toLowerCase())) {
          groupKey = 'accessories';
        }
        break;
      default:
        // Most other categories don't typically layer
        return;
    }
    
    if (groupKey && !grouped[groupKey]) {
      grouped[groupKey] = [];
    }
    if (groupKey) {
      grouped[groupKey].push(item);
    }
  }); // Close the forEach loop
  
  return grouped;
}

/**
 * Parse Claude's layering compatibility response and match names to full item objects
 * @param {string} claudeResponse - Claude's response text
 * @param {Array} stylingContext - Full item objects for matching
 * @returns {Object} - Compatible items organized by category with full objects
 */
function parseLayeringCompatibilityResponse(claudeResponse, stylingContext = []) {
  try {
    // Look for the COMPATIBLE LAYERING ITEMS section
    const compatibleSection = claudeResponse.match(/COMPATIBLE LAYERING ITEMS:\s*\n?((?:.*\n?)*?)(?=\n\n|```|$)/im);
    
    if (!compatibleSection || !compatibleSection[1]) {
      console.log('[layering] No compatible layering items section found in response');
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
      
      // Parse format like "tops: White Blouse, Navy Cardigan"
      const match = line.match(/^\s*(\w+):\s*(.+)$/i);
      if (match) {
        const category = match[1].toLowerCase();
        const itemsStr = match[2].trim();
        
        // Only accept valid layering categories
        const validLayeringCategories = ['tops', 'outerwear', 'accessories'];
        if (!validLayeringCategories.includes(category)) {
          return; // Skip invalid categories
        }
        
        if (itemsStr && itemsStr !== 'none' && itemsStr !== '-') {
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
                  compatibilityTypes: ['layering']
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
          }
        }
      }
    });
    
    return compatibleItems;
    
  } catch (error) {
    console.error('❌ Error parsing layering compatibility response:', error);
    return {};
  }
}

/**
 * Filter styling context to get only layering items
 */
function getLayeringItemsFromContext(stylingContext, newItemCategory) {
  if (!stylingContext || stylingContext.length === 0) {
    return [];
  }
  
  // Filtering layering items from styling context
  
  // Define what can layer with what
  const layeringMap = {
    'top': ['top', 'outerwear'], // Tops can layer with other tops and outerwear
    'outerwear': ['top'], // Light outerwear can layer with tops
    'accessory': ['accessory'] // Some accessories can layer (scarves)
  };
  
  const newCategory = newItemCategory?.toLowerCase();
  const validLayeringCategories = layeringMap[newCategory] || [];
  
  const layeringItems = stylingContext.filter(item => {
    const existingCategory = item.category?.toLowerCase();
    const isLayeringCategory = validLayeringCategories.includes(existingCategory);
    
    // Additional filtering for specific subcategories
    if (isLayeringCategory && existingCategory === 'accessory') {
      const subcategory = item.subcategory?.toLowerCase();
      return ['scarf', 'wrap', 'shawl'].includes(subcategory);
    }
    
    return isLayeringCategory;
  });
  
  return layeringItems;
}

module.exports = {
  isItemSuitableForLayering,
  buildLayeringCompatibilityPrompt,
  parseLayeringCompatibilityResponse,
  getLayeringItemsFromContext
};
