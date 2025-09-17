const express = require('express');
const router = express.Router();
const { Anthropic } = require('@anthropic-ai/sdk');

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * @route POST /api/style-advice
 * @desc Get style advice for a specific outfit
 * @access Private
 */
router.post('/', async (req, res) => {
  try {
    const { outfit, wardrobeItems } = req.body;

    // Find the actual wardrobe items from the outfit's item IDs
    const outfitItems = outfit.items
      .map(id => wardrobeItems.find(item => item.id === id))
      .filter(item => item !== undefined);

    // Create a prompt for Claude
    const prompt = `
      I have created the following outfit named "${outfit.name}":
      ${JSON.stringify(outfitItems, null, 2)}
      
      Please provide style advice for this outfit. Include suggestions for:
      1. How to accessorize
      2. Alternative items that could work well
      3. Occasions where this outfit would be appropriate
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

    const content = response.content[0];
    
    if (content.type === 'text') {
      return res.json({ styleAdvice: content.text });
    }

    return res.json({ 
      styleAdvice: 'Could not generate style advice. Please try again.' 
    });
  } catch (error) {
    console.error('Error calling Claude API:', error);
    res.status(500).json({
      message: 'Error connecting to Claude API. Please check your API key and try again.',
    });
  }
});

module.exports = router;
