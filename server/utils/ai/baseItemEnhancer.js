/**
 * Base Item Enhancement Utility
 * 
 * Enhances uploaded item data with image URLs and color-based names for outfit thumbnails.
 * This fixes the "No Image" issue where uploaded images weren't showing in outfit thumbnails.
 */

const { processBase64Image } = require('../../services/imageService');

/**
 * Enhances base item data for uploaded images by adding image URL and color-based name
 * 
 * @param {Object} formData - Form data from the request
 * @param {Object} preFilledData - Pre-filled data (from short form or wishlist)
 * @param {string} imageBase64 - Base64 image data
 * @param {string} mediaType - Image media type (e.g., 'image/webp')
 * @param {string} base64Data - Processed base64 data
 * @param {string} rawAnalysisResponse - Raw analysis text from Claude
 * @param {Object} req - Express request object for image processing
 * @returns {Promise<Object>} Enhanced item data with imageUrl and name
 */
async function enhanceBaseItemForOutfits(formData, preFilledData, imageBase64, mediaType, base64Data, rawAnalysisResponse, req) {
  // Prepare base item data with image for outfit thumbnails
  let itemDataForOutfits = { ...formData };
  if (preFilledData) {
    itemDataForOutfits = { ...itemDataForOutfits, ...preFilledData };
  }
  
  // For new items (no ID), save image to local storage like wardrobe items
  // For existing wardrobe items, use their existing imageUrl
  if (!preFilledData?.id && imageBase64) {
    try {
      // Use the same image processing as wardrobe items
      const imageDataUrl = `data:${mediaType};base64,${base64Data}`;
      const savedImageUrl = await processBase64Image(imageDataUrl, req);
      
      if (savedImageUrl) {
        itemDataForOutfits.imageUrl = savedImageUrl;
        console.log('🖼️ Saved AI history image to local storage:', savedImageUrl);
      } else {
        // Fallback to data URL if save fails
        itemDataForOutfits.imageUrl = imageDataUrl;
        console.log('⚠️ Failed to save AI history image, using data URL fallback');
      }
    } catch (uploadError) {
      console.error('❌ Failed to save AI history image, falling back to data URL:', uploadError);
      // Fallback to data URL if upload fails
      const imageDataUrl = `data:${mediaType};base64,${base64Data}`;
      itemDataForOutfits.imageUrl = imageDataUrl;
    }
    
    // Always regenerate name for uploaded images to include primary color
    const category = itemDataForOutfits.category || 'Item';
    const subcategory = itemDataForOutfits.subcategory || '';
    
    // Extract primary color directly from raw analysis text
    const primaryColor = extractPrimaryColor(rawAnalysisResponse);
    const finalColor = primaryColor || itemDataForOutfits.color;
    
    // Generate name with proper case formatting
    itemDataForOutfits.name = generateItemName(finalColor, subcategory, category);
    
    console.log('🖼️ Enhanced uploaded item:', itemDataForOutfits.name);
  }
  
  return itemDataForOutfits;
}

/**
 * Checks if the item needs enhancement (uploaded image vs wishlist item)
 * 
 * @param {Object} preFilledData - Pre-filled data
 * @param {string} imageBase64 - Base64 image data
 * @returns {boolean} True if item needs enhancement
 */
function shouldEnhanceBaseItem(preFilledData, imageBase64) {
  return !preFilledData?.imageUrl && !!imageBase64;
}

/**
 * Extracts primary color from Claude's analysis text
 * 
 * @param {string} rawAnalysisResponse - Raw analysis text
 * @returns {string|null} Extracted primary color or null
 */
function extractPrimaryColor(rawAnalysisResponse) {
  const primaryColorMatch = rawAnalysisResponse?.match(/Primary color:\s*([^,\n\r]+)/i);
  return primaryColorMatch ? primaryColorMatch[1].trim() : null;
}

/**
 * Generates item name with color and proper case formatting
 * 
 * @param {string} color - Primary color
 * @param {string} subcategory - Item subcategory
 * @param {string} category - Item category  
 * @returns {string} Generated name (e.g., "White Sneakers")
 */
function generateItemName(color, subcategory, category) {
  const colorPart = color ? 
    color.charAt(0).toUpperCase() + color.slice(1).toLowerCase() + ' ' : '';
  const itemPart = subcategory ? 
    subcategory.charAt(0).toUpperCase() + subcategory.slice(1).toLowerCase() : 
    category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
  
  return (colorPart + itemPart).trim();
}

module.exports = {
  enhanceBaseItemForOutfits,
  shouldEnhanceBaseItem,
  extractPrimaryColor,
  generateItemName
};
