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
 * @param {Array} suitableScenarios - Scenarios the item is suitable for
 * @returns {Object} - Compatibility results for all three types
 */
async function analyzeAllCompatibilities(formData, preFilledData, extractedCharacteristics, stylingContext, anthropic, suitableScenarios = null) {
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
        max_tokens: 1024,
        messages: [{
          role: "user",
          content: compatibilityPrompt
        }]
      });
      
      const rawCompatibilityResponse = compatibilityResponse.content[0].text;
      console.log('🎯 Claude compatibility response received');
      
      // Parse compatibility response with full item objects
      const result = parseCompatibilityResponse(rawCompatibilityResponse, stylingContext);
      
      console.log('✅ Compatible complementing items by category:', JSON.stringify(result, null, 2));
      
      // Create season + scenario combinations after compatibility analysis
      createSeasonScenarioCombinations(itemDataForCompatibility, result);
      
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
        console.log('✅ Parsed compatible layering items:', JSON.stringify(compatibleItems, null, 2));
        
        return compatibleItems;
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
        
        console.log('✅ Compatible outerwear items by category:', JSON.stringify(result, null, 2));
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

/**
 * Check if we have all essential categories for a complete outfit
 */
function checkEssentialCategories(itemData, allCompatibleItems, season) {
  // Define essential categories based on the item being analyzed
  const ESSENTIAL_CATEGORIES = {
    'dress': ['footwear'], // Dress just needs shoes
    'one_piece': ['footwear'], // One-piece (dress/jumpsuit) just needs shoes
    'top': ['bottoms', 'footwear'], // Top needs bottoms + shoes  
    'bottom': ['tops', 'footwear'], // Bottoms need tops + shoes
    'footwear': ['tops', 'bottoms'], // Shoes need top + bottom
    'outerwear': [], // Outerwear is layering - doesn't drive requirements
    'accessory': [] // Accessories don't drive requirements
  };
  
  const itemCategory = itemData.category?.toLowerCase();
  const requiredCategories = ESSENTIAL_CATEGORIES[itemCategory] || [];
  
  // Warn about unmapped categories
  if (!ESSENTIAL_CATEGORIES.hasOwnProperty(itemCategory)) {
    console.log(`⚠️  [checkEssentials] Unknown item category: ${itemCategory} - treating as no requirements`);
  }
  
  console.log(`🔍 [checkEssentials] Item category: ${itemCategory}, Required: [${requiredCategories.join(', ')}], Season: ${season}`);
  console.log(`🔍 [checkEssentials] All compatible items: ${allCompatibleItems.length} items`);
  
  // Get items that match this season
  const seasonItems = allCompatibleItems.filter(item => {
    const itemSeasons = item.seasons || item.season || [];
    let matches = false;
    
    if (typeof itemSeasons === 'string') {
      matches = itemSeasons.includes(season) || season.includes(itemSeasons);
    } else if (Array.isArray(itemSeasons)) {
      matches = itemSeasons.some(itemSeason => 
        itemSeason.includes(season) || season.includes(itemSeason)
      );
    }
    
    if (matches) {
      console.log(`    ✅ ${item.name} (${item.category}) - seasons: ${JSON.stringify(itemSeasons)}`);
    }
    
    return matches;
  });
  
  console.log(`🔍 [checkEssentials] Items matching season '${season}': ${seasonItems.length} items`);
  
  // Check which required categories we have items for
  const availableCategories = [];
  const missingCategories = [];
  
  requiredCategories.forEach(requiredCategory => {
    const itemsInCategory = seasonItems.filter(item => 
      item.category?.toLowerCase() === requiredCategory
    );
    
    if (itemsInCategory.length > 0) {
      console.log(`    ✅ Found ${requiredCategory}: ${itemsInCategory.map(i => i.name).join(', ')}`);
      availableCategories.push(requiredCategory);
    } else {
      console.log(`    ❌ Missing ${requiredCategory}`);
      missingCategories.push(requiredCategory);
    }
  });
  
  // Also track available non-essential categories for display
  const allAvailableCategories = [...new Set(seasonItems.map(item => item.category?.toLowerCase()).filter(Boolean))];
  
  console.log(`🔍 [checkEssentials] Result: hasAllEssentials=${missingCategories.length === 0}, missing=[${missingCategories.join(', ')}]`);
  
  return {
    hasAllEssentials: missingCategories.length === 0,
    missingCategories,
    availableCategories: allAvailableCategories,
    requiredCategories
  };
}

/**
 * Generate outfit combinations using compatible items for complete scenarios
 */
function generateOutfitCombinations(itemData, compatibleItems, seasonScenarioCombinations) {
  console.log('\n\n=== 👗 OUTFIT COMBINATIONS GENERATOR ===\n');
  
  // Only process combinations that have all essentials
  const completeScenarios = seasonScenarioCombinations.filter(combo => combo.hasItems);
  const incompleteScenarios = seasonScenarioCombinations.filter(combo => !combo.hasItems);
  
  if (completeScenarios.length === 0) {
    console.log('❌ NO COMPLETE OUTFIT COMBINATIONS AVAILABLE');
    if (incompleteScenarios.length > 0) {
      console.log('\n🚫 INCOMPLETE SCENARIOS:');
      incompleteScenarios.forEach(combo => {
        const missingText = combo.missingCategories.length > 0 ? 
          `don't have ${combo.missingCategories.join(' or ')} to combine with` :
          'missing essential items';
        console.log(`   ${combo.combination.toUpperCase()} - ${missingText}`);
      });
    }
    console.log('\n💡 Add items in missing categories to unlock outfit combinations!\n');
    return [];
  }
  
  // Flatten all compatible items from all categories
  const allCompatibleItems = [];
  if (compatibleItems) {
    Object.entries(compatibleItems).forEach(([category, categoryItems]) => {
      if (Array.isArray(categoryItems)) {
        categoryItems.forEach(item => {
          allCompatibleItems.push({
            ...item,
            sourceCategory: category
          });
        });
      }
    });
  }
  
  console.log(`✅ GENERATING OUTFITS FOR ${completeScenarios.length} COMPLETE SCENARIOS\n`);
  
  const outfitCombinations = [];
  
  completeScenarios.forEach((combo, index) => {
    console.log(`🎯 ${index + 1}) ${combo.combination.toUpperCase()}`);
    
    // Filter items that match this season
    const seasonItems = allCompatibleItems.filter(item => {
      const itemSeasons = item.seasons || item.season || [];
      if (typeof itemSeasons === 'string') {
        return itemSeasons.includes(combo.season) || combo.season.includes(itemSeasons);
      }
      if (Array.isArray(itemSeasons)) {
        return itemSeasons.some(itemSeason => 
          itemSeason.includes(combo.season) || combo.season.includes(itemSeason)
        );
      }
      return false;
    });
    
    if (seasonItems.length === 0) {
      console.log('   ❌ No items available for this season');
      return;
    }
    
    // Group items by category for outfit building
    const itemsByCategory = {};
    seasonItems.forEach(item => {
      const category = item.category?.toLowerCase() || item.sourceCategory;
      if (!itemsByCategory[category]) {
        itemsByCategory[category] = [];
      }
      itemsByCategory[category].push(item);
    });
    
    // Generate outfit recommendations based on the analyzed item type
    const outfits = buildOutfitRecommendations(itemData, itemsByCategory, combo.season, combo.scenario);
    
    if (outfits.length > 0) {
      console.log(`   ✅ ${outfits.length} GOOD OUTFIT COMBINATION${outfits.length > 1 ? 'S' : ''} FOUND:`);
      outfits.forEach((outfit, outfitIndex) => {
        // Create concise format: Item1 + Item2 + Item3
        const itemNames = outfit.items.map(item => item.name);
        const conciseFormat = itemNames.join(' + ');
        console.log(`      ${outfitIndex + 1}. ${conciseFormat}`);
      });
      
      outfitCombinations.push({
        combination: combo.combination,
        season: combo.season,
        scenario: combo.scenario,
        outfits
      });
    }
    
    console.log(''); // Empty line between combinations
  });
  
  // Summary
  const totalOutfits = outfitCombinations.reduce((sum, combo) => sum + combo.outfits.length, 0);
  console.log(`📊 SUMMARY: ${totalOutfits} total outfit combinations across ${completeScenarios.length} complete scenarios`);
  
  // Show incomplete scenarios with specific reasons
  if (incompleteScenarios.length > 0) {
    console.log(`\n🚫 INCOMPLETE SCENARIOS:`);
    incompleteScenarios.forEach(combo => {
      const missingText = combo.missingCategories.length > 0 ? 
        `don't have ${combo.missingCategories.join(' or ')} to combine with` :
        'missing essential items';
      console.log(`   ${combo.combination.toUpperCase()} - ${missingText}`);
    });
  }
  
  console.log(''); // Final spacing
  
  return outfitCombinations;
}

/**
 * Build outfit recommendations based on item type and available compatible items
 */
function buildOutfitRecommendations(itemData, itemsByCategory, season, scenario) {
  const itemCategory = itemData.category?.toLowerCase();
  const outfits = [];
  
  // Define outfit building strategies based on the analyzed item
  switch (itemCategory) {
    case 'dress':
    case 'one_piece':
      // Dress-based outfits: dress + shoes + optional accessories/outerwear
      outfits.push(...buildDressOutfits(itemData, itemsByCategory, season, scenario));
      break;
      
    case 'top':
      // Top-based outfits: top + bottom + shoes + optional accessories/outerwear
      outfits.push(...buildTopOutfits(itemData, itemsByCategory, season, scenario));
      break;
      
    case 'bottom':
      // Bottom-based outfits: bottom + top + shoes + optional accessories/outerwear
      outfits.push(...buildBottomOutfits(itemData, itemsByCategory, season, scenario));
      break;
      
    case 'footwear':
      // Shoe-based outfits: shoes + top + bottom + optional accessories/outerwear
      outfits.push(...buildFootwearOutfits(itemData, itemsByCategory, season, scenario));
      break;
      
    default:
      // For other items, try to build general combinations
      outfits.push(...buildGeneralOutfits(itemData, itemsByCategory, season, scenario));
  }
  
  // Filter to only return good combinations (limit to top 3 per scenario)
  return outfits.slice(0, 3);
}

/**
 * Build dress-based outfit combinations
 */
function buildDressOutfits(itemData, itemsByCategory, season, scenario) {
  const outfits = [];
  const footwear = itemsByCategory.footwear || [];
  
  // Essential: dress + footwear
  footwear.forEach(shoes => {
    const outfit = {
      type: 'dress-based',
      items: [
        { ...itemData, compatibilityTypes: ['base-item'] },
        shoes
      ]
    };
    
    // Add optional outerwear if available and appropriate
    const outerwear = itemsByCategory.outerwear || [];
    if (outerwear.length > 0 && (season.includes('fall') || season.includes('winter') || season.includes('spring'))) {
      const jacket = outerwear[0]; // Take the first compatible outerwear
      outfit.items.push(jacket);
    }
    
    // Add optional accessories
    const accessories = itemsByCategory.accessory || [];
    if (accessories.length > 0) {
      const accessory = accessories[0]; // Take the first compatible accessory
      outfit.items.push(accessory);
    }
    
    outfits.push(outfit);
  });
  
  return outfits;
}

/**
 * Build top-based outfit combinations
 */
function buildTopOutfits(itemData, itemsByCategory, season, scenario) {
  const outfits = [];
  const bottoms = itemsByCategory.bottoms || itemsByCategory.bottom || [];
  const footwear = itemsByCategory.footwear || [];
  
  // Essential: top + bottom + footwear
  bottoms.forEach(bottom => {
    footwear.forEach(shoes => {
      const outfit = {
        type: 'top-based',
        items: [
          { ...itemData, compatibilityTypes: ['base-item'] },
          bottom,
          shoes
        ]
      };
      
      // Add optional outerwear
      const outerwear = itemsByCategory.outerwear || [];
      if (outerwear.length > 0) {
        const jacket = outerwear[0];
        outfit.items.push(jacket);
      }
      
      outfits.push(outfit);
    });
  });
  
  return outfits;
}

/**
 * Build bottom-based outfit combinations
 */
function buildBottomOutfits(itemData, itemsByCategory, season, scenario) {
  const outfits = [];
  const tops = itemsByCategory.tops || itemsByCategory.top || [];
  const footwear = itemsByCategory.footwear || [];
  
  // Essential: bottom + top + footwear
  tops.forEach(top => {
    footwear.forEach(shoes => {
      const outfit = {
        type: 'bottom-based',
        items: [
          { ...itemData, compatibilityTypes: ['base-item'] },
          top,
          shoes
        ]
      };
      
      outfits.push(outfit);
    });
  });
  
  return outfits;
}

/**
 * Build footwear-based outfit combinations
 */
function buildFootwearOutfits(itemData, itemsByCategory, season, scenario) {
  const outfits = [];
  const tops = itemsByCategory.tops || itemsByCategory.top || [];
  const bottoms = itemsByCategory.bottoms || itemsByCategory.bottom || [];
  
  // Essential: footwear + top + bottom
  tops.forEach(top => {
    bottoms.forEach(bottom => {
      const outfit = {
        type: 'footwear-based',
        items: [
          { ...itemData, compatibilityTypes: ['base-item'] },
          top,
          bottom
        ]
      };
      
      outfits.push(outfit);
    });
  });
  
  return outfits;
}

/**
 * Build general outfit combinations for other item types
 */
function buildGeneralOutfits(itemData, itemsByCategory, season, scenario) {
  const outfits = [];
  
  // Try to create a basic combination with available items
  const availableCategories = Object.keys(itemsByCategory);
  if (availableCategories.length > 0) {
    const items = [{ ...itemData, compatibilityTypes: ['base-item'] }];
    
    // Add one item from each available category (max 4 total items)
    availableCategories.slice(0, 3).forEach(category => {
      const categoryItems = itemsByCategory[category];
      if (categoryItems.length > 0) {
        items.push(categoryItems[0]);
      }
    });
    
    outfits.push({
      type: 'general',
      items
    });
  }
  
  return outfits;
}

/**
 * Create and log season + scenario combinations with item availability check
 */
function createSeasonScenarioCombinations(itemData, compatibleItems) {
  const seasonScenarioCombinations = [];
  
  // Get seasons from itemData
  const seasons = itemData.seasons || [];
  
  // Try to get scenarios from multiple sources
  let scenarios = itemData.scenarios || itemData.suitableScenarios || [];
  
  // Handle scenario objects (extract names)
  if (scenarios.length > 0 && typeof scenarios[0] === 'object') {
    scenarios = scenarios.map(s => s.name || s);
  }
  
  if (seasons.length > 0 && scenarios.length > 0) {
    // Flatten compatible items from all categories
    const allCompatibleItems = [];
    if (compatibleItems) {
      Object.values(compatibleItems).forEach(categoryItems => {
        if (Array.isArray(categoryItems)) {
          allCompatibleItems.push(...categoryItems);
        }
      });
    }
    
    console.log(`\n🎯 SEASON + SCENARIO COMBINATIONS (${seasons.length * scenarios.length} total):`);
    
    seasons.forEach(season => {
      scenarios.forEach(scenario => {
        const combination = `${season} + ${scenario}`;
        
        // Check essential categories for complete outfit
        const { hasAllEssentials, missingCategories, availableCategories } = checkEssentialCategories(
          itemData, allCompatibleItems, season
        );
        
        const status = hasAllEssentials ? '✅' : '❌';
        const comboIndex = seasonScenarioCombinations.length + 1;
        
        let statusMessage;
        if (hasAllEssentials) {
          statusMessage = 'COMPLETE';
        } else if (missingCategories.length > 0) {
          statusMessage = `MISSING ${missingCategories.join(', ').toUpperCase()}`;
        } else {
          statusMessage = 'NO ITEMS';
        }
        
        // Add available categories info if there are some items
        if (availableCategories.length > 0 && !hasAllEssentials) {
          statusMessage += ` (has: ${availableCategories.join(', ')})`;
        }
        
        console.log(`  ${comboIndex}) ${combination} ${status} ${statusMessage}`);
        
        seasonScenarioCombinations.push({
          combination,
          season,
          scenario,
          hasItems: hasAllEssentials,
          missingCategories,
          availableCategories
        });
      });
    });
    
    const totalWithItems = seasonScenarioCombinations.filter(combo => combo.hasItems).length;
    console.log(`\n📊 COVERAGE: ${totalWithItems}/${seasonScenarioCombinations.length} combinations have complete outfits`);
    
  } else {
    console.log(`\n🎯 SEASON + SCENARIO COMBINATIONS: Cannot create - missing data`);
    console.log(`  - Seasons: ${seasons.length > 0 ? seasons.join(', ') : 'not available'}`);
    console.log(`  - Scenarios: ${scenarios.length > 0 ? scenarios.join(', ') : 'not available'}`);
  }
  
  return seasonScenarioCombinations;
}

module.exports = { 
  analyzeAllCompatibilities,
  generateOutfitCombinations,
  createSeasonScenarioCombinations
};
