/**
 * Analysis Scope Utilities
 * 
 * Determines which characteristics should be analyzed based on item category/subcategory.
 * Uses the same logic as DetailsFields.tsx to ensure consistency between frontend forms
 * and AI analysis capabilities.
 * 
 * This ensures we only analyze relevant characteristics for each item type,
 * avoiding irrelevant suggestions (e.g., analyzing necklines for shoes).
 */

/**
 * Determine analysis scope based on category and subcategory
 * Uses DetailsFields.tsx logic for consistency
 * 
 * @param {string} category - Item category (TOP, BOTTOM, ONE_PIECE, etc.)
 * @param {string} subcategory - Item subcategory (t-shirt, jeans, dress, etc.)
 * @returns {object} Analysis scope with always and conditional characteristics
 */
function getAnalysisScope(category, subcategory) {
  const scope = {
    // Universal characteristics for all items
    always: ['styleLevel', 'formalityLevel', 'colorFamily', 'material', 'pattern'],
    // Category-specific characteristics
    conditional: {}
  };

  // From DetailsFields: shouldShowNeckline logic
  if (subcategory && ['dress', 't-shirt', 'shirt', 'blouse', 'top', 'tank top', 'sweater', 'cardigan', 'blazer', 'jumpsuit', 'romper'].includes(subcategory.toLowerCase())) {
    scope.conditional.neckline = true;
    scope.conditional.layeringPotential = true; // Critical for items with necklines and closure analysis
  }

  // From DetailsFields: shouldShowSleeves logic  
  if ((category === 'ONE_PIECE' && subcategory && !['overall'].includes(subcategory.toLowerCase())) || 
      (category === 'TOP' && subcategory && ['t-shirt', 'shirt', 'blouse', 'sweater', 'cardigan', 'blazer'].includes(subcategory.toLowerCase()))) {
    scope.conditional.sleeves = true;
    scope.conditional.volume = true; // Important for layering compatibility
  }

  // From DetailsFields: shouldShowRise logic
  if (category === 'BOTTOM') {
    scope.conditional.rise = true;
    scope.conditional.length = true;
  }

  // From DetailsFields: shouldShowHeelHeight logic
  if (category === 'FOOTWEAR' && subcategory && ['heels', 'boots', 'sandals', 'flats', 'formal shoes'].includes(subcategory.toLowerCase())) {
    scope.conditional.heelHeight = true;
    scope.conditional.activityLevel = true; // Important for footwear compatibility
  }

  // From DetailsFields: shouldShowBootHeight logic
  if (category === 'FOOTWEAR' && subcategory && subcategory.toLowerCase() === 'boots') {
    scope.conditional.bootHeight = true;
  }

  return scope;
}

/**
 * Check if a characteristic should be analyzed for a given category/subcategory
 * @param {string} characteristic - The characteristic to check
 * @param {string} category - Item category
 * @param {string} subcategory - Item subcategory  
 * @returns {boolean} Whether to analyze this characteristic
 */
function shouldAnalyzeCharacteristic(characteristic, category, subcategory) {
  const scope = getAnalysisScope(category, subcategory);
  return scope.always.includes(characteristic) || scope.conditional[characteristic] === true;
}

/**
 * Get all characteristics that should be analyzed for an item
 * @param {string} category - Item category
 * @param {string} subcategory - Item subcategory
 * @returns {string[]} Array of characteristics to analyze
 */
function getAllRelevantCharacteristics(category, subcategory) {
  const scope = getAnalysisScope(category, subcategory);
  return [
    ...scope.always,
    ...Object.keys(scope.conditional).filter(key => scope.conditional[key] === true)
  ];
}

/**
 * Determine if layering analysis is relevant for this item type
 * @param {string} category - Item category
 * @param {string} subcategory - Item subcategory
 * @returns {boolean} Whether layering analysis is relevant
 */
function isLayeringRelevant(category, subcategory) {
  // Layering is mainly relevant for tops, one-pieces, and outerwear
  return ['TOP', 'ONE_PIECE', 'OUTERWEAR'].includes(category?.toUpperCase());
}

/**
 * Get category-specific analysis notes for AI prompt building
 * @param {string} category - Item category
 * @param {string} subcategory - Item subcategory
 * @returns {string[]} Array of category-specific analysis notes
 */
function getCategoryAnalysisNotes(category, subcategory) {
  const notes = [];
  
  if (category === 'FOOTWEAR') {
    notes.push('Consider heel height and activity appropriateness for footwear');
    if (subcategory?.toLowerCase() === 'boots') {
      notes.push('Analyze boot height for seasonal and style compatibility');
    }
  }
  
  if (category === 'TOP' || category === 'ONE_PIECE') {
    notes.push('Analyze neckline and sleeve compatibility for layering potential');
    notes.push('Consider volume and fit for combination possibilities');
  }
  
  if (category === 'BOTTOM') {
    notes.push('Analyze rise and length for proportional compatibility');
  }
  
  if (category === 'OUTERWEAR') {
    notes.push('Focus on layering potential and seasonal appropriateness');
  }
  
  return notes;
}

module.exports = {
  getAnalysisScope,
  shouldAnalyzeCharacteristic,
  getAllRelevantCharacteristics,
  isLayeringRelevant,
  getCategoryAnalysisNotes
};
