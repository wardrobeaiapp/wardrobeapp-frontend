import axios from 'axios';
import { filterStylingContext, filterSimilarContext } from './wardrobeContextHelpers';import { getUserAnalysisData } from './analysis/userDataService';
import { generateScenarioCoverage } from './analysis/coverageService';
import { processImageForAnalysis } from './analysis/imageProcessingService';
import { WardrobeItem } from '../../types';
import type { WardrobeItemAnalysis } from './types';

// Backend API URL - point to the actual backend server
const API_URL = 'http://localhost:5000/api';

/**
 * Filter pre-filled data to only include descriptive fields relevant for AI analysis
 * Excludes metadata fields like imageUrl, id, userId, timestamps, etc.
 */
const filterPreFilledData = (preFilledData: WardrobeItem) => {
  const filtered: Partial<WardrobeItem> = {};
  
  // Include only descriptive fields that AI can verify from the image
  if (preFilledData.name) filtered.name = preFilledData.name;
  if (preFilledData.category) filtered.category = preFilledData.category;
  if (preFilledData.subcategory) filtered.subcategory = preFilledData.subcategory;
  if (preFilledData.color) filtered.color = preFilledData.color;
  if (preFilledData.style) filtered.style = preFilledData.style;
  if (preFilledData.silhouette) filtered.silhouette = preFilledData.silhouette;
  if (preFilledData.material) filtered.material = preFilledData.material;
  if (preFilledData.pattern) filtered.pattern = preFilledData.pattern;
  if (preFilledData.length) filtered.length = preFilledData.length;
  if (preFilledData.sleeves) filtered.sleeves = preFilledData.sleeves;
  if (preFilledData.rise) filtered.rise = preFilledData.rise;
  if (preFilledData.neckline) filtered.neckline = preFilledData.neckline;
  if (preFilledData.heelHeight) filtered.heelHeight = preFilledData.heelHeight;
  if (preFilledData.bootHeight) filtered.bootHeight = preFilledData.bootHeight;
  if (preFilledData.brand) filtered.brand = preFilledData.brand;
  if (preFilledData.size) filtered.size = preFilledData.size;
  if (preFilledData.season) filtered.season = preFilledData.season;
  
  // Explicitly exclude metadata fields:
  // - imageUrl: AI already has the image
  // - id, userId: Not descriptive of the item
  // - dateAdded, imageExpiry: Timestamps irrelevant for analysis
  // - wishlist: Not about the item itself
  // - tags: Complex object, not needed for basic verification
  
  return filtered;
};

/**
 * Service for handling wardrobe item analysis operations
 */
export const wardrobeAnalysisService = {
  /**
   * Analyze a wardrobe item image using Claude Vision
   * @param imageBase64 - Base64 encoded image data (with data URI prefix)
   * @param detectedTags - Optional object with tags detected from the image
   * @param formData - Optional form data with category, subcategory, and seasons
   * @param preFilledData - Optional pre-filled data from wishlist item
   * @returns Promise with analysis, score, and feedback
   */
  async analyzeWardrobeItem(
    imageBase64: string, 
    detectedTags?: any, 
    formData?: { category?: string; subcategory?: string; seasons?: string[] },
    preFilledData?: WardrobeItem
  ): Promise<WardrobeItemAnalysis> {
    try {
      console.log('[wardrobeAnalysisService] Form data:', formData);
      
      if (preFilledData) {
        console.log('[wardrobeAnalysisService] Original pre-filled data:', preFilledData);
        const filtered = filterPreFilledData(preFilledData);
        console.log('[wardrobeAnalysisService] Filtered pre-filled data:', filtered);
      }
      
      // Process and validate image using dedicated service
      const imageResult = await processImageForAnalysis(imageBase64);
      if (imageResult.error) {
        return {
          analysis: imageResult.error === 'missing_image' ? 'Error: No image data provided.' : 'Error: The provided image data appears incomplete.',
          score: 5.0,
          feedback: imageResult.error === 'missing_image' ? 'Please upload an image to analyze.' : 'Please try uploading the image again with a complete file.',
          error: imageResult.error,
          details: imageResult.details
        };
      }
      
      imageBase64 = imageResult.processedImage;
      console.log('[wardrobeAnalysisService] Sending image to backend for analysis');
      
      // Get all user data using dedicated service
      const userData = await getUserAnalysisData();
      const { user, climateData, userGoals, scenarios, wardrobeItems } = userData;
      
      // Generate styling and gap analysis context
      let stylingContext: WardrobeItem[] = [];
      let similarContext: WardrobeItem[] = [];
      
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
        
        console.log(`[wardrobeAnalysisService] Generated styling context: ${stylingContext.length} items`);
        console.log(`[wardrobeAnalysisService] Generated gap analysis context: ${similarContext.length} items`);
      }

      // Generate scenario coverage using dedicated service
      const scenarioCoverage = user?.id && formData ? 
        await generateScenarioCoverage(user.id, formData, scenarios, wardrobeItems) : 
        null;
      
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
          // Include scenario coverage data calculated in frontend
          scenarioCoverage: scenarioCoverage || undefined,
          // Include user's wardrobe goals for personalized recommendations
          userGoals: userGoals.length > 0 ? userGoals : undefined,
          // Include pre-filled data from wishlist item if available (filtered to exclude metadata)
          preFilledData: preFilledData ? filterPreFilledData(preFilledData) : undefined
        }
      );

      console.log('[wardrobeAnalysisService] Received analysis from backend');
      
      // If the response contains error information, return it along with the fallback values
      if (response.data.error) {
        return {
          analysis: response.data.analysis || 'Error analyzing image.',
          score: response.data.score || 5.0,
          feedback: response.data.feedback || 'Could not process the image analysis.',
          recommendationAction: response.data.recommendationAction,
          recommendationText: response.data.recommendationText,
          error: response.data.error,
          details: response.data.details
        };
      }
      
      // The backend already parses and structures the response for us
      return {
        analysis: response.data.analysis,
        score: response.data.score,
        feedback: response.data.feedback,
        recommendationAction: response.data.recommendationAction,
        recommendationText: response.data.recommendationText
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
