/**
 * Compatibility checking prompt builder for complementing items
 * Lets Claude AI make intelligent decisions about which items work well together
 */

/**
 * Build compatibility checking section for Claude prompt
 */
function buildCompatibilityCheckingPrompt(itemData, complementingItems) {
  if (!complementingItems || complementingItems.length === 0) {
    return '';
  }

  console.log('\n=== 🎨 BUILDING COMPATIBILITY CHECKING PROMPT ===');
  console.log(`Item being analyzed: ${itemData.name || itemData.category} (${itemData.color})`);
  console.log(`Complementing items to check: ${complementingItems.length} items`);

  // Group complementing items by category for Claude
  const groupedItems = groupComplementingItemsByCategory(complementingItems);
  
  let prompt = '\n\n=== 🎨 COMPLEMENTING ITEMS COMPATIBILITY CHECK ===\n\n';
  
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
  
  prompt += '\n**COMPLEMENTING ITEMS TO EVALUATE:**\n\n';
  
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
  
  prompt += '**COMPATIBILITY EVALUATION INSTRUCTIONS:**\n\n';
  prompt += 'Please evaluate which of these complementing items would create GOOD styling combinations with the current item. Consider:\n\n';
  prompt += '• **Color harmony** - Do the colors work well together? Consider color theory, neutrals, and seasonal palettes\n';
  prompt += '• **Style cohesion** - Do the pieces work together stylistically? (casual/formal, modern/classic, etc.)\n';
  prompt += '• **Season appropriateness** - Do the items work for the same seasons?\n';
  prompt += '• **Occasion compatibility** - Would these pieces work for similar scenarios?\n';
  prompt += '• **Visual balance** - Do textures, patterns, and silhouettes complement each other?\n';
  prompt += '• **Material compatibility** - Do fabric weights and textures work together?\n';
  prompt += '• **Fit harmony** - Do the fits create a balanced, intentional look?\n';
  prompt += '• **Brand aesthetic** - Do the pieces share similar style aesthetics?\n\n';
  
  prompt += 'EXCLUDE items that:\n';
  prompt += '• Create color clashes or muddy combinations\n';
  prompt += '• Mix incompatible style levels (very casual with very formal)\n';
  prompt += '• Are inappropriate for the same seasons\n';
  prompt += '• Create overwhelming pattern/texture conflicts\n';
  prompt += '• Have incompatible fits (e.g., oversized with oversized creating shapelessness)\n';
  prompt += '• Mix conflicting material weights (heavy wool with sheer fabrics)\n';
  prompt += '• Create brand aesthetic conflicts (streetwear with preppy, etc.)\n\n';
  
  prompt += '**REQUIRED RESPONSE FORMAT:**\n\n';
  prompt += 'Return your compatibility selections in this exact format:\n\n';
  prompt += '```\n';
  prompt += 'COMPATIBLE COMPLEMENTING ITEMS:\n';
  
  Object.keys(groupedItems).forEach(category => {
    if (groupedItems[category] && groupedItems[category].length > 0) {
      prompt += `${category}: [list compatible item names, separated by commas]\n`;
    }
  });
  
  prompt += '```\n\n';
  prompt += 'Only list items that would create genuinely good combinations. Be selective - quality over quantity!\n\n';
  
  console.log(`📝 Compatibility prompt built with ${Object.keys(groupedItems).length} categories`);
  
  return prompt;
}

/**
 * Group complementing items by category
 */
function groupComplementingItemsByCategory(items) {
  const grouped = {};
  
  items.forEach(item => {
    const category = item.category?.toLowerCase();
    let groupKey;
    
    switch (category) {
      case 'bottom':
        groupKey = 'bottoms';
        break;
      case 'footwear':
        groupKey = 'footwear';
        break;
      case 'accessory':
        groupKey = 'accessories';
        break;
      case 'top':
        groupKey = 'tops';
        break;
      case 'one_piece':
        groupKey = 'onePieces';
        break;
      case 'outerwear':
        groupKey = 'outerwear';
        break;
      default:
        groupKey = 'other';
    }
    
    if (!grouped[groupKey]) {
      grouped[groupKey] = [];
    }
    grouped[groupKey].push(item);
  });
  
  return grouped;
}

/**
 * Extract item data from available sources
 */
function extractItemDataForCompatibility(formData, preFilledData, imageAnalysisData) {
  console.log('[compatibility] Extracting item data from available sources...');
  
  const itemData = {};
  
  // Get basic info from formData (user input or wishlist)
  if (formData) {
    itemData.category = formData.category;
    itemData.subcategory = formData.subcategory;
    itemData.color = formData.color;
    itemData.seasons = formData.seasons;
    itemData.name = formData.name;
  }
  
  // Override with preFilledData (wishlist items)
  if (preFilledData) {
    console.log('[compatibility] Using prefilled wishlist data');
    itemData.category = preFilledData.category || itemData.category;
    itemData.subcategory = preFilledData.subcategory || itemData.subcategory;
    itemData.color = preFilledData.color || itemData.color;
    itemData.seasons = preFilledData.season || preFilledData.seasons || itemData.seasons;
    itemData.name = preFilledData.name || itemData.name;
  }
  
  // Enhance with image analysis data (if available from previous Claude call)
  if (imageAnalysisData) {
    console.log('[compatibility] Enhancing with image analysis data');
    itemData.color = imageAnalysisData.detectedColor || itemData.color;
    itemData.pattern = imageAnalysisData.pattern;
    itemData.styleLevel = imageAnalysisData.styleLevel;
    itemData.formalityLevel = imageAnalysisData.formalityLevel;
  }
  
  console.log('[compatibility] Final item data:', JSON.stringify(itemData, null, 2));
  return itemData;
}

/**
 * Parse Claude's compatibility response and match names to full item objects
 * @param {string} claudeResponse - Claude's response text
 * @param {Array} stylingContext - Full item objects for matching
 * @returns {Object} - Compatible items organized by category with full objects
 */
function parseCompatibilityResponse(claudeResponse, stylingContext = []) {
  console.log('\n=== 🎯 PARSING COMPATIBILITY RESPONSE ===');
  
  try {
    // Look for the COMPATIBLE COMPLEMENTING ITEMS section
    // Capture everything until we hit double newline, triple backticks, or end of string
    const compatibleSection = claudeResponse.match(/COMPATIBLE COMPLEMENTING ITEMS:\s*\n?((?:.*\n?)*?)(?=\n\n|```|$)/im);
    
    if (!compatibleSection || !compatibleSection[1]) {
      console.log('[compatibility] No compatible items section found in response');
      return {};
    }
    
    const itemsText = compatibleSection[1].trim();
    const lines = itemsText.split('\n').filter(line => line.trim());
    const compatibleItems = {};
    
    lines.forEach((line) => {
      // Stop processing if we hit explanatory text (lines that don't follow the category: items format)
      if (line.toLowerCase().includes('these items') || line.toLowerCase().includes('because') || line.toLowerCase().includes('analysis')) {
        return;
      }
      
      // Parse format like "bottoms: Navy Trousers, Black Jeans" (with optional leading whitespace)
      const match = line.match(/^\s*(\w+):\s*(.+)$/i);
      if (match) {
        const category = match[1].toLowerCase();
        const itemsStr = match[2].trim();
        
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
              
              console.log(`🔍 [compatibility] Trying to match: "${itemName}" | Found: ${fullItem ? `✅ ${fullItem.name} (ID: ${fullItem.id})` : '❌ No match'}`);
              
              if (fullItem) {
                // Return full item object with all properties needed for cards
                return {
                  ...fullItem,
                  // Add compatibility type for frontend display
                  compatibilityTypes: ['complementing']
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
    console.error('❌ Error parsing compatibility response:', error);
    return {};
  }
}

module.exports = {
  buildCompatibilityCheckingPrompt,
  extractItemDataForCompatibility,
  parseCompatibilityResponse
};
