import { supabase } from '../../services/core';

/**
 * Generates a signed URL for an AI history image
 * @param filePath File path in storage
 * @param expiresIn Expiration time in seconds
 * @returns Signed URL or public URL
 */
export const generateAIHistorySignedUrl = async (filePath: string, expiresIn: number = 3600): Promise<string> => {
  console.log('[aiHistoryImageService] Generating signed URL for AI history image:', filePath);
  
  try {
    const { data, error } = await supabase.functions.invoke('generate-signed-url', {
      body: {
        filePath: filePath,
        expiresIn: expiresIn,
        bucket: 'ai-history-images'
      }
    });
    
    if (error) {
      console.error('[aiHistoryImageService] Error from generate-signed-url function:', error);
      throw error;
    }
    
    if (!data || (!data.signedUrl && !data.url)) {
      console.error('[aiHistoryImageService] No URL returned from function');
      throw new Error('No URL returned from generate-signed-url function');
    }
    
    console.log('[aiHistoryImageService] Data from generate-signed-url function:', data);
    // The server returns { signedUrl: string } but we expect to return just the URL
    return data.signedUrl || data.url; // Fallback to data.url for backward compatibility
  } catch (error) {
    console.error('[aiHistoryImageService] Failed to generate signed URL:', error);
    // If we can't generate a signed URL, try to construct a public URL as fallback
    const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://gujpqecwdftbwkcnwiup.supabase.co';
    const projectId = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] || 'gujpqecwdftbwkcnwiup';
    const publicUrl = `https://${projectId}.supabase.co/storage/v1/object/public/ai-history-images/${filePath}`;
    console.log('[aiHistoryImageService] Falling back to public URL:', publicUrl);
    return publicUrl;
  }
};
