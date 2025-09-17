const express = require('express');
const router = express.Router();
const { Anthropic } = require('@anthropic-ai/sdk');

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * @route POST /api/outfit-suggestions
 * @desc Get outfit suggestions based on wardrobe items and preferences
 * @access Private
 */
router.post('/', async (req, res) => {
  try {
    const { wardrobeItems, occasion, season, preferences } = req.body;

    // Create a prompt for Claude
    const prompt = `
      I have the following items in my wardrobe:
      ${JSON.stringify(wardrobeItems, null, 2)}
      
      ${occasion ? `I need an outfit for this occasion: ${occasion}` : ''}
      ${season ? `The current season is: ${season}` : ''}
      ${preferences ? `My style preferences: ${preferences}` : ''}
      
      Please suggest an outfit using only the items in my wardrobe. 
      Provide a name for the outfit, the items to use, and some style advice.
      Format your response as a JSON object with the following structure:
      {
        "outfitSuggestion": {
          "name": "Outfit name",
          "items": ["item1_id", "item2_id", ...],
          "occasion": "occasion",
          "season": ["season1", "season2", ...],
          "favorite": false,
          "dateCreated": "ISO date string"
        },
        "styleAdvice": "Your style advice here",
        "message": "Any additional message"
      }
    `;

    // Call the Claude API
    const response = await anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Parse the response to extract the JSON
    const content = response.content[0];
    
    if (content.type === 'text') {
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        return res.json(JSON.parse(jsonMatch[0]));
      }
    }

    // If no JSON is found, return a default response
    return res.json({
      message: 'Could not generate outfit suggestion. Please try again.',
    });
  } catch (error) {
    console.error('Error calling Claude API:', error);
    res.status(500).json({
      message: 'Error connecting to Claude API. Please check your API key and try again.',
    });
  }
});

module.exports = router;
