/**
 * Layer Compatibility Utilities
 * 
 * Contains logic for determining layering compatibility and base layer suitability.
 * Handles complex closure detection and layering-only item identification.
 */

// Constants for base layer classification
const GOOD_BASE_LAYERS = ['t-shirt', 'tank', 'camisole', 'blouse', 'shirt'];
const BAD_BASE_LAYERS = ['sweater', 'hoodie', 'pullover', 'knit', 'sweatshirt'];
const LAYERING_TYPES = ['cardigan', 'kimono', 'wrap', 'shawl', 'vest'];

// Closure detection patterns
const NEGATIVE_CLOSURE_PHRASES = [
  'no button', 
  'no zip', 
  'no closure', 
  'open front', 
  'no snap', 
  'open cardigan'
];

const POSITIVE_CLOSURE_PHRASES = [
  'button-front', 
  'zip-up', 
  'snap-front', 
  'tie-front', 
  'belt', 
  'wrap-front'
];

/**
 * Determines if a base item is suitable for layering under a specific layering item
 * @param {Object} baseItem - The potential base layer item
 * @param {Object} layeringItem - The layering item to go over the base
 * @returns {boolean} true if the base item is suitable for layering
 */
function isSuitableBaseLayer(baseItem, layeringItem) {
  if (!baseItem || !layeringItem) return false;
  
  const baseSubcategory = (baseItem.subcategory || '').toLowerCase();
  const baseName = (baseItem.name || '').toLowerCase();
  const layeringSubcategory = (layeringItem.subcategory || '').toLowerCase();
  
  // Good base layers (thin, designed to be worn under other items)
  const isGoodBaseLayer = GOOD_BASE_LAYERS.some(type => 
    baseSubcategory.includes(type) || baseName.includes(type)
  );
  
  // Bad base layers (thick, meant to be outerwear themselves)  
  const isBadBaseLayer = BAD_BASE_LAYERS.some(type => 
    baseSubcategory.includes(type) || baseName.includes(type)
  );
  
  // For cardigans: avoid thick items as base layers
  if (layeringSubcategory.includes('cardigan')) {
    if (isBadBaseLayer) {
      console.log(`   ❌ "${baseItem.name}" (${baseSubcategory}) not suitable as base layer under "${layeringItem.name}" - too thick`);
      return false;
    }
    if (isGoodBaseLayer) {
      return true;
    }
    // Default: allow if not explicitly bad
    return !isBadBaseLayer;
  }
  
  // For other layering items, be more permissive for now
  return !isBadBaseLayer;
}

/**
 * Check for negative closure phrases in item details
 * @param {string} details - Item details string
 * @returns {boolean} true if item has negative closure phrases
 */
function hasNegativeClosurePhrases(details) {
  return NEGATIVE_CLOSURE_PHRASES.some(phrase => details.includes(phrase));
}

/**
 * Check for positive closure indicators in item details  
 * @param {string} details - Item details string
 * @returns {boolean} true if item has positive closure indicators
 */
function hasPositiveClosureIndicators(details) {
  const hasExplicitPositive = POSITIVE_CLOSURE_PHRASES.some(phrase => details.includes(phrase));
  
  // Also check for general terms without negative context
  const hasGeneralButton = details.includes('button') && !details.includes('no button');
  const hasGeneralZip = details.includes('zip') && !details.includes('no zip');
  
  return hasExplicitPositive || hasGeneralButton || hasGeneralZip;
}

/**
 * Check if an item is a layering type (cardigan, kimono, etc.)
 * @param {Object} item - The wardrobe item
 * @returns {boolean} true if item is a layering type
 */
function isLayeringType(item) {
  if (!item) return false;
  
  const subcategory = (item.subcategory || '').toLowerCase();
  const name = (item.name || '').toLowerCase();
  
  return LAYERING_TYPES.some(type => 
    subcategory.includes(type) || name.includes(type)
  );
}

/**
 * Check if an item is layering-only (cannot be worn as standalone top)
 * Examples: cardigans without buttons, open blazers, kimonos
 * @param {Object} item - The wardrobe item
 * @returns {boolean} true if item should only be used for layering
 */
function isLayeringOnly(item) {
  if (!item) return false;
  
  const details = (item.details || '').toLowerCase();
  
  // Must be a layering type first
  if (!isLayeringType(item)) return false;
  
  // Check for negative phrases first (no closures)
  const hasNoClosure = hasNegativeClosurePhrases(details);
  
  // Then check for positive closure indicators
  const hasPositiveClosure = hasPositiveClosureIndicators(details);
  
  const hasClosures = !hasNoClosure && hasPositiveClosure;
  
  // If it's a layering type without closures, it's layering-only
  const result = !hasClosures;
  
  if (result) {
    console.log(`   🧥 "${item.name}" is layering-only (no closures)`);
  }
  
  return result;
}

module.exports = {
  isSuitableBaseLayer,
  isLayeringOnly,
  isLayeringType,
  hasNegativeClosurePhrases,
  hasPositiveClosureIndicators,
  // Export constants for testing/debugging
  GOOD_BASE_LAYERS,
  BAD_BASE_LAYERS,
  LAYERING_TYPES,
  NEGATIVE_CLOSURE_PHRASES,
  POSITIVE_CLOSURE_PHRASES
};
