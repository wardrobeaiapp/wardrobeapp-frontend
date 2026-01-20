import { useState } from 'react';
import { WishlistStatus, WardrobeItem } from '../../types';
import { DetectedTags } from '../../services/ai/formAutoPopulation/types';
import { useImageHandling } from './useImageHandling';
import { useTagDetection } from './useTagDetection';
import { useAIAnalysis } from './useAIAnalysis';
import { useAICheckPersistence } from './useAICheckPersistence';

export const useAICheck = () => {
  // Use the extracted image handling hook
  const imageHandling = useImageHandling();
  // Use the extracted tag detection hook  
  const tagDetection = useTagDetection();
  // Use the extracted AI analysis hook
  const aiAnalysis = useAIAnalysis();
  // Use the extracted persistence hook
  const persistence = useAICheckPersistence();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [itemSubcategory, setItemSubcategory] = useState('');
  const [errorType, setErrorType] = useState('');
  const [errorDetails, setErrorDetails] = useState('');

  const handleFileUpload = (file: File) => {
    imageHandling.setFile(file);
  };

  const handleProcessedImageChange = (base64Image: string) => {
    imageHandling.setImage(base64Image);
  };

  const checkItem = async (formData?: { category: string; subcategory: string; seasons: string[] }, preFilledData?: WardrobeItem) => {
    if (!imageHandling.imageLink.trim()) {
      setError('Please provide an image link to check.');
      return null;
    }

    setIsLoading(true);
    setError('');
    setErrorType('');
    setErrorDetails('');

    try {
      let analysisResult = '';
      let score = 0;
      let status: WishlistStatus = WishlistStatus.NOT_REVIEWED;
      let base64Image = '';
      let detectedTags: DetectedTags | null = null;

      // Handle image processing and analysis
      if (imageHandling.isFileUpload && imageHandling.uploadedFile) {
        base64Image = await imageHandling.getBase64Image();
      } else {
        // Handle URL processing - ensure it's a data URL or convert it
        if (imageHandling.imageLink.startsWith('data:image')) {
          base64Image = imageHandling.imageLink.split(',')[1] || imageHandling.imageLink;
        } else if (imageHandling.imageLink.startsWith('blob:')) {
          // If it's a blob URL, we need to fetch and convert it
          const response = await fetch(imageHandling.imageLink);
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
          base64Image = imageHandling.imageLink;
        }
      }

      // Store subcategory from formData
      if (formData?.subcategory) {
        setItemSubcategory(formData.subcategory);
      }

      // Call AI analysis using the extracted hook
      const analysisResponse = await aiAnalysis.analyzeItem(base64Image, detectedTags, formData, preFilledData || {} as WardrobeItem);
      if (!analysisResponse) {
        throw new Error('AI analysis failed');
      }
      
      analysisResult = analysisResponse.analysisResult;
      score = analysisResponse.score;
      status = analysisResponse.status;
      
      tagDetection.setExtractedTags(detectedTags);

      // Save analysis results using the persistence hook
      if (preFilledData) {
        await persistence.saveAnalysisResults(
          analysisResult,
          score,
          status,
          analysisResponse.response,
          imageHandling.imageLink,
          preFilledData
        );
      }

      // Data extraction complete

      return { 
        analysisResult, 
        status, 
        detectedTags,
        response: analysisResponse.response
      };
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
    imageHandling.resetImage();
    tagDetection.setExtractedTags(null);
    setItemSubcategory('');
    setError('');
    setErrorType('');
    setErrorDetails('');
  };


  // Compute recommendation action from score (same logic as backend had)
  const recommendationAction = (() => {
    if (aiAnalysis.itemCheckScore === undefined) return '';
    if (aiAnalysis.itemCheckScore >= 8) return 'RECOMMEND';
    if (aiAnalysis.itemCheckScore >= 6) return 'MAYBE';
    return 'SKIP';
  })();

  // Wrapper for fetchTags that handles error state
  const fetchTags = async (imageUrl: string) => {
    try {
      setError('');
      setErrorType('');
      const result = await tagDetection.fetchTags(imageUrl);
      if (result === null) {
        setError('Error fetching image tags');
        setErrorType('FETCH_TAGS_ERROR');
      }
      return result;
    } catch (error) {
      setError('Error fetching image tags');
      setErrorType('FETCH_TAGS_ERROR');
      return null;
    }
  };

  return {
    // State
    imageLink: imageHandling.imageLink,
    isFileUpload: imageHandling.isFileUpload,
    uploadedFile: imageHandling.uploadedFile,
    isLoading,
    error,
    itemCheckResponse: aiAnalysis.itemCheckResponse,
    itemCheckScore: aiAnalysis.itemCheckScore,
    itemCheckStatus: aiAnalysis.itemCheckStatus,
    extractedTags: tagDetection.extractedTags,
    recommendationAction, // Computed from score
    recommendationText: aiAnalysis.recommendationText,
    suitableScenarios: aiAnalysis.suitableScenarios, // Clean scenarios for display
    compatibleItems: aiAnalysis.compatibleItems, // Compatible items by category for display
    outfitCombinations: aiAnalysis.outfitCombinations, // Complete outfit recommendations
    seasonScenarioCombinations: aiAnalysis.seasonScenarioCombinations, // Season + scenario completion status
    coverageGapsWithNoOutfits: aiAnalysis.coverageGapsWithNoOutfits, // Coverage gaps with 0 outfits
    itemSubcategory, // Item subcategory from form data
    errorType,
    errorDetails,
    
    // Handlers
    setImageLink: imageHandling.setImage,
    handleFileUpload,
    handleProcessedImageChange,
    checkItem,
    resetCheck,
    fetchTags,
  };
};
