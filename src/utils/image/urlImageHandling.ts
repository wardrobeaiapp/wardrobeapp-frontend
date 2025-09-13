import { isKnownRetailSite } from '../../config/retailDomains';

/**
 * Error types for URL image handling
 */
export enum UrlImageErrorType {
  RETAIL_SITE_MANUAL_DOWNLOAD = 'RETAIL_SITE_MANUAL_DOWNLOAD_NEEDED',
  FORBIDDEN = 'FORBIDDEN',
  RATE_LIMIT = 'RATE_LIMIT',
  PROXY_FAILED = 'PROXY_FAILED',
  GENERAL = 'GENERAL_ERROR'
}

/**
 * Maps error types to user-friendly error messages
 */
export const errorMessages = {
  [UrlImageErrorType.RETAIL_SITE_MANUAL_DOWNLOAD]: 'This retailer restricts direct image access. Please save the image to your device first, then upload it directly.',
  [UrlImageErrorType.FORBIDDEN]: 'This retailer blocks image access. Try downloading the image and uploading it directly.',
  [UrlImageErrorType.RATE_LIMIT]: 'Too many requests to our image service. Please try again in a few minutes.',
  [UrlImageErrorType.PROXY_FAILED]: 'Image proxy service is currently unavailable. Try downloading and uploading the image.',
  [UrlImageErrorType.GENERAL]: 'Failed to load image from URL. Please check the URL and try again.'
};

/**
 * Identifies the specific error type from an error message
 * @param error The error object or message
 * @returns The classified error type
 */
export const classifyUrlError = (error: unknown): UrlImageErrorType => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  if (errorMessage.includes('RETAIL_SITE_MANUAL_DOWNLOAD_NEEDED')) {
    return UrlImageErrorType.RETAIL_SITE_MANUAL_DOWNLOAD;
  } else if (errorMessage.includes('403') || errorMessage.includes('Forbidden')) {
    return UrlImageErrorType.FORBIDDEN;
  } else if (errorMessage.includes('429') || errorMessage.includes('Too Many Requests')) {
    return UrlImageErrorType.RATE_LIMIT;
  } else if (errorMessage.includes('Proxy fetch failed')) {
    return UrlImageErrorType.PROXY_FAILED;
  }
  
  return UrlImageErrorType.GENERAL;
};

/**
 * Handles saving an image from a retail site URL
 * @param url The URL of the retail site image
 * @returns Promise with the saved image URL
 */
export const saveRetailSiteImage = async (url: string): Promise<string> => {
  console.log('[urlImageHandling] Retail site image detected. Using server-side saving:', url);
  
  try {
    // Import the imageService functions we need
    const { saveImageFromUrl } = await import('../../services/core/imageService');
    
    // Save the image to our backend storage
    const savedImageUrl = await saveImageFromUrl(url, 'retail-images');
    console.log('[urlImageHandling] Image saved to backend storage:', savedImageUrl);
    
    return savedImageUrl;
  } catch (error) {
    console.error('[urlImageHandling] Error saving retail site image:', error);
    throw error;
  }
};

/**
 * Handles saving an image from a standard URL (non-retail site)
 * @param url The URL of the image
 * @returns Promise with the stored image URL
 */
export const saveStandardUrlImage = async (url: string): Promise<string> => {
  try {
    // Import fetch utilities
    const { fetchImageFromUrl, uploadImageBlob, saveImageToStorage } = await import('../../services/core/imageService');
    
    // Fetch the image as a blob
    console.log('[urlImageHandling] Fetching non-retail URL image:', url);
    const { blob, fileExt } = await fetchImageFromUrl(url);
    
    // Upload to storage for consistency with other images
    const { filePath } = await uploadImageBlob(blob, fileExt, 'wardrobe');
    const storedUrl = await saveImageToStorage(filePath, blob);
    
    console.log('[urlImageHandling] Non-retail URL image stored at:', storedUrl);
    return storedUrl;
  } catch (error) {
    console.error('[urlImageHandling] Error processing URL image:', error);
    throw error;
  }
};

/**
 * Unified function to handle image loading from a URL
 * Determines the correct approach based on the URL type
 * @param url The URL to load the image from
 * @returns Promise with the saved image URL
 */
export const handleImageFromUrl = async (url: string): Promise<string> => {
  if (!url) {
    throw new Error('No URL provided');
  }
  
  // Check if this is a retail site image that might have CORS issues
  if (isKnownRetailSite(url)) {
    return await saveRetailSiteImage(url);
  } else {
    return await saveStandardUrlImage(url);
  }
};

/**
 * Fetches an image via proxy and converts it to a File object
 * @param url The URL to fetch the image from
 * @returns Promise with the File object
 */
export const fetchImageAsFile = async (url: string): Promise<File> => {
  // Import the image proxy service
  const { fetchImageViaProxy } = await import('../../services/core');
  
  // Fetch the image via proxy to get a blob and extension
  const { blob, fileExt } = await fetchImageViaProxy(url);
  
  // Convert blob to File object
  const fileName = `image-from-url.${fileExt}`;
  return new File([blob], fileName, { type: blob.type });
};
