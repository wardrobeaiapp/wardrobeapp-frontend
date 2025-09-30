const { Anthropic } = require('@anthropic-ai/sdk');
const {
  analyzeDuplicatesForAI,
  generateExtractionPrompt,
  parseExtractionResponse
} = require('../utils/duplicateDetectionUtils');

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

/**
 * Enhanced duplicate detection service that uses AI to extract attributes
 * and then applies algorithmic duplicate analysis
 */
class DuplicateDetectionService {
  
  /**
   * Analyze item for duplicates using AI-extracted attributes and algorithmic analysis
   * @param {string} base64Data - Base64 image data
   * @param {Object} formData - Form data containing category, subcategory, seasons
   * @param {Array} similarContext - Similar context items (same category/subcategory)
   * @returns {Object|null} Duplicate analysis result or null if failed
   */
  async analyzeWithAI(base64Data, formData, similarContext) {
    if (!formData || !formData.category || !similarContext) {
      console.log('Skipping duplicate detection: insufficient data');
      return null;
    }

    try {
      console.log('=== STEP 1: AI Attribute Extraction ===');
      
      // Step 1: Extract structured attributes from image
      const extractedAttributes = await this.extractAttributes(base64Data, formData.category);
      
      if (!extractedAttributes) {
        console.log('Failed to extract attributes, skipping duplicate analysis');
        return null;
      }

      console.log('Extracted attributes:', extractedAttributes);

      // Step 2: Run algorithmic duplicate analysis
      console.log('=== STEP 2: Algorithmic Duplicate Analysis ===');
      
      const enrichedItemData = {
        category: formData.category,
        subcategory: formData.subcategory,
        color: extractedAttributes.color,
        silhouette: extractedAttributes.silhouette,
        style: extractedAttributes.style,
        seasons: formData.seasons,
        // Include additional attributes from formData if available
        pattern: formData.pattern,
        neckline: formData.neckline,
        sleeves: formData.sleeves,
        material: formData.material
      };

      const allContextItems = similarContext || [];
      
      console.log('🔍 DEBUG - enrichedItemData:', JSON.stringify(enrichedItemData, null, 2));
      console.log('🔍 DEBUG - allContextItems count:', allContextItems.length);
      console.log('🔍 DEBUG - allContextItems sample:', JSON.stringify(allContextItems.slice(0, 3), null, 2));
      
      const duplicateAnalysis = analyzeDuplicatesForAI(enrichedItemData, allContextItems);
      
      console.log('Duplicate analysis result:', JSON.stringify(duplicateAnalysis, null, 2));
      
      return {
        extractedAttributes,
        duplicateAnalysis
      };

    } catch (error) {
      console.error('Enhanced duplicate detection failed:', error);
      return null;
    }
  }

  /**
   * Extract structured attributes from image using AI
   * @param {string} base64Data - Base64 image data
   * @param {string} category - Item category
   * @returns {Object|null} Extracted attributes or null if failed
   */
  async extractAttributes(base64Data, category) {
    try {
      const extractionPrompt = generateExtractionPrompt(category);
      
      const extractionResponse = await anthropic.messages.create({
        model: "claude-3-haiku-20240307",
        max_tokens: 200,
        temperature: 0.2, // Lower temperature for consistent extraction
        system: `You are a precise fashion attribute extractor. Extract ONLY the requested attributes using the exact options provided.`,
        messages: [{
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: "image/jpeg",
                data: base64Data
              }
            },
            {
              type: "text",
              text: extractionPrompt
            }
          ]
        }]
      });

      return parseExtractionResponse(extractionResponse.content[0].text);
    } catch (error) {
      console.error('Attribute extraction failed:', error);
      return null;
    }
  }

  /**
   * Generate system prompt section for duplicate analysis
   * @param {Object} extractedAttributes - Extracted attributes
   * @param {Object} duplicateAnalysis - Duplicate analysis results
   * @returns {string} Formatted prompt section
   */
  generatePromptSection(extractedAttributes, duplicateAnalysis) {
    let promptSection = `\n\n=== ALGORITHMIC DUPLICATE ANALYSIS ===`;
    promptSection += `\nThe following analysis was performed using deterministic algorithms:\n`;
    
    promptSection += `\nDETECTED ATTRIBUTES:`;
    promptSection += `\n- Color: ${extractedAttributes.color}`;
    promptSection += `\n- Silhouette: ${extractedAttributes.silhouette || 'N/A'}`;
    promptSection += `\n- Style: ${extractedAttributes.style}`;
    
    promptSection += `\nDUPLICATE ANALYSIS:`;
    if (duplicateAnalysis.duplicate_analysis.found) {
      promptSection += `\n- DUPLICATES FOUND: ${duplicateAnalysis.duplicate_analysis.count} similar items`;
      promptSection += `\n- Items: ${duplicateAnalysis.duplicate_analysis.items.join(', ')}`;
      promptSection += `\n- Severity: ${duplicateAnalysis.duplicate_analysis.severity}`;
    } else {
      promptSection += `\n- NO DUPLICATES: No similar items detected`;
    }
    
    promptSection += `\nVARIETY IMPACT:`;
    promptSection += `\n- ${duplicateAnalysis.variety_impact.message}`;
    promptSection += `\n- Color dominance risk: ${duplicateAnalysis.variety_impact.would_dominate ? 'YES' : 'NO'}`;
    
    promptSection += `\nALGORITHMIC RECOMMENDATION: ${duplicateAnalysis.recommendation}`;
    
    promptSection += `\n\n🚫 CRITICAL INSTRUCTION: Use ONLY the duplicate analysis above. Do NOT assume or mention any items that aren't explicitly listed. Do NOT make up items like "burgundy cardigan" or "black leather jacket" - only reference items actually found by the algorithm. If no duplicates were found, say so clearly. Your job is to interpret the algorithmic findings, not to guess what items might exist.`;
    
    return promptSection;
  }
}

module.exports = new DuplicateDetectionService();
