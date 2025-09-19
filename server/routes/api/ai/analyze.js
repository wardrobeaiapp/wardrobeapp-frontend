const express = require('express');
const { Anthropic } = require('@anthropic-ai/sdk');
const {
  buildSystemPrompt,
  addFormDataSection,
  addScenariosSection,
  addClimateSection,
  addStylingContextSection,
  addUserGoalsSection,
  addFinalInstructions
} = require('../../../utils/promptBuilder');

// Import services and utilities
const duplicateDetectionService = require('../../../services/duplicateDetectionService');
const scenarioCoverageService = require('../../../services/scenarioCoverageService');
const imageValidator = require('../../../utils/imageValidator');
const responseFormatter = require('../../../utils/responseFormatter');

const router = express.Router();

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// @route   POST /api/analyze-wardrobe-item
// @desc    Analyze wardrobe item with Claude
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { imageBase64, detectedTags, climateData, scenarios, formData, stylingContext, similarContext, additionalContext, scenarioCoverage, userGoals, userId } = req.body;
    
    // Log the complete request body for debugging
    console.log('=== Request Body ===');
    console.log('imageBase64:', imageBase64 ? 'present' : 'missing');
    console.log('detectedTags:', detectedTags || 'none');
    console.log('climateData:', climateData || 'none');
    console.log('scenarios:', scenarios || 'none');
    console.log('formData:', JSON.stringify(formData, null, 2) || 'none');
    console.log('stylingContext:', stylingContext ? `${stylingContext.length} items` : 'none');
    console.log('similarContext:', similarContext ? `${similarContext.length} items` : 'none');
    console.log('additionalContext:', additionalContext ? `${additionalContext.length} items` : 'none');
    console.log('scenarioCoverage:', scenarioCoverage ? `${scenarioCoverage.length} scenarios` : 'none');
    console.log('userGoals:', userGoals || 'none');
    console.log('===================');
    
    // Log that we received user data
    if (climateData) {
      console.log('Received user climate data from frontend for analysis:', climateData);
    }
    
    if (scenarios && scenarios.length > 0) {
      console.log(`Received ${scenarios.length} scenarios from frontend`);
    }

    // Validate and process image data
    const imageValidation = imageValidator.validateAndProcess(imageBase64);
    if (!imageValidation.isValid) {
      return res.status(imageValidation.statusCode).json(imageValidation.errorResponse);
    }
    
    const base64Data = imageValidation.base64Data;

    // Build the system prompt using modular approach
    let systemPrompt = buildSystemPrompt();
    
    // Add form data section
    systemPrompt = addFormDataSection(systemPrompt, formData);
    
    // Add scenarios section
    systemPrompt = addScenariosSection(systemPrompt, req.body.scenarios);
    
    // Add climate section
    systemPrompt = addClimateSection(systemPrompt, climateData);
    
    // Add user goals section
    systemPrompt = addUserGoalsSection(systemPrompt, userGoals);
    
    // Add styling context section
    systemPrompt = addStylingContextSection(systemPrompt, stylingContext);

    // === SCENARIO COVERAGE ANALYSIS ===
    const coverageAnalysis = await scenarioCoverageService.analyze(
      scenarioCoverage, formData, userId, req.body.scenarios
    );
    
    if (coverageAnalysis.promptSection) {
      systemPrompt += coverageAnalysis.promptSection;
    }

    // === ENHANCED DUPLICATE DETECTION ===
    const duplicateResult = await duplicateDetectionService.analyzeWithAI(
      base64Data, formData, similarContext, additionalContext
    );
    
    if (duplicateResult) {
      const promptSection = duplicateDetectionService.generatePromptSection(
        duplicateResult.extractedAttributes, 
        duplicateResult.duplicateAnalysis
      );
      systemPrompt += promptSection;
    }
    
    // Add final instructions
    systemPrompt = addFinalInstructions(systemPrompt);
    
    // Debug: Log the full prompt being sent to AI (truncated for readability)
    console.log('=== FULL PROMPT TO AI (last 1000 chars) ===');
    console.log(systemPrompt.slice(-1000));
    console.log('=== END PROMPT ===');

    // Log the complete prompt for debugging
    console.log('==== FULL CLAUDE PROMPT ====');
    console.log(systemPrompt);
    console.log('============================');
    
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
              text: "Please analyze this clothing item for my wardrobe."
            }
          ]
        }
      ]
    });

    // Parse and format the response
    const analysisResponse = response.content[0].text;
    const parsedResponse = responseFormatter.parseResponse(analysisResponse);
    
    // Build the final response with analysis data
    const analysisData = responseFormatter.formatAnalysisData(duplicateResult, scenarioCoverage);
    const responseData = responseFormatter.buildResponse(parsedResponse, analysisData);
    
    console.log('=== FINAL RESPONSE ===');
    console.log('Duplicate detection:', duplicateResult ? 'enabled' : 'disabled');
    console.log('Scenario coverage:', scenarioCoverage ? 'enabled' : 'disabled');
    console.log('Score:', parsedResponse.score);
    console.log('====================');
    
    res.json(responseData);
  } catch (err) {
    console.error('Error in Claude analysis:', err);
    res.status(500).json({ 
      error: 'Error analyzing image', 
      details: err.message,
      analysis: 'Sorry, there was an error analyzing your item. Please try again later.',
      score: 5.0,
      feedback: 'Technical error encountered.'
    });
  }
});

module.exports = router;
