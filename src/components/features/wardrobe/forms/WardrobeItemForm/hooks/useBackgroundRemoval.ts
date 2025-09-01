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
      console.error('Background removal failed:', error);
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
    setSelectedFile?: (file: File | null) => void
  ) => {
    if (processedImage) {
      console.log('[useBackgroundRemoval] Using processed image:', processedImage);
      
      try {
        setIsProcessing(true);
        
        // Fetch image via proxy but don't save to storage yet
        console.log('[useBackgroundRemoval] Downloading processed image via proxy...');
        const { blob, fileExt } = await fetchImageSafely(processedImage);
        
        // Create a local blob URL for preview
        const blobUrl = URL.createObjectURL(blob);
        console.log('[useBackgroundRemoval] Created blob URL for preview:', blobUrl);
        
        // Create a File object from the blob for form handling with correct mime type
        const mimeType = blob.type || `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`;
        const processedFile = new File([blob], `processed-image.${fileExt}`, { type: mimeType });
        
        // Set the preview and file - storage save will happen during form submission
        setPreviewImage(blobUrl);
        setImageUrl(blobUrl);
        
        // Set the processed image as the selected file for form submission
        if (setSelectedFile) {
          setSelectedFile(processedFile);
          console.log('[useBackgroundRemoval] Set processed image as selected file for form submission');
        }
        
        setShowPreview(false);
        setOriginalImage(null);
        setIsUsingProcessedImage(true);
        
      } catch (error) {
        console.error('[useBackgroundRemoval] Error fetching processed image:', error);
        
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
