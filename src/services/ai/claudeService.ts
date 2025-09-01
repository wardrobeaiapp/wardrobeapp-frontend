import axios from 'axios';
import { DetectedTags, WardrobeItem } from '../../types/wardrobe';
import { compressImageToMaxSize } from '../../utils/imageUtils';
import { Outfit } from '../../types/outfit';

interface ClaudeResponse {
  message: string;
  outfits?: any[];
}

/**
 * Generate a mock analysis when API key is not available
 * @param detectedTags - Optional object with tags detected from the image
 * @returns Analysis object with mock data
 */
const generateMockAnalysis = (detectedTags?: DetectedTags) => {
  // Extract some basic information from tags if available
  const category = detectedTags?.category || 'clothing item';
  const color = detectedTags?.color || '';
  const pattern = detectedTags?.pattern || '';
  const material = detectedTags?.material || '';
  const style = detectedTags?.style || '';
  
  // Generate a random score between 6.5 and 9.5
  const score = (Math.random() * 3 + 6.5).toFixed(1);
  const numericScore = parseFloat(score);
  
  // Build a plausible analysis based on available tags
  let analysis = `This appears to be a ${color ? color + ' ' : ''}${style ? style + ' ' : ''}${category}.`;
  analysis += ` It's a versatile piece that would work well in various outfit combinations.`;
  
  if (material) {
    analysis += ` The ${material} material gives it a quality feel and durability.`;
  }
  
  if (pattern) {
    analysis += ` The ${pattern} pattern adds visual interest and uniqueness to this piece.`;
  }
  
  // Add style advice
  analysis += ` This item would pair well with both casual and semi-formal outfits, making it a good addition to your wardrobe.`;
  
  // Feedback based on score
  let feedback = '';
  if (numericScore >= 8.5) {
    feedback = `This is an excellent ${category} that offers great versatility and style. Highly recommended for your wardrobe.`;
  } else if (numericScore >= 7) {
    feedback = `This ${category} is a solid choice with good potential for various outfits. Consider how it complements your existing wardrobe items.`;
  } else {
    feedback = `While this ${category} has some appeal, consider whether it truly adds value to your wardrobe. It might have limited versatility or may not align with your personal style.`;
  }
  
  return {
    analysis,
    score: numericScore,
    feedback
  };
};

// Backend API URL - use relative path to leverage proxy configuration
const API_URL = '/api';
// Anthropic API URL - no longer used as we're using backend proxy instead
// const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

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
  },

  /**
   * Analyze a wardrobe item image using Claude Vision
   * @param imageBase64 - Base64 encoded image data (with data URI prefix)
   * @param detectedTags - Optional object with tags detected from the image
   * @returns Promise with analysis, score, and feedback
   */
  async analyzeWardrobeItem(imageBase64: string, detectedTags?: DetectedTags): Promise<{
    analysis: string;
    score: number;
    feedback: string;
    error?: string;
    details?: string;
  }> {
    try {
      // Use our mock mode for offline testing if needed
      const useMockMode = false; // Set to true to enable mock mode regardless of API availability
      
      if (useMockMode) {
        console.log('[claudeService] Using mock mode');
        return generateMockAnalysis(detectedTags);
      }

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
      
      // Call our backend endpoint instead of Claude API directly (avoids CORS issues)
      const response = await axios.post(
        `${API_URL}/analyze-wardrobe-item`,
        {
          imageBase64,
          detectedTags
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
