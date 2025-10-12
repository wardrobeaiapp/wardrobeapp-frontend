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
    
    const compatibleSection = claudeResponse.match(/COMPATIBLE COMPLEMENTING ITEMS:\s*\n?((?:.*\n?)*?)(?=\n\n|```|$)/im);
    
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
    
    console.log('\n📋 FINAL COMPATIBLE ITEMS:');
    
    lines.forEach((line) => {
      // Stop processing if we hit explanatory text (lines that don't follow the category: items format)
      if (line.toLowerCase().includes('these items') || line.toLowerCase().includes('because') || line.toLowerCase().includes('analysis')) {
        return;
      }
      
      // Parse format like "bottoms: Navy Trousers, Black Jeans" (with optional leading whitespace)
      const match = line.match(/^\s*(\w+):\s*(.+)$/i);
      if (match) {
        const category = match[1].toLowerCase();
        const itemsStr = match[2].trim();
        
        if (itemsStr && itemsStr !== 'none' && itemsStr !== '-' && !itemsStr.toLowerCase().includes('n/a') && !itemsStr.toLowerCase().includes('no compatible')) {
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
                
                const itemNameLower = item.name.toLowerCase();
                const searchNameLower = itemName.toLowerCase();
                
                // Try bidirectional partial matching
                return itemNameLower.includes(searchNameLower) || 
                       searchNameLower.includes(itemNameLower) ||
                       // Also try word-by-word matching for better flexibility
                       searchNameLower.split(' ').every(word => 
                         word.length > 2 && itemNameLower.includes(word)
                       );
              });
              
              console.log(`🔍 [compatibility] Trying to match: "${itemName}" | Found: ${fullItem ? `✅ ${fullItem.name} (ID: ${fullItem.id})` : '❌ No match'}`);
              
              if (fullItem) {
                // Return full item object with all properties needed for cards
                return {
                  ...fullItem,
                  // Add compatibility type for frontend display
                  compatibilityTypes: ['complementing']
                };
              } else {
                // Fallback to text-only object for backward compatibility (especially for tests)
                console.log(`⚠️ No matching item found for: "${itemName}" - creating text-only fallback`);
                return {
                  name: itemName,
                  compatibilityTypes: ['complementing']
                };
              }
            }).filter(Boolean);
            
            if (fullItemObjects.length > 0) {
              compatibleItems[category] = fullItemObjects;
            }
          }
        }
      }
    });
    
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
    // Extract the detailed analysis section
    const analysisSection = claudeResponse.match(/COMPATIBILITY ANALYSIS:\s*\n?((?:.*\n?)*?)(?=\nCOMPATIBLE COMPLEMENTING ITEMS:|```|$)/im);
    
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
      if (trimmedLine.startsWith('**') && trimmedLine.endsWith(':**')) {
        currentCategory = trimmedLine.replace(/\*\*/g, '').replace(':', '').toLowerCase();
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
