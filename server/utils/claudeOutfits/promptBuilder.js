/**
 * Prompt Builder for Claude Outfit Generation
 * 
 * Builds comprehensive prompts for Claude outfit creation with styling rules,
 * layering guidelines, and fashion best practices.
 */

/**
 * Build comprehensive prompt for Claude outfit creation
 * @param {Object} itemData - The analyzed item (base item)
 * @param {Object} itemsByCategory - Available compatible items organized by category
 * @param {string} season - Season context (e.g., "spring/fall", "summer")
 * @param {string} scenario - Scenario context (e.g., "Social Outings", "Office Work")
 * @returns {string} Formatted prompt for Claude API
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

module.exports = {
  buildOutfitCreationPrompt
};
