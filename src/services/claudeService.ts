import axios from 'axios';
import { ClaudeResponse, Outfit, WardrobeItem } from '../types';

// Backend API URL
const API_URL = 'http://localhost:5000/api';

export const claudeService = {
  /**
   * Get outfit suggestions based on wardrobe items and preferences
   */
  async getOutfitSuggestions(
    wardrobeItems: WardrobeItem[],
    occasion?: string,
    season?: string,
    preferences?: string
  ): Promise<ClaudeResponse> {
    try {
      // Call our backend API
      const response = await axios.post(`${API_URL}/outfit-suggestions`, {
        wardrobeItems,
        occasion,
        season,
        preferences
      });

      return response.data as ClaudeResponse;
    } catch (error) {
      console.error('Error calling outfit suggestions API:', error);
      return {
        message: 'Error connecting to outfit suggestions API. Please try again later.',
      };
    }
  },

  /**
   * Get style advice for a specific outfit
   */
  async getStyleAdvice(outfit: Outfit, wardrobeItems: WardrobeItem[]): Promise<string> {
    try {
      // Call our backend API
      const response = await axios.post(`${API_URL}/style-advice`, {
        outfit,
        wardrobeItems
      });

      return response.data.styleAdvice;
    } catch (error) {
      console.error('Error calling style advice API:', error);
      return 'Error connecting to style advice API. Please try again later.';
    }
  }
};
