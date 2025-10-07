/**
 * Compatibility Analysis Service
 * 
 * Unified service for analyzing compatibility between a new item and existing wardrobe items.
 * Handles three types of compatibility checks:
 * 1. Complementing items (tops with bottoms, shoes with outfits, etc.)
 * 2. Layering items (cardigans, blazers, etc.)
 * 3. Outerwear items (coats, jackets, etc.)
 * 
 * Extracts the common pattern of:
 * - Suitability checking
 * - Context filtering
 * - Prompt building
 * - Claude API calls
 * - Response parsing
 * - Error handling
 */

// Import compatibility utilities
const { buildCompatibilityCheckingPrompt, extractItemDataForCompatibility, parseCompatibilityResponse } = require('../utils/ai/complementingCompatibilityPrompt');
const { isItemSuitableForLayering, buildLayeringCompatibilityPrompt, parseLayeringCompatibilityResponse, getLayeringItemsFromContext } = require('../utils/ai/layeringCompatibilityPrompt');
const { isItemSuitableForOuterwear, buildOuterwearCompatibilityPrompt, parseOuterwearCompatibilityResponse, getOuterwearItemsFromContext } = require('../utils/ai/outerwearCompatibilityPrompt');

/**
 * Analyzes all types of compatibility for a new item against existing wardrobe items
 * 
 * @param {Object} formData - New item form data
 * @param {Object} preFilledData - Pre-filled data (for wishlist items)
 * @param {Object} extractedCharacteristics - AI-extracted item characteristics
 * @param {Array} stylingContext - Array of existing wardrobe items for compatibility checking
 * @param {Object} anthropic - Anthropic client instance
 * @returns {Object} - Compatibility results for all three types
 */
async function analyzeAllCompatibilities(formData, preFilledData, extractedCharacteristics, stylingContext, anthropic) {
  const results = {
    compatibleComplementingItems: null,
    compatibleLayeringItems: null,
    compatibleOuterwearItems: null
  };

  // Early return if no styling context
  if (!stylingContext || stylingContext.length === 0) {
    console.log('ℹ️ No styling context provided for compatibility checking');
    return results;
  }
  
  console.log('🔍 [compatibilityAnalysisService] Starting compatibility analysis...');
  console.log('🔍 [compatibilityAnalysisService] Styling context items:', stylingContext.length);

  // Extract item data once for all compatibility checks
  const itemDataForCompatibility = extractItemDataForCompatibility(formData, preFilledData, extractedCharacteristics);

  // Run all compatibility checks
  results.compatibleComplementingItems = await analyzeComplementingCompatibility(
    itemDataForCompatibility, stylingContext, formData, anthropic
  );

  results.compatibleLayeringItems = await analyzeLayeringCompatibility(
    itemDataForCompatibility, extractedCharacteristics, stylingContext, formData, anthropic
  );

  results.compatibleOuterwearItems = await analyzeOuterwearCompatibility(
    itemDataForCompatibility, extractedCharacteristics, stylingContext, formData, anthropic
  );
  
  console.log('✅ [compatibilityAnalysisService] Compatibility analysis complete:', {
    complementingCount: results.compatibleComplementingItems ? Object.keys(results.compatibleComplementingItems).length : 0,
    layeringCount: results.compatibleLayeringItems ? Object.keys(results.compatibleLayeringItems).length : 0,
    outerwearCount: results.compatibleOuterwearItems ? Object.keys(results.compatibleOuterwearItems).length : 0
  });

  return results;
}

/**
 * Analyzes complementing items compatibility
 */
async function analyzeComplementingCompatibility(itemDataForCompatibility, stylingContext, formData, anthropic) {
  console.log('\n=== STEP: Complementing Items Compatibility Check ===');
  
  try {
    // Filter to get only complementing items (not layering/outerwear)
    const complementingItems = stylingContext.filter(item => {
      const newCategory = formData?.category?.toLowerCase();
      const existingCategory = item.category?.toLowerCase();
      
      // Basic complementing category check
      const complementingMap = {
        'top': ['bottom', 'footwear', 'accessory'],
        'bottom': ['top', 'footwear', 'accessory', 'outerwear'],
        'one_piece': ['footwear', 'accessory'],
        'footwear': ['top', 'bottom', 'one_piece', 'accessory', 'outerwear'],
        'outerwear': ['bottom', 'footwear', 'accessory'],
        'accessory': ['top', 'bottom', 'one_piece', 'footwear', 'outerwear']
      };
      
      const validComplements = complementingMap[newCategory] || [];
      return validComplements.includes(existingCategory);
    });
    
    console.log(`🔍 Found ${complementingItems.length} complementing items to evaluate`);
    
    if (complementingItems.length > 0) {
      // Build compatibility checking prompt
      const compatibilityPrompt = buildCompatibilityCheckingPrompt(itemDataForCompatibility, complementingItems);
      
      // Make Claude compatibility check call
      console.log('🤖 Calling Claude for compatibility evaluation...');
      const compatibilityResponse = await anthropic.messages.create({
        model: "claude-3-haiku-20240307",
        max_tokens: 1024,
        messages: [{
          role: "user",
          content: compatibilityPrompt
        }]
      });
      
      const rawCompatibilityResponse = compatibilityResponse.content[0].text;
      console.log('🎯 Claude compatibility response received');
      
      // Parse compatibility response
      const result = parseCompatibilityResponse(rawCompatibilityResponse);
      
      console.log('✅ Compatible complementing items by category:', JSON.stringify(result, null, 2));
      return result;
    } else {
      console.log('ℹ️ No complementing items found to evaluate');
      return null;
    }
  } catch (error) {
    console.error('❌ Error in compatibility checking:', error);
    // Continue without compatibility data rather than failing the whole request
    return null;
  }
}

/**
 * Analyzes layering items compatibility
 */
async function analyzeLayeringCompatibility(itemDataForLayering, extractedCharacteristics, stylingContext, formData, anthropic) {
  console.log('\n=== STEP: Layering Items Compatibility Check ===');
  
  try {
    // First check if the item is suitable for layering
    const isSuitableForLayering = isItemSuitableForLayering(itemDataForLayering, extractedCharacteristics);
    
    if (isSuitableForLayering) {
      // Get layering items from styling context
      const layeringItems = getLayeringItemsFromContext(stylingContext, formData?.category);
      
      if (layeringItems.length > 0) {
        // Build layering compatibility prompt
        const layeringPrompt = buildLayeringCompatibilityPrompt(itemDataForLayering, layeringItems);
        
        // Make Claude layering compatibility check call
        console.log('🤖 Calling Claude for layering compatibility evaluation...');
        const layeringResponse = await anthropic.messages.create({
          model: "claude-3-haiku-20240307",
          max_tokens: 1024,
          messages: [{
            role: "user",
            content: layeringPrompt
          }]
        });
        
        const rawLayeringResponse = layeringResponse.content[0].text;
        console.log('🎯 Claude layering compatibility response received');
        
        // Parse layering compatibility response
        const result = parseLayeringCompatibilityResponse(rawLayeringResponse);
        
        console.log('✅ Compatible layering items by category:', JSON.stringify(result, null, 2));
        return result;
      } else {
        console.log('ℹ️ No layering items found to evaluate');
        return null;
      }
    } else {
      console.log('ℹ️ Item is not suitable for layering - skipping layering compatibility check');
      return null;
    }
  } catch (error) {
    console.error('❌ Error in layering compatibility checking:', error);
    // Continue without layering compatibility data rather than failing the whole request
    return null;
  }
}

/**
 * Analyzes outerwear items compatibility
 */
async function analyzeOuterwearCompatibility(itemDataForOuterwear, extractedCharacteristics, stylingContext, formData, anthropic) {
  console.log('\n=== STEP: Outerwear Items Compatibility Check ===');
  
  try {
    // First check if the item is suitable for outerwear compatibility
    const isSuitableForOuterwear = isItemSuitableForOuterwear(itemDataForOuterwear, extractedCharacteristics);
    
    if (isSuitableForOuterwear) {
      // Get outerwear items from styling context
      const outerwearItems = getOuterwearItemsFromContext(stylingContext, formData?.category);
      
      if (outerwearItems.length > 0) {
        // Build outerwear compatibility prompt
        const outerwearPrompt = buildOuterwearCompatibilityPrompt(itemDataForOuterwear, outerwearItems);
        
        // Make Claude outerwear compatibility check call
        console.log('🤖 Calling Claude for outerwear compatibility evaluation...');
        const outerwearResponse = await anthropic.messages.create({
          model: "claude-3-haiku-20240307",
          max_tokens: 1024,
          messages: [{
            role: "user",
            content: outerwearPrompt
          }]
        });
        
        const rawOuterwearResponse = outerwearResponse.content[0].text;
        console.log('🎯 Claude outerwear compatibility response received');
        
        // Parse outerwear compatibility response
        const result = parseOuterwearCompatibilityResponse(rawOuterwearResponse);
        
        console.log('✅ Compatible outerwear items by category:', JSON.stringify(result, null, 2));
        return result;
      } else {
        console.log('ℹ️ No outerwear items found to evaluate');
        return null;
      }
    } else {
      console.log('ℹ️ Item is not suitable for outerwear compatibility - skipping outerwear compatibility check');
      return null;
    }
  } catch (error) {
    console.error('❌ Error in outerwear compatibility checking:', error);
    // Continue without outerwear compatibility data rather than failing the whole request
    return null;
  }
}

module.exports = {
  analyzeAllCompatibilities
};
