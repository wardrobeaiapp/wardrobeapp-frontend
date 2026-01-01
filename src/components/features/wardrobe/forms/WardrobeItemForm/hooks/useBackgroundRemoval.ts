import { useState } from 'react';
import { removeBackground, fileToBase64 } from '../../../../../../services/ai/backgroundRemovalService';
import { fetchImageSafely } from '../../../../../../services/core';

interface UseBackgroundRemovalProps {
  onError: (error: string) => void;
  onSuccess: () => void;
}

export const useBackgroundRemoval = ({ onError, onSuccess }: UseBackgroundRemovalProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isUsingProcessedImage, setIsUsingProcessedImage] = useState(false);

  const processImage = async (file: File, currentPreviewUrl: string, originalSupabaseUrl?: string) => {
    try {
      setIsProcessing(true);
      setOriginalImage(originalSupabaseUrl || currentPreviewUrl); // Store the Supabase URL if available
      
      // Convert file to base64 for Replicate API
      const base64Image = await fileToBase64(file);
      
      // Remove background using Replicate
      const externalProcessedUrl = await removeBackground(base64Image);
      
      console.log('[useBackgroundRemoval] 🔄 Background removal completed, got external URL:', externalProcessedUrl);
      
      // Upload to Supabase immediately to avoid duplicate uploads later
      console.log('[useBackgroundRemoval] 📤 Uploading processed image to Supabase during processing...');
      
      const { blob } = await fetchImageSafely(externalProcessedUrl);
      const { uploadImageBlob, saveImageToStorage } = await import('../../../../../../services/core/imageService');
      const { convertToWebP } = await import('../../../../../../utils/image/webpConverter');
      
      // Upload processed image to storage during processing
      const webpBlob = await convertToWebP(blob, 0.92); 
      const { filePath } = await uploadImageBlob(webpBlob, 'webp', 'wardrobe');
      const supabaseProcessedUrl = await saveImageToStorage(filePath, webpBlob);
      
      console.log('[useBackgroundRemoval] ✅ Processed image uploaded during processing:', supabaseProcessedUrl);
      
      // Store the Supabase URL instead of external URL
      setProcessedImage(supabaseProcessedUrl);
      setShowPreview(true);
      onSuccess();
      
    } catch (error) {
      onError(
        error instanceof Error 
          ? error.message 
          : 'Failed to remove background. Please try again.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const useOriginal = (
    setPreviewImage: (url: string) => void,
    setImageUrl: (url: string) => void,
    originalImageUrl?: string
  ) => {
    console.log('[useBackgroundRemoval] User selected ORIGINAL image');
    console.log('[useBackgroundRemoval] Original URL:', originalImageUrl);
    
    // Reset form state to use the original image
    if (originalImageUrl) {
      setPreviewImage(originalImageUrl);
      setImageUrl(originalImageUrl);
      console.log('[useBackgroundRemoval] ✅ Form state reset to original image:', originalImageUrl);
    } else {
      console.warn('[useBackgroundRemoval] ⚠️ No original URL provided - cannot reset form state');
    }
    
    setShowPreview(false);
    setProcessedImage(null);
    setOriginalImage(null);
    setIsUsingProcessedImage(false);
    
    console.log('[useBackgroundRemoval] Background removal state cleared');
  };

  const applyProcessedImage = async (
    setPreviewImage: (url: string) => void, 
    setImageUrl: (url: string) => void, 
    setSelectedFile?: (file: File | null) => void,
    currentImageUrl?: string,  // Add current image URL to delete the original
    trackUploadedImage?: (url: string) => void  // Add callback to track processed image
  ) => {
    if (processedImage) {
      try {
        setIsProcessing(true);
        
        let finalProcessedUrl = processedImage;
        
        // Check if processed image is already a Supabase URL
        const isAlreadySupabase = processedImage.includes('supabase.co');
        
        if (isAlreadySupabase) {
          console.log('[useBackgroundRemoval] ✅ Processed image already in Supabase storage, reusing:', processedImage);
          finalProcessedUrl = processedImage;
          
          // Track for cleanup if not already tracked
          if (trackUploadedImage) {
            trackUploadedImage(processedImage);
            console.log('[useBackgroundRemoval] Tracking existing Supabase image for cleanup:', processedImage);
          }
        } else {
          console.log('[useBackgroundRemoval] 📤 Processed image is external, uploading to Supabase...');
          
          // Fetch the processed image via proxy
          const { blob } = await fetchImageSafely(processedImage);
          
          // Import image services and WebP conversion
          const { uploadImageBlob, saveImageToStorage } = await import('../../../../../../services/core/imageService');
          const { convertToWebP } = await import('../../../../../../utils/image/webpConverter');
          
          // Upload processed image to storage immediately (replaces original workflow)  
          const webpBlob = await convertToWebP(blob, 0.92); // Convert to WebP with high quality
          const { filePath } = await uploadImageBlob(webpBlob, 'webp', 'wardrobe');
          finalProcessedUrl = await saveImageToStorage(filePath, webpBlob);
          
          console.log('[useBackgroundRemoval] Processed image uploaded:', finalProcessedUrl);
          
          // Track the processed image for potential cleanup
          if (trackUploadedImage) {
            trackUploadedImage(finalProcessedUrl);
            console.log('[useBackgroundRemoval] Tracking processed image for cleanup:', finalProcessedUrl);
          }
        }
        
        // Delete the original uploaded file from storage if it exists and it's different from processed
        console.log('[useBackgroundRemoval] DIAGNOSTIC - Checking deletion conditions:');
        console.log('[useBackgroundRemoval] - originalImage (stored during processing):', originalImage);
        console.log('[useBackgroundRemoval] - finalProcessedUrl:', finalProcessedUrl);
        console.log('[useBackgroundRemoval] - URLs are different?', originalImage !== finalProcessedUrl);
        
        // Only delete if original image is a Supabase URL and different from processed
        const isOriginalSupabase = originalImage && originalImage.includes('supabase.co');
        
        if (originalImage && originalImage !== finalProcessedUrl && isOriginalSupabase) {
          console.log('[useBackgroundRemoval] ✅ DELETING original uploaded Supabase file:', originalImage);
          const { deleteImageFromStorage } = await import('../../../../../../services/core/imageService');
          await deleteImageFromStorage(originalImage);
        } else {
          console.log('[useBackgroundRemoval] ❌ SKIPPING deletion - Condition failed');
          if (!originalImage) {
            console.log('[useBackgroundRemoval] - Reason: originalImage is empty');
          } else if (originalImage === finalProcessedUrl) {
            console.log('[useBackgroundRemoval] - Reason: URLs are identical');
          } else if (!isOriginalSupabase) {
            console.log('[useBackgroundRemoval] - Reason: originalImage is external (not Supabase)');
          }
        }
        
        // Update form state with the processed image URL
        setPreviewImage(finalProcessedUrl);
        setImageUrl(finalProcessedUrl);
        
        // Clear the selected file since image is now in storage
        if (setSelectedFile) {
          setSelectedFile(null);
        }
        
        setShowPreview(false);
        setOriginalImage(null);
        setIsUsingProcessedImage(true);
        
      } catch (error) {
        console.error('[useBackgroundRemoval] Error applying processed image:', error);
        // Fallback: use external URL directly
        setPreviewImage(processedImage);
        setImageUrl(processedImage);
        setShowPreview(false);
        setOriginalImage(null);
        setIsUsingProcessedImage(true);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const closePreview = () => {
    setShowPreview(false);
    setProcessedImage(null);
    setOriginalImage(null);
  };

  const resetProcessedState = () => {
    setIsUsingProcessedImage(false);
    setProcessedImage(null);
    setOriginalImage(null);
    setShowPreview(false);
  };

  return {
    isProcessing,
    processedImage,
    originalImage,
    showPreview,
    isUsingProcessedImage,
    processImage,
    useOriginal,
    applyProcessedImage,
    closePreview,
    resetProcessedState
  };
};
