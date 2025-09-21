import { useState } from 'react';
import { claudeService } from '../../services/ai/claudeService';
import { DetectedTags } from '../../services/ai/formAutoPopulation/types';
import { WishlistStatus, WardrobeItem } from '../../types';
import { detectImageTags, extractTopTags } from '../../services/ai/ximilarService';

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
  const [finalRecommendation, setFinalRecommendation] = useState<string>('');
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

  const checkItem = async (formData?: { category: string; subcategory: string; seasons: string[] }, preFilledData?: WardrobeItem) => {
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
      const response = await claudeService.analyzeWardrobeItem(base64Image, detectedTags || undefined, formData, preFilledData);
      analysisResult = response.analysis;
      score = response.score || 0;
      
      // Determine status based on score
      if (score >= 8) {
        status = WishlistStatus.APPROVED;
      } else {
        status = WishlistStatus.POTENTIAL_ISSUE;
      }

      setItemCheckResponse(analysisResult);
      setItemCheckScore(score);
      setItemCheckStatus(status);
      setExtractedTags(detectedTags);
      setFinalRecommendation(response.finalRecommendation || '');

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
    setFinalRecommendation('');
    setError('');
    setErrorType('');
    setErrorDetails('');
  };

  /**
   * Converts Ximilar tags format to the DetectedTags format expected by FormAutoPopulationService
   */
  const convertToDetectedTagsFormat = (tags: Record<string, string>): DetectedTags => {
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
    
    console.log('[useAICheck] Converted to DetectedTags format:', result);
    return result;
  };
  
  // Function to fetch tags from Ximilar API for an image - uses the same service as WardrobeItemForm
  const fetchTags = async (imageUrl: string): Promise<DetectedTags | null> => {
    try {
      console.log('[useAICheck] Fetching tags for image from Ximilar API');
      setIsLoading(true); // Show loading state while fetching tags
      setError(''); // Clear any previous errors
      
      let processedImageUrl = imageUrl;

      // Process the image URL to get appropriate format for the API
      console.log('[useAICheck] Processing image URL type:', imageUrl.startsWith('data:') ? 'already base64' : imageUrl.startsWith('blob:') ? 'blob URL' : 'regular URL');
      
      if (imageUrl.startsWith('blob:')) {
        // Convert blob URL to base64
        try {
          console.log('[useAICheck] Converting blob URL to base64');
          const response = await fetch(imageUrl);
          const blob = await response.blob();
          processedImageUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              resolve(reader.result as string);
            };
            reader.readAsDataURL(blob);
          });
          console.log('[useAICheck] Successfully converted blob to base64');
        } catch (blobError) {
          console.error('[useAICheck] Error converting blob URL to base64:', blobError);
          throw new Error('Failed to process image data');
        }
      } else if (!imageUrl.startsWith('data:') && !imageUrl.startsWith('http')) {
        // If it's not a base64, blob, or http URL, it might be a relative path
        // Try to convert to a full URL
        console.log('[useAICheck] Converting relative path to full URL');
        processedImageUrl = window.location.origin + imageUrl;
        console.log('[useAICheck] Converted to full URL:', processedImageUrl);
      }

      // Call Ximilar API directly using the same service as WardrobeItemForm
      console.log('[useAICheck] Calling Ximilar API for tag detection with:', processedImageUrl.substring(0, 50) + '...');
      const response = await detectImageTags(processedImageUrl);
      
      // Extract tags using the same method as WardrobeItemForm
      const rawTags = extractTopTags(response);
      
      // Convert to the format expected by FormAutoPopulationService
      const formattedTags = convertToDetectedTagsFormat(rawTags);
      
      // Log detailed information for debugging
      console.log('[useAICheck] Raw Ximilar API response status:', response.status);
      console.log('[useAICheck] Records count:', response.records?.length);
      if (response.records?.[0]) {
        console.log('[useAICheck] Record has _tags_map?', !!response.records[0]._tags_map);
        console.log('[useAICheck] Record has _tags?', !!response.records[0]._tags);
        
        // Check for category-related tags specifically
        const categoryTags = Object.entries(rawTags)
          .filter(([key]) => key.toLowerCase().includes('category') || key.toLowerCase().includes('type'))
          .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});
        console.log('[useAICheck] Category-related tags:', categoryTags);
      }
      
      console.log('[useAICheck] All extracted raw tags:', rawTags);
      console.log('[useAICheck] Formatted DetectedTags:', formattedTags);
      
      setExtractedTags(formattedTags); // Store in state for later use
      setIsLoading(false); // Hide loading state
      return formattedTags;
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
    finalRecommendation,
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
