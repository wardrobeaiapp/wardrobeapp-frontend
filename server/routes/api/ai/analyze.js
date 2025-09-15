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
    const { imageBase64, detectedTags, climateData, scenarios, formData, stylingContext, similarContext, additionalContext } = req.body;
    
    // Log the complete request body for debugging
    console.log('=== Request Body ===');
    console.log('imageBase64:', imageBase64 ? 'present' : 'missing');
    console.log('detectedTags:', detectedTags || 'none');
    console.log('climateData:', climateData || 'none');
    console.log('scenarios:', scenarios || 'none');
    console.log('formData:', formData || 'none');
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

    // Build a prompt for Claude
    let systemPrompt = "You are a fashion expert, personal stylist and wardrobe consultant. ";
    systemPrompt += "Your task is to analyze a potential clothing purchase and provide a recommendation on whether it's worth buying, ";
    systemPrompt += "considering the user's existing wardrobe, lifestyle, individual needs, and specific scenarios.";
    
    // Include category and subcategory from formData if available
    if (formData && (formData.category || formData.subcategory)) {
      systemPrompt += "\n\nThe user has provided the following information about this item:";
      
      if (formData.category) {
        systemPrompt += "\n- Category: " + formData.category;
      }
      
      if (formData.subcategory) {
        systemPrompt += "\n- Subcategory: " + formData.subcategory;
      }
      
      if (formData.seasons && formData.seasons.length > 0) {
        systemPrompt += "\n- Seasons: " + formData.seasons.join(", ");
      }
      
      systemPrompt += "\n\nPlease consider this information when analyzing the item.";
    }
    
    // Include user's scenarios if available
    if (req.body.scenarios && req.body.scenarios.length > 0) {
      systemPrompt += "\n\nThe user has provided the following scenarios where they need appropriate clothing:";
      
      req.body.scenarios.forEach((scenario, index) => {
        systemPrompt += `\n${index + 1}. ${scenario.name}`;
        if (scenario.type) systemPrompt += ` (Type: ${scenario.type})`;
        if (scenario.frequency) systemPrompt += ` [${scenario.frequency}]`;
        if (scenario.description) systemPrompt += `: ${scenario.description}`;
      });
      
      systemPrompt += "\n\nWhen analyzing this item, please consider:";
      systemPrompt += "\n- For outerwear items: Evaluate how well they complement the user's outfits for different scenarios (excluding 'Staying at Home'), even if not worn during the scenario itself.";
      systemPrompt += "\n- For 'Office Work': Consider how the item might be used for commuting to/from work";
      systemPrompt += "\n- For each scenario (excluding 'Staying at Home' for outerwear), assess:";
      systemPrompt += "\n  * If it's outerwear: How well it works with the clothing typically worn in that scenario";
      systemPrompt += "\n  * If it's not outerwear: How appropriate it is for the scenario itself";
      systemPrompt += "\n- How versatile the item is across multiple scenarios, considering both direct use and layering potential";
      systemPrompt += "\n- If the item fills any gaps in the user's wardrobe for these specific scenarios";
      systemPrompt += "\n\nImportant: For outerwear, completely skip any mention of 'Staying at Home' scenario in your analysis. Do not reference it at all when discussing outerwear items.";
    }
    
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
    
    // Include styling context (similar category/subcategory items for styling compatibility)
    if (stylingContext && stylingContext.length > 0) {
      systemPrompt += "\n\nFor styling context, here are similar items the user already owns in their wardrobe:\n";
      
      stylingContext.forEach((item, index) => {
        systemPrompt += `${index + 1}. ${item.name} - ${item.category}`;
        if (item.color) systemPrompt += ` (${item.color})`;
        if (item.season && item.season.length > 0) {
          systemPrompt += ` [${item.season.join(', ')}]`;
        }
        systemPrompt += "\n";
      });
      
      systemPrompt += "\nWhen analyzing the new item, consider:";
      systemPrompt += "\n- How well it will coordinate with these existing similar items";
      systemPrompt += "\n- Whether it adds variety or just duplicates what the user already has";
      systemPrompt += "\n- Styling opportunities and outfit combinations with these existing pieces";
    }
    
    // Include gap analysis context (items from different categories/seasons for wardrobe completeness)
    if (similarContext && similarContext.length > 0) {
      systemPrompt += "\n\nFor gap analysis, here is a sample of the user's existing wardrobe across different categories:\n";
      
      const categorySummary = {};
      similarContext.forEach(item => {
        if (!categorySummary[item.category]) {
          categorySummary[item.category] = [];
        }
        categorySummary[item.category].push(item);
      });
      
      Object.keys(categorySummary).forEach(category => {
        const items = categorySummary[category];
        systemPrompt += `\n${category} (${items.length} item${items.length > 1 ? 's' : ''}):`;
        items.slice(0, 3).forEach(item => { // Show max 3 items per category to avoid prompt bloat
          systemPrompt += `\n- ${item.name}`;
          if (item.color) systemPrompt += ` (${item.color})`;
          if (item.season && item.season.length > 0) {
            systemPrompt += ` [${item.season.join(', ')}]`;
          }
        });
        if (items.length > 3) {
          systemPrompt += `\n- ... and ${items.length - 3} more`;
        }
      });
      
      systemPrompt += "\n\nWhen analyzing the new item, consider:";
      systemPrompt += "\n- What gaps this item might fill in the user's wardrobe";
      systemPrompt += "\n- How it expands their outfit possibilities across different categories";
      systemPrompt += "\n- Whether the user has enough complementary pieces to make this item useful";
      systemPrompt += "\n- Seasonal balance and coverage across the user's wardrobe";
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
