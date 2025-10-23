/**
 * Simple compatibility response parsing utilities
 * Works with YES/NO format instead of parsing messy text lists
 */

/**
 * Parse Claude's YES/NO compatibility responses directly from styling context
 * @param {string} claudeResponse - Claude's response text  
 * @param {Array} stylingContext - Full item objects we asked about
 * @returns {Object} - Compatible items organized by category with full objects
 */
function parseCompatibilityResponse(claudeResponse, stylingContext = []) {
  console.log('\n=== 🎯 PARSING COMPATIBILITY RESPONSE ===');
  
  if (!claudeResponse || typeof claudeResponse !== 'string') {
    console.log('❌ Invalid Claude response provided');
    return {};
  }
  
  if (!stylingContext || !Array.isArray(stylingContext)) {
    console.log('⚠️ No styling context provided');
    return {};
  }

  console.log(`🔍 Processing ${stylingContext.length} styling context items`);
  
  const result = {};
  let totalCompatible = 0;

  // Parse Claude's YES/NO responses for each item
  stylingContext.forEach(item => {
    if (!item.name) return;
    
    const itemName = item.name;
    const category = item.category?.toLowerCase() || 'other';
    
    // Look for this specific item in Claude's response with reasoning
    // Pattern: "ItemName: COMPATIBLE - reason" or "ItemName: NOT_COMPATIBLE - reason"
    let regex = new RegExp(`${escapeRegExp(itemName)}:\\s*(COMPATIBLE|NOT_COMPATIBLE)\\s*-?\\s*(.*)`, 'i');
    let match = claudeResponse.match(regex);
    let reasoning = '';
    
    // If no exact match, try partial matching (Claude might use shorter names)
    if (!match) {
      // Strategy 1: Try prefix matching - "Brown Ankle: COMPATIBLE" for "Brown Ankle Boots"
      const words = itemName.split(' ');
      if (words.length > 1) {
        // Try matching with just first few words
        for (let i = Math.max(1, words.length - 1); i >= 1; i--) {
          const partialName = words.slice(0, i).join(' ');
          const partialRegex = new RegExp(`${escapeRegExp(partialName)}:\\s*(COMPATIBLE|NOT_COMPATIBLE)\\s*-?\\s*(.*)`, 'i');
          const partialMatch = claudeResponse.match(partialRegex);
          if (partialMatch) {
            match = partialMatch;
            break;
          }
        }
      }

      // Strategy 2: Try substring matching - "Suede Handbag: COMPATIBLE" for "Black Suede Handbag"
      if (!match) {
        // Look for patterns in Claude's response and see if they're substrings of our item name
        const responseLines = claudeResponse.split('\n').filter(line => line.trim());
        for (const line of responseLines) {
          const lineMatch = line.match(/^([^:]+):\s*(COMPATIBLE|NOT_COMPATIBLE)/i);
          if (lineMatch) {
            const claudeItemName = lineMatch[1].trim();
            const status = lineMatch[2];
            
            // Check if Claude's name matches our item name (multiple strategies)
            if (claudeItemName.length > 2) {
              // Strategy A: Direct substring match
              if (itemName.toLowerCase().includes(claudeItemName.toLowerCase())) {
                match = [lineMatch[0], status];
                break;
              }
              
              // Strategy B: Word-by-word matching for cases like "Brown Boots" matching "Brown Leather Boots"
              const claudeWords = claudeItemName.toLowerCase().split(/\s+/);
              const itemWords = itemName.toLowerCase().split(/\s+/);
              
              // Check if all Claude's words appear in our item name
              const allWordsMatch = claudeWords.every(claudeWord => 
                itemWords.some(itemWord => itemWord.includes(claudeWord) || claudeWord.includes(itemWord))
              );
              
              if (allWordsMatch && claudeWords.length >= 2) { // Require at least 2 words for safety
                match = [lineMatch[0], status];
                break;
              }
            }
          }
        }
      }
    }
    
    if (match && match[1].toUpperCase() === 'COMPATIBLE') {
      // Extract reasoning from the match
      reasoning = match[2] ? match[2].trim() : '';
      
      // This item is compatible! Add it to results
      if (!result[category]) {
        result[category] = [];
      }
      
      result[category].push({
        ...item, // Keep ALL original item data!
        compatibilityTypes: ['complementing']
      });
      
      totalCompatible++;
      console.log(`✅ ${itemName} → COMPATIBLE${reasoning ? ' - ' + reasoning : ''}`);
    } else if (match) {
      reasoning = match[2] ? match[2].trim() : '';
      console.log(`❌ ${itemName} → NOT_COMPATIBLE${reasoning ? ' - ' + reasoning : ''}`);
    } else {
      console.log(`⚠️ ${itemName} → No clear response found`);
    }
  });

  // Sort items within each category for consistency
  Object.keys(result).forEach(category => {
    result[category].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  });

  console.log(`✅ Parsed ${Object.keys(result).length} categories with ${totalCompatible} total compatible items`);
  
  // Log summary by category
  Object.entries(result).forEach(([category, items]) => {
    console.log(`   ${category}: ${items.length} items (${items.map(item => item.name).join(', ')})`);
  });

  return result;
}

// Helper function to escape regex special characters
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = {
  parseCompatibilityResponse
};
