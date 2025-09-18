import axios from 'axios';
import { compressImageToMaxSize } from '../../utils/imageUtils';
import { getClimateData } from '../profile/climateService';
import { supabase } from '../core/supabase';
import { getScenariosForUser } from '../scenarios/scenariosService';
import { getWardrobeItems } from '../wardrobe/items';
import { filterStylingContext, filterSimilarContext, filterAdditionalContext } from './wardrobeContextHelpers';
import { WardrobeItem, ItemCategory, Season } from '../../types';
import type { Scenario } from '../scenarios/types';
import type { WardrobeItemAnalysis } from './types';

// Backend API URL - point to the actual backend server
const API_URL = 'http://localhost:5000/api';

/**
 * Service for handling wardrobe item analysis operations
 */
export const wardrobeAnalysisService = {
  /**
   * Analyze a wardrobe item image using Claude Vision
   * @param imageBase64 - Base64 encoded image data (with data URI prefix)
   * @param detectedTags - Optional object with tags detected from the image
   * @param formData - Optional form data with category, subcategory, and seasons
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
        console.error('[wardrobeAnalysisService] No image data provided');
        return {
          analysis: 'Error: No image data provided.',
          score: 5.0,
          feedback: 'Please upload an image to analyze.',
          error: 'missing_image',
          details: 'No image data was provided for analysis.'
        };
      }

      // Check if image data is too small (likely invalid)
      console.log('[wardrobeAnalysisService] Image data length:', imageBase64.length, 'starts with:', imageBase64.substring(0, 50));
      console.log('[wardrobeAnalysisService] Form data:', formData);
      
      if (imageBase64.length < 50) {
        console.error('[wardrobeAnalysisService] Image data too small to be valid');
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
      console.log(`[wardrobeAnalysisService] Original image size: ${originalSize} bytes`);
      
      try {
        // Tier 1: Images over 4MB - very aggressive compression needed
        if (originalSize > 4000000) {
          console.log('[wardrobeAnalysisService] Very large image detected (>4MB), applying maximum compression');
          imageBase64 = await compressImageToMaxSize(imageBase64, 800000);
        }
        // Tier 2: Images between 1-4MB - standard compression
        else if (originalSize > 1000000) {
          console.log('[wardrobeAnalysisService] Large image detected (>1MB), applying standard compression');
          imageBase64 = await compressImageToMaxSize(imageBase64, 900000);
        }
        // Tier 3: Images between 800KB-1MB - light compression
        else if (originalSize > 800000) {
          console.log('[wardrobeAnalysisService] Medium image detected (>800KB), applying light compression');
          imageBase64 = await compressImageToMaxSize(imageBase64, 750000);
        }

        console.log(`[wardrobeAnalysisService] Compression result: ${originalSize} → ${imageBase64.length} bytes (${Math.round(imageBase64.length/originalSize*100)}%)`);
      } catch (resizeError) {
        console.error('[wardrobeAnalysisService] Error compressing image:', resizeError);
        // If compression fails and image is too large, use simple truncation as last resort
        if (imageBase64.length > 1500000) {
          console.warn('[wardrobeAnalysisService] Compression failed, using fallback truncation');
          imageBase64 = imageBase64.substring(0, 1000000);
        }
      }

      console.log('[wardrobeAnalysisService] Sending image to backend for analysis');
      
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
            console.log('[wardrobeAnalysisService] Climate data loaded successfully:', climateData);
            
            // Fetch user's scenarios using the scenarios service
            try {
              scenarios = await getScenariosForUser(user.id);
              console.log(`[wardrobeAnalysisService] Loaded ${scenarios.length} scenarios`);
            } catch (scenariosError) {
              console.error('[wardrobeAnalysisService] Error fetching scenarios:', scenariosError);
            }
            
            // Fetch user's wardrobe items for context
            try {
              wardrobeItems = await getWardrobeItems(user.id);
              console.log(`[wardrobeAnalysisService] Loaded ${wardrobeItems.length} wardrobe items for context`);
            } catch (wardrobeError) {
              console.error('[wardrobeAnalysisService] Error fetching wardrobe items:', wardrobeError);
            }
          } catch (dataError) {
            console.error('[wardrobeAnalysisService] Error loading user data:', dataError);
            // Continue without preferences/climate/scenarios if there's an error
          }
        } else {
          console.log('[wardrobeAnalysisService] No authenticated user found, proceeding without user data');
        }
      } catch (authError) {
        console.error('[wardrobeAnalysisService] Error getting authenticated user:', authError);
        // Continue without user data if there's an auth error
      }
      
      // Generate styling and gap analysis context
      let stylingContext: WardrobeItem[] = [];
      let similarContext: WardrobeItem[] = [];
      let additionalContext: WardrobeItem[] = [];
      
      if (wardrobeItems.length > 0 && formData) {
        console.log('[wardrobeAnalysisService] Debug - formData:', formData);
        console.log('[wardrobeAnalysisService] Debug - detectedTags:', detectedTags);
        console.log(`[wardrobeAnalysisService] Debug - Total wardrobe items: ${wardrobeItems.length}`);
        
        // Extract color from detectedTags if available
        let detectedColor: string | undefined = undefined;
        if (detectedTags) {
          // Try to find color in detectedTags
          const colorTags = ['color', 'primaryColor', 'dominantColor'].find(key => detectedTags[key]);
          if (colorTags && typeof detectedTags[colorTags] === 'string') {
            detectedColor = detectedTags[colorTags] as string;
            console.log('[wardrobeAnalysisService] Detected color from tags:', detectedColor);
          }
          
          // Also try common color keywords in any tag values
          const allTagValues = Object.values(detectedTags).join(' ').toLowerCase();
          const commonColors = ['white', 'black', 'grey', 'gray', 'red', 'blue', 'green', 'yellow', 'pink', 'purple', 'brown', 'orange', 'beige', 'navy'];
          const foundColor = commonColors.find(color => allTagValues.includes(color));
          if (foundColor && !detectedColor) {
            detectedColor = foundColor;
            console.log('[wardrobeAnalysisService] Found color in tag values:', detectedColor);
          }
        }
        
        // Enhanced formData with color information
        const enhancedFormData = {
          ...formData,
          color: detectedColor
        };
        
        console.log('[wardrobeAnalysisService] Enhanced formData with color:', enhancedFormData);
        
        // Filter for styling context using helper function
        stylingContext = filterStylingContext(wardrobeItems, enhancedFormData) as WardrobeItem[];
        
        // Filter for gap analysis context using helper function
        similarContext = filterSimilarContext(wardrobeItems, enhancedFormData) as WardrobeItem[];
        
        // Filter for additional context using helper function
        additionalContext = filterAdditionalContext(wardrobeItems, enhancedFormData) as WardrobeItem[];
        
        console.log(`[wardrobeAnalysisService] Generated styling context: ${stylingContext.length} items`);
        console.log(`[wardrobeAnalysisService] Generated gap analysis context: ${similarContext.length} items`);
        console.log(`[wardrobeAnalysisService] Generated additional context: ${additionalContext.length} items`);
      }

      // Calculate scenario coverage for the target category and season
      let scenarioCoverage = null;
      
      try {
        // Get the current authenticated user for scenario coverage
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user?.id && formData?.category && formData?.seasons && formData.seasons.length > 0) {
          console.log(`[wardrobeAnalysisService] Calculating coverage for ${formData.category} in seasons: ${formData.seasons.join(',')}`);
          
          try {
            // Check if this is outerwear - use different logic
            const isOuterwear = formData.category.toLowerCase() === 'outerwear';
            
            if (isOuterwear) {
              // For outerwear, fetch only seasonal coverage (not scenario-specific)
              console.log(`[wardrobeAnalysisService] Using SEASONAL coverage for outerwear`);
              const { getOuterwearSeasonalCoverageForAI } = await import('../wardrobe/scenarioCoverage/category/queries');
              
              // Get seasonal coverage for ALL selected seasons
              const allCoveragePromises = formData.seasons.map(season => 
                getOuterwearSeasonalCoverageForAI(user.id, season as Season)
              );
              
              const allSeasonsCoverage = await Promise.all(allCoveragePromises);
              scenarioCoverage = allSeasonsCoverage.flat();
              
              console.log(`[wardrobeAnalysisService] Generated SEASONAL outerwear coverage for ${formData.seasons.length} seasons: ${scenarioCoverage.length} total coverage entries`);
              
              // Log seasonal coverage
              scenarioCoverage.forEach((coverage: any) => {
                console.log(`[wardrobeAnalysisService] Seasonal Coverage: ${coverage.scenarioName} - ${coverage.season}: ${coverage.coveragePercent}%`);
              });
              
            } else if (scenarios.length > 0) {
              // For regular items, use scenario-specific coverage
              console.log(`[wardrobeAnalysisService] Using SCENARIO coverage for regular items`);
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
              scenarioCoverage = allSeasonsCoverage.flat();
              
              console.log(`[wardrobeAnalysisService] Generated scenario coverage for ${formData.seasons.length} seasons: ${scenarioCoverage.length} total coverage entries`);
              
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
                console.log(`[wardrobeAnalysisService] Coverage: ${scenarioName} - [${seasonCoverages}]`);
              });
            }
            
          } catch (coverageError) {
            console.error('[wardrobeAnalysisService] Failed to calculate coverage:', coverageError);
            // Continue without scenario coverage
          }
        }
      } catch (authError) {
        console.error('[wardrobeAnalysisService] Failed to get user for scenario coverage:', authError);
        // Continue without scenario coverage
      }
      
      // Call our backend endpoint for analysis
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

      console.log('[wardrobeAnalysisService] Received analysis from backend');
      
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
      console.error('[wardrobeAnalysisService] Error analyzing wardrobe item:', error);
      
      // Handle different types of errors
      if (error.response) {
        // The request was made and the server responded with a status code outside of 2xx range
        console.error('[wardrobeAnalysisService] Server error response:', error.response.data);
        return {
          analysis: 'Error analyzing image. The server encountered a problem.',
          score: 5.0,
          feedback: 'The analysis service is temporarily unavailable. Please try again later.',
          error: 'server_error',
          details: `Server responded with status ${error.response.status}: ${JSON.stringify(error.response.data)}`
        };
      } else if (error.request) {
        // The request was made but no response was received
        console.error('[wardrobeAnalysisService] No response received:', error.request);
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
