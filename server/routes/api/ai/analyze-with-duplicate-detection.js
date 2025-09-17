// Updated analyze endpoint with duplicate detection service
const express = require('express');
const { Anthropic } = require('@anthropic-ai/sdk');
const { formatStylePreferencesForPrompt } = require('../../../utils/stylePreferencesUtils');
const { analyzeScenarioCoverage } = require('../../../utils/scenarioAnalysis');
const { analyzeWardrobeForPrompt, generateStructuredPrompt } = require('../../../utils/simpleOutfitAnalysis');
const {
  buildSystemPrompt,
  addFormDataSection,
  addScenariosSection,
  addClimateSection,
  addStylingContextSection,
  addScenarioCoverageSection,
  addGapAnalysisSection,
  addFinalInstructions
} = require('../../../utils/promptBuilder');

// Import new duplicate detection utilities
const {
  analyzeDuplicatesForAI,
  generateExtractionPrompt,
  parseExtractionResponse
} = require('../../../utils/duplicateDetectionUtils');

const router = express.Router();

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// @route   POST /api/analyze-wardrobe-item
// @desc    Analyze wardrobe item with Claude using improved duplicate detection
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { imageBase64, detectedTags, climateData, scenarios, formData, stylingContext, similarContext, additionalContext } = req.body;
    
    // Log the complete request body for debugging
    console.log('=== Enhanced Request Analysis ===');
    console.log('imageBase64:', imageBase64 ? 'present' : 'missing');
    console.log('detectedTags:', detectedTags || 'none');
    console.log('climateData:', climateData || 'none');
    console.log('scenarios:', scenarios || 'none');
    console.log('formData:', JSON.stringify(formData, null, 2) || 'none');
    console.log('stylingContext:', stylingContext ? `${stylingContext.length} items` : 'none');
    console.log('similarContext:', similarContext ? `${similarContext.length} items` : 'none');
    console.log('additionalContext:', additionalContext ? `${additionalContext.length} items` : 'none');
    console.log('==============================');

    if (!imageBase64) {
      return res.status(400).json({ error: 'Image data is required' });
    }

    // Extract base64 data without prefix if present and ensure it's properly formatted
    let base64Data = imageBase64;
    
    if (base64Data.startsWith('data:')) {
      const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        base64Data = matches[2];
      } else {
        return res.status(400).json({ 
          error: 'Invalid image data format', 
          details: 'The provided image data is not in a valid base64 format',
          analysis: 'Error analyzing image. Please try again later.',
          score: 5.0,
          feedback: 'Could not process the image analysis.'
        });
      }
    }

    // Simple validation of base64 data
    if (!base64Data || base64Data.length < 100) {
      return res.status(400).json({ 
        error: 'Insufficient image data', 
        details: 'The provided image data is too small to be a valid image',
        analysis: 'Error analyzing image. The image data appears to be incomplete.',
        score: 5.0,
        feedback: 'Please provide a complete image.'
      });
    }

    // === STEP 1: AI ATTRIBUTE EXTRACTION ===
    console.log('=== STEP 1: Extracting structured attributes ===');
    
    const extractionPrompt = generateExtractionPrompt(formData.category);
    console.log('Extraction prompt generated for category:', formData.category);
    
    const extractionResponse = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 200,
      temperature: 0.2, // Lower temperature for more consistent extraction
      system: `You are a precise fashion attribute extractor. Extract ONLY the requested attributes from the image using the exact options provided. Be concise and accurate.`,
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

    const extractedAttributes = parseExtractionResponse(extractionResponse.content[0].text);
    console.log('Extracted attributes:', extractedAttributes);

    // === STEP 2: ALGORITHMIC DUPLICATE ANALYSIS ===
    console.log('=== STEP 2: Running algorithmic duplicate analysis ===');
    
    let duplicateAnalysis = null;
    let wardrobeAnalysis = null;
    
    if (extractedAttributes) {
      // Enhanced item data with AI-extracted attributes
      const enrichedItemData = {
        category: formData.category,
        subcategory: formData.subcategory,
        color: extractedAttributes.color,
        silhouette: extractedAttributes.silhouette,
        style: extractedAttributes.style,
        seasons: formData.seasons
      };

      console.log('Enriched item data:', enrichedItemData);

      const allContextItems = [...(similarContext || []), ...(additionalContext || [])];
      duplicateAnalysis = analyzeDuplicatesForAI(enrichedItemData, allContextItems);
      
      console.log('Duplicate analysis result:', JSON.stringify(duplicateAnalysis, null, 2));
    } else {
      console.log('Failed to extract attributes, using fallback analysis');
      
      // Fallback to original simple duplicate check
      if (similarContext && similarContext.length > 0) {
        wardrobeAnalysis = analyzeWardrobeForPrompt(formData, similarContext, []);
      }
    }

    // === STEP 3: BUILD ENHANCED SYSTEM PROMPT ===
    console.log('=== STEP 3: Building enhanced system prompt ===');
    
    let systemPrompt = buildSystemPrompt();
    
    // Add form data section
    systemPrompt = addFormDataSection(systemPrompt, formData);
    
    // Add scenarios section
    systemPrompt = addScenariosSection(systemPrompt, scenarios);
    
    // Add climate section
    systemPrompt = addClimateSection(systemPrompt, climateData);
    
    // Add styling context section
    systemPrompt = addStylingContextSection(systemPrompt, stylingContext);

    // Add structured duplicate analysis
    if (duplicateAnalysis) {
      systemPrompt += `\n\n=== ALGORITHMIC DUPLICATE ANALYSIS ===`;
      systemPrompt += `\nThe following analysis was performed using deterministic algorithms:\n`;
      
      if (extractedAttributes) {
        systemPrompt += `\nDETECTED ATTRIBUTES:`;
        systemPrompt += `\n- Color: ${extractedAttributes.color}`;
        systemPrompt += `\n- Silhouette: ${extractedAttributes.silhouette || 'N/A'}`;
        systemPrompt += `\n- Style: ${extractedAttributes.style}`;
      }
      
      systemPrompt += `\nDUPLICATE ANALYSIS:`;
      if (duplicateAnalysis.duplicate_analysis.found) {
        systemPrompt += `\n- DUPLICATES FOUND: ${duplicateAnalysis.duplicate_analysis.count} similar items`;
        systemPrompt += `\n- Items: ${duplicateAnalysis.duplicate_analysis.items.join(', ')}`;
        systemPrompt += `\n- Severity: ${duplicateAnalysis.duplicate_analysis.severity}`;
      } else {
        systemPrompt += `\n- NO DUPLICATES: No similar items detected`;
      }
      
      systemPrompt += `\nVARIETY IMPACT:`;
      systemPrompt += `\n- ${duplicateAnalysis.variety_impact.message}`;
      systemPrompt += `\n- Color dominance risk: ${duplicateAnalysis.variety_impact.would_dominate ? 'YES' : 'NO'}`;
      
      systemPrompt += `\nALGORITHMIC RECOMMENDATION: ${duplicateAnalysis.recommendation}`;
      
      systemPrompt += `\n\nIMPORTANT: Base your recommendation on these factual findings. If duplicates were found, score should be 1-3/10. If no duplicates and fills gaps, score 6-8/10.`;
      
    } else if (wardrobeAnalysis) {
      // Fallback to original analysis
      systemPrompt += generateStructuredPrompt(wardrobeAnalysis);
    }
    
    // Add final instructions and detected tags
    systemPrompt = addFinalInstructions(systemPrompt, detectedTags);

    // === STEP 4: AI RECOMMENDATION BASED ON ANALYSIS ===
    console.log('=== STEP 4: Getting AI recommendation based on analysis ===');
    
    const finalResponse = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 1024,
      temperature: 0.7,
      system: systemPrompt,
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
            text: "Based on the structured analysis provided, analyze this clothing item and provide your recommendation."
          }
        ]
      }]
    });

    // Parse the response using existing logic
    let analysisResponse = finalResponse.content[0].text;
    console.log('Final Claude response:', analysisResponse);
    
    // Extract analysis sections (using your existing parsing logic)
    let analysis = "";
    let score = 5.0;
    let feedback = "";
    let finalRecommendation = "";
    
    // Your existing parsing logic here...
    const analysisMatch = analysisResponse.match(/ANALYSIS:?\s*([\s\S]*?)(?=SCORE:?|$)/i);
    if (analysisMatch && analysisMatch[1]) {
      analysis = formatStructuredAnalysis(analysisMatch[1].trim());
    } else {
      analysis = formatStructuredAnalysis(analysisResponse);
    }
    
    const scoreMatch = analysisResponse.match(/SCORE:?\s*([\d\.]+)/i);
    if (scoreMatch && scoreMatch[1]) {
      score = parseFloat(scoreMatch[1]);
    }
    
    const feedbackMatch = analysisResponse.match(/FEEDBACK:?\s*([\s\S]*?)(?=FINAL RECOMMENDATION:?|$)/i);
    if (feedbackMatch && feedbackMatch[1]) {
      feedback = feedbackMatch[1].trim();
    }
    
    const finalRecommendationMatch = analysisResponse.match(/FINAL RECOMMENDATION:?\s*([\s\S]*?)(?=$)/i);
    if (finalRecommendationMatch && finalRecommendationMatch[1]) {
      finalRecommendation = finalRecommendationMatch[1].trim();
    }

    // Enhanced response with duplicate detection data
    const response = {
      analysis,
      score,
      feedback,
      finalRecommendation,
      
      // Additional structured data for debugging/transparency
      duplicate_detection: {
        attributes_extracted: extractedAttributes,
        duplicate_analysis: duplicateAnalysis,
        analysis_method: extractedAttributes ? 'enhanced_algorithmic' : 'fallback_simple'
      }
    };

    console.log('=== FINAL RESPONSE ===');
    console.log('Score:', score);
    console.log('Analysis method:', response.duplicate_detection.analysis_method);
    console.log('====================');

    res.json(response);

  } catch (err) {
    console.error('Error in enhanced duplicate detection analysis:', err);
    res.status(500).json({ 
      error: 'Error analyzing image', 
      details: err.message,
      analysis: 'Sorry, there was an error analyzing your item. Please try again later.',
      score: 5.0,
      feedback: 'Technical error encountered.'
    });
  }
});

// Helper function to format structured analysis (copy from your existing code)
function formatStructuredAnalysis(rawAnalysis) {
  let formatted = "";
  
  // Extract PROS section
  const prosMatch = rawAnalysis.match(/PROS:?\s*([\s\S]*?)(?=CONS:?|SUITABLE SCENARIOS:?|COMBINATION SUGGESTIONS:?|$)/i);
  if (prosMatch && prosMatch[1]) {
    const prosText = prosMatch[1].trim();
    formatted += "**PROS:**\n";
    const numberedPoints = prosText.match(/\d+\.\s*([^0-9]+?)(?=\d+\.|$)/g);
    if (numberedPoints && numberedPoints.length > 0) {
      numberedPoints.forEach((point, index) => {
        if (index < 3) {
          const cleanPoint = point.replace(/^\d+\.\s*/, '').trim();
          formatted += `✓ ${cleanPoint}\n`;
        }
      });
    }
    formatted += "\n";
  }
  
  // Extract CONS section  
  const consMatch = rawAnalysis.match(/CONS:?\s*([\s\S]*?)(?=SUITABLE SCENARIOS:?|COMBINATION SUGGESTIONS:?|$)/i);
  if (consMatch && consMatch[1]) {
    const consText = consMatch[1].trim();
    formatted += "**CONS:**\n";
    const numberedPoints = consText.match(/\d+\.\s*([^0-9]+?)(?=\d+\.|$)/g);
    if (numberedPoints && numberedPoints.length > 0) {
      numberedPoints.forEach((point, index) => {
        if (index < 3) {
          const cleanPoint = point.replace(/^\d+\.\s*/, '').trim();
          formatted += `✗ ${cleanPoint}\n`;
        }
      });
    }
    formatted += "\n";
  }
  
  return formatted || rawAnalysis;
}

module.exports = router;
