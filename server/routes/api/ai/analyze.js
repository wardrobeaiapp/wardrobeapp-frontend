const express = require('express');
const { Anthropic } = require('@anthropic-ai/sdk');
const { formatStylePreferencesForPrompt } = require('../../../utils/stylePreferencesUtils');
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
    const { imageBase64, detectedTags, userPreferences, climateData } = req.body;
    
    // Log that we received user data
    if (userPreferences) {
      console.log('Received user style preferences from frontend for analysis');
    }
    
    if (climateData) {
      console.log('Received user climate data from frontend for analysis:', climateData);
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

    // Build a prompt for Claude
    let systemPrompt = "You are an fashion expert, personal stylist and wardrobe consultant. ";
    systemPrompt += "Your task is to analyze a potential clothing purchase and provide a recommendation on whether it's worth buying, ";
    systemPrompt += "considering the user's existing wardrobe, lifestyle, and individual needs.";
    
    // Style preferences processing - Currently disabled, but maintained in a utility module
    // Uncomment the line below to include style preferences in the prompt
    // systemPrompt += formatStylePreferencesForPrompt(userPreferences);
    
    // Note: We still receive userPreferences in the request (line 18), but don't include them in the prompt by default
    // This section is commented out but kept for use in other requests    
    
    // Include user's local climate if available
    if (climateData && climateData.localClimate) {
      // Format the climate string to be more human-readable
      let formattedClimate = climateData.localClimate
        .replace(/-/g, ' ')  // Replace hyphens with spaces
        .split(' ')          // Split into words
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))  // Capitalize each word
        .join(' ');         // Join back with spaces
        
      systemPrompt += "\n\nImportant - Consider the user's local climate:\n";
      systemPrompt += "- Local climate: " + formattedClimate + "\n";
      
      // Add guidance for climate considerations
      systemPrompt += "- When making recommendations, consider what materials and styles are appropriate for this climate.\n";
      systemPrompt += "- Mention any climate-specific considerations that might affect the longevity, utility, or appropriateness of the item.\n";
    }
    
    if (detectedTags) {
      systemPrompt += "\n\nHere are tags that were automatically detected in the image: " + JSON.stringify(detectedTags);
    }
    
    systemPrompt += "\n\nProvide a score from 1-10 on how versatile and valuable this item is for a wardrobe. ";
    systemPrompt += "Format your response with three sections: ANALYSIS, SCORE, and FEEDBACK. ";
    systemPrompt += "Keep your total response under 300 words.";

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
    
    // Parse response to extract sections
    let analysis = "";
    let score = 5.0;
    let feedback = "";
    
    // Look for ANALYSIS section
    const analysisMatch = analysisResponse.match(/ANALYSIS:?\s*([\s\S]*?)(?=SCORE:?|$)/i);
    if (analysisMatch && analysisMatch[1]) {
      analysis = analysisMatch[1].trim();
    } else {
      analysis = analysisResponse; // Use the full response if no sections found
    }
    
    // Look for SCORE section
    const scoreMatch = analysisResponse.match(/SCORE:?\s*([\d\.]+)/i);
    if (scoreMatch && scoreMatch[1]) {
      score = parseFloat(scoreMatch[1]);
    }
    
    // Look for FEEDBACK section
    const feedbackMatch = analysisResponse.match(/FEEDBACK:?\s*([\s\S]*?)(?=$)/i);
    if (feedbackMatch && feedbackMatch[1]) {
      feedback = feedbackMatch[1].trim();
    }
    
    // Send back the extracted information
    res.json({
      analysis,
      score,
      feedback
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
