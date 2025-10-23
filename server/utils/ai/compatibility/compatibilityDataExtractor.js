/**
 * Compatibility data extraction utilities
 * Handles extracting and combining item data from multiple sources for compatibility analysis
 */

/**
 * Extract item data from form data, pre-filled data, and image analysis for compatibility checking
 * @param {Object} formData - Form data from user
 * @param {Object} preFilledData - Pre-filled data (e.g., from wishlist)
 * @param {Object} imageAnalysisData - Analysis data from image
 * @param {Array} suitableScenarios - Scenarios the item is suitable for
 */
function extractItemDataForCompatibility(formData, preFilledData, imageAnalysisData, suitableScenarios = null) {
  console.log('[compatibility] Extracting item data from available sources...');
  
  const itemData = {};
  
  // Priority: preFilledData > formData > imageAnalysisData
  // This ensures wishlist data takes precedence where available
  
  // Basic item information
  const name = preFilledData?.name || formData?.name || imageAnalysisData?.name;
  if (name) {
    itemData.name = name;
  }
  
  const category = preFilledData?.category || formData?.category || imageAnalysisData?.category;
  if (category) {
    itemData.category = category;
  }
  
  const subcategory = preFilledData?.subcategory || formData?.subcategory || imageAnalysisData?.subcategory;
  if (subcategory) {
    itemData.subcategory = subcategory;
  }
  
  // Visual characteristics - only add if they exist
  if (preFilledData?.color || formData?.color || imageAnalysisData?.color) {
    itemData.color = preFilledData?.color || formData?.color || imageAnalysisData?.color;
  }
  if (preFilledData?.pattern || imageAnalysisData?.pattern) {
    itemData.pattern = preFilledData?.pattern || imageAnalysisData?.pattern;
  }
  if (preFilledData?.material || imageAnalysisData?.material) {
    itemData.material = preFilledData?.material || imageAnalysisData?.material;
  }
  if (preFilledData?.style || imageAnalysisData?.style) {
    itemData.style = preFilledData?.style || imageAnalysisData?.style;
  }
  if (preFilledData?.silhouette || imageAnalysisData?.silhouette) {
    itemData.silhouette = preFilledData?.silhouette || imageAnalysisData?.silhouette;
  }
  if (preFilledData?.details || formData?.details || imageAnalysisData?.details) {
    itemData.details = preFilledData?.details || formData?.details || imageAnalysisData?.details;
  }
  
  // Specific characteristics by category - only add if they exist
  if (itemData.category === 'top') {
    if (preFilledData?.neckline || imageAnalysisData?.neckline) {
      itemData.neckline = preFilledData?.neckline || imageAnalysisData?.neckline;
    }
    if (preFilledData?.sleeves || imageAnalysisData?.sleeves) {
      itemData.sleeves = preFilledData?.sleeves || imageAnalysisData?.sleeves;
    }
    if (preFilledData?.length || imageAnalysisData?.length) {
      itemData.length = preFilledData?.length || imageAnalysisData?.length;
    }
  } else if (itemData.category === 'bottom') {
    if (preFilledData?.rise || imageAnalysisData?.rise) {
      itemData.rise = preFilledData?.rise || imageAnalysisData?.rise;
    }
    if (preFilledData?.length || imageAnalysisData?.length) {
      itemData.length = preFilledData?.length || imageAnalysisData?.length;
    }
  } else if (itemData.category === 'footwear') {
    if (preFilledData?.heelHeight || imageAnalysisData?.heelHeight) {
      itemData.heelHeight = preFilledData?.heelHeight || imageAnalysisData?.heelHeight;
    }
    if (preFilledData?.bootHeight || imageAnalysisData?.bootHeight) {
      itemData.bootHeight = preFilledData?.bootHeight || imageAnalysisData?.bootHeight;
    }
  }
  
  // Seasonal information - use 'seasons' like original (not 'season')
  if (preFilledData?.season || formData?.seasons || imageAnalysisData?.season) {
    itemData.seasons = preFilledData?.season || formData?.seasons || imageAnalysisData?.season;
  }
  
  // Style level from image analysis if available
  if (imageAnalysisData) {
    if (imageAnalysisData.detectedColor) {
      itemData.color = imageAnalysisData.detectedColor;
    }
    if (imageAnalysisData.pattern) {
      itemData.pattern = imageAnalysisData.pattern;
    }
    if (imageAnalysisData.styleLevel) {
      itemData.styleLevel = imageAnalysisData.styleLevel;
    }
    if (imageAnalysisData.formalityLevel) {
      itemData.formalityLevel = imageAnalysisData.formalityLevel;
    }
  }
  
  // Add scenarios if provided
  if (suitableScenarios) {
    console.log('[compatibility] Adding suitable scenarios');
    itemData.scenarios = suitableScenarios;
  }
  
  // Log summary of item data instead of full JSON dump
  console.log(`[compatibility] Final item data: ${itemData.name} (${itemData.category}) - ${itemData.seasons?.length || 0} seasons, ${itemData.scenarios?.length || 0} scenarios`);
  return itemData;
}

module.exports = {
  extractItemDataForCompatibility
};
