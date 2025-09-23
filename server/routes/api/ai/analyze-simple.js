const express = require('express');
const { Anthropic } = require('@anthropic-ai/sdk');

// Import utilities
const imageValidator = require('../../../utils/imageValidator');

const router = express.Router();

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

/**
 * Extract suitable scenarios from Claude's analysis response
 * @param {string} analysisResponse - Raw response text from Claude
 * @returns {string[]} Array of suitable scenario names
 */
function extractSuitableScenarios(analysisResponse) {
  let suitableScenarios = [];
  
  const suitableScenariosMatch = analysisResponse.match(/SUITABLE SCENARIOS:?\s*([\s\S]*?)(?=REASON:?|FINAL RECOMMENDATION:?|SCORE:?|$)/i);
  if (suitableScenariosMatch && suitableScenariosMatch[1]) {
    const scenariosText = suitableScenariosMatch[1].trim();
    
    // Only extract scenarios that are explicitly listed as suitable
    // Look for lines that start with numbers, bullets, or dashes followed by scenario names
    // Exclude lines with negative words like "not suitable", "inappropriate", etc.
    const lines = scenariosText.split('\n');
    const negativeWords = /not suitable|inappropriate|doesn't work|poor fit|avoid|skip|unsuitable/i;
    
    for (let line of lines) {
      line = line.trim();
      if (line && !negativeWords.test(line)) {
        // Extract scenario name by removing leading numbers, bullets, dashes
        let scenarioName = line.replace(/^[\d+\.\-\•\*\s]+/, '').trim();
        
        // Remove any trailing explanations in parentheses or after colons/dashes
        scenarioName = scenarioName.split(/[\(\:\-]/)[0].trim();
        
        if (scenarioName && scenarioName.length > 2) {
          suitableScenarios.push(scenarioName);
        }
      }
    }
  }
  
  return suitableScenarios;
}

// @route   POST /api/analyze-wardrobe-item-simple
// @desc    Simple analysis of wardrobe item with Claude - just basic prompt
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { imageBase64, formData, scenarios } = req.body;
    
    console.log('=== Simple Analysis Request ===');
    console.log('imageBase64:', imageBase64 ? 'present' : 'missing');
    console.log('formData:', JSON.stringify(formData, null, 2) || 'none');
    console.log('scenarios:', scenarios || 'none');
    console.log('==============================');

    // Validate and process image data
    const imageValidation = imageValidator.validateAndProcess(imageBase64);
    if (!imageValidation.isValid) {
      return res.status(imageValidation.statusCode).json(imageValidation.errorResponse);
    }
    
    const base64Data = imageValidation.base64Data;

    // Build system prompt with scenarios if provided
    let systemPrompt = "Analyze the clothing item";
    
    // Add scenarios section if provided
    if (scenarios && scenarios.length > 0) {
      systemPrompt += " and assess how well it works for the following scenarios:\n";
      scenarios.forEach((scenario, index) => {
        systemPrompt += `\n${index + 1}. ${scenario.name}`;
        if (scenario.description) systemPrompt += `: ${scenario.description}`;
      });
      systemPrompt += "\n\nInclude a 'SUITABLE SCENARIOS:' section listing ONLY the scenario names where this item would work well. List one per line without explanations.";
    }
    
    systemPrompt += " End your response with 'REASON: [brief explanation]', then 'FINAL RECOMMENDATION: [RECOMMEND/SKIP/MAYBE]', then 'SCORE: X' where X is a number from 1-10 based on how suitable this item would be for the user's wardrobe.";

    // Call Claude API
    const response = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 1024,
      temperature: 0.7,
      system: systemPrompt,
      messages: [
        {
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
              text: "Please analyze this clothing item as potential purchase for my wardrobe."
            }
          ]
        }
      ]
    });

    // Get the raw response text
    const analysisResponse = response.content[0].text;
    
    // Extract score, final recommendation, and reasoning from Claude's response
    let score = 5.0; // default score
    const scoreMatch = analysisResponse.match(/SCORE:?\s*([\d\.]+)/i);
    if (scoreMatch && scoreMatch[1]) {
      score = parseFloat(scoreMatch[1]);
    }
    
    // Extract final reason
    let finalReason = "";
    const finalReasonMatch = analysisResponse.match(/REASON:?\s*([\s\S]*?)(?=FINAL RECOMMENDATION:?|$)/i);
    if (finalReasonMatch && finalReasonMatch[1]) {
      finalReason = finalReasonMatch[1].trim();
    }
    
    // Extract final recommendation
    let finalRecommendation = "";
    const finalRecommendationMatch = analysisResponse.match(/FINAL RECOMMENDATION:?\s*([\s\S]*?)(?=SCORE:?|$)/i);
    if (finalRecommendationMatch && finalRecommendationMatch[1]) {
      finalRecommendation = finalRecommendationMatch[1].trim();
    }
    
    // Extract suitable scenarios using dedicated function
    const suitableScenarios = extractSuitableScenarios(analysisResponse);
    
    console.log('=== Simple Analysis Response ===');
    console.log('Response length:', analysisResponse.length, 'characters');
    console.log('Extracted score:', score);
    console.log('Extracted final reason:', finalReason);
    console.log('Extracted final recommendation:', finalRecommendation);
    console.log('Extracted suitable scenarios:', suitableScenarios);
    console.log('===============================');

    // Return the raw analysis with extracted data
    res.json({
      analysis: analysisResponse,
      score: score,
      finalReason: finalReason,
      finalRecommendation: finalRecommendation,
      suitableScenarios: suitableScenarios,
      success: true
    });
    
  } catch (err) {
    console.error('Error in simple Claude analysis:', err);
    res.status(500).json({ 
      error: 'Error analyzing image', 
      details: err.message,
      analysis: 'Sorry, there was an error analyzing your item. Please try again later.',
      success: false
    });
  }
});

module.exports = router;
