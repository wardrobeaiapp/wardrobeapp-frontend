/**
 * Base Item Enhancement Utility
 * 
 * Enhances uploaded item data with image URLs and color-based names for outfit thumbnails.
 * This fixes the "No Image" issue where uploaded images weren't showing in outfit thumbnails.
 */

const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');

/**
 * Process and save a base64 image to Supabase Storage (same system as wardrobe items)
 * @param {string} imageDataUrl - Base64 data URL
 * @param {Object} req - Express request object
 * @returns {Promise<string|null>} - Public URL or null if failed
 */
async function processAndSaveImageToSupabase(imageDataUrl, req) {
  try {
    // Extract user ID from request
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User ID required for Supabase Storage upload');
    }

    // Create Supabase client with service role for storage operations (same pattern as wardrobe items)
    const supabaseUrl = process.env.SUPABASE_URL || 'https://gujpqecwdftbwkcnwiup.supabase.co';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseServiceKey) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for storage operations');
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Convert base64 to buffer
    const base64Data = imageDataUrl.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Extract file extension from media type
    const mediaType = imageDataUrl.match(/data:([^;]+);base64/)?.[1] || 'image/jpeg';
    const fileExt = mediaType.split('/')[1] || 'jpg';
    
    // Generate unique file path (same structure as wardrobe items)
    const uniqueId = uuidv4();
    const filePath = `${userId}/ai-history/${uniqueId}.${fileExt}`;
    
    console.log('📤 Uploading AI history image to Supabase Storage:', {
      bucket: 'wardrobe-images',
      path: filePath,
      size: buffer.length,
      type: mediaType,
      userId
    });

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('wardrobe-images')
      .upload(filePath, buffer, {
        cacheControl: '3600',
        upsert: false,
        contentType: mediaType
      });

    if (error) {
      console.error('Supabase upload error:', error);
      throw error;
    }

    if (!data) {
      throw new Error('No data returned from Supabase upload');
    }

    // Generate public URL (same as wardrobe items)
    const { data: publicUrlData } = supabase.storage
      .from('wardrobe-images')
      .getPublicUrl(filePath);

    if (!publicUrlData?.publicUrl) {
      throw new Error('Failed to generate public URL');
    }

    console.log('✅ AI history image uploaded to Supabase Storage:', publicUrlData.publicUrl);
    return publicUrlData.publicUrl;

  } catch (error) {
    console.error('Error uploading to Supabase Storage:', error);
    return null;
  }
}

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
  let itemDataForOutfits = { ...formData };
  if (preFilledData) {
    itemDataForOutfits = { ...itemDataForOutfits, ...preFilledData };
  }
  
  // For new items (no ID), save image to Supabase Storage like wardrobe items
  // For existing wardrobe items, use their existing imageUrl
  if (!preFilledData?.id && imageBase64) {
    try {
      const imageDataUrl = `data:${mediaType};base64,${base64Data}`;
      const savedImageUrl = await processAndSaveImageToSupabase(imageDataUrl, req);
      if (savedImageUrl) {
        itemDataForOutfits.imageUrl = savedImageUrl;
      } else {
        itemDataForOutfits.imageUrl = imageDataUrl; // Fallback
      }
    } catch (uploadError) {
      console.error('❌ Failed to save AI history image to Supabase, falling back to data URL:', uploadError);
      itemDataForOutfits.imageUrl = imageDataUrl; // Fallback
    }
    
    // Extract primary color directly from raw analysis text
    const primaryColor = extractPrimaryColor(rawAnalysisResponse);
    const finalColor = primaryColor || itemDataForOutfits.color;
    
    // Generate name with proper case formatting
    itemDataForOutfits.name = generateItemName(finalColor, itemDataForOutfits.subcategory, itemDataForOutfits.category);
    
    console.log('🖼️ Enhanced uploaded item:', itemDataForOutfits.name);
  }
  
  console.log('🔍 [baseItemEnhancer] Final itemDataForOutfits:', {
    imageUrl: itemDataForOutfits.imageUrl,
    imageUrlType: itemDataForOutfits.imageUrl?.startsWith('data:') ? 'base64' : 
                itemDataForOutfits.imageUrl?.includes('supabase') ? 'supabase' : 'other',
    imageUrlLength: itemDataForOutfits.imageUrl?.length
  });
  
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
