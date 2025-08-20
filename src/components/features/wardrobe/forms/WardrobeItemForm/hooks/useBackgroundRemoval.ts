import { useState } from 'react';
import { removeBackground, fileToBase64 } from '../../../../../../services/backgroundRemovalService';

interface UseBackgroundRemovalProps {
  onError: (error: string) => void;
  onSuccess: () => void;
}

export const useBackgroundRemoval = ({ onError, onSuccess }: UseBackgroundRemovalProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

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
  };

  const useProcessed = async (
    setPreviewImage: (url: string) => void, 
    setImageUrl: (url: string) => void, 
    setSelectedFile?: (file: File | null) => void
  ) => {
    if (processedImage) {
      console.log('[useBackgroundRemoval] Using processed image:', processedImage);
      
      try {
        // Use the processed image URL directly
        setPreviewImage(processedImage);
        setImageUrl(processedImage);
        
        // Clear the selected file so we don't upload the original file
        if (setSelectedFile) {
          setSelectedFile(null);
          console.log('[useBackgroundRemoval] Cleared selectedFile to prevent original file upload');
        }
        
        setShowPreview(false);
        setOriginalImage(null);
        setIsProcessing(false);
        
      } catch (error) {
        console.error('[useBackgroundRemoval] Error downloading processed image:', error);
        setIsProcessing(false);
        
        // Fallback to temp URL on error
        setPreviewImage(processedImage);
        setImageUrl(processedImage);
        setShowPreview(false);
        setOriginalImage(null);
      }
    }
  };

  const closePreview = () => {
    setShowPreview(false);
    setProcessedImage(null);
    setOriginalImage(null);
  };

  return {
    isProcessing,
    processedImage,
    originalImage,
    showPreview,
    processImage,
    useOriginal,
    useProcessed,
    closePreview
  };
};
