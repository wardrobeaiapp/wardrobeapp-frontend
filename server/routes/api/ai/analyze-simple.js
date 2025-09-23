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

/**
 * Analyze scenario coverage to determine initial score based on gap analysis
 * @param {Array} scenarioCoverage - Scenario coverage data
 * @param {string[]} suitableScenarios - Array of suitable scenario names from Claude analysis
 * @param {Object} formData - Form data with category/subcategory info
 * @param {Array} userGoals - User goals that affect scoring
 * @returns {number} Initial score based on coverage analysis (1-10)
 */
function analyzeScenarioCoverageForScore(scenarioCoverage, suitableScenarios, formData, userGoals) {
  if (!scenarioCoverage || !Array.isArray(scenarioCoverage) || scenarioCoverage.length === 0) {
    return 5.0; // Default score if no coverage data
  }
  
  console.log('🎯 Analyzing scenario coverage for initial score...');
  console.log('Suitable scenarios from Claude:', suitableScenarios);
  
  let relevantCoverage = [];
  
  // Filter coverage based on suitable scenarios, but handle special cases
  if (suitableScenarios && suitableScenarios.length > 0) {
    // Check only suitable scenarios
    relevantCoverage = scenarioCoverage.filter(coverage => {
      // Always include "All scenarios" coverage (e.g. outerwear)
      if (coverage.scenarioName.toLowerCase().includes('all scenarios')) {
        return true;
      }
      
      // Include specific scenarios that match
      return suitableScenarios.some(scenario => 
        coverage.scenarioName.toLowerCase().includes(scenario.toLowerCase()) ||
        scenario.toLowerCase().includes(coverage.scenarioName.toLowerCase())
      );
    });
    console.log('Filtered coverage for suitable scenarios:', relevantCoverage.length, 'entries');
    
    // If filtering resulted in 0 entries, use all coverage as fallback
    if (relevantCoverage.length === 0) {
      console.log('No matches found, falling back to all coverage');
      relevantCoverage = scenarioCoverage;
    }
  } else {
    // Use all coverage if no suitable scenarios identified
    relevantCoverage = scenarioCoverage;
    console.log('Using all coverage data:', relevantCoverage.length, 'entries');
  }
  
  if (relevantCoverage.length === 0) {
    console.log('No relevant coverage found, using default score');
    return 5.0;
  }
  
  // Find the most critical gap type to determine score
  let gapType = null;
  
  for (const coverage of relevantCoverage) {
    console.log(`Coverage: ${coverage.scenarioName} - ${coverage.category} - ${coverage.gapType}`);
    
    if (coverage.gapType) {
      // Simple priority: critical > improvement > expansion > satisfied > oversaturated
      if (!gapType || 
          (coverage.gapType === 'critical') ||
          (coverage.gapType === 'improvement' && gapType !== 'critical') ||
          (coverage.gapType === 'expansion' && !['critical', 'improvement'].includes(gapType))) {
        gapType = coverage.gapType;
      }
    }
  }
  
  // Check if user has decluttering/money-saving goals
  const hasConstraintGoals = userGoals && userGoals.some(goal => 
    ['buy-less-shop-more-intentionally', 'declutter-downsize', 'save-money'].includes(goal)
  );
  
  // Convert gap type to score with userGoals consideration
  let initialScore = 5.0;
  
  if (hasConstraintGoals) {
    // CONSTRAINED SCORING (declutter/save money goals)
    switch (gapType) {
      case 'critical':
        initialScore = 10;
        break;
      case 'improvement':
        initialScore = 9;
        break;
      case 'expansion':
        initialScore = 6; // Lower score - probably skip
        break;
      case 'satisfied':
        initialScore = 4; // Lower score - skip, you have enough
        break;
      case 'oversaturated':
        initialScore = 2; // Lower score - definitely skip
        break;
      default:
        initialScore = 5.0;
    }
    console.log(`Constrained scoring (${userGoals.filter(g => ['buy-less-shop-more-intentionally', 'declutter-downsize', 'save-money'].includes(g)).join(', ')}) - Gap type '${gapType}': ${initialScore}`);
  } else {
    // STANDARD SCORING
    switch (gapType) {
      case 'critical':
        initialScore = 10;
        break;
      case 'improvement':
        initialScore = 9;
        break;
      case 'expansion':
        initialScore = 8;
        break;
      case 'satisfied':
        initialScore = 6;
        break;
      case 'oversaturated':
        initialScore = 3;
        break;
      default:
        initialScore = 5.0;
    }
    console.log(`Standard scoring - Gap type '${gapType}': ${initialScore}`);
  }
  
  return initialScore;
}


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
    let systemPrompt = "Analyze the clothing item";
    
    // Add scenarios section if provided
    if (scenarios && scenarios.length > 0) {
      systemPrompt += " and assess how well it works for the following scenarios:\n";
      scenarios.forEach((scenario, index) => {
        systemPrompt += `\n${index + 1}. ${scenario.name}`;
        if (scenario.description) systemPrompt += `: ${scenario.description}`;
      });
      systemPrompt += "\n\nInclude a 'SUITABLE SCENARIOS:' section listing ONLY the scenario names where this item would work well. List one per line without explanations.";
      
      // Add outerwear-specific exclusion
      if (formData && formData.category && formData.category.toLowerCase() === 'outerwear') {
        systemPrompt += " Note: Exclude 'Staying at Home' for outerwear items as they are not worn indoors.";
      }
    }
    
    systemPrompt += " End your response with 'REASON: [brief explanation]', then 'FINAL RECOMMENDATION: [RECOMMEND/SKIP/MAYBE]'.";

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
    
    // We don't need Claude's score - we use coverage analysis score only
    
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
    
    // Analyze scenario coverage to get initial score
    const initialScore = analyzeScenarioCoverageForScore(scenarioCoverage, suitableScenarios, formData, userGoals);
    
    console.log('=== Simple Analysis Response ===');
    console.log('Response length:', analysisResponse.length, 'characters');
    console.log('Score from coverage analysis:', initialScore);
    console.log('Extracted final reason:', finalReason);
    console.log('Extracted final recommendation:', finalRecommendation);
    console.log('Extracted suitable scenarios:', suitableScenarios);
    console.log('===============================');

    // Return the analysis with coverage-based score only
    res.json({
      analysis: analysisResponse,
      score: initialScore, // Only score - from gap analysis
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
