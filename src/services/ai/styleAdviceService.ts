import axios from 'axios';
import { WardrobeItem, Outfit } from '../../types';
import { StyleAdviceResponse } from './types';

// Backend API URL - point to the actual backend server
const API_URL = 'http://localhost:5000/api';

/**
 * Service for handling style advice related operations
 */
export const styleAdviceService = {
  /**
   * Get style advice for a specific outfit
   * @param outfit - The outfit to get style advice for
   * @param wardrobeItems - Array of wardrobe items to provide context
   * @returns Promise with style advice as a string
   */
  async getStyleAdvice(outfit: Outfit, wardrobeItems: WardrobeItem[]): Promise<string> {
    try {
      // Validate input
      if (!outfit || !wardrobeItems || !Array.isArray(wardrobeItems)) {
        console.error('Invalid input for style advice request');
        return 'Invalid input for style advice. Please check your request and try again.';
      }

      // Call our backend API with proper typing
      const response = await axios.post<StyleAdviceResponse>(
        `${API_URL}/style-advice`,
        { outfit, wardrobeItems },
        { timeout: 30000 } // 30 second timeout
      );

      // Handle potential missing or malformed response
      if (!response.data || typeof response.data.styleAdvice !== 'string') {
        console.error('Invalid response format from style advice API:', response.data);
        return 'Received an invalid response from the style advice service. Please try again.';
      }

      return response.data.styleAdvice;
    } catch (error: any) {
      console.error('Error calling style advice API:', error);
      
      if (error.code === 'ECONNABORTED') {
        return 'The style advice request timed out. Please try again with a smaller selection of items.';
      }
      
      return error.response?.data?.message || 
             error.message || 
             'Error connecting to style advice service. Please try again later.';
    }
  }
};
