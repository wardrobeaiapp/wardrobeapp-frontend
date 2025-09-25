const express = require('express');
const { Anthropic } = require('@anthropic-ai/sdk');

// Import utilities
const imageValidator = require('../../../utils/imageValidator');
const extractSuitableScenarios = require('../../../utils/ai/extractSuitableScenarios');
const analyzeScenarioCoverageForScore = require('../../../utils/ai/analyzeScenarioCoverageForScore');

const router = express.Router();

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});



// @route   POST /api/analyze-wardrobe-item-simple
// @desc    Simple analysis of wardrobe item with Claude - just basic prompt
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { imageBase64, formData, scenarios, scenarioCoverage, userGoals } = req.body;
    
    console.log('=== Simple Analysis Request ===');
    console.log('imageBase64:', imageBase64 ? 'present' : 'missing');
    console.log('formData:', JSON.stringify(formData, null, 2) || 'none');
    console.log('scenarios:', scenarios || 'none');
    console.log('scenarioCoverage:', scenarioCoverage || 'none');
    console.log('userGoals:', userGoals || 'none');
    console.log('==============================');

    // Validate and process image data
    const imageValidation = imageValidator.validateAndProcess(imageBase64);
    if (!imageValidation.isValid) {
      return res.status(imageValidation.statusCode).json(imageValidation.errorResponse);
    }
    
    const base64Data = imageValidation.base64Data;

    // Build system prompt with scenarios if provided
    let systemPrompt = "You are evaluating whether this clothing/accessory item is suitable for different lifestyle scenarios. Think about where and when this item would realistically be used.";
    
    // Add scenarios section if provided
    if (scenarios && scenarios.length > 0) {
      systemPrompt += "\n\nEvaluate suitability for these scenarios:\n";
      scenarios.forEach((scenario, index) => {
        systemPrompt += `\n${index + 1}. ${scenario.name}`;
        if (scenario.description) systemPrompt += `: ${scenario.description}`;
      });
      
      systemPrompt += "\n\nGuidelines:";
      systemPrompt += "\n- Pay close attention to scenario descriptions - they specify dress codes and formality requirements";
      systemPrompt += "\n- Match the item's formality level to the scenario's requirements";
      systemPrompt += "\n- Consider practical reality: Would someone actually wear this item for this activity?";
      systemPrompt += "\n- Think about styling potential: Basic items can work in elevated scenarios when styled appropriately";
      
      systemPrompt += "\n\nList ONLY truly suitable scenarios in a 'SUITABLE SCENARIOS:' section. Be realistic about when someone would actually use this item. Number them starting from 1 (1., 2., 3., etc.), one scenario per line, no explanations.";
    }
    systemPrompt += " End your response with 'REASON: [brief explanation]', then 'FINAL RECOMMENDATION: [RECOMMEND/SKIP/MAYBE]'.";

    // Call Claude API
    const response = await anthropic.messages.create({
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
    const rawAnalysisResponse = response.content[0].text;
    
    // Extract final reason and recommendation from raw text BEFORE cleaning
    let finalReason = "";
    const finalReasonMatch = rawAnalysisResponse.match(/REASON:?\s*([\s\S]*?)(?=FINAL RECOMMENDATION:?|$)/i);
    if (finalReasonMatch && finalReasonMatch[1]) {
      finalReason = finalReasonMatch[1].trim();
    }
    
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
    
    // Extract suitable scenarios using dedicated function (from raw response)
    const suitableScenarios = extractSuitableScenarios(rawAnalysisResponse);
    
    // Analyze scenario coverage to get score and objective reason
    const analysisResult = analyzeScenarioCoverageForScore(scenarioCoverage, suitableScenarios, formData, userGoals);
    const initialScore = analysisResult.score;
    const objectiveFinalReason = analysisResult.reason;
    
    console.log('=== Simple Analysis Response ===');
    console.log('Response length:', analysisResponse.length, 'characters');
    console.log('Score from coverage analysis:', initialScore);
    console.log('Claude recommendation:', claudeRecommendation);
    console.log('Claude reason:', finalReason);
    console.log('Objective reason:', objectiveFinalReason);
    console.log('Extracted suitable scenarios:', suitableScenarios);
    console.log('===============================');

    // Return the analysis with coverage-based score and explanation
    res.json({
      analysis: analysisResponse,
      score: initialScore, // Frontend will convert this to action/status
      recommendationText: objectiveFinalReason, // Human-readable explanation
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
