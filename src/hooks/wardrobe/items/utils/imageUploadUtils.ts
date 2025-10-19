/**
 * Image upload utilities for wardrobe items
 * Handles file uploads and blob URL processing
 */

interface ImageUploadResult {
  imageUrl: string;
  uploadSuccessful: boolean;
}

/**
 * Handles image upload for wardrobe items
 * Supports both File objects and blob URLs
 * 
 * @param file - File object to upload (optional)
 * @param imageUrl - Image URL (may be blob URL, regular URL, or empty)
 * @returns Promise with final image URL and upload status
 */
export const handleImageUpload = async (
  file?: File, 
  imageUrl?: string
): Promise<ImageUploadResult> => {
  let finalImageUrl = imageUrl || '';
  let uploadSuccessful = true;

  // Handle file upload if we have a file or if imageUrl is a blob URL
  if (file || (imageUrl && imageUrl.startsWith('blob:'))) {
    console.log('HOOK: Uploading file to storage...');
    
    try {
      if (file) {
        // Upload the file directly
        const { uploadImageBlob, saveImageToStorage } = await import('../../../../services/core/imageService');
        
        // Get file extension
        const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
        
        // Convert file to blob and upload
        const blob = new Blob([await file.arrayBuffer()], { type: file.type });
        const { filePath } = await uploadImageBlob(blob, fileExt, 'wardrobe');
        finalImageUrl = await saveImageToStorage(filePath, blob);
        
        console.log('HOOK: File uploaded successfully to:', finalImageUrl);
        
      } else if (imageUrl && imageUrl.startsWith('blob:')) {
        // Handle blob URL - fetch it and upload to storage
        const { uploadImageBlob, saveImageToStorage } = await import('../../../../services/core/imageService');
        
        // Fetch the blob from the blob URL
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        
        // Determine file extension from blob type
        const fileExt = blob.type?.split('/')[1]?.toLowerCase() || 'jpg';
        
        const { filePath } = await uploadImageBlob(blob, fileExt, 'wardrobe');
        finalImageUrl = await saveImageToStorage(filePath, blob);
        
        console.log('HOOK: Blob URL uploaded successfully to:', finalImageUrl);
        
        // Clean up the blob URL to prevent memory leaks
        URL.revokeObjectURL(imageUrl);
      }
    } catch (uploadError) {
      console.error('HOOK: Error uploading image:', uploadError);
      console.log('HOOK: Continuing with original imageUrl due to upload error');
      uploadSuccessful = false;
      // Keep the original URL if upload fails
      finalImageUrl = imageUrl || '';
    }
  }

  return {
    imageUrl: finalImageUrl,
    uploadSuccessful
  };
};
