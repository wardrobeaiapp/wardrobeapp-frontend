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
  
  // Debug: Log what item details Claude will actually see
  console.log('🔍 [DEBUG] NEW ITEM DETAILS FOR CLAUDE:');
  console.log('   - Name:', itemData.name);
  console.log('   - Details:', itemData.details || 'MISSING');
  console.log('   - Silhouette:', itemData.silhouette || 'MISSING');
  console.log('   - Material:', itemData.material || 'MISSING');
  
  // Debug: Log sample existing items
  console.log('🔍 [DEBUG] SAMPLE EXISTING ITEMS:');
  complementingItems.slice(0, 3).forEach(item => {
    console.log(`   - ${item.name}: silhouette=${item.silhouette || 'MISSING'}, material=${item.material || 'MISSING'}, details=${item.details || 'MISSING'}`);
  });

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
  if (itemData.details) prompt += `- Details: ${itemData.details}\n`;
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
        if (item.silhouette) prompt += ` - ${item.silhouette} fit`;
        if (item.material) prompt += ` - ${item.material}`;
        if (item.pattern && item.pattern !== 'solid') prompt += ` - ${item.pattern}`;
        if (item.type) prompt += ` - ${item.type}`;
        if (item.details) prompt += ` - ${item.details}`;
        if (item.season && Array.isArray(item.season)) {
          prompt += ` - seasons: ${item.season.join(', ')}`;
        }
        prompt += '\n';
      });
    }
  });

  prompt += '\nEVALUATION CRITERIA:\n';
  prompt += 'Be HIGHLY SELECTIVE and consider these sophisticated styling factors:\n\n';
  
  prompt += '**THINK LIKE A PROFESSIONAL STYLIST:**\n';
  prompt += '- Does this combination create an INTENTIONAL, COHESIVE aesthetic?\n';
  prompt += '- Consider the overall vibe, mood, and styling story of the main piece\n';
  prompt += '- Use your fashion expertise - what would actually look good together?\n';
  prompt += '- Focus on creating elevated, harmonious looks rather than just "functional" combinations\n\n';
  
  prompt += '**ITEM NECESSITY:**\n';
  prompt += '- Does this item actually NEED this accessory/complement?\n';
  prompt += '- Consider if the accessory ENHANCES or DETRACTS from the main item\n';
  prompt += '- Some items are complete on their own and don\'t need additional accessories\n\n';
  
  prompt += '**STYLING SOPHISTICATION:**\n';
  prompt += '- **Color harmony**: Colors should be harmonious AND support the aesthetic\n';
  prompt += '- **Tone matching**: Soft items need soft complements, bold items need appropriate boldness\n';
  prompt += '- **Proportion balance**: Scale and visual weight should be appropriate\n';
  prompt += '- **Material synergy**: Textures should support the overall mood\n';
  prompt += '- **Occasion appropriateness**: Perfect for the intended use case\n';

  prompt += '\nREQUIRED RESPONSE FORMAT:\n';
  prompt += 'For each item listed above, respond with COMPATIBLE or NOT_COMPATIBLE and provide a brief styling reason:\n\n';
  prompt += 'Format: ItemName: COMPATIBLE/NOT_COMPATIBLE - [brief reason]\n\n';
  
  Object.keys(itemsByCategory).forEach(category => {
    const items = itemsByCategory[category];
    if (items && items.length > 0) {
      prompt += `**${category.toUpperCase()}:**\n`;
      items.forEach((item, index) => {
        prompt += `${index + 1}. ${item.name}: [COMPATIBLE or NOT_COMPATIBLE] - [styling reason]\n`;
      });
      prompt += '\n';
    }
  });

  prompt += '\nCOMMON STYLING MISTAKES TO AVOID:\n';
  prompt += '- Don\'t match items just because they "don\'t clash" - they should ENHANCE each other\n';
  prompt += '- Avoid adding unnecessary accessories (belts to dresses that are meant to flow)\n';
  prompt += '- Don\'t pair delicate/romantic items with harsh/chunky pieces\n';
  prompt += '- Avoid mixing too many different vibes (bohemian + corporate + athletic)\n';
  prompt += '- Don\'t suggest items that compete for attention rather than complement\n\n';
  
  prompt += 'EXAMPLES:\n';
  prompt += '✅ GOOD: Blue floral dress + nude/tan heels (soft, harmonious, lets dress shine)\n';
  prompt += '❌ BAD: Blue floral dress + black chunky boots (too harsh, clashing vibes)\n';
  prompt += '✅ GOOD: Structured blazer + thin leather belt (adds definition, matches formality)\n';
  prompt += '❌ BAD: Flowy bohemian dress + wide statement belt (interrupts the flow)\n\n';
  
  prompt += 'FINAL INSTRUCTIONS:\n';
  prompt += '- Only approve items that create an INTENTIONAL, COHESIVE look\n';
  prompt += '- When in doubt, be MORE SELECTIVE - quality over quantity\n';
  prompt += '- Consider: Would a professional stylist recommend this pairing?\n';
  prompt += '- If no items in a category work well, that\'s perfectly fine\n';
  
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
