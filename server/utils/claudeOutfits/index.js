/**
 * Claude-Based Outfit Generation Utility
 * 
 * Main orchestrator that coordinates prompt building, API calls,
 * and response parsing for Claude outfit generation.
 */

const { buildOutfitCreationPrompt } = require('./promptBuilder');
const { parseClaudeOutfitResponse } = require('./responseParser');

/**
 * Generate outfit combinations using Claude's fashion intelligence
 * @param {Object} itemData - The analyzed item (base item)
 * @param {Object} itemsByCategory - Available compatible items organized by category
 * @param {string} season - Season context (e.g., "spring/fall", "summer")
 * @param {string} scenario - Scenario context (e.g., "Social Outings", "Office Work")  
 * @param {Object} anthropicClient - Claude API client
 * @returns {Array} Array of outfit objects with fashion-sensible combinations
 */
async function generateOutfitsWithClaude(itemData, itemsByCategory, season, scenario, anthropicClient) {
  console.log(`   🤖 Asking Claude to create outfits for ${season} ${scenario}...`);
  
  // Debug base item data for outfit generation
  console.log('   🔍 BASE ITEM DEBUG in generateOutfitsWithClaude:');
  console.log('   - Name:', itemData?.name);
  console.log('   - Category:', itemData?.category);
  console.log('   - Has imageUrl:', !!itemData?.imageUrl);
  console.log('   - ImageUrl type:', typeof itemData?.imageUrl);
  console.log('   - ImageUrl preview:', itemData?.imageUrl ? itemData.imageUrl.substring(0, 50) + '...' : 'none');
  
  // Build comprehensive prompt with item details
  const outfitPrompt = buildOutfitCreationPrompt(itemData, itemsByCategory, season, scenario);
  
  try {
    const response = await anthropicClient.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 2048, // Increased for up to 10 outfits with explanations
      temperature: 0.3, // Lower temperature for more consistent fashion logic
      system: "You are a professional fashion stylist. Create practical, weather-appropriate outfit combinations that make fashion sense.",
      messages: [{
        role: "user", 
        content: outfitPrompt
      }]
    });
    
    const claudeResponse = response.content[0].text;
    console.log('   🎨 Claude outfit response:', claudeResponse.substring(0, 200) + '...');
    
    // Parse Claude's response into outfit objects
    const outfits = parseClaudeOutfitResponse(claudeResponse, itemData, itemsByCategory, scenario);
    
    console.log(`   ✅ Claude created ${outfits.length} sensible outfit combinations`);
    if (outfits.length === 0) {
      console.log('   ⚠️ Claude returned no valid outfits - check parsing or validation logic');
    }
    return outfits;
    
  } catch (error) {
    console.error('   ❌ Error generating outfits with Claude:', error);
    console.log('   🔄 Will fallback to algorithmic outfit generation');
    // Return null to signal fallback should be used
    return null;
  }
}

// Export the main function and individual modules for flexibility
module.exports = {
  generateOutfitsWithClaude,
  buildOutfitCreationPrompt,
  parseClaudeOutfitResponse
};
