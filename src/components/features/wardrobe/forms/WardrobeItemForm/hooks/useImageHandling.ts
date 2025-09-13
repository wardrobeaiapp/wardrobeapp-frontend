import { useState, useCallback } from 'react';
import { detectImageTags, extractTopTags } from '../../../../../../services/ai/ximilarService';
import { uploadImageBlob, saveImageToStorage } from '../../../../../../services/core/imageService';

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

  const compressImage = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      img.onload = () => {
        const MAX_SIZE = 600;
        let { width, height } = img;
        
        if (width > height && width > MAX_SIZE) {
          height = Math.round((height * MAX_SIZE) / width);
          width = MAX_SIZE;
        } else if (height > width && height > MAX_SIZE) {
          width = Math.round((width * MAX_SIZE) / height);
          height = MAX_SIZE;
        } else if (width === height && width > MAX_SIZE) {
          width = height = MAX_SIZE;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Failed to compress image'));
            return;
          }
          
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error('Failed to read compressed image'));
          reader.readAsDataURL(blob);
        }, 'image/jpeg', 0.8);
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  };

  /**
   * Converts Ximilar tags format to the DetectedTags format expected by FormAutoPopulationService
   */
  const convertToDetectedTagsFormat = (tags: Record<string, string>): any => {
    // Extract all available tags
    const allTags = Object.values(tags);
    
    // Categorize tags
    const result = {
      general_tags: allTags,
      fashion_tags: [] as string[],
      color_tags: [] as string[],
      dominant_colors: [] as string[],
      pattern_tags: [] as string[],
      raw_tag_confidences: {} as Record<string, number>
    };

    // Fashion tags - copy from general for now
    result.fashion_tags = [...allTags];
    
    // Extract color tags
    if (tags.color) {
      result.color_tags.push(tags.color);
      result.dominant_colors.push(tags.color);
    }
    
    // Extract pattern tags
    if (tags.pattern) {
      result.pattern_tags.push(tags.pattern);
    }
    
    // Add dummy confidences for all tags
    allTags.forEach(tag => {
      result.raw_tag_confidences[tag] = 0.9; // Assume high confidence
    });
    
    console.log('[useImageHandling] Converted to DetectedTags format:', result);
    return result;
  };
  
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

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Upload a file to Supabase storage and return a permanent URL
  const uploadFileToStorage = async (file: File): Promise<string> => {
    try {
      console.log('[useImageHandling] Uploading file to Supabase storage:', file.name);
      
      // Get file extension from file name
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      
      // Convert file to blob for upload
      const blob = new Blob([await file.arrayBuffer()], { type: file.type });
      
      // Use the imageService functions to upload to Supabase storage
      const { filePath } = await uploadImageBlob(blob, fileExt, 'wardrobe');
      
      // Save with proper permissions and get public URL
      const publicUrl = await saveImageToStorage(filePath, blob);
      
      console.log('[useImageHandling] File uploaded successfully to:', filePath);
      console.log('[useImageHandling] Public URL:', publicUrl);
      
      return publicUrl;
    } catch (error) {
      console.error('[useImageHandling] Error uploading file to storage:', error);
      throw new Error('Failed to upload image to storage');
    }
  };

  const handleFileSelect = async (file: File, setImageUrl: (url: string) => void) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      onImageError('Please select a valid image file (JPEG, PNG, or WebP)');
      return;
    }
    
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      onImageError('Image size must be less than 10MB');
      return;
    }
    
    try {
      // Store the original file
      setSelectedFile(file);
      
      // For immediate preview, use a compressed data URL
      const compressedImageUrl = await compressImage(file);
      setPreviewImage(compressedImageUrl);
      
      // Detect and log tags for the uploaded file while uploading to storage
      detectAndLogTags(file).catch(error => {
        console.error('[useImageHandling] Error detecting tags:', error);
      });
      
      // Upload the file to Supabase storage (this gives us a permanent URL)
      const storedImageUrl = await uploadFileToStorage(file);
      
      // Update the form with the permanent storage URL
      setImageUrl(storedImageUrl);
      onImageSuccess();
      
      // Reset any background removal state when new image is selected
      onNewImageSelected?.();
    } catch (error) {
      console.error('[useImageHandling] Error processing image:', error);
      onImageError('Failed to process image');
    }
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
    
    // Check if this is a retail site image that might have CORS issues
    const isRetailSite = isKnownRetailSite(url);
    
    if (isRetailSite) {
      console.log('[useImageHandling] Retail site image detected. Using server-side saving:', url);
      setIsDownloadingImage(true);
      
      try {
        // Import the imageService functions we need
        const { saveImageFromUrl } = await import('../../../../../../services/core/imageService');
        
        // Save the image to our backend storage
        const savedImageUrl = await saveImageFromUrl(url, 'retail-images');
        console.log('[useImageHandling] Image saved to backend storage:', savedImageUrl);
        
        // Update state with the saved image URL
        setImageUrl(savedImageUrl);
        setPreviewImage(savedImageUrl);
        onImageSuccess();
        
        // Detect and log tags for the URL image
        try {
          await detectAndLogTags(savedImageUrl);
        } catch (tagError) {
          console.error('Error detecting tags for saved image:', tagError);
        }
      } catch (error) {
        console.error('[useImageHandling] Error saving retail site image:', error);
        onImageError('Failed to save image from retail site. Please try uploading the image directly.');
      } finally {
        setIsDownloadingImage(false);
      }
    } else {
      // Regular image URL handling - preview immediately
      setPreviewImage(url);
      
      try {
        // Import fetch utilities
        const { fetchImageFromUrl } = await import('../../../../../../services/core/imageService');
        
        // Fetch the image as a blob
        console.log('[useImageHandling] Fetching non-retail URL image:', url);
        const { blob, fileExt } = await fetchImageFromUrl(url);
        
        // Upload to storage for consistency with other images
        const { filePath } = await uploadImageBlob(blob, fileExt, 'wardrobe');
        const storedUrl = await saveImageToStorage(filePath, blob);
        
        // Update with permanent URL
        setImageUrl(storedUrl);
        console.log('[useImageHandling] Non-retail URL image stored at:', storedUrl);
        
        // Detect and log tags for the URL image
        await detectAndLogTags(url);
        
        onImageSuccess();
      } catch (error) {
        console.error('[useImageHandling] Error processing URL image:', error);
        onImageError('Failed to process image URL');
      }
    }
  };
  
  // Helper function to check if a URL is from a known retail site with CORS issues
  const isKnownRetailSite = (url: string): boolean => {
    try {
      console.log('[useImageHandling] Checking if URL is from a known retail site:', url);
      const retailDomains = [
        'reserved.com',
        'static.reserved.com',
        'shop.mango.com',
        'mango.com',
        'zara.com',
        'hm.com',
        'asos.com',
        'nordstrom.com'
      ];
      
      const domain = new URL(url).hostname;
      const isRetail = retailDomains.some(retailDomain => domain.includes(retailDomain));
      console.log('[useImageHandling] URL domain:', domain, 'Is retail site:', isRetail);
      return isRetail;
    } catch (e) {
      return false;
    }
  };

  /**
   * Handles retail site images that can't be directly loaded due to CORS restrictions
   * @param imageUrl URL of the retail site image
   * @param setImageUrl Function to set the image URL in the form
   */
  const handleRetailSiteImage = (imageUrl: string, setImageUrl: (url: string) => void) => {
    // Clear any previous errors
    onImageError('');
    
    setIsDownloadingImage(false);
    
    // Set a user-friendly error message with guidance
    onImageError('This retailer restricts direct image access. Please save the image to your device first, then upload it directly.');
    
    // Optionally open the image in a new tab to help the user download it
    window.open(imageUrl, '_blank');
  };

  /**
   * Handles loading an image from a URL
   * @param url The URL to load the image from
   * @param setImageUrl Function to set the image URL in the form
   */
  const handleUrlLoad = async (url: string, setImageUrl: (url: string) => void) => {
    setIsDownloadingImage(true);
    onImageError('');
    
    try {
      // Import the image proxy service
      const { fetchImageViaProxy } = await import('../../../../../../services/core');
      
      // Fetch the image via proxy to get a blob and extension
      const { blob, fileExt } = await fetchImageViaProxy(url);
      
      // Convert blob to File object
      const fileName = `image-from-url.${fileExt}`;
      const file = new File([blob], fileName, { type: blob.type });
      
      // Use the existing file selection logic
      handleFileSelect(file, setImageUrl);
      
      // Reset processed state when new image is loaded
      onBackgroundRemovalReset?.();
      
      // Store the original URL
      setImageUrl(url);
      
      // Mark that this image came from URL AFTER everything else
      setTimeout(() => {
        onSetIsImageFromUrl?.(true);
        console.log('Set isImageFromUrl to true for URL image');
      }, 100);
    } catch (error) {
      console.error('Failed to load image from URL:', error);
      
      // Check for special retail site errors
      if (error instanceof Error && error.message.includes('RETAIL_SITE_MANUAL_DOWNLOAD_NEEDED')) {
        const imageUrl = error.message.split('RETAIL_SITE_MANUAL_DOWNLOAD_NEEDED:')[1];
        handleRetailSiteImage(imageUrl, setImageUrl);
        return;
      }
      
      // Handle other errors
      let errorMessage = 'Failed to load image from URL. Please check the URL and try again.';
      
      // More descriptive error for specific cases
      if (error instanceof Error) {
        if (error.message.includes('403') || error.message.includes('Forbidden')) {
          errorMessage = 'This retailer blocks image access. Try downloading the image and uploading it directly.';
        } else if (error.message.includes('429') || error.message.includes('Too Many Requests')) {
          errorMessage = 'Too many requests to our image service. Please try again in a few minutes.';
        } else if (error.message.includes('Proxy fetch failed')) {
          errorMessage = 'Image proxy service is currently unavailable. Try downloading and uploading the image.';
        }
      }
      
      onImageError(errorMessage);
      onSetIsImageFromUrl?.(false);
    } finally {
      setIsDownloadingImage(false);
    }
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
