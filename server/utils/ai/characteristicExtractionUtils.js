/**
 * Characteristic Extraction Utilities
 * 
 * Contains helper functions for extracting comprehensive item characteristics
 * from AI responses for enhanced styling analysis.
 * 
 * Supports wishlist data integration and category-specific characteristic detection.
 */

/**
 * Extract a specific field from AI response text
 * @param {string} text - The AI response text
 * @param {string[]} keywords - Keywords to search for [fieldName, ...options]
 * @param {any} defaultValue - Default value if not found
 * @returns {any} Extracted value or default
 */
function extractField(text, keywords, defaultValue) {
  const lowerText = text.toLowerCase();
  
  // Look for the keywords in the text
  for (const keyword of keywords) {
    const index = lowerText.indexOf(keyword.toLowerCase());
    if (index !== -1) {
      // Extract the line or surrounding context
      const lines = text.split('\n');
      for (const line of lines) {
        if (line.toLowerCase().includes(keyword.toLowerCase())) {
          // Try to extract the value after the keyword
          const colonIndex = line.indexOf(':');
          if (colonIndex !== -1) {
            const value = line.substring(colonIndex + 1).trim();
            if (value) {
              return value.split(/[,\n]/)[0].trim(); // Take first part before comma or newline
            }
          }
        }
      }
      
      // If found the keyword, try to identify which option it matches
      for (const option of keywords.slice(1)) { // Skip first keyword which is the field name
        if (lowerText.includes(option.toLowerCase())) {
          return option;
        }
      }
    }
  }
  
  return defaultValue;
}

/**
 * Extract numeric field (1-5 scale) from AI response
 * @param {string} text - The AI response text
 * @param {string[]} keywords - Keywords to search for
 * @param {number} defaultValue - Default numeric value
 * @returns {number} Extracted number or default
 */
function extractNumericField(text, keywords, defaultValue) {
  const lines = text.split('\n');
  
  for (const keyword of keywords) {
    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      const lowerKeyword = keyword.toLowerCase();
      
      if (lowerLine.includes(lowerKeyword)) {
        // Skip section headers like "2. FORMALITY LEVEL"
        if (line.match(/^\s*\d+\.\s/)) {
          continue;
        }
        
        // Try multiple patterns to find numbers
        const patterns = [
          /[•\*\-\u2022]\s*([1-5])\s*=/,  // Bullet points (including Unicode •)
          /([1-5])\s*=/,                   // 3 =
          /([1-5])\s*-/,                   // 3 -
          /([1-5])\s*:/,                   // 3 :
          /level\s*([1-5])/i,             // level 3
          /rates?\s*(?:as\s*)?([1-5])/i,  // rates as 3
          /score\s*(?:of\s*)?([1-5])/i    // score 3
        ];
        
        for (const pattern of patterns) {
          const match = line.match(pattern);
          if (match && match[1]) {
            return parseInt(match[1]);
          }
        }
      }
    }
  }
  
  return defaultValue;
}

/**
 * Extract colors mentioned in AI response
 * @param {string} text - The AI response text
 * @returns {string[]} Array of detected colors or ['unknown']
 */
function extractColors(text) {
  const colorKeywords = ['black', 'white', 'red', 'blue', 'green', 'yellow', 'pink', 'purple', 'orange', 'brown', 'gray', 'grey', 'navy', 'burgundy', 'maroon', 'teal', 'olive', 'coral', 'lavender', 'beige', 'tan', 'cream'];
  const foundColors = [];
  
  const lowerText = text.toLowerCase();
  for (const color of colorKeywords) {
    if (lowerText.includes(color)) {
      foundColors.push(color);
    }
  }
  
  return foundColors.length > 0 ? foundColors : ['unknown'];
}

/**
 * Extract layering reasoning from AI response
 * @param {string} text - The AI response text
 * @returns {string|null} Layering reasoning text or null
 */
function extractLayeringReasoning(text) {
  const lines = text.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Skip section headers (like "6. LAYERING POTENTIAL:")
    if (trimmed.match(/^\d+\.\s*[A-Z\s]+:?\s*$/)) {
      continue;
    }
    
    // Look for bullet points or content lines with layering descriptions
    if (trimmed.match(/^[•\-\*]\s*/)) {
      // Check if this bullet point contains layering reasoning
      if (trimmed.toLowerCase().includes('layering') || 
          trimmed.toLowerCase().includes('under') || 
          trimmed.toLowerCase().includes('over') ||
          (trimmed.toLowerCase().includes('inner') && trimmed.toLowerCase().includes('layer')) ||
          (trimmed.toLowerCase().includes('outer') && trimmed.toLowerCase().includes('layer'))) {
        
        // Make sure it has explanatory content
        if (trimmed.includes('good for') || 
            trimmed.includes('ideal for') || 
            trimmed.includes('works well') || 
            trimmed.includes('because') ||
            trimmed.includes('make') ||
            trimmed.includes('under') ||
            trimmed.includes('over')) {
          return trimmed;
        }
      }
    }
  }
  return null;
}

/**
 * Extract comprehensive item characteristics from AI response
 * @param {string} rawResponse - Raw AI analysis response
 * @param {object} analysisScope - Scope defining which characteristics to extract
 * @param {object} preFilledData - Pre-filled wishlist data (optional)
 * @returns {object} Extracted characteristics object
 */
function extractItemCharacteristics(rawResponse, analysisScope, preFilledData) {
  const characteristics = {};
  
  // Universal characteristics (always extracted)
  characteristics.styleLevel = extractField(rawResponse, ['style level', 'basic', 'neutral', 'statement'], 'neutral');
  characteristics.formalityLevel = extractNumericField(rawResponse, ['formality level', 'formality'], 3);
  characteristics.colorFamily = extractField(rawResponse, ['color family', 'neutral', 'earth-tone', 'bright', 'pastel', 'jewel-tone'], 'neutral');
  characteristics.primaryColors = extractColors(rawResponse);
  characteristics.patternType = extractField(rawResponse, ['pattern', 'solid', 'stripe', 'floral', 'geometric'], 'solid');
  
  // Material - use pre-filled data if available, otherwise extract from response
  characteristics.material = preFilledData?.material || extractField(rawResponse, ['material', 'fabric', 'cotton', 'silk', 'denim', 'leather'], null);
  
  // Conditional characteristics based on analysis scope
  if (analysisScope.conditional.neckline) {
    characteristics.neckline = extractField(rawResponse, ['neckline', 'crew', 'v-neck', 'scoop', 'turtleneck'], null);
    characteristics.necklineHeight = extractField(rawResponse, ['height', 'high', 'mid', 'low'], null);
  }
  
  if (analysisScope.conditional.sleeves) {
    characteristics.sleeves = extractField(rawResponse, ['sleeve', 'sleeveless', 'short', 'long', 'bell', 'puff'], null);
    characteristics.sleeveVolume = extractField(rawResponse, ['sleeve volume', 'fitted', 'relaxed', 'voluminous'], null);
  }
  
  if (analysisScope.conditional.layeringPotential) {
    characteristics.layeringPotential = extractField(rawResponse, ['layering potential', 'standalone', 'inner layer', 'outer layer', 'versatile'], 'standalone');
    characteristics.layeringReasoning = extractLayeringReasoning(rawResponse);
  }
  
  if (analysisScope.conditional.volume) {
    characteristics.volume = extractField(rawResponse, ['volume', 'fitted', 'relaxed', 'oversized', 'voluminous'], 'fitted');
    characteristics.silhouette = extractField(rawResponse, ['silhouette', 'straight', 'a-line', 'flowy', 'structured'], 'straight');
  }
  
  if (analysisScope.conditional.heelHeight) {
    characteristics.heelHeight = extractField(rawResponse, ['heel height', 'flat', 'low', 'medium', 'high'], 'flat');
    characteristics.activityLevel = extractField(rawResponse, ['activity', 'athletic', 'casual', 'business', 'formal'], 'casual');
  }
  
  if (analysisScope.conditional.rise) {
    characteristics.rise = extractField(rawResponse, ['rise', 'low-rise', 'mid-rise', 'high-waisted'], null);
  }
  
  if (analysisScope.conditional.bootHeight) {
    characteristics.bootHeight = extractField(rawResponse, ['boot height', 'ankle', 'mid-calf', 'knee'], null);
  }
  
  return characteristics;
}

module.exports = {
  extractField,
  extractNumericField,
  extractColors,
  extractLayeringReasoning,
  extractItemCharacteristics
};
