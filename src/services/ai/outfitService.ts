import axios from 'axios';
import { WardrobeItem } from '../../types';
import { ClaudeResponse } from './types';

// Backend API URL - point to the actual backend server
const API_URL = 'http://localhost:5000/api';

/**
 * Service for handling outfit-related operations
 */
export const outfitService = {
  /**
   * Get outfit suggestions based on wardrobe items and preferences
   * @param wardrobeItems - Array of wardrobe items to use for suggestions
   * @param season - Optional season filter
   * @param preferences - Optional style preferences
   * @returns Promise with outfit suggestions or error details
   */
  async getOutfitSuggestions(
    wardrobeItems: WardrobeItem[], 
    season?: string, 
    preferences?: string
  ): Promise<ClaudeResponse> {
    try {
      // Validate input
      if (!Array.isArray(wardrobeItems)) {
        console.error('Invalid wardrobeItems array');
        return {
          message: 'Invalid wardrobe items provided. Please check your input and try again.',
          error: 'invalid_input',
          details: 'wardrobeItems must be an array'
        };
      }

      // Call our backend API with proper typing and timeout
      const response = await axios.post<ClaudeResponse>(
        `${API_URL}/outfit-suggestions`,
        {
          wardrobeItems,
          season,
          preferences
        },
        { timeout: 45000 } // 45 second timeout for outfit suggestions
      );

      // Validate response structure
      if (!response.data || typeof response.data.message !== 'string') {
        console.error('Invalid response format from outfit suggestions API:', response.data);
        return {
          message: 'Received an invalid response from the outfit suggestions service.',
          error: 'invalid_response',
          details: 'Response format is invalid'
        };
      }

      return response.data;
    } catch (error: any) {
      console.error('Error calling outfit suggestions API:', error);
      
      const errorResponse: ClaudeResponse = {
        message: 'Error connecting to outfit suggestions service. Please try again later.',
        error: 'api_error',
        details: error.message
      };
      
      if (error.code === 'ECONNABORTED') {
        errorResponse.message = 'The outfit suggestions request timed out. Please try again with fewer items or different criteria.';
        errorResponse.error = 'timeout';
      } else if (error.response?.data) {
        errorResponse.details = error.response.data.message || JSON.stringify(error.response.data);
      }
      
      return errorResponse;
    }
  }
};
