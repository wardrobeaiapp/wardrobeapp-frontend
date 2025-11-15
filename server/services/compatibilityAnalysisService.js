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
const { getCompatibleItems } = require('./algorithmicCompatibilityService');
const { isItemSuitableForLayering, buildLayeringCompatibilityPrompt, parseLayeringCompatibilityResponse, getLayeringItemsFromContext } = require('../utils/ai/layeringCompatibilityPrompt');
const { isItemSuitableForOuterwear, buildOuterwearCompatibilityPrompt, parseOuterwearCompatibilityResponse, getOuterwearItemsFromContext } = require('../utils/ai/outerwearCompatibilityPrompt');

// Import separated services
const { checkEssentialCategories } = require('./essentialCategoriesService');
const { createSeasonScenarioCombinations } = require('./seasonScenarioService');

/**
 * Analyzes all types of compatibility for a new item against existing wardrobe items
 * 
 * @param {Object} formData - New item form data
 * @param {Object} preFilledData - Pre-filled data (for wishlist items)
 * @param {Object} extractedCharacteristics - AI-extracted item characteristics
 * @param {Array} stylingContext - Array of existing wardrobe items for compatibility checking
 * @param {Object} anthropic - Anthropic client instance
 * @param {Array} suitableScenarios - Scenarios the item is suitable for
 * @param {Array} scenarios - Array of scenario objects with id and name for UUID mapping
 * @returns {Object} - Compatibility results for all three types
 */
async function analyzeAllCompatibilities(formData, preFilledData, extractedCharacteristics, stylingContext, anthropic, suitableScenarios = null, scenarios = []) {
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
  
  // Debug: Show actual item names in styling context
  console.log('🔍 [DEBUG] Sample styling context item names:');
  stylingContext.slice(0, 5).forEach((item, index) => {
    console.log(`   ${index + 1}. "${item.name}" (ID: ${item.id}, Category: ${item.category})`);
  });

  // Extract item data once for all compatibility checks
  const itemDataForCompatibility = extractItemDataForCompatibility(formData, preFilledData, extractedCharacteristics, suitableScenarios);

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
        max_tokens: 2048, // Increased from 1024 to allow for complete response
        messages: [{
          role: "user",
          content: compatibilityPrompt
        }]
      });
      
      const rawCompatibilityResponse = compatibilityResponse.content[0].text;
      console.log('🎯 Claude compatibility response received');
      console.log('🎯 [DEBUG] Response length:', rawCompatibilityResponse?.length || 0, 'characters');
      
      // Parse compatibility response with full item objects
      const result = parseCompatibilityResponse(rawCompatibilityResponse, stylingContext);
      
      // Log summary instead of full JSON dump to avoid flooding logs
      const categoryCount = Object.keys(result).length;
      const totalItems = Object.values(result).reduce((sum, items) => sum + (Array.isArray(items) ? items.length : 0), 0);
      console.log(`✅ Found ${totalItems} compatible items across ${categoryCount} categories`);
      
      // Optional: detailed summary by category
      Object.entries(result).forEach(([category, items]) => {
        if (Array.isArray(items) && items.length > 0) {
          const itemNames = items.map(item => item.name).join(', ');
          console.log(`   ${category}: ${items.length} items (${itemNames})`);
        }
      });
      
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
    console.log('🔍 LAYERING SUITABILITY CHECK:');
    console.log('  - itemDataForLayering:', itemDataForLayering?.name || 'unknown');
    console.log('  - extractedCharacteristics.layeringPotential:', extractedCharacteristics?.layeringPotential);
    console.log('  - extractedCharacteristics available fields:', extractedCharacteristics ? Object.keys(extractedCharacteristics) : 'null');
    
    const isSuitableForLayering = isItemSuitableForLayering(itemDataForLayering, extractedCharacteristics);
    
    console.log('  - isSuitableForLayering result:', isSuitableForLayering);
    
    if (isSuitableForLayering) {
      // Get layering items from styling context
      const layeringItems = getLayeringItemsFromContext(stylingContext, formData?.category);
      
      if (layeringItems.length > 0) {
        // Build layering compatibility prompt
        const layeringPrompt = buildLayeringCompatibilityPrompt(itemDataForLayering, layeringItems);
        
        // Make Claude layering compatibility check call
        console.log('🤖 Calling Claude for layering compatibility evaluation...');
        const response = await anthropic.messages.create({
          model: "claude-3-haiku-20240307",
          max_tokens: 512,
          messages: [{
            role: "user",
            content: layeringPrompt
          }]
        });
        
        const rawResponse = response.content[0].text;
        console.log('🤖 Claude compatibility analysis response:', rawResponse);
        
        // Parse the response to extract compatible items with full objects
        const compatibleItems = parseLayeringCompatibilityResponse(rawResponse, stylingContext);
        // Log summary of layering items instead of full JSON
        const layeringCategoryCount = Object.keys(compatibleItems).length;
        const layeringTotalItems = Object.values(compatibleItems).reduce((sum, items) => sum + (Array.isArray(items) ? items.length : 0), 0);
        console.log(`✅ Found ${layeringTotalItems} compatible layering items across ${layeringCategoryCount} categories`);
        
        // Log which items were found for debugging
        Object.entries(compatibleItems).forEach(([category, items]) => {
          if (Array.isArray(items) && items.length > 0) {
            const itemNames = items.map(item => item.name).join(', ');
            console.log(`   ${category}: ${items.length} items (${itemNames})`);
          }
        });
        
        return compatibleItems; // Return the actual compatible items structure
      } else {
        console.log('⚠️ No layering items available in styling context');
        return {};
      }
    } else {
      console.log('🚫 Item NOT suitable for layering - skipping layering compatibility analysis');
      console.log('  - Reason: layeringPotential =', extractedCharacteristics?.layeringPotential || 'undefined');
      return {};
    }
  } catch (error) {
    console.error('❌ Error in layering compatibility checking:', error);
    // Continue without layering compatibility data rather than failing the whole request
    return {};
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
    console.log(`🧥 [outerwear] Is item suitable for outerwear compatibility: ${isSuitableForOuterwear}`);
    
    if (isSuitableForOuterwear) {
      // Debug: Log styling context outerwear items
      const allOuterwearInContext = stylingContext.filter(item => item.category?.toLowerCase() === 'outerwear');
      console.log(`🧥 [outerwear] Total outerwear items in styling context: ${allOuterwearInContext.length}`);
      allOuterwearInContext.forEach((item, i) => 
        console.log(`  ${i+1}. ${item.name} (category: ${item.category}, wishlist: ${item.wishlist})`)
      );
      
      // Get outerwear items from styling context
      const outerwearItems = getOuterwearItemsFromContext(stylingContext, formData?.category);
      console.log(`🧥 [outerwear] Filtered outerwear items for compatibility: ${outerwearItems.length}`);
      
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
        
        // Parse outerwear compatibility response with full item objects
        const result = parseOuterwearCompatibilityResponse(rawOuterwearResponse, stylingContext);
        
        // Log summary of outerwear items instead of full JSON
        const outerwearCategoryCount = Object.keys(result).length;
        const outerwearTotalItems = Object.values(result).reduce((sum, items) => sum + (Array.isArray(items) ? items.length : 0), 0);
        console.log(`✅ Found ${outerwearTotalItems} compatible outerwear items across ${outerwearCategoryCount} categories`);
        return result;
      } else {
        console.log('🚫 [outerwear] No outerwear items found to evaluate - returning null');
        console.log('🚫 [outerwear] This will cause compatibleOuterwearItems to be null and consolidation to show {}');
        return null;
      }
    } else {
      console.log('🚫 [outerwear] Item is not suitable for outerwear compatibility - skipping outerwear compatibility check');
      return null;
    }
  } catch (error) {
    console.error('❌ Error in outerwear compatibility checking:', error);
  }
}

module.exports = { 
  analyzeAllCompatibilities,
  createSeasonScenarioCombinations
};
