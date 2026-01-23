/**
 * Claude Analysis Service
 * 
 * Handles Claude AI analysis workflow including prompt building, API calls, and response processing.
 * Extracted from analyze-simple.js to improve maintainability.
 */

// Import utilities
const { getAnalysisScope } = require('../utils/ai/analysisScopeUtils');
const { buildEnhancedAnalysisPrompt } = require('../utils/ai/enhancedPromptBuilder');

/**
 * Performs Claude AI analysis on an uploaded item image
 * 
 * @param {Object} options - Analysis options
 * @param {Object} options.formData - Form data from request
 * @param {Object} options.preFilledData - Pre-filled wishlist data
 * @param {Array} options.scenarios - Available scenarios
 * @param {string} options.mediaType - Image media type
 * @param {string} options.base64Data - Base64 image data
 * @param {Object} options.anthropicClient - Claude API client
 * @returns {Object} Analysis results including raw response and extracted data
 */
async function performClaudeAnalysis({
  formData,
  preFilledData,
  scenarios,
  mediaType,
  base64Data,
  anthropicClient
}) {
  console.log('=== STEP: Enhanced Characteristic Analysis Setup ===');
  
  // Merge form data with pre-filled wishlist data
  const analysisData = {
    ...formData,
    ...(preFilledData || {}), // Wishlist data takes precedence where available
    isFromWishlist: !!preFilledData
  };
  
  // Determine analysis scope based on category/subcategory
  const analysisScope = getAnalysisScope(analysisData.category, analysisData.subcategory);
  
  console.log('📊 Analysis data:', analysisData.category, analysisData.subcategory);
  console.log('🔍 Analysis scope determined');
  
  if (preFilledData) {
    console.log('👗 Pre-filled wishlist data detected - will verify/correct/complete');
  }

  // Initialize duplicate prompt section as empty (will be populated later)
  let duplicatePromptSection = '';

  // Build comprehensive system prompt
  const systemPrompt = buildEnhancedAnalysisPrompt(
    analysisData,
    analysisScope,
    preFilledData,
    scenarios,
    duplicatePromptSection
  );

  // Call Claude API
  const response = await anthropicClient.messages.create({
    model: "claude-3-haiku-20240307",
    max_tokens: 1024,
    temperature: 0.5,
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mediaType,
              data: base64Data
            }
          },
          {
            type: "text",
            text: "Please analyze this clothing item as potential purchase for my wardrobe."
          }
        ]
      }
    ]
  });

  // Get the raw response text
  const rawAnalysisResponse = response.content[0].text;
  
  // Extract final reason and recommendation from raw text
  const { finalReason, claudeRecommendation, analysisResponse } = extractAnalysisComponents(rawAnalysisResponse);
  
  return {
    rawAnalysisResponse,
    analysisResponse,
    finalReason,
    claudeRecommendation,
    analysisData,
    analysisScope
  };
}

/**
 * Extracts key components from Claude's raw analysis response
 * 
 * @param {string} rawAnalysisResponse - Raw response from Claude
 * @returns {Object} Extracted components
 */
function extractAnalysisComponents(rawAnalysisResponse) {
  // Extract final reason
  let finalReason = "";
  const finalReasonMatch = rawAnalysisResponse.match(/REASON:?\s*([\s\S]*?)(?=FINAL RECOMMENDATION:?|$)/i);
  if (finalReasonMatch && finalReasonMatch[1]) {
    finalReason = finalReasonMatch[1].trim();
  }
  
  // Extract Claude recommendation
  let claudeRecommendation = "";
  const finalRecommendationMatch = rawAnalysisResponse.match(/FINAL RECOMMENDATION:?\s*([\s\S]*?)(?=SCORE:?|$)/i);
  if (finalRecommendationMatch && finalRecommendationMatch[1]) {
    claudeRecommendation = finalRecommendationMatch[1].trim();
  }
  
  // Clean up the analysis text for display (remove Claude's recommendation sections)
  let analysisResponse = rawAnalysisResponse;
  analysisResponse = analysisResponse.replace(/FINAL RECOMMENDATION:?\s*[\s\S]*?(?=REASON:|$)/i, '');
  analysisResponse = analysisResponse.replace(/REASON:?\s*[\s\S]*?$/i, '');
  analysisResponse = analysisResponse.trim();
  
  return {
    finalReason,
    claudeRecommendation, 
    analysisResponse
  };
}

module.exports = {
  performClaudeAnalysis,
  extractAnalysisComponents
};
