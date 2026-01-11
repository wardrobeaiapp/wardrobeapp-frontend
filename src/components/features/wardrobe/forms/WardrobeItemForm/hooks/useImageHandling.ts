import { useState } from 'react';
import { uploadImageBlob, saveImageToStorage } from '../../../../../../services/core/imageService';
import { compressImage } from '../../../../../../utils/image/imageCompression';
import { handleImageFromUrl, fetchImageAsFile, classifyUrlError, errorMessages, UrlImageErrorType } from '../../../../../../utils/image/urlImageHandling';
import { validateImageFile, safeExecute, logError } from '../../../../../../utils/error/errorHandling';
import { convertToWebP, WebPPresets } from '../../../../../../utils/image/webpConverter';

interface UseImageHandlingProps {
  initialImageUrl?: string;
  onImageError: (error: string) => void;
  onImageSuccess: () => void;
  onNewImageSelected?: () => void;
  onSetIsImageFromUrl?: (isFromUrl: boolean) => void;
  onBackgroundRemovalReset?: () => void;
}

export const useImageHandling = ({ 
  initialImageUrl = '', 
  onImageError, 
  onImageSuccess,
  onNewImageSelected,
  onSetIsImageFromUrl,
  onBackgroundRemovalReset
}: UseImageHandlingProps) => {
  const [previewImage, setPreviewImage] = useState<string | null>(initialImageUrl || null);
  const [isDownloadingImage, setIsDownloadingImage] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [detectedTags, setDetectedTags] = useState<Record<string, string>>({});
  
  // Track uploaded images for potential cleanup
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
  
  // const detectAndLogTags = useCallback(async (imageSource: string | File) => {
  //   try {
  //     console.log('[Ximilar] Detecting tags for image...');
  //     const response = await detectImageTags(
  //       imageSource instanceof File ? await fileToBase64(imageSource) : imageSource
  //     );
  //     const topTags = extractTopTags(response);
  //     console.log('[Ximilar] Detected tags:', topTags);
      
  //     // Convert to the format expected by FormAutoPopulationService
  //     const detectedTagsFormat = convertToDetectedTagsFormat(topTags);
      
  //     // Update local state and notify parent component
  //     setDetectedTags(topTags);
  //     onTagsDetected?.(detectedTagsFormat);
      
  //     return topTags;
  //   } catch (error) {
  //     console.error('[Ximilar] Error detecting tags:', error);
  //     return {};
  //   }
  // }, [onTagsDetected]);


  // Upload a file to Supabase storage with smart WebP compression and return a permanent URL
  const uploadFileToStorage = async (file: File): Promise<string> => {
    return safeExecute(
      async () => {
        console.log('[useImageHandling] Converting and uploading file to Supabase storage:', file.name);
        
        // Convert to WebP format with smart compression (TinyPNG-like quality optimization)
        const compressionResult = await convertToWebP(file, WebPPresets.WARDROBE_STANDARD);
        
        console.log('[useImageHandling] Smart compression stats:', {
          original: `${(compressionResult.originalSize / 1024).toFixed(1)}KB`,
          compressed: `${(compressionResult.compressedSize / 1024).toFixed(1)}KB`,
          savings: `${compressionResult.compressionRatio.toFixed(1)}%`,
          quality: `${((compressionResult.quality || 0.92) * 100).toFixed(0)}%`,
          method: compressionResult.method,
          dimensions: compressionResult.dimensions
        });
        
        // Use the imageService functions to upload to Supabase storage
        const { filePath } = await uploadImageBlob(compressionResult.blob, 'webp', 'wardrobe');
        const publicUrl = await saveImageToStorage(filePath, compressionResult.blob);
        
        console.log('[useImageHandling] WebP file uploaded successfully:', publicUrl);
        return publicUrl;
      },
      (error) => {
        throw new Error('Failed to convert and upload image to storage');
      },
      'useImageHandling'
    ) as Promise<string>; // Type assertion needed since safeExecute can return undefined
  };

  const handleFileSelect = async (file: File, setImageUrl: (url: string) => void) => {
    // Validate file type and size
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      onImageError(validation.errorMessage || 'Invalid image file');
      return;
    }
    
    return safeExecute(
      async () => {
        // Store the original file
        setSelectedFile(file);
        
        // For immediate preview, use a compressed data URL
        const compressedImageUrl = await compressImage(file);
        setPreviewImage(compressedImageUrl);
        
        // TODO: Detect and log tags for the uploaded file (in background) - COMMENTED OUT FOR NOW
        // detectAndLogTags(file).catch(error => {
        //   logError('useImageHandling', 'Error detecting tags', error);
        // });
        
        // Upload the file to Supabase storage (this gives us a permanent URL)
        const storedImageUrl = await uploadFileToStorage(file);
        
        // Track this uploaded image for potential cleanup
        setUploadedImageUrls(prev => [...prev, storedImageUrl]);
        console.log('[useImageHandling] Tracking uploaded image for cleanup:', storedImageUrl);
        
        // Update the form with the permanent storage URL
        setImageUrl(storedImageUrl);
        onImageSuccess();
        
        // Reset any background removal state when new image is selected
        onNewImageSelected?.();
      },
      (error) => {
        onImageError('Failed to process image');
      },
      'useImageHandling.handleFileSelect'
    );
  };

  const handleDrop = async (e: React.DragEvent, setImageUrl: (url: string) => void) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      await handleFileSelect(file, setImageUrl);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleUrlChange = async (
    url: string, 
    setImageUrl: (url: string) => void
  ) => {
    // Set the URL temporarily so the UI shows something
    setImageUrl(url);
    
    if (!url) {
      setPreviewImage(null);
      return;
    }
    
    setIsDownloadingImage(true);
    
    return safeExecute(
      async () => {
        // Use our consolidated URL handling utility
        const storedImageUrl = await handleImageFromUrl(url);
        
        // Update UI with the stored image
        setImageUrl(storedImageUrl);
        setPreviewImage(storedImageUrl);
        
        // TODO: Detect tags for the image - COMMENTED OUT FOR NOW
        // await detectAndLogTags(storedImageUrl);
        
        onImageSuccess();
      },
      (error) => {
        logError('useImageHandling', 'Error handling URL image', error);
        onImageError('Failed to process image URL. Please try downloading and uploading directly.');
      },
      'useImageHandling.handleUrlChange'
    ).finally(() => {
      setIsDownloadingImage(false);
    });
  };
  
  // Using isKnownRetailSite from config/retailDomains.ts

  /**
   * Handles loading an image from a URL
   * @param url The URL to load the image from
   * @param setImageUrl Function to set the image URL in the form
   */
  const handleUrlLoad = async (url: string, setImageUrl: (url: string) => void) => {
    setIsDownloadingImage(true);
    onImageError('');
    
    return safeExecute(
      async () => {
        // Fetch the image as a File object using our utility
        const file = await fetchImageAsFile(url);
        
        // Use the existing file selection logic
        await handleFileSelect(file, setImageUrl);
        
        // Reset processed state when new image is loaded
        onBackgroundRemovalReset?.();
        
        // Store the original URL
        setImageUrl(url);
        
        // Mark that this image came from URL 
        onSetIsImageFromUrl?.(true);
        console.log('Set isImageFromUrl to true for URL image');
      },
      (error) => {
        // Classify and handle the error using our utility
        const errorType = classifyUrlError(error);
        const errorMessage = errorMessages[errorType];
        
        logError('useImageHandling', 'Failed to load image from URL', error);
        
        // Special handling for retail site errors
        if (errorType === UrlImageErrorType.RETAIL_SITE_MANUAL_DOWNLOAD && error instanceof Error) {
          const imageUrl = error.message.split('RETAIL_SITE_MANUAL_DOWNLOAD_NEEDED:')[1];
          if (imageUrl) {
            // Open the image in a new tab to help the user download it
            window.open(imageUrl, '_blank');
          }
        }
        
        onImageError(errorMessage);
        onSetIsImageFromUrl?.(false);
      },
      'useImageHandling.handleUrlLoad'
    ).finally(() => {
      setIsDownloadingImage(false);
    });
  };

  // Clear/remove image function
  const clearImage = (setImageUrl: (url: string) => void) => {
    setPreviewImage(null);
    setSelectedFile(null);
    setDetectedTags({});
    setImageUrl('');
    onImageSuccess(); // Clear any error messages
    onNewImageSelected?.(); // Reset background removal and other states
    onSetIsImageFromUrl?.(false);
    console.log('[useImageHandling] Image cleared successfully');
  };

  // Cleanup uploaded images function (for form cancellation)
  const cleanupUploadedImages = async () => {
    console.log('[useImageHandling] ===== CLEANUP FUNCTION CALLED =====');
    console.log('[useImageHandling] uploadedImageUrls.length:', uploadedImageUrls.length);
    console.log('[useImageHandling] uploadedImageUrls contents:', uploadedImageUrls);
    
    if (uploadedImageUrls.length === 0) {
      console.log('[useImageHandling] ❌ No uploaded images to cleanup - exiting');
      return;
    }

    console.log(`[useImageHandling] ✅ Starting cleanup of ${uploadedImageUrls.length} uploaded images...`);
    
    const { deleteImageFromStorage } = await import('../../../../../../services/core/imageService');
    
    for (let i = 0; i < uploadedImageUrls.length; i++) {
      const imageUrl = uploadedImageUrls[i];
      try {
        console.log(`[useImageHandling] 🗑️  Deleting image ${i+1}/${uploadedImageUrls.length}:`, imageUrl);
        await deleteImageFromStorage(imageUrl);
        console.log(`[useImageHandling] ✅ Successfully deleted image ${i+1}`);
      } catch (error) {
        console.error(`[useImageHandling] ❌ Failed to delete image ${i+1}:`, imageUrl, error);
        // Continue with other deletions even if one fails
      }
    }
    
    console.log('[useImageHandling] 🧹 Clearing uploadedImageUrls array...');
    setUploadedImageUrls([]);
    console.log('[useImageHandling] ===== CLEANUP COMPLETED =====');
  };

  // Mark image as saved (remove from cleanup list)
  const markImageAsSaved = (imageUrl: string) => {
    setUploadedImageUrls(prev => prev.filter(url => url !== imageUrl));
    console.log('[useImageHandling] Image marked as saved, removed from cleanup:', imageUrl);
  };

  // Add image to tracking list (for background removal processed images)
  const trackUploadedImage = (imageUrl: string) => {
    setUploadedImageUrls(prev => [...prev, imageUrl]);
    console.log('[useImageHandling] Tracking uploaded image for cleanup:', imageUrl);
  };

  return {
    previewImage,
    setPreviewImage,
    isDownloadingImage,
    setIsDownloadingImage,
    selectedFile,
    setSelectedFile,
    detectedTags,
    handleFileSelect,
    handleDrop,
    handleDragOver,
    handleUrlChange,
    handleUrlLoad,
    clearImage,
    cleanupUploadedImages,
    markImageAsSaved,
    trackUploadedImage,
    uploadedImageUrls
  };
};
