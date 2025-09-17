import axios from 'axios';
import { compressImageToMaxSize } from '../../utils/imageUtils';
import { getClimateData } from '../profile/climateService';
import { supabase } from '../core/supabase';
import { getScenariosForUser } from '../scenarios/scenariosService';
import { getWardrobeItems } from '../wardrobe/items';
import { filterStylingContext, filterSimilarContext, filterAdditionalContext } from './wardrobeContextHelpers';
import { WardrobeItem, ItemCategory, Season, Outfit } from '../../types';
import type { Scenario } from '../scenarios/types';
import type { StyleAdviceResponse, WardrobeItemAnalysis } from './types';
import { outfitService } from './outfitService';


// Backend API URL - point to the actual backend server
const API_URL = 'http://localhost:5000/api';
// Anthropic API URL - no longer used as we're using backend proxy instead
// const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

export const claudeService = {
  // Outfit suggestions functionality moved to outfitService
  getOutfitSuggestions: outfitService.getOutfitSuggestions,

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
  async analyzeWardrobeItem(
    imageBase64: string, 
    detectedTags?: any, 
    formData?: { category?: string; subcategory?: string; seasons?: string[] }
  ): Promise<WardrobeItemAnalysis> {
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
      
      // Generate styling and gap analysis context
      let stylingContext: WardrobeItem[] = [];
      let similarContext: WardrobeItem[] = [];
      let additionalContext: WardrobeItem[] = [];
      
      if (wardrobeItems.length > 0 && formData) {
        console.log('[claudeService] Debug - formData:', formData);
        console.log('[claudeService] Debug - detectedTags:', detectedTags);
        console.log(`[claudeService] Debug - Total wardrobe items: ${wardrobeItems.length}`);
        console.log('[claudeService] Debug - All wardrobe items:', wardrobeItems.map(item => ({ 
          name: item.name, 
          category: item.category, 
          subcategory: item.subcategory,
          seasons: item.season,
          color: item.color
        })));
        
        // Extract color from detectedTags if available
        let detectedColor: string | undefined = undefined;
        if (detectedTags) {
          // Try to find color in detectedTags
          const colorTags = ['color', 'primaryColor', 'dominantColor'].find(key => detectedTags[key]);
          if (colorTags && typeof detectedTags[colorTags] === 'string') {
            detectedColor = detectedTags[colorTags] as string;
            console.log('[claudeService] Detected color from tags:', detectedColor);
          }
          
          // Also try common color keywords in any tag values
          const allTagValues = Object.values(detectedTags).join(' ').toLowerCase();
          const commonColors = ['white', 'black', 'grey', 'gray', 'red', 'blue', 'green', 'yellow', 'pink', 'purple', 'brown', 'orange', 'beige', 'navy'];
          const foundColor = commonColors.find(color => allTagValues.includes(color));
          if (foundColor && !detectedColor) {
            detectedColor = foundColor;
            console.log('[claudeService] Found color in tag values:', detectedColor);
          }
        }
        
        // Enhanced formData with color information
        const enhancedFormData = {
          ...formData,
          color: detectedColor
        };
        
        console.log('[claudeService] Enhanced formData with color:', enhancedFormData);
        
        // Filter for styling context using helper function
        stylingContext = filterStylingContext(wardrobeItems, enhancedFormData) as WardrobeItem[];
        
        // Filter for gap analysis context using helper function
        similarContext = filterSimilarContext(wardrobeItems, enhancedFormData) as WardrobeItem[];
        
        // Filter for additional context using helper function
        additionalContext = filterAdditionalContext(wardrobeItems, enhancedFormData) as WardrobeItem[];
        
        console.log(`[claudeService] Generated styling context: ${stylingContext.length} items`);
        stylingContext.forEach(item => console.log(`[claudeService] Styling context item: ${item.name}`));
        console.log(`[claudeService] Generated gap analysis context: ${similarContext.length} items`);
        similarContext.forEach(item => console.log(`[claudeService] Similar context item: ${item.name} - ${item.category} (${item.subcategory}) - COLOR: ${item.color} - SEASONS: [${item.season?.join(',') || 'NONE'}]`));
        console.log(`[claudeService] Generated additional context: ${additionalContext.length} items`);
        additionalContext.forEach(item => console.log(`[claudeService] Additional context item: ${item.name}`));
      }

      // Calculate scenario coverage for the target category and season
      let scenarioCoverage = null;
      
      try {
        // Get the current authenticated user for scenario coverage
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user?.id && formData?.category && formData?.seasons && formData.seasons.length > 0 && scenarios.length > 0) {
          console.log(`[claudeService] Calculating scenario coverage for ${formData.category} in ALL seasons: ${formData.seasons.join(',')}`);
          
          try {
            const { getCategoryCoverageForAI } = await import('../wardrobe/scenarioCoverage/category/queries');
            
            // Get coverage for ALL selected seasons, not just the first one
            const allCoveragePromises = formData.seasons.map(season => 
              getCategoryCoverageForAI(
                user.id,
                formData.category as ItemCategory,
                season as Season,
                scenarios,
                wardrobeItems
              )
            );
            
            const allSeasonsCoverage = await Promise.all(allCoveragePromises);
            
            // Flatten and combine coverage from all seasons
            scenarioCoverage = allSeasonsCoverage.flat();
            
            console.log(`[claudeService] Generated scenario coverage for ${formData.seasons.length} seasons: ${scenarioCoverage.length} total coverage entries`);
            
            // Group by scenario and show coverage per season
            const coverageByScenario = scenarioCoverage.reduce((acc: Record<string, any[]>, coverage) => {
              const key = coverage.scenarioName;
              if (!acc[key]) acc[key] = [];
              acc[key].push(coverage);
              return acc;
            }, {});
            
            Object.entries(coverageByScenario).forEach(([scenarioName, coverages]) => {
              const seasonCoverages = (coverages as any[]).map(c => 
                `${c.season}: ${(c as any).coveragePercent || (c as any).coveragePercentage || 0}%`
              ).join(', ');
              console.log(`[claudeService] Coverage: ${scenarioName} - [${seasonCoverages}]`);
            });
            
          } catch (coverageError) {
            console.error('[claudeService] Failed to calculate scenario coverage:', coverageError);
            // Continue without scenario coverage
          }
        }
      } catch (authError) {
        console.error('[claudeService] Failed to get user for scenario coverage:', authError);
        // Continue without scenario coverage
      }
      
      // Call our backend endpoint instead of Claude API directly (avoids CORS issues)
      const response = await axios.post(
        `${API_URL}/analyze-wardrobe-item`,
        {
          imageBase64,
          detectedTags,
          climateData,
          scenarios: scenarios.length > 0 ? scenarios.map(({ id, name, description, frequency }) => ({
            id,
            name,
            description,
            frequency
          })) : undefined,
          // Include form data if provided
          formData: formData ? {
            category: formData.category,
            subcategory: formData.subcategory,
            seasons: formData.seasons
          } : undefined,
          // Include wardrobe context for enhanced analysis
          stylingContext: stylingContext.length > 0 ? stylingContext : undefined,
          similarContext: similarContext.length > 0 ? similarContext : undefined,
          additionalContext: additionalContext.length > 0 ? additionalContext : undefined,
          // Include scenario coverage data calculated in frontend
          scenarioCoverage: scenarioCoverage || undefined
        }
      );

      console.log('[claudeService] Received analysis from backend');
      
      // If the response contains error information, return it along with the fallback values
      if (response.data.error) {
        return {
          analysis: response.data.analysis || 'Error analyzing image.',
          score: response.data.score || 5.0,
          feedback: response.data.feedback || 'Could not process the image analysis.',
          finalRecommendation: response.data.finalRecommendation,
          error: response.data.error,
          details: response.data.details
        };
      }
      
      // The backend already parses and structures the response for us
      return {
        analysis: response.data.analysis,
        score: response.data.score,
        feedback: response.data.feedback,
        finalRecommendation: response.data.finalRecommendation
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
