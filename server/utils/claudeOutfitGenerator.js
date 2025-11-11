/**
 * Claude-Based Outfit Generation Utility
 * 
 * Uses Claude's natural fashion knowledge to create sensible outfit combinations
 * instead of mechanical algorithmic combinations.
 */

/**
 * Generate outfit combinations using Claude's fashion intelligence
 * @param {Object} itemData - The analyzed item (base item)
 * @param {Object} itemsByCategory - Available compatible items organized by category
 * @param {string} season - Season context (e.g., "spring/fall", "summer")
 * @param {string} scenario - Scenario context (e.g., "Social Outings", "Office Work")  
 * @param {Object} anthropicClient - Claude API client
 * @returns {Array} Array of outfit objects with fashion-sensible combinations
 */
async function generateOutfitsWithClaude(itemData, itemsByCategory, season, scenario, anthropicClient) {
  console.log(`   🤖 Asking Claude to create outfits for ${season} ${scenario}...`);
  
  // Build comprehensive prompt with item details
  const outfitPrompt = buildOutfitCreationPrompt(itemData, itemsByCategory, season, scenario);
  
  try {
    const response = await anthropicClient.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 2048, // Increased for up to 10 outfits with explanations
      temperature: 0.3, // Lower temperature for more consistent fashion logic
      system: "You are a professional fashion stylist. Create practical, weather-appropriate outfit combinations that make fashion sense.",
      messages: [{
        role: "user", 
        content: outfitPrompt
      }]
    });
    
    const claudeResponse = response.content[0].text;
    console.log('   🎨 Claude outfit response:', claudeResponse.substring(0, 200) + '...');
    
    // Parse Claude's response into outfit objects
    const outfits = parseClaudeOutfitResponse(claudeResponse, itemData, itemsByCategory, scenario);
    
    console.log(`   ✅ Claude created ${outfits.length} sensible outfit combinations`);
    if (outfits.length === 0) {
      console.log('   ⚠️ Claude returned no valid outfits - check parsing or validation logic');
    }
    return outfits;
    
  } catch (error) {
    console.error('   ❌ Error generating outfits with Claude:', error);
    console.log('   🔄 Will fallback to algorithmic outfit generation');
    // Return null to signal fallback should be used
    return null;
  }
}

/**
 * Build comprehensive prompt for Claude outfit creation
 */
function buildOutfitCreationPrompt(itemData, itemsByCategory, season, scenario) {
  let prompt = `Create practical outfit combinations for ${season} season and ${scenario} scenario.\n\n`;
  
  // Add base item details
  prompt += `BASE ITEM (must be included in all outfits):\n`;
  prompt += `- ${itemData.name} (${itemData.category})\n`;
  if (itemData.type) prompt += `  Type: ${itemData.type}\n`;
  if (itemData.material) prompt += `  Material: ${itemData.material}\n`;
  if (itemData.style) prompt += `  Style: ${itemData.style}\n`;
  if (itemData.color) prompt += `  Color: ${itemData.color}\n`;
  if (itemData.details) prompt += `  Details: ${itemData.details}\n`;
  
  prompt += `\nAVAILABLE COMPATIBLE ITEMS:\n`;
  
  // Add all available items with their details
  Object.entries(itemsByCategory).forEach(([category, items]) => {
    if (items && items.length > 0) {
      prompt += `\n${category.toUpperCase()}:\n`;
      items.forEach((item, index) => {
        prompt += `${index + 1}. ${item.name}`;
        if (item.type) prompt += ` (type: ${item.type})`;
        if (item.material) prompt += ` (material: ${item.material})`;
        if (item.color) prompt += ` (color: ${item.color})`;
        if (item.details) prompt += ` (${item.details})`;
        prompt += `\n`;
      });
    }
  });
  
  // Check if this is a home scenario where footwear is optional
  const isHomeScenario = scenario && (
    scenario.toLowerCase().includes('home') || 
    scenario.toLowerCase().includes('staying at home')
  );

  prompt += `\nINSTRUCTIONS:
- Create up to 10 COMPLETE outfit combinations that include the base item
- Stop creating outfits when you've exhausted genuinely different, high-quality styling approaches
- Each outfit should offer a distinct look or styling approach - avoid repetitive combinations
- A COMPLETE outfit must include: base item + appropriate clothing + ${isHomeScenario ? 'footwear (optional for home scenarios)' : 'footwear (REQUIRED)'}
- ACCESSORIES (bags, jewelry, belts) are ADDITIONAL items that complement complete outfits - they do NOT replace footwear or essential clothing
- Consider weather appropriateness (e.g., don't pair heavy winter items with summer items)
- Consider occasion appropriateness for "${scenario}"
- Each outfit should be practical and fashionable
- For each outfit, list the items used and briefly explain why they work together
- Quality over quantity: It's better to have 3-5 excellent, diverse outfits than 10 similar ones
${isHomeScenario ? '' : '- FOOTWEAR IS MANDATORY for non-home scenarios - do not create outfits without shoes'}

FORMAT your response as:
OUTFIT 1: [item names separated by + symbols]
Explanation: [brief fashion reasoning]

OUTFIT 2: [item names separated by + symbols]  
Explanation: [brief fashion reasoning]

... continue up to OUTFIT 10 if you have genuinely different, high-quality styling approaches`;

  return prompt;
}

/**
 * Parse Claude's outfit response back into expected format
 */
function parseClaudeOutfitResponse(claudeResponse, baseItemData, itemsByCategory, scenario) {
  const outfits = [];
  
  // Split response into outfit sections
  const outfitSections = claudeResponse.split(/OUTFIT \d+:/i).slice(1);
  
  console.log(`   🔍 Parsing ${outfitSections.length} outfit sections from Claude response`);
  
  outfitSections.forEach((section, index) => {
    const lines = section.split('\n').map(line => line.trim()).filter(line => line);
    if (lines.length === 0) return;
    
    const itemsLine = lines[0];
    const explanation = lines.find(line => line.toLowerCase().startsWith('explanation:')) || '';
    
    // Parse item names from the line
    const itemNames = itemsLine.split('+').map(name => name.trim());
    const outfitItems = [];
    
    // Add base item first
    outfitItems.push({
      ...baseItemData,
      compatibilityTypes: ['base-item']
    });
    
    // Find matching items from available items
    itemNames.forEach(itemName => {
      if (itemName.toLowerCase() === baseItemData.name.toLowerCase()) return; // Skip base item
      
      // Search for this item in available items
      Object.values(itemsByCategory).forEach(categoryItems => {
        if (Array.isArray(categoryItems)) {
          const matchedItem = categoryItems.find(item => 
            item.name.toLowerCase().includes(itemName.toLowerCase()) ||
            itemName.toLowerCase().includes(item.name.toLowerCase())
          );
          if (matchedItem && !outfitItems.find(existing => existing.name === matchedItem.name)) {
            outfitItems.push(matchedItem);
          }
        }
      });
    });
    
    // Validate outfit completeness before adding
    const isValidOutfit = validateOutfitCompleteness(outfitItems, baseItemData.category, scenario);
    
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

/**
 * Validate that an outfit has all essential components
 * @param {Array} outfitItems - Items in the outfit
 * @param {string} baseItemCategory - Category of the base item being analyzed
 * @param {string} scenario - Scenario context
 * @returns {Object} { isValid: boolean, reason?: string }
 */
function validateOutfitCompleteness(outfitItems, baseItemCategory, scenario) {
  const isHomeScenario = scenario && (
    scenario.toLowerCase().includes('home') || 
    scenario.toLowerCase().includes('staying at home')
  );
  
  // Check if footwear is present (required for non-home scenarios)
  const hasFootwear = outfitItems.some(item => 
    item.category?.toLowerCase() === 'footwear'
  );
  
  if (!isHomeScenario && !hasFootwear) {
    return {
      isValid: false,
      reason: `Missing required footwear for "${scenario}" scenario`
    };
  }
  
  // Check category-specific requirements
  const baseCategory = baseItemCategory?.toLowerCase();
  
  if (baseCategory === 'top') {
    // Tops need bottoms + footwear
    const hasBottoms = outfitItems.some(item => 
      ['bottom', 'bottoms'].includes(item.category?.toLowerCase())
    );
    if (!hasBottoms) {
      return {
        isValid: false,
        reason: 'Top-based outfit missing bottoms'
      };
    }
  }
  
  if (baseCategory === 'bottom') {
    // Bottoms need tops + footwear  
    const hasTops = outfitItems.some(item => 
      ['top', 'tops'].includes(item.category?.toLowerCase())
    );
    if (!hasTops) {
      return {
        isValid: false,
        reason: 'Bottom-based outfit missing tops'
      };
    }
  }
  
  // Outfit is valid
  return { isValid: true };
}

module.exports = {
  generateOutfitsWithClaude,
  buildOutfitCreationPrompt,
  parseClaudeOutfitResponse,
  validateOutfitCompleteness
};
