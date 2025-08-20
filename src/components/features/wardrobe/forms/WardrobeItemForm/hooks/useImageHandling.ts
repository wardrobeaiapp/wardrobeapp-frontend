import { useState } from 'react';

interface UseImageHandlingProps {
  initialImageUrl?: string;
  onImageError: (error: string) => void;
  onImageSuccess: () => void;
}

export const useImageHandling = ({ 
  initialImageUrl = '', 
  onImageError, 
  onImageSuccess 
}: UseImageHandlingProps) => {
  const [previewImage, setPreviewImage] = useState<string | null>(initialImageUrl || null);
  const [isDownloadingImage, setIsDownloadingImage] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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

  const handleUrlChange = (
    url: string, 
    setImageUrl: (url: string) => void
  ) => {
    setImageUrl(url);
    if (url) {
      setPreviewImage(url);
      onImageSuccess();
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
    handleFileSelect,
    handleDrop,
    handleDragOver,
    handleUrlChange,
    compressImage
  };
};
