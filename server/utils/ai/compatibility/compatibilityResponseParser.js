/**
 * Compatibility response parsing utilities
 * Handles parsing Claude's compatibility analysis responses and matching item names to objects
 */

/**
 * Parse Claude's compatibility response and match names to full item objects
 * @param {string} claudeResponse - Claude's response text
 * @param {Array} stylingContext - Full item objects for matching
 * @returns {Object} - Compatible items organized by category with full objects
 */
function parseCompatibilityResponse(claudeResponse, stylingContext = []) {
  console.log('\n=== 🎯 PARSING COMPATIBILITY RESPONSE ===');
  
  try {
    // First, extract and log the detailed analysis
    const analysisSection = claudeResponse.match(/COMPATIBILITY ANALYSIS:\s*\n?((?:.*\n?)*?)(?=\nCOMPATIBLE COMPLEMENTING ITEMS:|```|$)/im);
    
    if (analysisSection && analysisSection[1]) {
      console.log('\n🔍 DETAILED COMPATIBILITY ANALYSIS:');
      const analysisText = analysisSection[1].trim();
      const analysisLines = analysisText.split('\n').filter(line => line.trim());
      
      let currentCategory = '';
      analysisLines.forEach(line => {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('**') && trimmedLine.endsWith(':**')) {
          currentCategory = trimmedLine.replace(/\*\*/g, '').replace(':', '');
          console.log(`\n📂 ${currentCategory}:`);
        } else if (trimmedLine.includes(': ')) {
          const [itemName, reasoning] = trimmedLine.split(': ', 2);
          const isCompatible = reasoning.toUpperCase().startsWith('COMPATIBLE');
          const status = isCompatible ? '✅ SELECTED' : '❌ EXCLUDED';
          console.log(`  ${status} ${itemName}: ${reasoning}`);
        }
      });
    }
    
    // Then extract the final compatible items list
    console.log('\n🔍 [DEBUG] Searching for COMPATIBLE COMPLEMENTING ITEMS section...');
    console.log('🔍 [DEBUG] Full response:', claudeResponse);
    
    // Try multiple patterns to handle truncated headers
    // Use more inclusive pattern that captures until ANALYSIS or end of response
    let compatibleSection = claudeResponse.match(/COMPATIBLE COMPLEMENTING ITEMS:\s*\n?([\s\S]*?)(?=\n\s*ANALYSIS|\n\s*```|$)/i);
    
    // Fallback for truncated header (missing 'C' at beginning)
    if (!compatibleSection) {
      console.log('🔍 [DEBUG] Trying pattern for truncated header (missing C)...');
      compatibleSection = claudeResponse.match(/OMPATIBLE COMPLEMENTING ITEMS:\s*\n?([\s\S]*?)(?=\n\s*ANALYSIS|\n\s*```|$)/i);
    }
    
    // Additional fallback patterns
    if (!compatibleSection) {
      console.log('🔍 [DEBUG] Trying more flexible patterns...');
      compatibleSection = claudeResponse.match(/[CO]?MPATIBLE.*ITEMS:\s*\n?([\s\S]*?)(?=\n\s*ANALYSIS|\n\s*```|$)/i);
    }
    
    console.log('🔍 [DEBUG] Compatible section match result:', compatibleSection ? `Found: "${compatibleSection[1]?.trim()}"` : 'Not found');
    
    if (!compatibleSection || !compatibleSection[1]) {
      console.log('[compatibility] No compatible items section found in response');
      // Try alternative patterns that Claude might use
      console.log('🔍 [DEBUG] Trying alternative patterns...');
      const altPattern1 = claudeResponse.match(/compatible.*items:?\s*\n?((?:.*\n?)*?)(?=\n\n|```|$)/im);
      const altPattern2 = claudeResponse.match(/final.*list:?\s*\n?((?:.*\n?)*?)(?=\n\n|```|$)/im);
      const altPattern3 = claudeResponse.match(/selected.*items:?\s*\n?((?:.*\n?)*?)(?=\n\n|```|$)/im);
      
      console.log('🔍 [DEBUG] Alternative pattern 1 (compatible items):', altPattern1 ? 'Found' : 'Not found');
      console.log('🔍 [DEBUG] Alternative pattern 2 (final list):', altPattern2 ? 'Found' : 'Not found');
      console.log('🔍 [DEBUG] Alternative pattern 3 (selected items):', altPattern3 ? 'Found' : 'Not found');
      
      // FALLBACK: Extract from detailed analysis section if final summary is missing
      console.log('🔄 [DEBUG] Trying fallback: extracting from detailed analysis...');
      return extractFromDetailedAnalysis(claudeResponse, stylingContext);
    }
    
    const itemsText = compatibleSection[1].trim();
    const lines = itemsText.split('\n').filter(line => line.trim());
    const compatibleItems = {};
    
    console.log('📋 [DEBUG] Parsing compatible items section with', lines.length, 'lines');
    
    let currentCategory = null;
    
    lines.forEach((line, lineIndex) => {
      // Stop processing if we hit explanatory text (lines that don't follow the category: items format)
      if (line.toLowerCase().includes('these items') || line.toLowerCase().includes('because') || line.toLowerCase().includes('analysis')) {
        return;
      }
      
      // Check if this is a category header (e.g., "footwear:" or "footwear: items")
      const categoryMatch = line.match(/^\s*(\w+):\s*(.*)$/i);
      if (categoryMatch) {
        const category = categoryMatch[1].toLowerCase();
        const itemsStr = categoryMatch[2].trim();
        
        if (itemsStr && itemsStr !== 'none' && itemsStr !== '-' && !itemsStr.toLowerCase().includes('n/a') && !itemsStr.toLowerCase().includes('no compatible')) {
          // Single-line format: "category: items"
          processItemsForCategory(category, itemsStr, stylingContext, compatibleItems);
        } else if (itemsStr === '' || !itemsStr) {
          // Multi-line format: "category:" followed by items on next line(s)
          currentCategory = category;
        } else {
          console.log(`📋 [DEBUG] Skipping category "${category}" - no valid items or marked as none`);
        }
      } else if (currentCategory && line.trim() && !line.trim().includes(':')) {
        // This might be the items line for the previous category
        const itemsStr = line.trim();
        
        if (itemsStr && itemsStr !== 'none' && itemsStr !== '-' && !itemsStr.toLowerCase().includes('n/a') && !itemsStr.toLowerCase().includes('no compatible')) {
          processItemsForCategory(currentCategory, itemsStr, stylingContext, compatibleItems);
        }
        currentCategory = null; // Reset after processing
      }
    });
    
    // Helper function to process items for a category
    function processItemsForCategory(category, itemsStr, stylingContext, compatibleItems) {
      const itemNames = itemsStr.split(',').map(item => item.trim()).filter(name => {
        // Filter out N/A responses and "no compatible" messages
        const nameLower = name.toLowerCase();
        return name && 
               !nameLower.includes('n/a') && 
               !nameLower.includes('no compatible') &&
               !nameLower.includes('none') &&
               !nameLower.includes('no matching') &&
               name.length > 0;
      });
      
      if (itemNames.length > 0) {
        // Match item names to full objects from styling context
        const fullItemObjects = itemNames.map(itemName => {
          // Find matching item in styling context by name
          // Use flexible matching: either full name contains partial name, or vice versa
          const fullItem = stylingContext.find(item => {
            if (!item.name || !itemName) return false;
            
            const itemNameLower = item.name.toLowerCase().trim();
            const searchNameLower = itemName.toLowerCase().trim();
            
            // Try exact match first
            if (itemNameLower === searchNameLower) {
              return true;
            }
            
            // Try bidirectional partial matching
            if (itemNameLower.includes(searchNameLower) || searchNameLower.includes(itemNameLower)) {
              return true;
            }
            
            // Also try word-by-word matching for better flexibility
            const words = searchNameLower.split(' ').filter(word => word.length > 2);
            if (words.length > 0 && words.every(word => itemNameLower.includes(word))) {
              return true;
            }
            
            return false;
          });
          
          if (fullItem) {
            // Return full item object with all properties needed for cards
            return {
              ...fullItem,
              // Add compatibility type for frontend display
              compatibilityTypes: ['complementing']
            };
          } else {
            // Create fallback object for unmatched items
            console.log(`No matching item found for: "${itemName}" - creating fallback object`);
            return {
              name: itemName,
              compatibilityTypes: ['complementing']
            };
          }
        }).filter(Boolean);
        
        if (fullItemObjects.length > 0) {
          compatibleItems[category] = fullItemObjects;
        }
      } else {
        console.log(`  Skipping category "${category}" - no valid items or marked as none`);
      }
    }
    
    console.log('✅ Parsed', Object.keys(compatibleItems).length, 'categories with', Object.values(compatibleItems).reduce((sum, items) => sum + items.length, 0), 'total compatible items');
    
    return compatibleItems;
    
  } catch (error) {
    console.error('❌ Error parsing compatibility response:', error);
    return {};
  }
}

/**
 * Fallback function to extract compatible items from detailed analysis section
 * Used when Claude doesn't provide the final summary section
 */
function extractFromDetailedAnalysis(claudeResponse, stylingContext = []) {
  console.log('🔄 [FALLBACK] Extracting from detailed analysis section...');
  
  try {
    // Extract the detailed analysis section - use more inclusive pattern
    const analysisSection = claudeResponse.match(/COMPATIBILITY ANALYSIS:\s*\n?([\s\S]*?)(?=\n\s*COMPATIBLE COMPLEMENTING ITEMS:|\n\s*```|$)/i);
    
    if (!analysisSection || !analysisSection[1]) {
      console.log('❌ [FALLBACK] No detailed analysis section found');
      return {};
    }
    
    const analysisText = analysisSection[1].trim();
    const analysisLines = analysisText.split('\n').filter(line => line.trim());
    const compatibleItems = {};
    
    let currentCategory = '';
    
    analysisLines.forEach(line => {
      const trimmedLine = line.trim();
      
      // Check if this is a category header  
      if (trimmedLine.startsWith('**') && trimmedLine.match(/:\*\*\s*$/)) {
        let categoryName = trimmedLine.replace(/\*\*/g, '').replace(/:\s*$/, '').toLowerCase();
        
        // Normalize category names (plural to singular)
        if (categoryName === 'accessories') categoryName = 'accessory';
        if (categoryName === 'tops') categoryName = 'top';
        if (categoryName === 'bottoms') categoryName = 'bottom';
        if (categoryName === 'shoes') categoryName = 'footwear';
        
        currentCategory = categoryName;
        console.log(`📂 [FALLBACK] Processing category: ${currentCategory}`);
        return;
      }
      
      // Check if this is an item analysis line
      if (currentCategory && trimmedLine.includes(': ')) {
        const [itemName, reasoning] = trimmedLine.split(': ', 2);
        const cleanItemName = itemName.replace(/^[-*]\s*/, '').trim();
        
        // Check if the reasoning indicates compatibility
        const reasoningUpper = reasoning.toUpperCase();
        const isCompatible = reasoningUpper.startsWith('COMPATIBLE') || 
                           reasoningUpper.includes('WORKS WELL') ||
                           reasoningUpper.includes('GOOD MATCH') ||
                           reasoningUpper.includes('SUITABLE');
        
        if (isCompatible && cleanItemName) {
          console.log(`✅ [FALLBACK] Found compatible item: ${cleanItemName} in ${currentCategory}`);
          
          // Try to match with full item from styling context
          const fullItem = stylingContext.find(item => {
            if (!item.name || !cleanItemName) return false;
            
            const itemNameLower = item.name.toLowerCase();
            const searchNameLower = cleanItemName.toLowerCase();
            
            return itemNameLower.includes(searchNameLower) || 
                   searchNameLower.includes(itemNameLower);
          });
          
          if (fullItem) {
            if (!compatibleItems[currentCategory]) {
              compatibleItems[currentCategory] = [];
            }
            compatibleItems[currentCategory].push({
              ...fullItem,
              compatibilityTypes: ['complementing']
            });
          } else {
            // Log that item wasn't found (for test compatibility)
            console.log(`🔄 [FALLBACK] No matching item found for: "${cleanItemName}"`);
          }
          // Don't create fallback objects for unmatched items in fallback parsing
          // This maintains backward compatibility with existing tests
        } else {
          // Log excluded items for test compatibility
          if (cleanItemName) {
            console.log(`🔄 [FALLBACK] Excluded item: ${cleanItemName}`);
          }
        }
      }
    });
    
    console.log('🔄 [FALLBACK] Extracted compatible items:', Object.keys(compatibleItems));
    return compatibleItems;
    
  } catch (error) {
    console.error('❌ [FALLBACK] Error extracting from detailed analysis:', error);
    return {};
  }
}

module.exports = {
  parseCompatibilityResponse,
  extractFromDetailedAnalysis
};
