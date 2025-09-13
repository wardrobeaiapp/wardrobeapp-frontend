import { useState, useCallback } from 'react';
import { detectImageTags, extractTopTags } from '../../../../../../services/ai/ximilarService';
import { uploadImageBlob, saveImageToStorage } from '../../../../../../services/core/imageService';
import { compressImage } from '../../../../../../utils/image/imageCompression';
import { fileToBase64 } from '../../../../../../utils/file/fileConversion';
import { convertToDetectedTagsFormat } from '../../../../../../utils/tags/tagFormatting';
import { handleImageFromUrl, fetchImageAsFile, classifyUrlError, errorMessages, UrlImageErrorType } from '../../../../../../utils/image/urlImageHandling';
import { validateImageFile, safeExecute, logError } from '../../../../../../utils/error/errorHandling';

interface UseImageHandlingProps {
  initialImageUrl?: string;
  onImageError: (error: string) => void;
  onImageSuccess: () => void;
  onNewImageSelected?: () => void;
  onTagsDetected?: (tags: any) => void;
  onSetIsImageFromUrl?: (isFromUrl: boolean) => void;
  onBackgroundRemovalReset?: () => void;
}

export const useImageHandling = ({ 
  initialImageUrl = '', 
  onImageError, 
  onImageSuccess,
  onNewImageSelected,
  onTagsDetected,
  onSetIsImageFromUrl,
  onBackgroundRemovalReset
}: UseImageHandlingProps) => {
  const [previewImage, setPreviewImage] = useState<string | null>(initialImageUrl || null);
  const [isDownloadingImage, setIsDownloadingImage] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [detectedTags, setDetectedTags] = useState<Record<string, string>>({});
  
  const detectAndLogTags = useCallback(async (imageSource: string | File) => {
    try {
      console.log('[Ximilar] Detecting tags for image...');
      const response = await detectImageTags(
        imageSource instanceof File ? await fileToBase64(imageSource) : imageSource
      );
      const topTags = extractTopTags(response);
      console.log('[Ximilar] Detected tags:', topTags);
      
      // Convert to the format expected by FormAutoPopulationService
      const detectedTagsFormat = convertToDetectedTagsFormat(topTags);
      
      // Update local state and notify parent component
      setDetectedTags(topTags);
      onTagsDetected?.(detectedTagsFormat);
      
      return topTags;
    } catch (error) {
      console.error('[Ximilar] Error detecting tags:', error);
      return {};
    }
  }, [onTagsDetected]);

  // Using fileToBase64 from utils/file/fileConversion.ts

  // Upload a file to Supabase storage and return a permanent URL
  const uploadFileToStorage = async (file: File): Promise<string> => {
    return safeExecute(
      async () => {
        console.log('[useImageHandling] Uploading file to Supabase storage:', file.name);
        
        // Get file extension from file name
        const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
        
        // Convert file to blob for upload
        const blob = new Blob([await file.arrayBuffer()], { type: file.type });
        
        // Use the imageService functions to upload to Supabase storage
        const { filePath } = await uploadImageBlob(blob, fileExt, 'wardrobe');
        const publicUrl = await saveImageToStorage(filePath, blob);
        
        console.log('[useImageHandling] File uploaded successfully:', publicUrl);
        return publicUrl;
      },
      (error) => {
        throw new Error('Failed to upload image to storage');
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
        
        // Detect and log tags for the uploaded file (in background)
        detectAndLogTags(file).catch(error => {
          logError('useImageHandling', 'Error detecting tags', error);
        });
        
        // Upload the file to Supabase storage (this gives us a permanent URL)
        const storedImageUrl = await uploadFileToStorage(file);
        
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
        
        // Detect tags for the image
        await detectAndLogTags(storedImageUrl);
        
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
    compressImage
  };
};
