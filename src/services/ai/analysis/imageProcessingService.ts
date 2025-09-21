import { compressImageToMaxSize } from '../../../utils/imageUtils';

/**
 * Validate and process images for AI analysis
 * Handles compression with tiered approach based on image size
 */
export async function processImageForAnalysis(imageBase64: string): Promise<{
  processedImage: string;
  error?: string;
  details?: string;
}> {
  // Validate image data
  if (!imageBase64) {
    console.error('[imageProcessingService] No image data provided');
    return {
      processedImage: '',
      error: 'missing_image',
      details: 'No image data was provided for analysis.'
    };
  }

  // Check if image data is too small (likely invalid)
  console.log('[imageProcessingService] Image data length:', imageBase64.length);
  
  if (imageBase64.length < 50) {
    console.error('[imageProcessingService] Image data too small to be valid');
    return {
      processedImage: '',
      error: 'invalid_image',
      details: 'The provided image data is too small to be valid.'
    };
  }
  
  // Tiered compression approach
  const originalSize = imageBase64.length;
  console.log(`[imageProcessingService] Original image size: ${originalSize} bytes`);
  
  let processedImage = imageBase64;
  
  try {
    // Tier 1: Images over 4MB - very aggressive compression needed
    if (originalSize > 4000000) {
      console.log('[imageProcessingService] Very large image detected (>4MB), applying maximum compression');
      processedImage = await compressImageToMaxSize(processedImage, 800000);
    }
    // Tier 2: Images between 1-4MB - standard compression
    else if (originalSize > 1000000) {
      console.log('[imageProcessingService] Large image detected (>1MB), applying standard compression');
      processedImage = await compressImageToMaxSize(processedImage, 900000);
    }
    // Tier 3: Images between 800KB-1MB - light compression
    else if (originalSize > 800000) {
      console.log('[imageProcessingService] Medium image detected (>800KB), applying light compression');
      processedImage = await compressImageToMaxSize(processedImage, 750000);
    }

    console.log(`[imageProcessingService] Compression result: ${originalSize} → ${processedImage.length} bytes (${Math.round(processedImage.length/originalSize*100)}%)`);
    
  } catch (resizeError) {
    console.error('[imageProcessingService] Error compressing image:', resizeError);
    // If compression fails and image is too large, use simple truncation as last resort
    if (processedImage.length > 1500000) {
      console.warn('[imageProcessingService] Compression failed, using fallback truncation');
      processedImage = processedImage.substring(0, 1000000);
    }
  }

  return { processedImage };
}
