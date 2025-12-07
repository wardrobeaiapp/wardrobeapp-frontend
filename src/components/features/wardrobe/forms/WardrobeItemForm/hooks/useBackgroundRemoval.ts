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

  const processImage = async (file: File, currentPreviewUrl: string) => {
    try {
      setIsProcessing(true);
      setOriginalImage(currentPreviewUrl);
      
      // Convert file to base64 for Replicate API
      const base64Image = await fileToBase64(file);
      
      // Remove background using Replicate
      const processedImageUrl = await removeBackground(base64Image);
      
      setProcessedImage(processedImageUrl);
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

  const useOriginal = () => {
    setShowPreview(false);
    setProcessedImage(null);
    setOriginalImage(null);
    setIsUsingProcessedImage(false);
  };

  const applyProcessedImage = async (
    setPreviewImage: (url: string) => void, 
    setImageUrl: (url: string) => void, 
    setSelectedFile?: (file: File | null) => void,
    currentImageUrl?: string  // Add current image URL to delete the original
  ) => {
    if (processedImage) {
      try {
        setIsProcessing(true);
        
        // Fetch the processed image via proxy
        const { blob } = await fetchImageSafely(processedImage);
        
        // Import image services and WebP conversion
        const { uploadImageBlob, saveImageToStorage, deleteImageFromStorage } = await import('../../../../../../services/core/imageService');
        const { convertToWebP } = await import('../../../../../../utils/image/webpConverter');
        
        // Upload processed image to storage immediately (replaces original workflow)  
        const webpBlob = await convertToWebP(blob, 0.92); // Convert to WebP with high quality
        const { filePath } = await uploadImageBlob(webpBlob, 'webp', 'wardrobe');
        const processedImageUrl = await saveImageToStorage(filePath, webpBlob);
        
        console.log('[useBackgroundRemoval] Processed image uploaded:', processedImageUrl);
        
        // Delete the original image from storage if it exists
        if (currentImageUrl && currentImageUrl !== processedImageUrl) {
          console.log('[useBackgroundRemoval] Deleting original image:', currentImageUrl);
          await deleteImageFromStorage(currentImageUrl);
        }
        
        // Update form state with the processed image URL from storage
        setPreviewImage(processedImageUrl);
        setImageUrl(processedImageUrl);
        
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
