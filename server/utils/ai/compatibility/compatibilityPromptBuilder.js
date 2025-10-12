/**
 * Compatibility checking prompt builder for complementing items
 * Builds Claude AI prompts for intelligent compatibility decisions
 */

/**
 * Build compatibility checking section for Claude prompt
 */
function buildCompatibilityCheckingPrompt(itemData, complementingItems) {
  if (!complementingItems || complementingItems.length === 0) {
    return '';
  }

  console.log('[compatibility] Building compatibility check prompt');
  console.log('[compatibility] Item data:', itemData);
  console.log('[compatibility] Complementing items count:', complementingItems.length);

  // Group items by category for better organization
  const itemsByCategory = groupComplementingItemsByCategory(complementingItems);
  
  let prompt = '\n\n=== COMPLEMENTING ITEMS COMPATIBILITY CHECK ===\n';
  prompt += `Given your analysis of this ${itemData.category || 'item'}, evaluate which of these existing wardrobe pieces would work well together:\n\n`;

  // Add the current item context
  prompt += `CURRENT ITEM DETAILS:\n`;
  prompt += `- Name: ${itemData.name || 'New item'}\n`;
  prompt += `- Category: ${itemData.category || 'Unknown'}\n`;
  if (itemData.subcategory) prompt += `- Subcategory: ${itemData.subcategory}\n`;
  if (itemData.color) prompt += `- Color: ${itemData.color}\n`;
  if (itemData.style) prompt += `- Style: ${itemData.style}\n`;
  if (itemData.pattern) prompt += `- Pattern: ${itemData.pattern}\n`;
  if (itemData.material) prompt += `- Material: ${itemData.material}\n`;
  if (itemData.silhouette) prompt += `- Silhouette: ${itemData.silhouette}\n`;
  if (itemData.seasons) prompt += `- Season: ${Array.isArray(itemData.seasons) ? itemData.seasons.join(', ') : itemData.seasons}\n`;
  if (itemData.scenarios) prompt += `- Suitable scenarios: ${Array.isArray(itemData.scenarios) ? itemData.scenarios.join(', ') : itemData.scenarios}\n`;

  prompt += '\nEXISTING WARDROBE PIECES TO EVALUATE:\n';

  // Add each category with its items - use uppercase plural headers to match tests
  Object.keys(itemsByCategory).forEach(category => {
    const items = itemsByCategory[category];
    if (items && items.length > 0) {
      // Convert category names to match test expectations
      let categoryHeader = category.toUpperCase();
      if (category === 'bottom') categoryHeader = 'BOTTOMS';
      if (category === 'top') categoryHeader = 'TOPS';
      if (category === 'footwear') categoryHeader = 'FOOTWEAR';
      if (category === 'accessory') categoryHeader = 'ACCESSORIES';
      
      prompt += `\n**${categoryHeader}:**\n`;
      
      items.forEach((item, index) => {
        prompt += `${index + 1}. ${item.name}`;
        if (item.color) prompt += ` (${item.color})`;
        if (item.subcategory && item.subcategory !== category) {
          prompt += ` - ${item.subcategory}`;
        }
        if (item.style) prompt += ` - ${item.style} style`;
        if (item.pattern && item.pattern !== 'solid') prompt += ` - ${item.pattern}`;
        if (item.season && Array.isArray(item.season)) {
          prompt += ` - seasons: ${item.season.join(', ')}`;
        }
        prompt += '\n';
      });
    }
  });

  prompt += '\nCOMPATIBILITY ANALYSIS:\n';
  prompt += 'For each category, analyze each item considering:\n';
  prompt += '- **Color harmony**: Do the colors work together harmoniously?\n';
  prompt += '- **Style cohesion**: Do the style levels match appropriately?\n';
  prompt += '- **Season appropriateness**: Are both items suitable for the same seasons?\n';
  prompt += '- **Occasion compatibility**: Would this combination work for the intended use cases?\n';
  prompt += '- **Proportion and silhouette**: Do the shapes and proportions complement each other?\n';
  prompt += '- **Material compatibility**: Do the textures and materials work together?\n';
  prompt += '- **Pattern mixing rules**: If patterns are involved, do they follow good mixing principles?\n';
  prompt += '- **Practical wearability**: Would someone actually wear these together in real life?\n';

  Object.keys(itemsByCategory).forEach(category => {
    const items = itemsByCategory[category];
    if (items && items.length > 0) {
      prompt += `\n**${category}:**\n`;
      items.forEach((item) => {
        prompt += `- ${item.name}: [Analyze compatibility and provide reasoning]\n`;
      });
    }
  });

  prompt += '\nREQUIRED RESPONSE FORMAT:\n';
  prompt += 'COMPATIBLE COMPLEMENTING ITEMS:\n';
  prompt += 'List only the items that would work well, organized by category:\n';
  
  Object.keys(itemsByCategory).forEach(category => {
    prompt += `${category}: [List compatible items from this category, comma-separated, or "none"]\n`;
  });

  prompt += '\nIMPORTANT:\n';
  prompt += '- Only include items that genuinely complement the new item\n';
  prompt += '- Consider real-world styling principles\n';
  prompt += '- Be selective - fewer good matches is better than many questionable ones\n';
  prompt += '- If no items in a category work well, write "none"\n';
  
  return prompt;
}

/**
 * Group complementing items by category
 */
function groupComplementingItemsByCategory(items) {
  const grouped = {};
  
  items.forEach(item => {
    const category = item.category ? item.category.toLowerCase() : 'other';
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(item);
  });
  
  // Sort items within each category by name for consistency
  Object.keys(grouped).forEach(category => {
    grouped[category].sort((a, b) => {
      const nameA = a.name || '';
      const nameB = b.name || '';
      return nameA.localeCompare(nameB);
    });
  });
  
  console.log('[compatibility] Grouped items by category:', Object.keys(grouped).map(cat => `${cat}: ${grouped[cat].length}`).join(', '));
  
  return grouped;
}

module.exports = {
  buildCompatibilityCheckingPrompt,
  groupComplementingItemsByCategory
};
