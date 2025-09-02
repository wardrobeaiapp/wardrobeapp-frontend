import { supabase } from './supabaseClient';

interface FetchImageProxyResponse {
  success: boolean;
  data?: {
    imageData: number[];
    contentType: string;
    fileExt: string;
    size: number;
  };
  error?: string;
  details?: string;
}

/**
 * Fetches an image through our backend proxy to avoid CORS issues
 * @param imageUrl The URL of the image to fetch
 * @returns Promise that resolves to the image Blob and its file extension
 */
export const fetchImageViaProxy = async (imageUrl: string): Promise<{ blob: Blob; fileExt: string }> => {
  console.log('[imageProxyService] Fetching image via proxy:', imageUrl);
  
  try {
    // Check if the image URL is from a known CORS-friendly domain
    const isCorsSupported = isCorsEnabledDomain(imageUrl);
    if (isCorsSupported) {
      console.log('[imageProxyService] URL is from CORS-enabled domain, trying direct fetch first');
      try {
        return await fetchImageDirectly(imageUrl);
      } catch (directError) {
        console.warn('[imageProxyService] Direct fetch failed despite CORS-enabled domain:', directError);
        // Continue with proxy as fallback
      }
    }

    // Try Supabase Edge Function proxy
    const { data, error } = await supabase.functions.invoke('fetch-image-proxy', {
      body: {
        imageUrl: imageUrl
      }
    });

    if (error) {
      console.error('[imageProxyService] Supabase function error:', error);
      // Don't throw, try fallback methods
      if (error.message.includes('402') || error.message.includes('429')) {
        console.warn('[imageProxyService] Quota or rate limit error. Trying direct fetch...');
        return await fetchImageDirectly(imageUrl);
      }
      throw new Error(`Proxy fetch failed: ${error.message}`);
    }

    const response = data as FetchImageProxyResponse;
    
    if (!response.success || !response.data) {
      console.error('[imageProxyService] Proxy returned error:', response.error);
      // Try direct fetch as fallback
      console.warn('[imageProxyService] Trying direct fetch as fallback...');
      return await fetchImageDirectly(imageUrl);
    }

    // Convert the array back to Uint8Array and create blob
    const uint8Array = new Uint8Array(response.data.imageData);
    const blob = new Blob([uint8Array], { type: response.data.contentType });

    console.log('[imageProxyService] Successfully fetched image via proxy:', {
      size: blob.size,
      type: blob.type,
      fileExt: response.data.fileExt
    });

    return { blob, fileExt: response.data.fileExt };
    
  } catch (error) {
    console.error('[imageProxyService] Error fetching image via proxy:', error);
    // Final attempt - try direct fetch if we haven't already
    try {
      console.warn('[imageProxyService] Final attempt: trying direct fetch...');
      return await fetchImageDirectly(imageUrl);
    } catch (directError) {
      // Combine errors for better debugging
      const errorMsg = error instanceof Error ? error.message : String(error);
      const directErrorMsg = directError instanceof Error ? directError.message : String(directError);
      throw new Error(`Image fetch failed: ${errorMsg}. Direct fetch also failed: ${directErrorMsg}`);
    }
  }
};

/**
 * Helper function to fetch image directly without proxy
 * @param imageUrl The URL of the image to fetch
 * @returns Promise that resolves to the image Blob and its file extension
 */
const fetchImageDirectly = async (imageUrl: string): Promise<{ blob: Blob; fileExt: string }> => {
  try {
    // Check if this is a retail site with known CORS issues
    const isRetailSite = isKnownRetailSite(imageUrl);
    if (isRetailSite) {
      console.log('[imageProxyService] Retail site detected, using special handling');
      return await handleRetailSiteImage(imageUrl);
    }

    // Set up fetch with credentials and all required headers
    const response = await fetch(imageUrl, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Accept': 'image/*',
        'Origin': window.location.origin,
        'Referer': window.location.origin,
        'User-Agent': 'Mozilla/5.0 (compatible; WardrobeApp)'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }
    
    const blob = await response.blob();
    
    // Determine file extension from content-type or URL
    let fileExt = 'jpg';
    const contentType = response.headers.get('content-type');
    
    if (contentType) {
      if (contentType.includes('png')) fileExt = 'png';
      else if (contentType.includes('webp')) fileExt = 'webp';
      else if (contentType.includes('gif')) fileExt = 'gif';
      else if (contentType.includes('svg')) fileExt = 'svg';
    } else {
      // Fallback to URL extension
      const urlExt = imageUrl.split('.').pop()?.split('?')[0]?.toLowerCase();
      if (urlExt && ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(urlExt)) {
        fileExt = urlExt === 'jpeg' ? 'jpg' : urlExt;
      }
    }
    
    console.log('[imageProxyService] Direct fetch succeeded');
    return { blob, fileExt };
  } catch (error) {
    console.error('[imageProxyService] Direct fetch failed:', error);
    throw error;
  }
};

/**
 * Special handling for retail sites that have strict CORS policies
 * @param imageUrl The URL of the retail site image
 * @returns Promise with blob and fileExt
 */
const handleRetailSiteImage = async (imageUrl: string): Promise<{ blob: Blob; fileExt: string }> => {
  // For retail sites, we'll need to use different approach
  // Option 1: Try a fetch with no-cors mode (will succeed but result in opaque response)
  try {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const response = await fetch(imageUrl, {
      method: 'GET',
      mode: 'no-cors',
      credentials: 'omit',
      headers: {
        'Accept': 'image/*',
      }
    });
    
    // Extract file extension from URL since we can't read content-type from opaque response
    const urlExt = imageUrl.split('.').pop()?.split('?')[0]?.toLowerCase();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const fileExt = (urlExt && ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(urlExt)) 
      ? (urlExt === 'jpeg' ? 'jpg' : urlExt)
      : 'jpg';
    
    // With no-cors mode, we get an opaque response that we can't directly use
    // Instead, we'll need to create a blob URL and open it in a new tab
    // and guide the user to save the image manually
    
    // Create a dummy blob with text instructions
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const dummyBlob = new Blob([
      new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46])
    ], { type: 'image/jpeg' });
    
    // We'll need to show guidance to the user about saving the image manually
    console.log('[imageProxyService] Retail site image - needs manual download');
    
    // Signal that this image needs manual handling
    throw new Error('RETAIL_SITE_MANUAL_DOWNLOAD_NEEDED:' + imageUrl);
  } catch (error) {
    // If the error is our special signal, propagate it
    if (error instanceof Error && error.message?.includes('RETAIL_SITE_MANUAL_DOWNLOAD_NEEDED')) {
      throw error;
    }
    console.error('[imageProxyService] Retail site image fetch failed:', error);
    const errorMsg = error instanceof Error ? error.message : String(error);
    throw new Error(`Retail site image fetch failed: ${errorMsg}`);
  }
};

/**
 * Check if URL is from a known retail site with CORS restrictions
 */
const isKnownRetailSite = (url: string): boolean => {
  try {
    const retailDomains = [
      'shop.mango.com',
      'mango.com',
      'zara.com',
      'hm.com',
      'asos.com',
      'nordstrom.com',
      'macys.com',
      'target.com',
      'walmart.com',
      'amazon.com',
      'forever21.com',
      'fashionnova.com',
      'gap.com',
      'adidas.com',
      'nike.com'
    ];
    
    const domain = new URL(url).hostname;
    return retailDomains.some(retailDomain => domain.includes(retailDomain));
  } catch (e) {
    return false;
  }
};

/**
 * Check if a domain is known to support CORS for image requests
 * @param url The URL to check
 * @returns boolean indicating if the domain is known to support CORS
 */
const isCorsEnabledDomain = (url: string): boolean => {
  try {
    const corsEnabledDomains = [
      'imgur.com', 'i.imgur.com',
      'pexels.com', 'images.pexels.com',
      'unsplash.com', 'images.unsplash.com',
      'cloudinary.com',
      'googleapis.com',
      'fbcdn.net',
      'shopify.com',
      'staticflickr.com',
      's3.amazonaws.com'
    ];
    
    const domain = new URL(url).hostname;
    return corsEnabledDomains.some(corsEnabledDomain => domain.includes(corsEnabledDomain));
  } catch (e) {
    // If URL is invalid, assume not CORS enabled
    return false;
  }
};

/**
 * Attempts to fetch image via proxy with enhanced fallback mechanisms
 * @param imageUrl The URL of the image to fetch
 * @returns Promise that resolves to the image Blob and its file extension
 */
export const fetchImageSafely = async (imageUrl: string): Promise<{ blob: Blob; fileExt: string }> => {
  // The enhanced fetchImageViaProxy already has multiple fallback mechanisms
  try {
    return await fetchImageViaProxy(imageUrl);
  } catch (error) {
    console.error('[imageProxyService] All image fetch methods failed');
    throw new Error(`Unable to load image from ${imageUrl.substring(0, 30)}... - Please try a different image URL or use the file upload option instead.`);
  }
};
