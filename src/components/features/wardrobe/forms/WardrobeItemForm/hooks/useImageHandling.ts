import { useState, useCallback } from 'react';
import { detectImageTags, extractTopTags } from '../../../../../../services/ximilarService';

interface UseImageHandlingProps {
  initialImageUrl?: string;
  onImageError: (error: string) => void;
  onImageSuccess: () => void;
  onNewImageSelected?: () => void;
  onTagsDetected?: (tags: any) => void;
}

export const useImageHandling = ({ 
  initialImageUrl = '', 
  onImageError, 
  onImageSuccess,
  onNewImageSelected,
  onTagsDetected
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
      
      const compressedImageUrl = await compressImage(file);
      setImageUrl(compressedImageUrl);
      setPreviewImage(compressedImageUrl);
      onImageSuccess();
      
      // Detect and log tags for the uploaded file
      await detectAndLogTags(file);
      
      // Reset any background removal state when new image is selected
      onNewImageSelected?.();
    } catch (error) {
      console.error('Error processing image:', error);
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
    setImageUrl(url);
    if (url) {
      setPreviewImage(url);
      onImageSuccess();
      
      // Detect and log tags for the URL image
      try {
        await detectAndLogTags(url);
      } catch (error) {
        console.error('Error detecting tags for URL image:', error);
      }
    } else {
      setPreviewImage(null);
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
    compressImage
  };
};
