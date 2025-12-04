import { supabase } from './supabaseClient';
import { v4 as uuidv4 } from 'uuid';

/**
 * Gets a public URL for a file in storage
 * @param filePath The path to the file in storage
 * @returns The public URL of the file
 */
const getPublicUrl = (filePath: string): string => {
  const { data } = supabase.storage
    .from('wardrobe-images')
    .getPublicUrl(filePath);
  
  if (!data?.publicUrl) {
    throw new Error('Failed to generate public URL');
  }
  
  return data.publicUrl;
};

/**
 * Fetches an image from a URL and returns it as a Blob
 * @param imageUrl The URL of the image to fetch
 * @returns Promise that resolves to the image Blob and its file extension
 */
export const fetchImageFromUrl = async (imageUrl: string): Promise<{ blob: Blob; fileExt: string }> => {
  console.log('Fetching image from URL:', imageUrl);
  
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      const errorMsg = `Failed to fetch image: ${response.status} ${response.statusText}`;
      console.error(errorMsg);
      throw new Error(errorMsg);
    }
    
    const blob = await response.blob();
    console.log('Blob created with type:', blob.type);
    
    // Extract file extension from URL or default to 'jpg'
    const fileExt = imageUrl.split('.').pop()?.split('?')[0] || 'jpg';
    
    return { blob, fileExt };
  } catch (error) {
    console.error('Error fetching image from URL:', error);
    throw error;
  }
};

/**
 * Uploads an image Blob to Supabase Storage
 * @param blob The image Blob to upload
 * @param fileExt The file extension (e.g., 'jpg', 'png')
 * @param folder The folder to save the image in (default: 'wardrobe')
 * @param customFileName Optional custom filename (without extension)
 * @returns Promise that resolves to the file path and upload data
 */
export const uploadImageBlob = async (
  blob: Blob, 
  fileExt: string, 
  folder: string = 'wardrobe',
  customFileName?: string
): Promise<{ filePath: string; uploadData: any }> => {
  try {
    // Get current user ID
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      const errorMsg = 'User must be authenticated to upload images';
      console.error(errorMsg);
      throw new Error(errorMsg);
    }
    
    const userId = user.id;
    const uniqueId = customFileName || uuidv4();
    const filePath = `${userId}/${folder}/${uniqueId}.${fileExt}`;
    
    console.log('Uploading to Supabase storage...', {
      bucket: 'wardrobe-images',
      path: filePath,
      size: blob.size,
      type: blob.type,
      userId
    });
    
    // Upload the blob to Supabase Storage
    const { data, error } = await supabase.storage
      .from('wardrobe-images')
      .upload(filePath, blob, {
        cacheControl: '3600',
        upsert: false,
        contentType: blob.type || 'image/jpeg'
      });
    
    if (error) {
      console.error('Supabase upload error:', error);
      throw error;
    }
    
    if (!data) {
      const errorMsg = 'No data returned from upload';
      console.error(errorMsg);
      throw new Error(errorMsg);
    }
    
    console.log('Image blob uploaded successfully');
    return { filePath, uploadData: data };
  } catch (error) {
    console.error('Error uploading image blob:', error);
    throw error;
  }
};

/**
 * Saves an uploaded image to storage and returns the public URL
 * @param filePath The path where the file was uploaded
 * @param blob The image Blob (not used but kept for API compatibility)
 * @returns Promise that resolves to the public URL of the saved image
 */
export const saveImageToStorage = async (filePath: string, blob: Blob): Promise<string> => {
  try {
    console.log('Getting public URL for saved image...', { filePath });
    
    // Get public URL - no permission updates needed since file is already uploaded with correct permissions
    const publicUrl = getPublicUrl(filePath);
    console.log('Generated public URL:', publicUrl);
    
    console.log('Image saved successfully');
    return publicUrl;
  } catch (error) {
    console.error('Error getting public URL for saved image:', error);
    throw error;
  }
};

/**
 * Fetches an image from a URL and uploads it to Supabase Storage
 * @param imageUrl The URL of the image to fetch and upload
 * @param folder The folder to save the image in (default: 'wardrobe')
 * @returns Promise that resolves to the public URL of the uploaded image
 */
export const saveImageFromUrl = async (imageUrl: string, folder: string = 'wardrobe'): Promise<string> => {
  try {
    // 1. Fetch the image
    const { blob, fileExt } = await fetchImageFromUrl(imageUrl);
    
    // 2. Upload the blob
    const { filePath } = await uploadImageBlob(blob, fileExt, folder);
    
    // 3. Save with proper permissions
    return await saveImageToStorage(filePath, blob);
  } catch (error) {
    console.error('Error in saveImageFromUrl:', error);
    throw error;
  }
};

/**
 * Deletes an image from Supabase storage
 * @param imageUrl The full URL or file path of the image to delete
 * @returns Promise that resolves when deletion is complete
 */
export const deleteImageFromStorage = async (imageUrl: string): Promise<void> => {
  try {
    if (!imageUrl) {
      console.log('[imageService] No image URL provided for deletion');
      return;
    }

    // Only delete images from our Supabase bucket for safety
    if (!imageUrl.includes('supabase.co') || !imageUrl.includes('/storage/v1/object/public/')) {
      console.log('[imageService] Skipping deletion - not a Supabase storage URL:', imageUrl);
      return;
    }

    // Extract file path from Supabase URL
    // URL format: https://{project}.supabase.co/storage/v1/object/public/{bucket}/{path}
    const urlParts = imageUrl.split('/storage/v1/object/public/');
    if (urlParts.length !== 2) {
      console.error('[imageService] Invalid Supabase URL format:', imageUrl);
      return;
    }

    const pathWithBucket = urlParts[1];
    const pathParts = pathWithBucket.split('/');
    const bucket = pathParts[0];
    const filePath = pathParts.slice(1).join('/');

    if (!bucket || !filePath) {
      console.error('[imageService] Could not extract bucket/path from URL:', imageUrl);
      return;
    }

    console.log(`[imageService] Deleting image from bucket "${bucket}" at path "${filePath}"`);

    // Delete the file from Supabase storage
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      console.error('[imageService] Error deleting image:', error);
      throw error;
    }

    console.log(`[imageService] Successfully deleted image: ${filePath}`);
  } catch (error) {
    console.error('[imageService] Failed to delete image:', error);
    // Don't throw the error to prevent blocking the main operation
    // Image cleanup is a nice-to-have, not critical
  }
};

// Utility function to check if a string is a valid URL
export const isValidImageUrl = (url: string): boolean => {
  try {
    new URL(url);
    return /^https?:\/\//.test(url);
  } catch {
    return false;
  }
};
