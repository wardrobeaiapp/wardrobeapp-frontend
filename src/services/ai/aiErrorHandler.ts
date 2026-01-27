import type { WardrobeItemAnalysis } from './types';

/**
 * Error types for AI analysis
 */
export type AIAnalysisErrorType = 'missing_image' | 'incomplete_image' | 'server_error' | 'network_error' | 'unknown_error';

/**
 * Error handling result
 */
export interface ErrorHandlingResult {
  analysis: string;
  score: number;
  feedback: string;
  suitableScenarios: any[];
  compatibleItems: any;
  outfitCombinations: any[];
  seasonScenarioCombinations: any[];
  error: AIAnalysisErrorType;
  details?: string;
}

/**
 * Handle image processing errors
 * @param imageResult - Result from image processing service
 * @returns Error handling result or null if no error
 */
export const handleImageProcessingError = (imageResult: any): ErrorHandlingResult | null => {
  if (!imageResult.error) {
    return null;
  }

  const isMissingImage = imageResult.error === 'missing_image';
  
  return {
    analysis: isMissingImage 
      ? 'Error: No image data provided.' 
      : 'Error: The provided image data appears incomplete.',
    score: 5.0,
    feedback: isMissingImage 
      ? 'Please upload an image to analyze.' 
      : 'Please try uploading the image again with a complete file.',
    suitableScenarios: [],
    compatibleItems: {},
    outfitCombinations: [],
    seasonScenarioCombinations: [],
    error: isMissingImage ? 'missing_image' : 'incomplete_image',
    details: imageResult.details
  };
};

/**
 * Handle API request errors
 * @param error - Error object from axios or other sources
 * @returns Error handling result
 */
export const handleApiError = (error: any): ErrorHandlingResult => {
  console.error('[aiErrorHandler] Error analyzing wardrobe item:', error);
  
  // Handle different types of errors
  if (error.response) {
    // The request was made and the server responded with a status code outside of 2xx range
    console.error('[aiErrorHandler] Server error response:', error.response.data);
    return {
      analysis: 'Error analyzing image. The server encountered a problem.',
      score: 5.0,
      feedback: 'The analysis service is temporarily unavailable. Please try again later.',
      suitableScenarios: [],
      compatibleItems: {},
      outfitCombinations: [],
      seasonScenarioCombinations: [],
      error: 'server_error',
      details: `Server responded with status ${error.response.status}: ${JSON.stringify(error.response.data)}`
    };
  } else if (error.request) {
    // The request was made but no response was received
    console.error('[aiErrorHandler] No response received:', error.request);
    return {
      analysis: 'Error analyzing image. Could not connect to the analysis service.',
      score: 5.0,
      feedback: 'Please check your internet connection and try again.',
      suitableScenarios: [],
      compatibleItems: {},
      outfitCombinations: [],
      seasonScenarioCombinations: [],
      error: 'network_error',
      details: 'No response received from the server. The service may be down or your connection may be interrupted.'
    };
  } else {
    // Something happened in setting up the request that triggered an Error
    return {
      analysis: 'Error analyzing image. Please try again later.',
      score: 5.0,
      feedback: 'An unexpected error occurred during image analysis.',
      suitableScenarios: [],
      compatibleItems: {},
      outfitCombinations: [],
      seasonScenarioCombinations: [],
      error: 'unknown_error',
      details: error.message || 'Unknown error occurred'
    };
  }
};

/**
 * Handle any error in the AI analysis workflow
 * @param error - Error object or result with error
 * @param context - Context where error occurred ('image_processing' or 'api_call')
 * @returns Error handling result
 */
export const handleAnalysisError = (error: any, context: 'image_processing' | 'api_call'): ErrorHandlingResult => {
  if (context === 'image_processing') {
    return handleImageProcessingError(error) || handleApiError(error);
  } else {
    return handleApiError(error);
  }
};

/**
 * Check if a result is an error result
 * @param result - Result to check
 * @returns True if result contains an error
 */
export const isErrorResult = (result: WardrobeItemAnalysis): boolean => {
  return !!(result as any).error;
};

/**
 * Get user-friendly error message based on error type
 * @param errorType - Type of error
 * @returns User-friendly error message
 */
export const getErrorMessage = (errorType: AIAnalysisErrorType): string => {
  switch (errorType) {
    case 'missing_image':
      return 'Please upload an image to analyze.';
    case 'incomplete_image':
      return 'The image appears to be incomplete. Please try uploading again.';
    case 'server_error':
      return 'The analysis service is temporarily unavailable. Please try again later.';
    case 'network_error':
      return 'Please check your internet connection and try again.';
    case 'unknown_error':
    default:
      return 'An unexpected error occurred. Please try again later.';
  }
};
