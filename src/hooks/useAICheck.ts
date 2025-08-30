import { useState } from 'react';
import { claudeService } from '../services/claudeService';
import { DetectedTags } from '../services/formAutoPopulation/types';
import { WishlistStatus } from '../types';
import axios from 'axios';

export const useAICheck = () => {
  const [imageLink, setImageLink] = useState('');
  const [isFileUpload, setIsFileUpload] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [itemCheckResponse, setItemCheckResponse] = useState<string | null>(null);
  const [itemCheckScore, setItemCheckScore] = useState<number | undefined>();
  const [itemCheckStatus, setItemCheckStatus] = useState<WishlistStatus | undefined>();
  const [extractedTags, setExtractedTags] = useState<DetectedTags | null>(null);
  const [errorType, setErrorType] = useState('');
  const [errorDetails, setErrorDetails] = useState('');

  const handleFileUpload = (file: File) => {
    setUploadedFile(file);
    setIsFileUpload(true);
    
    // Create object URL for preview
    const objectUrl = URL.createObjectURL(file);
    setImageLink(objectUrl);
  };

  const handleProcessedImageChange = (base64Image: string) => {
    setImageLink(base64Image);
  };

  const checkItem = async () => {
    if (!imageLink.trim()) {
      setError('Please provide an image link to check.');
      return null;
    }

    setIsLoading(true);
    setError('');
    setItemCheckResponse(null);
    setErrorType('');
    setErrorDetails('');

    try {
      let analysisResult = '';
      let score = 0;
      let status: WishlistStatus = WishlistStatus.NOT_REVIEWED;
      let base64Image = '';
      let detectedTags: DetectedTags | null = null;

      // Handle image processing and analysis
      if (isFileUpload && uploadedFile) {
        // Convert file to base64 for API
        base64Image = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            // Remove the data URL prefix if present
            const base64String = reader.result as string;
            resolve(base64String.split(',')[1] || base64String);
          };
          reader.onerror = reject;
          reader.readAsDataURL(uploadedFile);
        });
      } else {
        // Handle URL processing - ensure it's a data URL or convert it
        if (imageLink.startsWith('data:image')) {
          base64Image = imageLink.split(',')[1] || imageLink;
        } else if (imageLink.startsWith('blob:')) {
          // If it's a blob URL, we need to fetch and convert it
          const response = await fetch(imageLink);
          const blob = await response.blob();
          base64Image = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              const base64String = reader.result as string;
              resolve(base64String.split(',')[1] || base64String);
            };
            reader.readAsDataURL(blob);
          });
        } else {
          // Regular URL
          base64Image = imageLink;
        }
      }

      // Call Claude API for analysis
      const response = await claudeService.analyzeWardrobeItem(base64Image);
      analysisResult = response.analysis;
      score = response.score || 0;
      
      // Determine status based on score
      if (score >= 8) {
        status = WishlistStatus.APPROVED;
      } else if (score >= 6) {
        status = WishlistStatus.POTENTIAL_ISSUE;
      }

      setItemCheckResponse(analysisResult);
      setItemCheckScore(score);
      setItemCheckStatus(status);
      setExtractedTags(detectedTags);

      return { analysisResult, score, status, detectedTags };
    } catch (err) {
      console.error('Error checking item:', err);
      setError('Failed to analyze the outfit. Please try again.');
      setErrorType('Analysis Failed');
      setErrorDetails(err instanceof Error ? err.message : 'Unknown error occurred');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const resetCheck = () => {
    setImageLink('');
    setIsFileUpload(false);
    setUploadedFile(null);
    setItemCheckResponse(null);
    setItemCheckScore(undefined);
    setItemCheckStatus(undefined);
    setExtractedTags(null);
    setError('');
    setErrorType('');
    setErrorDetails('');
  };

  // Function to fetch tags from Ximilar API for an image
  const fetchTags = async (imageUrl: string): Promise<DetectedTags | null> => {
    try {
      console.log('[useAICheck] Fetching tags for image from Ximilar API');
      setIsLoading(true); // Show loading state while fetching tags
      setError(''); // Clear any previous errors
      
      let base64Image = '';

      // Process the image URL to get base64 data
      if (imageUrl.startsWith('data:image')) {
        // Already a data URL, extract base64 part
        base64Image = imageUrl.split(',')[1] || imageUrl;
      } else if (imageUrl.startsWith('blob:')) {
        // Convert blob URL to base64
        try {
          const response = await fetch(imageUrl);
          const blob = await response.blob();
          base64Image = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              const base64String = reader.result as string;
              resolve(base64String.split(',')[1] || base64String);
            };
            reader.readAsDataURL(blob);
          });
        } catch (blobError) {
          console.error('[useAICheck] Error converting blob URL to base64:', blobError);
          throw new Error('Failed to process image data');
        }
      } else {
        // For URLs, we'll let the server handle fetching the image
        // Just pass the URL as is
        base64Image = imageUrl;
      }

      // Call API to get fashion tags
      console.log('[useAICheck] Calling /api/extract-fashion-tags endpoint');
      const response = await axios.post('/api/extract-fashion-tags', { imageBase64: base64Image });
      
      if (response.data && response.data.tags) {
        const tags = response.data.tags as DetectedTags;
        setExtractedTags(tags); // Store in state for later use
        console.log('[useAICheck] Successfully fetched tags:', tags);
        setIsLoading(false); // Hide loading state
        return tags;
      } else {
        console.warn('[useAICheck] API response missing tags property:', response.data);
        setError('Failed to extract tags from image');
        setIsLoading(false);
        return null;
      }
    } catch (error) {
      console.error('[useAICheck] Error fetching tags:', error);
      setError('Error fetching image tags: ' + (error instanceof Error ? error.message : 'Unknown error'));
      setErrorType('FETCH_TAGS_ERROR');
      setIsLoading(false);
      return null;
    }
  };

  return {
    // State
    imageLink,
    isFileUpload,
    uploadedFile,
    isLoading,
    error,
    itemCheckResponse,
    itemCheckScore,
    itemCheckStatus,
    extractedTags,
    errorType,
    errorDetails,
    
    // Handlers
    setImageLink,
    handleFileUpload,
    handleProcessedImageChange,
    checkItem,
    resetCheck,
    fetchTags,
  };
};
