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
  if (itemData.closure) prompt += `  Closure: ${itemData.closure}\n`;
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
        if (item.closure) prompt += ` (closure: ${item.closure})`;
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

  prompt += `\n🚨 BLAZER/CARDIGAN/HOODIE STYLING RULES 🚨
For EVERY outfit you create, check ALL cardigans/blazers/hoodies in the combination (from any source - base item OR available items list):

MANDATORY RULE:
• If ANY cardigan/blazer/vest has "Open Front" or "Wrap Style" closure → That outfit MUST also contain an underneath layer (t-shirt, blouse, tank top)
• If no underneath layer is available in that combination → DO NOT create that outfit
• Example: "Jeans + Cream Cardigan (closure: Open Front) + Boots" = INVALID - skip this combination
• Example: "Jeans + T-Shirt + Cream Cardigan (closure: Open Front) + Boots" = VALID

HOODIE STYLING RULES:
• Pullover hoodies can be worn STANDALONE or WITH layering underneath (t-shirt, tank top)
• Zip closure hoodies should ONLY be worn WITH layering underneath (t-shirt, tank top)
• Example: "Jeans + Zip Hoodie + Sneakers" = INVALID (missing base layer)
• Example: "Jeans + T-Shirt + Zip Hoodie + Sneakers" = VALID (has base layer)
• Example: "Jeans + Pullover Hoodie + Sneakers" = VALID (pullover can be standalone)

STYLING VARIETY RULE:
• For button/zip closure blazers/cardigans/vest - CREATE BOTH styling approaches when possible:
  - Some outfits with the blazer/cardigan worn STANDALONE (just the blazer + bottoms + shoes)
  - Some outfits with the blazer/cardigan LAYERED over tops (blazer + shirt/blouse/t-shirt + bottoms + shoes)
• This creates styling variety and shows different looks: professional (standalone), casual-chic (layered), etc.
• Example variety: "Navy Blazer + White Pants + Heels" AND "Navy Blazer + Silk Blouse + White Pants + Heels"

🚨 CRITICAL: PROPER LAYERING RULES 🚨
• GOOD LAYERING (encouraged): Base layer + outer layer
  - ✅ VALID: "T-shirt + Blazer + Jeans" (base + outer)
  - ✅ VALID: "Tank Top + Cardigan + Skirt" (base + outer)
  - ✅ VALID: "Blouse + Light Jacket + Trousers" (base + outer)

• BAD LAYERING (forbidden): Multiple outer layers together
  - ❌ INVALID: "Hoodie + Sweatshirt" (both are outer layers)
  - ❌ INVALID: "Sweater + Cardigan" (both are outer layers)  
  - ❌ INVALID: "Blazer + Jacket" (both are outer layers)

🚨 CRITICAL: NO MULTIPLE BOTTOMS 🚨
• NEVER include multiple bottom items in one outfit:
  - ❌ INVALID: "T-shirt + Black Joggers + Grey Joggers + Sneakers" (two pairs of pants)
  - ❌ INVALID: "T-shirt + Jeans + Shorts + Boots" (two bottom pieces)
  - ❌ INVALID: "Blouse + Skirt + Trousers + Heels" (two bottom pieces)
• Rule: Only ONE bottom per outfit - you can't wear multiple pants/shorts/skirts simultaneously
• Choose the BEST bottom option, don't combine bottoms

• Outer layer items: hoodies, sweatshirts, sweaters, cardigans, blazers, jackets, coats
• Base layer items: t-shirts, tank tops, blouses, shirts, camisoles
• Rule: Multiple tops are GOOD when they're proper layering (base + outer), BAD when they're competing outer layers

These rules apply to EVERY outfit combination, regardless of which item is the base item.

INSTRUCTIONS:
- Create up to 10 COMPLETE outfit combinations that include the base item
- Stop creating outfits when you've exhausted genuinely different, high-quality styling approaches
- Each outfit should offer a DISTINCT STYLING APPROACH - different footwear, different tops, different layering, etc.
- AVOID redundant combinations: Don't create both "Skirt + Blouse + Sneakers" and "Skirt + Blouse + Sneakers + Bag" - just show the complete version with accessories included
- If you add accessories to an outfit, include them as part of a complete look, don't create separate versions with/without accessories
- A COMPLETE outfit must include: base item + appropriate clothing + ${isHomeScenario ? 'footwear (optional for home scenarios)' : 'footwear (REQUIRED)'}
- ACCESSORIES (bags, jewelry, belts) should be included when they enhance the outfit, but don't create separate outfit variations just to add/remove accessories
- 🚨 OUTERWEAR RULE: If the base item is OUTERWEAR (jacket, blazer, cardigan), ensure it follows the closure rules above. Button/zip blazers can be worn standalone OR layered for variety. Heavy jackets and coats typically need base layers underneath.
- Pay attention to layer thickness and type when combining items - avoid layering outer garments together (don't put hoodies or sweatshirts with sweaters and cardigans, etc.) as both are designed to be worn as the outer layer, creating a bulky, impractical look
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
    const itemNames = itemsLine.split('+').map(name => name.trim()).filter(name => name && name.length > 0);
    const outfitItems = [];
    
    // Add base item first
    outfitItems.push({
      ...baseItemData,
      compatibilityTypes: ['base-item']
    });
    
    // Find matching items from available items
    itemNames.forEach(itemName => {
      if (!itemName || typeof itemName !== 'string') return; // Skip invalid item names
      if (baseItemData.name && itemName.toLowerCase() === baseItemData.name.toLowerCase()) return; // Skip base item
      
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
  
  if (baseCategory === 'footwear') {
    // Footwear needs BOTH tops AND bottoms to make a complete outfit
    // Note: Multiple tops are allowed for proper layering (e.g., t-shirt + blazer)
    const topItems = outfitItems.filter(item => 
      ['top', 'tops'].includes(item.category?.toLowerCase())
    );
    const hasBottoms = outfitItems.some(item => 
      ['bottom', 'bottoms'].includes(item.category?.toLowerCase())
    );
    
    if (topItems.length === 0) {
      return {
        isValid: false,
        reason: 'Footwear-based outfit missing tops (cannot wear just shoes and bottoms)'
      };
    }
    if (!hasBottoms) {
      return {
        isValid: false,
        reason: 'Footwear-based outfit missing bottoms (cannot wear just shoes and tops)'
      };
    }
  }
  
  if (baseCategory === 'outerwear') {
    // Smart outerwear validation based on item type and styling approach
    const hasBottoms = outfitItems.some(item => 
      ['bottom', 'bottoms'].includes(item.category?.toLowerCase())
    );
    
    // Bottoms are always required for outerwear-based outfits
    if (!hasBottoms) {
      return {
        isValid: false,
        reason: 'Outerwear-based outfit missing bottoms (need complete outfit underneath)'
      };
    }
    
    // For tops: Blazers and cardigans can be worn standalone if they have button/zip closures
    // Heavy jackets and coats typically need base layers
    const baseItem = outfitItems.find(item => item.category?.toLowerCase() === 'outerwear');
    const isBlazerId = baseItem?.subcategory?.toLowerCase() === 'blazer';
    const isCardigan = baseItem?.subcategory?.toLowerCase() === 'cardigan';
    const hasButtonOrZip = baseItem?.closure && ['Buttons', 'Zipper'].includes(baseItem.closure);
    
    const hasTops = outfitItems.some(item => 
      ['top', 'tops'].includes(item.category?.toLowerCase())
    );
    
    // Heavy jackets/coats need base layers, but blazers/cardigans with proper closures can go standalone
    const canGoStandalone = (isBlazerId || isCardigan) && hasButtonOrZip;
    
    if (!hasTops && !canGoStandalone) {
      return {
        isValid: false,
        reason: `${baseItem?.subcategory || 'Outerwear'} requires base layer underneath (missing top)`
      };
    }
  }
  
  // SAFETY NET: Check for multiple bottoms violation  
  const bottomItems = outfitItems.filter(item => {
    const category = item.category?.toLowerCase();
    return category === 'bottom' || category === 'bottoms';
  });
  
  if (bottomItems.length > 1) {
    const bottomNames = bottomItems.map(item => `${item.name}`).join(' + ');
    return {
      isValid: false,
      reason: `Invalid multiple bottoms: ${bottomNames} - can only wear one bottom per outfit`
    };
  }

  // SAFETY NET: Check for double outer layer violations
  const outerLayerItems = outfitItems.filter(item => {
    const subcategory = item.subcategory?.toLowerCase() || '';
    const isOuterLayer = ['hoodie', 'sweatshirt', 'sweater', 'cardigan', 'blazer', 'jacket', 'coat'].includes(subcategory);
    return isOuterLayer;
  });
  
  if (outerLayerItems.length > 1) {
    const outerLayerNames = outerLayerItems.map(item => `${item.name} (${item.subcategory})`).join(' + ');
    return {
      isValid: false,
      reason: `Invalid double outer layers: ${outerLayerNames} - choose only one outer layer per outfit`
    };
  }

  // SAFETY NET: Final closure rule validation to catch any AI mistakes
  const invalidClosureItems = outfitItems.filter(item => {
    const subcategory = item.subcategory?.toLowerCase();
    const isCardigan = subcategory === 'cardigan';
    const isBlazer = subcategory === 'blazer';
    const isVest = subcategory === 'vest';
    const isHoodie = subcategory === 'hoodie';
    const isOpenFront = ['Open Front', 'Wrap Style'].includes(item.closure);
    const isZipHoodie = isHoodie && item.closure === 'Zipper';
    
    // Check cardigans/blazers/vests with open front OR zip hoodies (both need base layers)
    return ((isCardigan || isBlazer || isVest) && isOpenFront) || isZipHoodie;
  });
  
  if (invalidClosureItems.length > 0) {
    // Check if there's an underneath layer for the open front items
    const hasUnderneathLayer = outfitItems.some(item => 
      ['t-shirt', 'shirt', 'blouse', 'tank top', 'camisole'].includes(item.subcategory?.toLowerCase())
    );
    
    if (!hasUnderneathLayer) {
      const invalidNames = invalidClosureItems.map(item => `${item.name} (${item.closure || item.subcategory})`).join(', ');
      return {
        isValid: false,
        reason: `Items requiring base layer underneath: ${invalidNames}`
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
