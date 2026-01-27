import axios from 'axios';
import { WardrobeItem } from '../../types';
import type { WardrobeItemAnalysis } from './types';
import { getAuthHeaders } from './authService';
import { filterPreFilledData } from './aiDataProcessor';

// Backend API URL - point to the actual backend server
const API_URL = 'http://localhost:5000/api';

/**
 * Interface for AI analysis request payload
 */
interface AIAnalysisRequest {
  imageBase64: string;
  detectedTags?: any;
  climateData?: any;
  scenarios?: Array<{ id: string; name: string; description?: string; frequency?: string | number }>;
  formData?: any;
  stylingContext?: WardrobeItem[];
  similarContext?: WardrobeItem[];
  scenarioCoverage?: any[];
  userGoals?: any[];
  preFilledData?: Partial<WardrobeItem>;
  userId?: string;
}

/**
 * Call the backend AI analysis endpoint
 * @param request - Analysis request payload
 * @returns Promise with analysis response
 */
export const analyzeWardrobeItem = async (request: AIAnalysisRequest): Promise<WardrobeItemAnalysis> => {
  try {
    // Get authentication headers
    const headers = await getAuthHeaders();
    
    // Call our backend endpoint for analysis
    const response = await axios.post(
      `${API_URL}/analyze-wardrobe-item-simple`,
      request,
      { headers }
    );

    console.log('[aiApiClient] Received analysis from backend');
    
    // If the response contains error information, return it along with the fallback values
    if (response.data.error) {
      return {
        analysis: response.data.analysis || 'Error analyzing image.',
        score: response.data.score || 5.0,
        feedback: response.data.feedback || 'Could not process the image analysis.',
        error: response.data.error,
        details: response.data.details
      };
    }

    // Return the successful analysis response
    return response.data;
  } catch (error: any) {
    console.error('[aiApiClient] Error calling AI analysis endpoint:', error);
    
    // Handle network errors and other exceptions
    if (error.response) {
      // The server responded with an error status
      return {
        analysis: `Server error: ${error.response.status} ${error.response.statusText}`,
        score: 5.0,
        feedback: 'Please try again later.',
        error: 'server_error',
        details: error.response.data?.message || 'Unknown server error'
      };
    } else if (error.request) {
      // The request was made but no response was received
      return {
        analysis: 'Network error: Could not connect to the server.',
        score: 5.0,
        feedback: 'Please check your internet connection and try again.',
        error: 'network_error',
        details: 'No response received from server'
      };
    } else {
      // Something else happened
      return {
        analysis: 'Unexpected error occurred.',
        score: 5.0,
        feedback: 'Please try again.',
        error: 'unexpected_error',
        details: error.message || 'Unknown error'
      };
    }
  }
};

/**
 * Build AI analysis request payload
 * @param params - Parameters for building the request
 * @returns Formatted request payload
 */
export const buildAnalysisRequest = (params: {
  imageBase64: string;
  detectedTags?: any;
  climateData?: any;
  scenarios?: Array<{ id: string; name: string; description?: string; frequency?: string | number }>;
  formData?: any;
  stylingContext?: Partial<WardrobeItem>[];
  similarContext?: Partial<WardrobeItem>[];
  scenarioCoverage?: any[] | null;
  userGoals?: any[];
  processedPreFilledData?: WardrobeItem;
  userId?: string;
}): AIAnalysisRequest => {
  const {
    imageBase64,
    detectedTags,
    climateData,
    scenarios,
    formData,
    stylingContext,
    similarContext,
    scenarioCoverage,
    userGoals,
    processedPreFilledData,
    userId
  } = params;

  return {
    imageBase64,
    detectedTags,
    climateData,
    scenarios: scenarios && scenarios.length > 0 ? scenarios.map(({ id, name, description, frequency }) => ({
      id,
      name,
      description,
      frequency: typeof frequency === 'string' ? parseFloat(frequency) || undefined : frequency
    })) : undefined,
    // Include form data if provided
    formData: formData ? {
      ...formData,
      type: (formData as any).type
    } : undefined,
    // Include wardrobe context for enhanced analysis (filtered to reduce payload)
    stylingContext: stylingContext && stylingContext.length > 0 ? stylingContext as WardrobeItem[] : undefined,
    similarContext: similarContext && similarContext.length > 0 ? similarContext as WardrobeItem[] : undefined,
    // Include scenario coverage data calculated in frontend
    scenarioCoverage: scenarioCoverage || undefined,
    // Include user's wardrobe goals for personalized recommendations
    userGoals: userGoals && userGoals.length > 0 ? userGoals : undefined,
    // Include pre-filled data from wishlist item if available (filtered to exclude metadata)
    preFilledData: processedPreFilledData ? filterPreFilledData(processedPreFilledData) : undefined,
    // Include user ID for scenario-based filtering
    userId
  };
};
