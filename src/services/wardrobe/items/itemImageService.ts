import { supabase } from '../../../services/core';
import { isDemoUser } from '../../../pages/Demo/services/demoWardrobeService';

/**
 * Check if we're in demo context by looking at current URL or stored demo state
 */
const isDemoContext = (): boolean => {
  // Check if we're on the demo page
  if (typeof window !== 'undefined') {
    return window.location.pathname.includes('/demo');
  }
  return false;
};

/**
 * Generates a signed URL for an image
 * @param filePath File path in storage
 * @param expiresIn Expiration time in seconds
 * @param userId Optional user ID to check if it's a demo user
 * @returns Signed URL or public URL for demo users
 */
export const generateSignedUrl = async (filePath: string, expiresIn: number = 3600, userId?: string): Promise<string> => {
  // Clean up the file path if needed
  let processedFilePath = filePath;
  
  // If the path is a full URL, extract just the path part
  if (processedFilePath.includes('supabase.co')) {
    try {
      // Extract the path part after the bucket name
      const pathMatches = processedFilePath.match(/wardrobe-images\/([^?]+)/);
      if (pathMatches && pathMatches[1]) {
        processedFilePath = pathMatches[1];
        console.log('[itemImageService] Extracted path from URL:', processedFilePath);
      }
    } catch (err) {
      console.warn('[itemImageService] Could not parse URL, using as-is:', err);
    }
  }

  // For demo users or demo context, use public URLs directly
  const isDemoUser_check = userId ? isDemoUser(userId) : false;
  const isDemo = isDemoUser_check || isDemoContext();
  
  if (isDemo) {
    console.log('[itemImageService] Demo context detected, using public URL for path:', processedFilePath);
    // Extract project ID from Supabase URL
    const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://gujpqecwdftbwkcnwiup.supabase.co';
    const projectId = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] || 'gujpqecwdftbwkcnwiup';
    const publicUrl = `https://${projectId}.supabase.co/storage/v1/object/public/wardrobe-images/${processedFilePath}`;
    console.log('[itemImageService] Generated public URL for demo:', publicUrl);
    return publicUrl;
  }
  
  console.log('[itemImageService] Calling generate-signed-url function for path:', processedFilePath);
  
  try {
    const { data, error } = await supabase.functions.invoke('generate-signed-url', {
      body: {
        filePath: processedFilePath,
        expiresIn: expiresIn
      }
    });
    
    if (error) {
      console.error('[itemImageService] Error from generate-signed-url function:', error);
      throw error;
    }
    
    if (!data || (!data.signedUrl && !data.url)) {
      console.error('[itemImageService] No URL returned from function');
      throw new Error('No URL returned from generate-signed-url function');
    }
    
    console.log('[itemImageService] Data from generate-signed-url function:', data);
    // The server returns { signedUrl: string } but we expect to return just the URL
    return data.signedUrl || data.url; // Fallback to data.url for backward compatibility
  } catch (error) {
    console.error('[itemImageService] Failed to generate signed URL:', error);
    // If we can't generate a signed URL, try to construct a public URL as fallback
    const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://gujpqecwdftbwkcnwiup.supabase.co';
    const projectId = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] || 'gujpqecwdftbwkcnwiup';
    const publicUrl = `https://${projectId}.supabase.co/storage/v1/object/public/wardrobe-images/${processedFilePath}`;
    console.log('[itemImageService] Falling back to public URL:', publicUrl);
    return publicUrl;
  }
};
