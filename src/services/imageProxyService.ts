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
    const { data, error } = await supabase.functions.invoke('fetch-image-proxy', {
      body: {
        imageUrl: imageUrl
      }
    });

    if (error) {
      console.error('[imageProxyService] Supabase function error:', error);
      throw new Error(`Proxy fetch failed: ${error.message}`);
    }

    const response = data as FetchImageProxyResponse;
    
    if (!response.success || !response.data) {
      console.error('[imageProxyService] Proxy returned error:', response.error);
      throw new Error(response.error || 'Failed to fetch image via proxy');
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
    throw error;
  }
};

/**
 * Attempts to fetch image via proxy first, falls back to direct fetch if needed
 * @param imageUrl The URL of the image to fetch
 * @returns Promise that resolves to the image Blob and its file extension
 */
export const fetchImageSafely = async (imageUrl: string): Promise<{ blob: Blob; fileExt: string }> => {
  try {
    // First try the proxy
    return await fetchImageViaProxy(imageUrl);
  } catch (proxyError) {
    const errorMessage = proxyError instanceof Error ? proxyError.message : String(proxyError);
    console.warn('[imageProxyService] Proxy failed, attempting direct fetch:', errorMessage);
    
    try {
      // Fallback to direct fetch (will fail with CORS but worth trying)
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
      }
      
      const blob = await response.blob();
      const fileExt = imageUrl.split('.').pop()?.split('?')[0] || 'jpg';
      
      console.log('[imageProxyService] Direct fetch succeeded');
      return { blob, fileExt };
      
    } catch (directError) {
      console.error('[imageProxyService] Both proxy and direct fetch failed');
      throw new Error(`Image fetch failed: ${errorMessage}`);
    }
  }
};
