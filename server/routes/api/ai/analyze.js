const express = require('express');
const { Anthropic } = require('@anthropic-ai/sdk');
const { formatStylePreferencesForPrompt } = require('../../../utils/stylePreferencesUtils');
const { analyzeScenarioCoverage } = require('../../../utils/scenarioAnalysis');
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
    const { imageBase64, detectedTags, climateData, scenarios, formData, stylingContext, similarContext, additionalContext } = req.body;
    
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
    console.log('===================');
    
    // Log that we received user data
    if (climateData) {
      console.log('Received user climate data from frontend for analysis:', climateData);
    }
    
    if (scenarios && scenarios.length > 0) {
      console.log(`Received ${scenarios.length} scenarios from frontend`);
    }

    if (!imageBase64) {
      return res.status(400).json({ error: 'Image data is required' });
    }

    // Extract base64 data without prefix if present and ensure it's properly formatted
    let base64Data = imageBase64;
    
    // Handle data URI format (e.g., data:image/jpeg;base64,/9j/4AAQ...)
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

    // Simple validation of base64 data - ensuring it's non-empty and reasonable size
    if (!base64Data || base64Data.length < 100) {
      return res.status(400).json({ 
        error: 'Insufficient image data', 
        details: 'The provided image data is too small to be a valid image',
        analysis: 'Error analyzing image. The image data appears to be incomplete.',
        score: 5.0,
        feedback: 'Please provide a complete image.'
      });
    }

    // Build the system prompt using modular approach
    let systemPrompt = buildSystemPrompt();
    
    // Add form data section
    systemPrompt = addFormDataSection(systemPrompt, formData);
    
    // Add scenarios section
    systemPrompt = addScenariosSection(systemPrompt, req.body.scenarios);
    
    // Add climate section
    systemPrompt = addClimateSection(systemPrompt, climateData);
    
    // Add styling context section
    systemPrompt = addStylingContextSection(systemPrompt, stylingContext);

    // Analyze scenario coverage and add section
    let scenarioCoverage = null;
    if (req.body.scenarios && req.body.scenarios.length > 0 && (similarContext || additionalContext)) {
      const allContextItems = [...(similarContext || []), ...(additionalContext || [])];
      // Pass form data seasons to analyze only seasonal-appropriate coverage
      const targetSeasons = req.body.formData?.seasons || null;
      scenarioCoverage = analyzeScenarioCoverage(req.body.scenarios, allContextItems, targetSeasons);
      systemPrompt = addScenarioCoverageSection(systemPrompt, scenarioCoverage);
    }
    
    // Add gap analysis section
    systemPrompt = addGapAnalysisSection(systemPrompt, similarContext);
    
    // Add final instructions and detected tags
    systemPrompt = addFinalInstructions(systemPrompt, detectedTags);

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

    // Extract analysis from Claude response
    let analysisResponse = response.content[0].text;
    console.log('Claude response:', analysisResponse);
    
    // Parse and restructure response to extract sections
    let analysis = "";
    let score = 5.0;
    let feedback = "";
    let finalRecommendation = "";
    
    // Helper function to format structured analysis
    function formatStructuredAnalysis(rawAnalysis) {
      let formatted = "";
      
      // Extract PROS section
      const prosMatch = rawAnalysis.match(/PROS:?\s*([\s\S]*?)(?=CONS:?|SUITABLE SCENARIOS:?|COMBINATION SUGGESTIONS:?|$)/i);
      if (prosMatch && prosMatch[1]) {
        const prosText = prosMatch[1].trim();
        formatted += "**PROS:**\n";
        // Look for numbered lists first (1. 2. 3.)
        const numberedPoints = prosText.match(/\d+\.\s*([^0-9]+?)(?=\d+\.|$)/g);
        if (numberedPoints && numberedPoints.length > 0) {
          numberedPoints.forEach((point, index) => {
            if (index < 3) {
              const cleanPoint = point.replace(/^\d+\.\s*/, '').trim();
              formatted += `✓ ${cleanPoint}\n`;
            }
          });
        } else {
          // Fallback: split by sentences for paragraph text
          const prosPoints = prosText.split(/[.!]\s+/).filter(p => p.trim().length > 15);
          prosPoints.forEach((point, index) => {
            if (index < 3) {
              formatted += `✓ ${point.trim().replace(/^[-•]\s*/, '')}\n`;
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
        } else {
          const consPoints = consText.split(/[.!]\s+/).filter(p => p.trim().length > 15);
          consPoints.forEach((point, index) => {
            if (index < 3) {
              formatted += `✗ ${point.trim().replace(/^[-•]\s*/, '')}\n`;
            }
          });
        }
        formatted += "\n";
      }
      
      // Extract SUITABLE SCENARIOS section
      const scenariosMatch = rawAnalysis.match(/SUITABLE SCENARIOS:?\s*([\s\S]*?)(?=COMBINATION SUGGESTIONS:?|$)/i);
      if (scenariosMatch && scenariosMatch[1]) {
        const scenariosText = scenariosMatch[1].trim();
        formatted += "**SUITABLE SCENARIOS:**\n";
        const numberedPoints = scenariosText.match(/\d+\.\s*([^0-9]+?)(?=\d+\.|$)/g);
        if (numberedPoints && numberedPoints.length > 0) {
          numberedPoints.forEach((point, index) => {
            if (index < 3) {
              const cleanPoint = point.replace(/^\d+\.\s*/, '').trim();
              formatted += `🎯 ${cleanPoint}\n`;
            }
          });
        } else {
          const scenarioPoints = scenariosText.split(/[.!]\s+/).filter(p => p.trim().length > 10);
          scenarioPoints.forEach((point, index) => {
            if (index < 3) {
              formatted += `🎯 ${point.trim().replace(/^[-•]\s*/, '')}\n`;
            }
          });
        }
        formatted += "\n";
      }
      
      // Extract COMBINATION SUGGESTIONS section
      const combinationsMatch = rawAnalysis.match(/COMBINATION SUGGESTIONS:?\s*([\s\S]*?)(?=$)/i);
      if (combinationsMatch && combinationsMatch[1]) {
        const combinationsText = combinationsMatch[1].trim();
        formatted += "**COMBINATION SUGGESTIONS:**\n";
        const numberedPoints = combinationsText.match(/\d+\.\s*([^0-9]+?)(?=\d+\.|$)/g);
        if (numberedPoints && numberedPoints.length > 0) {
          numberedPoints.forEach((point, index) => {
            if (index < 3) {
              const cleanPoint = point.replace(/^\d+\.\s*/, '').trim();
              formatted += `👔 ${cleanPoint}\n`;
            }
          });
        } else {
          const combPoints = combinationsText.split(/[.!]\s+/).filter(p => p.trim().length > 15);
          combPoints.forEach((point, index) => {
            if (index < 3) {
              formatted += `👔 ${point.trim().replace(/^[-•]\s*/, '')}\n`;
            }
          });
        }
      }
      
      return formatted || rawAnalysis; // Fallback to original if parsing fails
    }
    
    // Look for ANALYSIS section
    const analysisMatch = analysisResponse.match(/ANALYSIS:?\s*([\s\S]*?)(?=SCORE:?|$)/i);
    if (analysisMatch && analysisMatch[1]) {
      analysis = formatStructuredAnalysis(analysisMatch[1].trim());
    } else {
      analysis = formatStructuredAnalysis(analysisResponse); // Format the full response if no sections found
    }
    
    // Look for SCORE section
    const scoreMatch = analysisResponse.match(/SCORE:?\s*([\d\.]+)/i);
    if (scoreMatch && scoreMatch[1]) {
      score = parseFloat(scoreMatch[1]);
    }
    
    // Look for FEEDBACK section
    const feedbackMatch = analysisResponse.match(/FEEDBACK:?\s*([\s\S]*?)(?=FINAL RECOMMENDATION:?|$)/i);
    if (feedbackMatch && feedbackMatch[1]) {
      feedback = feedbackMatch[1].trim();
    }
    
    // Look for FINAL RECOMMENDATION section
    const finalRecommendationMatch = analysisResponse.match(/FINAL RECOMMENDATION:?\s*([\s\S]*?)(?=$)/i);
    if (finalRecommendationMatch && finalRecommendationMatch[1]) {
      finalRecommendation = finalRecommendationMatch[1].trim();
    }
    
    console.log('FINAL RECOMMENDATION extracted:', finalRecommendation);
    
    // Send back the extracted information
    res.json({
      analysis,
      score,
      feedback,
      finalRecommendation
    });
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
