import { getUserAnalysisData } from './analysis/userDataService';
import { generateScenarioCoverage } from './analysis/coverageService';
import { processImageForAnalysis } from './analysis/imageProcessingService';
import { WardrobeItem } from '../../types';
import type { WardrobeItemAnalysis } from './types';
import { filterPreFilledData, processScenarioConversion, filterScenarioCoverageForWishlist } from './aiDataProcessor';
import { analyzeWardrobeItem, buildAnalysisRequest } from './aiApiClient';
import { filterAndProcessContexts } from './aiContextFilter';
import { handleImageProcessingError, handleApiError } from './aiErrorHandler';

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
    formData?: {
      category?: string;
      subcategory?: string;
      seasons?: string[];
      color?: string;
      scenarios?: string[];
      type?: string;
      material?: string;
      pattern?: string;
      style?: string;
      silhouette?: string;
      neckline?: string;
      sleeves?: string;
      rise?: string;
      length?: string;
      heelHeight?: string;
      bootHeight?: string;
      closure?: string;
      details?: string;
    },
    preFilledData?: WardrobeItem
  ): Promise<WardrobeItemAnalysis> {
    try {
      console.log('[wardrobeAnalysisService] Form data:', formData);
      
      if (preFilledData) {
        console.log('[wardrobeAnalysisService] Original pre-filled data:', preFilledData);
        console.log('[wardrobeAnalysisService] Scenarios in original data:', preFilledData.scenarios);
      }
      
      // Process and validate image using dedicated service
      const imageResult = await processImageForAnalysis(imageBase64);
      const imageError = handleImageProcessingError(imageResult);
      if (imageError) {
        return imageError;
      }
      
      imageBase64 = imageResult.processedImage;
      console.log('[wardrobeAnalysisService] Sending image to backend for analysis');
      
      // Get all user data using dedicated service
      const userData = await getUserAnalysisData();
      const { user, climateData, userGoals, scenarios, wardrobeItems } = userData;
      
      // Process preFilledData for wishlist items - convert scenario UUIDs to names
      let processedPreFilledData = processScenarioConversion(preFilledData, scenarios);
      
      if (processedPreFilledData) {
        // Show final filtered preFilledData for debugging
        const filtered = filterPreFilledData(processedPreFilledData);
        console.log('[wardrobeAnalysisService] Final filtered pre-filled data:', filtered);
        console.log('[wardrobeAnalysisService] Final scenarios in filtered data:', filtered.scenarios);
      }
      
      // Generate styling and gap analysis context
      let filteredStylingContext: Partial<WardrobeItem>[] = [];
      let filteredSimilarContext: Partial<WardrobeItem>[] = [];

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
        
        // Enhanced formData with color information and scenarios from wishlist items
        const enhancedFormData = {
          ...formData,
          color: detectedColor || formData.color, // Only override if we actually detected a color
          // 🎯 CRITICAL: Add scenarios from wishlist items for scenario-based filtering
          scenarios: processedPreFilledData?.scenarios || (formData as any)?.scenarios
        };
        
        console.log('[wardrobeAnalysisService] Enhanced formData with color and scenarios:', enhancedFormData);
        
        // 🎯 Log scenario filtering info
        if (enhancedFormData.scenarios && enhancedFormData.scenarios.length > 0) {
          console.log('[wardrobeAnalysisService] 🎯 WISHLIST ITEM SCENARIO FILTERING: Will filter styling context to scenarios:', enhancedFormData.scenarios);
        } else {
          console.log('[wardrobeAnalysisService] 📋 REGULAR ITEM ANALYSIS: No scenario filtering (analyzing uploaded image or regular item)');
        }
        
        // Filter and process contexts using dedicated service
        const contextResult = filterAndProcessContexts(wardrobeItems, enhancedFormData, scenarios || []);
        filteredStylingContext = contextResult.filteredStylingContext;
        filteredSimilarContext = contextResult.filteredSimilarContext;
        
        console.log(`[wardrobeAnalysisService] Generated styling context: ${filteredStylingContext.length} items`);
        console.log(`[wardrobeAnalysisService] Generated gap analysis context: ${filteredSimilarContext.length} items`);
      } else {
        // Initialize empty contexts when no enhanced form data
        filteredStylingContext = [];
        filteredSimilarContext = [];
      }

      // Generate scenario coverage using dedicated service
      let scenarioCoverage = user?.id && formData ? 
        await generateScenarioCoverage(user.id, formData, scenarios, wardrobeItems) : 
        null;
      
      // Filter scenario coverage for wishlist items to only include their pre-selected scenarios
      if (preFilledData && preFilledData.scenarios && preFilledData.scenarios.length > 0 && scenarioCoverage) {
        console.log('[wardrobeAnalysisService] 🎯 WISHLIST ITEM - Filtering scenario coverage');
        console.log('[wardrobeAnalysisService] Wishlist item selected scenario IDs:', preFilledData.scenarios);
        
        // Convert wishlist scenario IDs to names for filtering
        const wishlistScenarioNames = preFilledData.scenarios.map(scenarioId => {
          const scenario = scenarios && scenarios.find ? scenarios.find(s => s.id === scenarioId) : null;
          return scenario ? scenario.name : null;
        }).filter((name): name is string => name !== null);
        
        console.log('[wardrobeAnalysisService] Converted to scenario names:', wishlistScenarioNames);
        
        // Filter scenario coverage to only include the wishlist item's scenarios
        scenarioCoverage = filterScenarioCoverageForWishlist(scenarioCoverage, wishlistScenarioNames) || null;
      }
      
      // Build analysis request and call API
      const request = buildAnalysisRequest({
        imageBase64,
        detectedTags,
        climateData,
        scenarios,
        formData,
        stylingContext: filteredStylingContext,
        similarContext: filteredSimilarContext,
        scenarioCoverage,
        userGoals,
        processedPreFilledData,
        userId: user?.id
      });

      return await analyzeWardrobeItem(request);
    } catch (error: any) {
      return handleApiError(error);
    }
  }
};
