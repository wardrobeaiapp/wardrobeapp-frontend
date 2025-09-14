import axios from 'axios';
import { DetectedTags, WardrobeItem } from '../../types/wardrobe';
import { compressImageToMaxSize } from '../../utils/imageUtils';
import { Outfit, ClaudeResponse as BaseClaudeResponse, ItemCategory } from '../../types';
import { getClimateData } from '../profile/climateService';
import { supabase } from '../core/supabase';
import { getScenariosForUser } from '../scenarios/scenariosService';
import { getWardrobeItems } from '../wardrobe/items';

// Import the Scenario type from scenarios service
import type { Scenario } from '../scenarios/types';

// Extend the base ClaudeResponse to include outfits
interface ClaudeResponse extends BaseClaudeResponse {
  outfits?: Outfit[];
  error?: string;
  details?: string;
}

interface StyleAdviceResponse {
  styleAdvice: string;
  error?: string;
  details?: string;
}


// Backend API URL - point to the actual backend server
const API_URL = 'http://localhost:5000/api';
// Anthropic API URL - no longer used as we're using backend proxy instead
// const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

export const claudeService = {
  /**
   * Get outfit suggestions based on wardrobe items and preferences
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
  },

  /**
   * Get style advice for a specific outfit
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
  },

  /**
   * Analyze a wardrobe item image using Claude Vision
   * @param imageBase64 - Base64 encoded image data (with data URI prefix)
   * @param detectedTags - Optional object with tags detected from the image
   * @returns Promise with analysis, score, and feedback
   */
  async analyzeWardrobeItem(imageBase64: string, detectedTags?: DetectedTags, formData?: { category?: string; subcategory?: string; seasons?: string[] }): Promise<{
    analysis: string;
    score: number;
    feedback: string;
    error?: string;
    details?: string;
  }> {
    try {

      // Validate image data before sending to server
      if (!imageBase64) {
        console.error('[claudeService] No image data provided');
        return {
          analysis: 'Error: No image data provided.',
          score: 5.0,
          feedback: 'Please upload an image to analyze.',
          error: 'missing_image',
          details: 'No image data was provided for analysis.'
        };
      }

      // Check if image data is too small (likely invalid)
      // Log the length for debugging
      console.log('[claudeService] Image data length:', imageBase64.length, 'starts with:', imageBase64.substring(0, 50));
      console.log('[claudeService] Form data:', formData);
      
      if (imageBase64.length < 50) {
        console.error('[claudeService] Image data too small to be valid');
        return {
          analysis: 'Error: The provided image data appears incomplete.',
          score: 5.0,
          feedback: 'Please try uploading the image again with a complete file.',
          error: 'invalid_image',
          details: 'The provided image data is too small to be valid.'
        };
      }
      
      // More aggressive image size handling with tiered approach
      const originalSize = imageBase64.length;
      console.log(`[claudeService] Original image size: ${originalSize} bytes`);
      
      try {
        // Tier 1: Images over 4MB - very aggressive compression needed
        if (originalSize > 4000000) {
          console.log('[claudeService] Very large image detected (>4MB), applying maximum compression');
          imageBase64 = await compressImageToMaxSize(imageBase64, 800000);
        }
        // Tier 2: Images between 1-4MB - standard compression
        else if (originalSize > 1000000) {
          console.log('[claudeService] Large image detected (>1MB), applying standard compression');
          imageBase64 = await compressImageToMaxSize(imageBase64, 900000);
        }
        // Tier 3: Images between 800KB-1MB - light compression
        else if (originalSize > 800000) {
          console.log('[claudeService] Medium image detected (>800KB), applying light compression');
          imageBase64 = await compressImageToMaxSize(imageBase64, 750000);
        }

        console.log(`[claudeService] Compression result: ${originalSize} → ${imageBase64.length} bytes (${Math.round(imageBase64.length/originalSize*100)}%)`);
      } catch (resizeError) {
        console.error('[claudeService] Error compressing image:', resizeError);
        // If compression fails and image is too large, use simple truncation as last resort
        if (imageBase64.length > 1500000) {
          console.warn('[claudeService] Compression failed, using fallback truncation');
          imageBase64 = imageBase64.substring(0, 1000000);
        }
      }

      console.log('[claudeService] Sending image to backend for Claude analysis');
      
      // Get current user from Supabase and their preferences
      let climateData = null;
      let scenarios: Scenario[] = [];
      let wardrobeItems: WardrobeItem[] = [];
      
      try {
        // Get the current authenticated user
        const { data: { user } } = await supabase.auth.getUser();
        
        // Fetch user data if user is logged in
        if (user?.id) {
          try {            
            // Fetch climate data
            climateData = await getClimateData(user.id);
            console.log('[claudeService] Climate data loaded successfully:', climateData);
            
            // Fetch user's scenarios using the scenarios service
            try {
              scenarios = await getScenariosForUser(user.id);
              console.log(`[claudeService] Loaded ${scenarios.length} scenarios`);
            } catch (scenariosError) {
              console.error('[claudeService] Error fetching scenarios:', scenariosError);
            }
            
            // Fetch user's wardrobe items for context
            try {
              wardrobeItems = await getWardrobeItems(user.id);
              console.log(`[claudeService] Loaded ${wardrobeItems.length} wardrobe items for context`);
            } catch (wardrobeError) {
              console.error('[claudeService] Error fetching wardrobe items:', wardrobeError);
            }
          } catch (dataError) {
            console.error('[claudeService] Error loading user data:', dataError);
            // Continue without preferences/climate/scenarios if there's an error
          }
        } else {
          console.log('[claudeService] No authenticated user found, proceeding without user data');
        }
      } catch (authError) {
        console.error('[claudeService] Error getting authenticated user:', authError);
        // Continue without user data if there's an auth error
      }
      
      // Generate styling context (similar items based on category, subcategory, and season)
      let stylingContext: WardrobeItem[] = [];
      let gapAnalysisContext: WardrobeItem[] = [];
      
      if (wardrobeItems.length > 0 && formData) {
        console.log('[claudeService] Debug - formData:', formData);
        console.log('[claudeService] Debug - All wardrobe items:', wardrobeItems.map(item => ({ name: item.name, category: item.category, subcategory: item.subcategory })));
        
        // Filter for styling context - items that complement the new item for styling analysis
        stylingContext = wardrobeItems.filter(item => {
          // Common season matching logic
          const matchesSeason = formData.seasons?.some(season => 
            item.season?.includes(season as any)
          ) ?? true; // If no seasons specified, include all
          
          // For top/t-shirt, select complementary categories: bottoms, footwear, outerwear
          if (formData.category === ItemCategory.TOP && formData.subcategory?.toLowerCase() === 't-shirt') {
            console.log(`[claudeService] Debug - checking item: ${item.name}, category: ${item.category}, season: ${item.season}`);
            
            const matchesCategory = [ItemCategory.BOTTOM, ItemCategory.FOOTWEAR, ItemCategory.OUTERWEAR].includes(item.category as ItemCategory);
            
            console.log(`[claudeService] Debug - matchesCategory: ${matchesCategory}, matchesSeason: ${matchesSeason}`);
            
            return matchesCategory && matchesSeason;
          }
          
          // For top/shirt, select complementary categories + specific accessories
          if (formData.category === ItemCategory.TOP && formData.subcategory?.toLowerCase() === 'shirt') {
            console.log(`[claudeService] Debug - checking item: ${item.name}, category: ${item.category}, subcategory: ${item.subcategory}, season: ${item.season}`);
            
            const matchesMainCategories = [ItemCategory.BOTTOM, ItemCategory.FOOTWEAR, ItemCategory.OUTERWEAR].includes(item.category as ItemCategory);
            
            const matchesAccessories = (item.category as string) === ItemCategory.ACCESSORY && 
              ['scarf', 'belt', 'bag', 'jewelry', 'watch', 'ties'].includes(item.subcategory?.toLowerCase() || '');
            
            console.log(`[claudeService] Debug - matchesMainCategories: ${matchesMainCategories}, matchesAccessories: ${matchesAccessories}, matchesSeason: ${matchesSeason}`);
            
            return (matchesMainCategories || matchesAccessories) && matchesSeason;
          }

          if (formData.category === ItemCategory.TOP && formData.subcategory?.toLowerCase() === 'Blouse') {
            console.log(`[claudeService] Debug - checking item: ${item.name}, category: ${item.category}, subcategory: ${item.subcategory}, season: ${item.season}`);
            
            const matchesMainCategories = [ItemCategory.BOTTOM, ItemCategory.FOOTWEAR, ItemCategory.OUTERWEAR].includes(item.category as ItemCategory);
            
            const matchesAccessories = (item.category as string) === ItemCategory.ACCESSORY && 
              ['scarf', 'belt', 'bag', 'jewelry', 'watch'].includes(item.subcategory?.toLowerCase() || '');
            
            console.log(`[claudeService] Debug - matchesMainCategories: ${matchesMainCategories}, matchesAccessories: ${matchesAccessories}, matchesSeason: ${matchesSeason}`);
            
            return (matchesMainCategories || matchesAccessories) && matchesSeason;
          }
          
          return false; // No other category/subcategory logic implemented yet
        });
        
        // Filter for gap analysis context - items from same category for comparison
        gapAnalysisContext = wardrobeItems.filter(item => {
          const matchesCategory = item.category === formData.category;
          const matchesSeason = formData.seasons?.some(season => 
            item.season?.includes(season as any)
          ) ?? true; // If no seasons specified, include all
          
          return matchesCategory && matchesSeason;
        });
        
        console.log(`[claudeService] Generated styling context: ${stylingContext.length} items`);
        stylingContext.forEach(item => console.log(`[claudeService] Styling context item: ${item.name}`));
        console.log(`[claudeService] Generated gap analysis context: ${gapAnalysisContext.length} items`);
      }
      
      // Call our backend endpoint instead of Claude API directly (avoids CORS issues)
      const response = await axios.post(
        `${API_URL}/analyze-wardrobe-item`,
        {
          imageBase64,
          detectedTags,
          climateData,
          scenarios: scenarios.length > 0 ? scenarios.map(({ id, name, description }) => ({
            id,
            name,
            description
          })) : undefined,
          // Include form data if provided
          formData: formData ? {
            category: formData.category,
            subcategory: formData.subcategory,
            seasons: formData.seasons
          } : undefined,
          // Include wardrobe context for enhanced analysis
          stylingContext: stylingContext.length > 0 ? stylingContext : undefined,
          gapAnalysisContext: gapAnalysisContext.length > 0 ? gapAnalysisContext : undefined
        }
      );

      console.log('[claudeService] Received analysis from backend');
      
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
      
      // The backend already parses and structures the response for us
      return {
        analysis: response.data.analysis,
        score: response.data.score,
        feedback: response.data.feedback
      };
    } catch (error: any) {
      console.error('[claudeService] Error analyzing wardrobe item with Claude:', error);
      
      // Handle different types of errors
      if (error.response) {
        // The request was made and the server responded with a status code outside of 2xx range
        console.error('[claudeService] Server error response:', error.response.data);
        return {
          analysis: 'Error analyzing image. The server encountered a problem.',
          score: 5.0,
          feedback: 'The analysis service is temporarily unavailable. Please try again later.',
          error: 'server_error',
          details: `Server responded with status ${error.response.status}: ${JSON.stringify(error.response.data)}`
        };
      } else if (error.request) {
        // The request was made but no response was received
        console.error('[claudeService] No response received:', error.request);
        return {
          analysis: 'Error analyzing image. Could not connect to the analysis service.',
          score: 5.0,
          feedback: 'Please check your internet connection and try again.',
          error: 'network_error',
          details: 'No response received from the server. The service may be down or your connection may be interrupted.'
        };
      } else {
        // Something happened in setting up the request that triggered an Error
        return {
          analysis: 'Error analyzing image. Please try again later.',
          score: 5.0,
          feedback: 'An unexpected error occurred during image analysis.',
          error: 'unknown_error',
          details: error.message || 'Unknown error occurred'
        };
      }
    }
  }
};
