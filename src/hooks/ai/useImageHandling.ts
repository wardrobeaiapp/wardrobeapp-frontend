import { useState } from 'react';

export const useImageHandling = () => {
  const [imageLink, setImageLink] = useState('');
  const [isFileUpload, setIsFileUpload] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // Set image URL for analysis
  const setImage = (url: string) => {
    setImageLink(url);
    setIsFileUpload(false);
    setUploadedFile(null);
  };

  // Set uploaded file for analysis
  const setFile = (file: File) => {
    setUploadedFile(file);
    setIsFileUpload(true);
    
    // Create object URL for preview
    const url = URL.createObjectURL(file);
    setImageLink(url);
  };

  // Reset image state
  const resetImage = () => {
    // Clean up object URL if it exists
    if (isFileUpload && imageLink) {
      URL.revokeObjectURL(imageLink);
    }
    
    setImageLink('');
    setIsFileUpload(false);
    setUploadedFile(null);
  };

  // Convert file to base64 for API calls
  const getBase64Image = async (): Promise<string> => {
    if (!uploadedFile) {
      throw new Error('No file uploaded');
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        // Remove data URL prefix (data:image/jpeg;base64,)
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(uploadedFile);
    });
  };

  return {
    // State
    imageLink,
    isFileUpload,
    uploadedFile,
    
    // Actions
    setImage,
    setFile,
    resetImage,
    getBase64Image
  };
};
