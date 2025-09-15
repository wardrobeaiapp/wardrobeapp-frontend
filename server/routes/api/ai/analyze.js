const express = require('express');
const { Anthropic } = require('@anthropic-ai/sdk');
const { formatStylePreferencesForPrompt } = require('../../../utils/stylePreferencesUtils');
const router = express.Router();

// Helper function to analyze scenario coverage with existing wardrobe
function analyzeScenarioCoverage(scenarios, wardrobeItems) {
  return scenarios.map(scenario => {
    console.log('Scenario:', scenario);
    // Get items that are suitable for this scenario
    const suitableItems = wardrobeItems.filter(item => {
      // Check if item is explicitly tagged for this scenario
      if (item.scenarios && item.scenarios.includes(scenario.name)) {
        return true;
      }
      
      // Auto-detect suitability based on scenario type and item characteristics
      return isItemSuitableForScenario(item, scenario);
    });

    // Analyze coverage by category
    const categoryAnalysis = analyzeCategoryBalance(suitableItems);
    const coverageLevel = calculateCoverageScore(categoryAnalysis, scenario);
    const gaps = identifyGaps(categoryAnalysis, scenario);
    const strengths = identifyStrengths(categoryAnalysis);

    return {
      scenarioName: scenario.name,
      frequency: scenario.frequency,
      suitableItems: suitableItems.length,
      coverageLevel,
      coverageDescription: getCoverageDescription(coverageLevel),
      gaps,
      strengths,
      categoryBreakdown: categoryAnalysis
    };
  });
}

function isItemSuitableForScenario(item, scenario) {
  const scenarioName = scenario.name.toLowerCase();
  const itemCategory = item.category?.toLowerCase() || '';
  const itemSubcategory = item.subcategory?.toLowerCase() || '';
  const itemStyle = item.style?.toLowerCase() || '';
  
  // Office Work / Professional scenarios
  if (scenarioName.includes('office') || scenarioName.includes('work') || scenarioName.includes('professional')) {
    return ['blazer', 'shirt', 'blouse', 'dress shirt', 'trousers', 'dress pants', 'dress', 'formal shoes', 'heels'].includes(itemSubcategory) ||
           itemStyle.includes('formal') || itemStyle.includes('business');
  }
  
  // Casual / Weekend scenarios
  if (scenarioName.includes('casual') || scenarioName.includes('weekend')) {
    return ['t-shirt', 'jeans', 'shorts', 'sneakers', 'casual dress'].includes(itemSubcategory) ||
           itemStyle.includes('casual');
  }
  
  // Dinner / Evening scenarios
  if (scenarioName.includes('dinner') || scenarioName.includes('evening') || scenarioName.includes('date')) {
    return ['dress', 'blouse', 'nice shirt', 'heels', 'dress shoes'].includes(itemSubcategory) ||
           itemStyle.includes('elegant') || itemStyle.includes('dressy');
  }
  
  // Exercise / Gym scenarios
  if (scenarioName.includes('exercise') || scenarioName.includes('gym') || scenarioName.includes('workout')) {
    return ['activewear', 'sportswear', 'sneakers', 'athletic'].some(term => 
           itemSubcategory.includes(term) || itemStyle.includes(term));
  }
  
  // Default: consider versatile pieces suitable for most scenarios
  return ['jeans', 'shirt', 'sweater', 'cardigan', 'dress'].includes(itemSubcategory);
}

function analyzeCategoryBalance(items) {
  const analysis = {
    tops: items.filter(item => item.category === 'TOP').length,
    bottoms: items.filter(item => item.category === 'BOTTOM').length,
    dresses: items.filter(item => item.category === 'ONE_PIECE' && item.subcategory === 'dress').length,
    outerwear: items.filter(item => item.category === 'OUTERWEAR').length,
    footwear: items.filter(item => item.category === 'FOOTWEAR').length,
    accessories: items.filter(item => item.category === 'ACCESSORY').length
  };
  analysis.total = items.length;
  return analysis;
}

function calculateCoverageScore(categoryAnalysis, scenario) {
  let score = 0;
  const scenarioName = scenario.name.toLowerCase();
  
  // Base score from having any suitable items
  if (categoryAnalysis.total === 0) return 0;
  if (categoryAnalysis.total >= 1) score += 1;
  if (categoryAnalysis.total >= 3) score += 1;
  
  // Bonus for category balance
  const hasTopOrDress = categoryAnalysis.tops > 0 || categoryAnalysis.dresses > 0;
  const hasBottoms = categoryAnalysis.bottoms > 0;
  const hasFootwear = categoryAnalysis.footwear > 0;
  
  if (hasTopOrDress) score += 1;
  if (hasBottoms || categoryAnalysis.dresses > 0) score += 1; // Dresses can replace bottoms
  if (hasFootwear) score += 1;
  
  return Math.min(5, score);
}

function identifyGaps(categoryAnalysis, scenario) {
  const gaps = [];
  
  if (categoryAnalysis.tops === 0 && categoryAnalysis.dresses === 0) {
    gaps.push('suitable tops or dresses');
  }
  if (categoryAnalysis.bottoms === 0 && categoryAnalysis.dresses === 0) {
    gaps.push('suitable bottoms');
  }
  if (categoryAnalysis.footwear === 0) {
    gaps.push('appropriate footwear');
  }
  if (categoryAnalysis.outerwear === 0) {
    gaps.push('layering pieces');
  }
  
  return gaps;
}

function identifyStrengths(categoryAnalysis) {
  const strengths = [];
  
  if (categoryAnalysis.tops >= 2) strengths.push('variety of tops');
  if (categoryAnalysis.bottoms >= 2) strengths.push('bottom options');
  if (categoryAnalysis.dresses >= 1) strengths.push('dress options');
  if (categoryAnalysis.outerwear >= 1) strengths.push('layering pieces');
  if (categoryAnalysis.footwear >= 2) strengths.push('footwear variety');
  
  return strengths;
}

function getCoverageDescription(level) {
  const descriptions = {
    0: 'No suitable items - significant gap',
    1: 'Minimal coverage - major gaps',
    2: 'Basic coverage - several gaps',
    3: 'Good coverage - minor gaps',
    4: 'Strong coverage - well equipped',
    5: 'Excellent coverage - fully equipped'
  };
  return descriptions[level] || 'Unknown coverage level';
}

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
    let systemPrompt = "You are a fashion expert, personal stylist and wardrobe consultant with deep knowledge of both timeless style principles and current fashion relevance. ";
    systemPrompt += "Your task is to analyze a potential clothing purchase and provide a recommendation on whether it's worth buying, ";
    systemPrompt += "considering the user's existing wardrobe, lifestyle, individual needs, and specific scenarios.";
    
    systemPrompt += "\n\n=== FASHION RELEVANCE GUIDELINES ===";
    systemPrompt += "\nWhen making recommendations, always consider:";
    systemPrompt += "\n• **Fashion currency**: Ensure pieces feel current and won't look obviously dated, regardless of whether they're classic, trendy, or avant-garde";
    systemPrompt += "\n• **Modern fit standards**: Avoid recommending obviously outdated silhouettes that feel dated in today's fashion context";
    systemPrompt += "\n• **Color relevance**: Consider whether color combinations feel fresh and current, not dated";
    systemPrompt += "\n• **Styling evolution**: Account for how fashion norms have evolved (e.g., mixing casual/formal, layering techniques)";
    systemPrompt += "\n• **Proportional awareness**: Focus on flattering, well-balanced proportions appropriate for current fashion sensibilities";
    systemPrompt += "\n• **Fabric and finish quality**: Contemporary expectations for fabric weight, texture, and finishing";
    
    systemPrompt += "\n\n**Important**: Support the user's style exploration and preferences - whether they gravitate toward classic, trendy, minimalist, or extravagant pieces. Your role is to ensure their choices work well with their existing wardrobe and feel fashion-relevant, not to impose a particular aesthetic. Focus on helping them build a cohesive, wearable wardrobe that reflects their personal style while avoiding truly outdated elements.";
    
    systemPrompt += "\n\n=== VISUAL QUALITY INDICATORS ===";
    systemPrompt += "\nFrom the image, you can only assess what's visually apparent. Flag any obvious concerns if visible:";
    systemPrompt += "\n• **Visible construction issues**: Poor stitching, loose threads, uneven seams";
    systemPrompt += "\n• **Fit problems**: Obvious pulling, bunching, or poor drape on the model/person";
    systemPrompt += "\n• **Fabric appearance**: If fabric looks extremely thin, cheap, or poorly finished";
    systemPrompt += "\n• **Hardware issues**: Visibly poor zippers, buttons, or closures";
    systemPrompt += "\n\n**Important limitation**: You cannot assess true fabric quality, durability, or construction details that aren't visible in the photo. Never claim an item is \"high quality\" - only mention if you notice obvious visual red flags. When quality cannot be determined from the image, state this clearly.";
    
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
        if (item.subcategory) systemPrompt += ` (${item.subcategory})`;
        if (item.color) systemPrompt += ` - ${item.color}`;
        
        // Add detailed styling properties for better combination analysis
        const details = [];
        if (item.length) details.push(`length: ${item.length}`);
        if (item.silhouette) details.push(`silhouette: ${item.silhouette}`);
        if (item.rise) details.push(`rise: ${item.rise}`);
        if (item.neckline) details.push(`neckline: ${item.neckline}`);
        if (item.heel_height) details.push(`heel: ${item.heel_height}`);
        if (item.boot_height) details.push(`boot height: ${item.boot_height}`);
        if (item.material) details.push(`material: ${item.material}`);
        if (item.fit) details.push(`fit: ${item.fit}`);
        
        if (details.length > 0) {
          systemPrompt += ` [${details.join(', ')}]`;
        }
        
        if (item.season && item.season.length > 0) {
          systemPrompt += ` {${item.season.join(', ')}}`;
        }
        systemPrompt += "\n";
      });
      
      systemPrompt += "\nWhen analyzing the new item, consider these STYLING COMPATIBILITY factors:";
      systemPrompt += "\n- **Silhouette balance**: How different silhouettes work together (e.g., fitted top with wide-leg pants)";
      systemPrompt += "\n- **Length proportions**: Proper hem relationships (e.g., cropped tops with high-waisted bottoms)";
      systemPrompt += "\n- **Rise compatibility**: How trouser/skirt rise works with top length and tucking options";
      systemPrompt += "\n- **Neckline coordination**: How necklines pair with accessories and layering pieces";
      systemPrompt += "\n- **Material weight matching**: Lightweight vs heavy fabrics and seasonal appropriateness";
      systemPrompt += "\n- **Heel height practicality**: How footwear heel heights affect outfit proportions and occasion suitability";
      systemPrompt += "\n- **Overall style coherence**: Whether pieces create cohesive looks or clash in formality/aesthetic";
      systemPrompt += "\n- Identify specific combination opportunities and warn against poor styling matches";
    }

    // Analyze scenario coverage with existing wardrobe
    if (req.body.scenarios && req.body.scenarios.length > 0 && (similarContext || additionalContext)) {
      const allContextItems = [...(similarContext || []), ...(additionalContext || [])];
      const scenarioCoverage = analyzeScenarioCoverage(req.body.scenarios, allContextItems);
      
      systemPrompt += "\n\n=== WARDROBE SCENARIO COVERAGE ANALYSIS ===";
      systemPrompt += "\nBased on the user's existing wardrobe, here's how well each scenario is currently covered:\n";
      
      scenarioCoverage.forEach(coverage => {
        systemPrompt += `\n${coverage.scenarioName} [${coverage.frequency || 'frequency not specified'}]:`;
        systemPrompt += `\n- Coverage level: ${coverage.coverageLevel}/5 (${coverage.coverageDescription})`;
        systemPrompt += `\n- Existing suitable items: ${coverage.suitableItems} pieces`;
        if (coverage.gaps.length > 0) {
          systemPrompt += `\n- Identified gaps: ${coverage.gaps.join(', ')}`;
        }
        if (coverage.strengths.length > 0) {
          systemPrompt += `\n- Well-covered areas: ${coverage.strengths.join(', ')}`;
        }
      });
      
      systemPrompt += "\n\n=== PURCHASE DECISION GUIDANCE ===";
      systemPrompt += "\nWhen evaluating this new item, critically assess:";
      systemPrompt += "\n- Does this item fill a genuine gap in scenario coverage, or would it be redundant?";
      systemPrompt += "\n- For high-frequency scenarios with low coverage: This item could be highly valuable";
      systemPrompt += "\n- For well-covered scenarios: Question whether this purchase adds meaningful value";
      systemPrompt += "\n- Consider the cost-per-wear potential based on scenario frequency and current gaps";
      systemPrompt += "\n- Is the user building a complete wardrobe or just accumulating similar items?";
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
