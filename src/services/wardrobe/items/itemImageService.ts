import { supabase } from '../../../services/core';

/**
 * Generates a signed URL for an image
 * @param filePath File path in storage
 * @param expiresIn Expiration time in seconds
 * @returns Signed URL
 */
export const generateSignedUrl = async (filePath: string, expiresIn: number = 3600): Promise<string> => {
  console.log('[itemImageService] Calling generate-signed-url function for path:', filePath);
  
  const { data, error } = await supabase.functions.invoke('generate-signed-url', {
    body: {
      filePath: filePath,
      expiresIn: expiresIn
    }
  }); // 1 hour expiration
  
  if (error) {
    console.error('[itemImageService] Error from generate-signed-url function:', error);
    throw error;
  }
  
  console.log('[itemImageService] Data from generate-signed-url function:', data);
  // The server returns { signedUrl: string } but we expect to return just the URL
  return data.signedUrl || data.url; // Fallback to data.url for backward compatibility
};
