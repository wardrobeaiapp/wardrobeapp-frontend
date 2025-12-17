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

      const categoryLower = String(formData.category || '').toLowerCase();
      const isAccessory = categoryLower === 'accessory';

      const enrichedItemData = {
        category: formData.category,
        subcategory: formData.subcategory,
        color: extractedAttributes.color,
        ...(isAccessory
          ? {}
          : { silhouette: this.normalizeSilhouette(extractedAttributes.silhouette, formData.subcategory) }),
        ...(extractedAttributes.style && extractedAttributes.style !== 'unknown' && extractedAttributes.style !== 'N/A'
          ? { style: extractedAttributes.style }
          : {}),
        ...(formData.type ? { type: formData.type } : {}),
        seasons: formData.seasons,
        // Include additional attributes from formData if available
        ...(formData.pattern ? { pattern: formData.pattern } : {}),
        ...(formData.neckline ? { neckline: formData.neckline } : {}),
        ...(formData.sleeves ? { sleeves: formData.sleeves } : {}),
        ...(formData.material ? { material: formData.material } : {}),
        ...(formData.details ? { details: formData.details } : {})
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
      console.error('AI duplicate analysis failed:', error);
      return null;
    }
  }

  /**
   * Analyze item for duplicates using form data (skip AI extraction)
   * @param {Object} analysisData - Complete analysis data (formData + preFilledData + extracted characteristics)
   * @param {Array} similarContext - Similar context items (same category/subcategory)
   * @returns {Object|null} Duplicate analysis result or null if failed
   */
  async analyzeWithFormData(analysisData, similarContext) {
    if (!analysisData || !analysisData.category || !similarContext) {
      console.log('Skipping duplicate detection: insufficient data');
      return null;
    }

    try {
      console.log('=== Using Form Data for Duplicate Analysis (Skip AI Extraction) ===');

      const categoryLower = String(analysisData.category || '').toLowerCase();
      const isAccessory = categoryLower === 'accessory';

      const extractedAttributes = {
        color: analysisData.color || 'unknown',
        ...(isAccessory ? {} : { silhouette: this.normalizeSilhouette(analysisData.silhouette, analysisData.subcategory) }),
        ...(analysisData.style && analysisData.style !== 'unknown' && analysisData.style !== 'N/A' ? { style: analysisData.style } : {}),
        ...(analysisData.type && analysisData.type !== 'unknown' && analysisData.type !== 'N/A' ? { type: analysisData.type } : {}),
        ...(analysisData.material && analysisData.material !== 'unknown' && analysisData.material !== 'N/A' ? { material: analysisData.material } : {}),
        ...(analysisData.pattern && analysisData.pattern !== 'unknown' && analysisData.pattern !== 'N/A' ? { pattern: analysisData.pattern } : {})
      };

      console.log('Using attributes from analysis data:', extractedAttributes);

      // Run algorithmic duplicate analysis (same as in analyzeWithAI)
      const enrichedItemData = {
        category: analysisData.category,
        subcategory: analysisData.subcategory,
        seasons: analysisData.seasons || [],
        ...extractedAttributes
      };

      const duplicateAnalysis = analyzeDuplicatesForAI(enrichedItemData, similarContext);

      return {
        extractedAttributes,
        duplicateAnalysis
      };

    } catch (error) {
      console.error('Duplicate analysis with extracted characteristics failed:', error);
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
   * Normalize silhouette based on subcategory logic
   * @param {string} silhouette - Provided silhouette or undefined
   * @param {string} subcategory - Item subcategory
   * @returns {string} Normalized silhouette
   */
  normalizeSilhouette(silhouette, subcategory) {
    // If silhouette is already provided, use it
    if (silhouette && silhouette !== 'unknown' && silhouette !== 'undefined') {
      return silhouette;
    }
    
    console.log(`🔄 Normalizing silhouette for ${subcategory}: ${silhouette} → applying defaults`);
    
    // Apply logical default for leggings only (as requested)
    const subcat = subcategory?.toLowerCase();
    
    if (subcat === 'leggings') {
      console.log(`   ✅ Applied logical default: leggings → skinny`);
      return 'skinny';
    }
    
    // If no logical default exists, return unknown
    console.log(`   ⚠️ No default silhouette available for subcategory: ${subcategory}`);
    return 'unknown';
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
    if (extractedAttributes.silhouette && extractedAttributes.silhouette !== 'unknown' && extractedAttributes.silhouette !== 'N/A') {
      promptSection += `\n- Silhouette: ${extractedAttributes.silhouette}`;
    } else if (extractedAttributes.type && extractedAttributes.type !== 'unknown') {
      promptSection += `\n- Type: ${extractedAttributes.type}`;
    } else {
      promptSection += `\n- Silhouette: ${extractedAttributes.silhouette || 'N/A'}`;
    }
    if (extractedAttributes.material && extractedAttributes.material !== 'unknown' && extractedAttributes.material !== 'N/A') {
      promptSection += `\n- Material: ${extractedAttributes.material}`;
    }
    if (extractedAttributes.style && extractedAttributes.style !== 'unknown' && extractedAttributes.style !== 'N/A') {
      promptSection += `\n- Style: ${extractedAttributes.style}`;
    }
    
    promptSection += `\nDUPLICATE ANALYSIS:`;
    if (duplicateAnalysis.duplicate_analysis.found) {
      promptSection += `\n- DUPLICATES FOUND: ${duplicateAnalysis.duplicate_analysis.count} similar items`;
      promptSection += `\n- Items: ${duplicateAnalysis.duplicate_analysis.items.join(', ')}`;
      promptSection += `\n- Severity: ${duplicateAnalysis.duplicate_analysis.severity}`;
    } else {
      promptSection += `\n- NO DUPLICATES: No similar items detected`;
    }
    
    // Variety impact and recommendations are now handled separately in coverage analysis
    
    promptSection += `\n\n🚫 CRITICAL INSTRUCTION: Use ONLY the duplicate analysis above. Do NOT assume or mention any items that aren't explicitly listed. Do NOT make up new items - only reference items actually found by the algorithm. If no duplicates were found, say so clearly.`;
    
    return promptSection;
  }
}

module.exports = new DuplicateDetectionService();
