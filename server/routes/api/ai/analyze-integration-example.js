// Example of how to integrate duplicate detection service
// This shows how to modify your existing /api/analyze-wardrobe-item endpoint

const express = require('express');
const { Anthropic } = require('@anthropic-ai/sdk');
const { 
  analyzeDuplicatesForAI, 
  generateExtractionPrompt, 
  parseExtractionResponse 
} = require('../../../utils/duplicateDetectionUtils');

const router = express.Router();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

router.post('/', async (req, res) => {
  try {
    const { imageBase64, formData, similarContext, additionalContext } = req.body;
    
    if (!imageBase64) {
      return res.status(400).json({ error: 'Image data is required' });
    }

    // === STEP 1: AI ATTRIBUTE EXTRACTION ===
    console.log('=== STEP 1: Extracting attributes ===');
    
    const extractionPrompt = generateExtractionPrompt(formData.category);
    
    console.log('Extraction prompt:', extractionPrompt);
    
    const extractionResponse = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 200,
      temperature: 0.3, // Lower temperature for more consistent extraction
      system: `You are a fashion attribute extractor. Extract ONLY the requested attributes from the image. Be precise and use exactly the options provided.`,
      messages: [{
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: "image/jpeg",
              data: imageBase64.replace(/^data:image\/[a-z]+;base64,/, '')
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

    if (!extractedAttributes) {
      console.log('Failed to extract attributes, falling back to original logic');
      // Fallback to your original analysis logic
      return res.json({ 
        analysis: 'Could not extract attributes for duplicate analysis',
        score: 5.0 
      });
    }

    // === STEP 2: ALGORITHMIC DUPLICATE ANALYSIS ===
    console.log('=== STEP 2: Running duplicate analysis ===');
    
    const enrichedItemData = {
      category: formData.category,
      subcategory: formData.subcategory,
      color: extractedAttributes.color,
      silhouette: extractedAttributes.silhouette,
      style: extractedAttributes.style
    };

    const allContextItems = [...(similarContext || []), ...(additionalContext || [])];
    const duplicateAnalysis = analyzeDuplicatesForAI(enrichedItemData, allContextItems);
    
    console.log('Duplicate analysis result:', JSON.stringify(duplicateAnalysis, null, 2));

    // === STEP 3: AI RECOMMENDATION BASED ON FACTS ===
    console.log('=== STEP 3: Getting AI recommendation ===');
    
    let recommendationPrompt = buildRecommendationPrompt(duplicateAnalysis, extractedAttributes);
    
    console.log('Recommendation prompt:', recommendationPrompt);
    
    const finalResponse = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 1024,
      temperature: 0.7,
      system: recommendationPrompt,
      messages: [{
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: "image/jpeg",
              data: imageBase64.replace(/^data:image\/[a-z]+;base64,/, '')
            }
          },
          {
            type: "text",
            text: "Based on the analysis provided, give me your recommendation for this item."
          }
        ]
      }]
    });

    // Parse the response (using your existing parsing logic)
    let analysisResponse = finalResponse.content[0].text;
    
    // Add the duplicate analysis data for transparency
    const responseWithAnalysis = {
      analysis: analysisResponse,
      score: extractScoreFromResponse(analysisResponse),
      feedback: extractFeedbackFromResponse(analysisResponse),
      finalRecommendation: extractFinalRecommendation(analysisResponse),
      
      // Additional structured data
      duplicate_detection: {
        attributes_detected: extractedAttributes,
        duplicate_analysis: duplicateAnalysis,
        recommendation_basis: duplicateAnalysis.recommendation
      }
    };

    res.json(responseWithAnalysis);

  } catch (err) {
    console.error('Error in duplicate detection analysis:', err);
    res.status(500).json({ 
      error: 'Error analyzing image', 
      details: err.message
    });
  }
});

/**
 * Build recommendation prompt with structured analysis data
 */
function buildRecommendationPrompt(duplicateAnalysis, extractedAttributes) {
  let prompt = `You are a wardrobe consultant making recommendations based on FACTUAL ANALYSIS.

DETECTED ATTRIBUTES:
- Color: ${extractedAttributes.color}
- Silhouette: ${extractedAttributes.silhouette || 'N/A'}
- Style: ${extractedAttributes.style}

DUPLICATE ANALYSIS RESULTS:
`;

  if (duplicateAnalysis.duplicate_analysis.found) {
    prompt += `- DUPLICATES FOUND: ${duplicateAnalysis.duplicate_analysis.count} similar items
- Items: ${duplicateAnalysis.duplicate_analysis.items.join(', ')}
- Severity: ${duplicateAnalysis.duplicate_analysis.severity}
`;
  } else {
    prompt += `- NO DUPLICATES: No similar items found
`;
  }

  prompt += `
VARIETY IMPACT:
- Color distribution: ${duplicateAnalysis.variety_impact.message}
- Would dominate wardrobe: ${duplicateAnalysis.variety_impact.would_dominate ? 'YES' : 'NO'}

ALGORITHMIC RECOMMENDATION: ${duplicateAnalysis.recommendation}

INSTRUCTIONS:
Based on these FACTS (not your own analysis), provide your recommendation using this format:

ANALYSIS:
PROS:
1. [Positive aspect about the item]
2. [How it works with wardrobe]
3. [Styling opportunities]

${duplicateAnalysis.duplicate_analysis.found ? `CONS:
1. You already own ${duplicateAnalysis.duplicate_analysis.count} similar items: ${duplicateAnalysis.duplicate_analysis.items.join(', ')}
2. ${duplicateAnalysis.variety_impact.message}` : ''}

SCORE: X/10
[Score based on the analysis - duplicates should score 1-3, no duplicates 6-8]

FINAL RECOMMENDATION: ${duplicateAnalysis.recommendation === 'SKIP' ? 'SKIP' : duplicateAnalysis.recommendation === 'CONSIDER' ? 'CONSIDER' : 'RECOMMEND'} - [Your reasoning based on the facts provided]

CRITICAL: Do not re-analyze the image. Use only the provided analysis results.
`;

  return prompt;
}

// Helper functions for parsing response (simplified versions)
function extractScoreFromResponse(response) {
  const scoreMatch = response.match(/SCORE:?\s*([\d\.]+)/i);
  return scoreMatch ? parseFloat(scoreMatch[1]) : 5.0;
}

function extractFeedbackFromResponse(response) {
  const feedbackMatch = response.match(/FEEDBACK:?\s*([\s\S]*?)(?=FINAL RECOMMENDATION:?|$)/i);
  return feedbackMatch ? feedbackMatch[1].trim() : '';
}

function extractFinalRecommendation(response) {
  const finalMatch = response.match(/FINAL RECOMMENDATION:?\s*([\s\S]*?)(?=$)/i);
  return finalMatch ? finalMatch[1].trim() : '';
}

module.exports = router;
