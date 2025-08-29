import { useState } from 'react';
import { claudeService } from '../services/claudeService';
import { DetectedTags } from '../services/formAutoPopulation/types';
import { WishlistStatus } from '../types';

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
    setImageLink('');
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
      if (isFileUpload) {
        // Handle file upload logic
        // ... (extracted from original component)
      } else {
        // Handle URL processing
        base64Image = imageLink;
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
  };
};
