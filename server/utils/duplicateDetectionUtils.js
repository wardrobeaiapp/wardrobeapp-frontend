// Server-side duplicate detection utilities
// Using shared constants for consistency

const {
  COLOR_OPTIONS,
  STYLE_OPTIONS, 
  SILHOUETTE_OPTIONS,
  COLOR_FAMILIES,
  SILHOUETTE_FAMILIES,
  getSilhouetteOptionsForCategory
} = require('../constants/wardrobeOptions');

/**
 * Check if two colors are considered matching
 */
function colorsMatch(color1, color2) {
  if (!color1 || !color2) return false;
  if (color1 === color2) return true;
  
  for (const family of Object.values(COLOR_FAMILIES)) {
    if (family.includes(color1) && family.includes(color2)) {
      return true;
    }
  }
  return false;
}

/**
 * Check if two silhouettes are considered matching
 */
function silhouettesMatch(silhouette1, silhouette2) {
  if (!silhouette1 || !silhouette2) return false;
  if (silhouette1 === silhouette2) return true;
  
  for (const family of Object.values(SILHOUETTE_FAMILIES)) {
    if (family.includes(silhouette1) && family.includes(silhouette2)) {
      return true;
    }
  }
  return false;
}

/**
 * Calculate similarity score between items (0-100)
 */
function calculateSimilarityScore(newItem, existingItem) {
  // Must match category and subcategory
  if (newItem.category !== existingItem.category || 
      newItem.subcategory !== existingItem.subcategory) {
    return 0;
  }
  
  let score = 0;
  const weights = { color: 40, silhouette: 30, style: 20, material: 10 };
  const maxScore = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
  
  if (colorsMatch(newItem.color, existingItem.color)) score += weights.color;
  if (silhouettesMatch(newItem.silhouette, existingItem.silhouette)) score += weights.silhouette;
  if (newItem.style === existingItem.style) score += weights.style;
  if (newItem.material === existingItem.material) score += weights.material;
  
  return Math.round((score / maxScore) * 100);
}

/**
 * Find critical duplicates (85%+ similarity)
 */
function findCriticalDuplicates(newItem, existingItems) {
  return existingItems
    .filter(item => 
      item.category === newItem.category && 
      item.subcategory === newItem.subcategory
    )
    .map(item => ({
      item,
      similarity_score: calculateSimilarityScore(newItem, item),
      overlap_factors: getOverlapFactors(newItem, item)
    }))
    .filter(match => match.similarity_score >= 85)
    .sort((a, b) => b.similarity_score - a.similarity_score);
}

/**
 * Get overlap factors between items
 */
function getOverlapFactors(newItem, existingItem) {
  const factors = [];
  
  if (colorsMatch(newItem.color, existingItem.color)) {
    factors.push(`Same color (${newItem.color || 'unknown'})`);
  }
  
  if (silhouettesMatch(newItem.silhouette, existingItem.silhouette)) {
    factors.push(`Same silhouette (${newItem.silhouette || 'unknown'})`);
  }
  
  if (newItem.style === existingItem.style && newItem.style) {
    factors.push(`Same style (${newItem.style})`);
  }
  
  return factors;
}

/**
 * Analyze duplicate situation and generate structured output for AI
 */
function analyzeDuplicatesForAI(newItem, existingItems) {
  const criticalDuplicates = findCriticalDuplicates(newItem, existingItems);
  
  // Calculate variety impact
  const categoryItems = existingItems.filter(item => item.category === newItem.category);
  const colorCounts = {};
  categoryItems.forEach(item => {
    if (item.color) colorCounts[item.color] = (colorCounts[item.color] || 0) + 1;
  });
  
  const newColor = newItem.color;
  const currentColorCount = colorCounts[newColor] || 0;
  const afterAddition = currentColorCount + 1;
  const colorPercentage = Math.round((afterAddition / (categoryItems.length + 1)) * 100);
  
  return {
    duplicate_analysis: {
      found: criticalDuplicates.length > 0,
      count: criticalDuplicates.length,
      items: criticalDuplicates.map(d => d.item.name),
      severity: criticalDuplicates.length >= 3 ? 'EXCESSIVE' : 
                criticalDuplicates.length >= 2 ? 'HIGH' : 
                criticalDuplicates.length >= 1 ? 'MODERATE' : 'NONE'
    },
    variety_impact: {
      color_percentage: colorPercentage,
      would_dominate: colorPercentage >= 60,
      message: colorPercentage >= 60 ? 
        `Would make ${colorPercentage}% of your ${newItem.category?.toLowerCase()} items the same color` :
        'Maintains good color variety'
    },
    recommendation: criticalDuplicates.length >= 2 ? 'SKIP' :
                   criticalDuplicates.length >= 1 && colorPercentage >= 60 ? 'CONSIDER' : 
                   'ANALYZE_FURTHER'
  };
}

/**
 * Generate AI extraction prompt
 */
function generateExtractionPrompt(category) {
  const silhouetteOptions = getSilhouetteOptionsForCategory(category);
  
  return `
EXTRACT STRUCTURED DATA - Select from exact options:

COLOR: ${COLOR_OPTIONS.join(', ')}

${silhouetteOptions.length > 0 ? `SILHOUETTE: ${silhouetteOptions.join(', ')}` : 'SILHOUETTE: Not applicable'}

STYLE: ${STYLE_OPTIONS.join(', ')}

FORMAT:
color: [selection]
silhouette: [selection or N/A]
style: [selection]

Use exact capitalization. Select closest match if uncertain.
`;
}

/**
 * Parse AI extraction response
 */
function parseExtractionResponse(response) {
  try {
    const lines = response.split('\n').map(line => line.trim()).filter(line => line);
    let color = '', silhouette = '', style = '';
    
    for (const line of lines) {
      if (line.startsWith('color:')) color = line.replace('color:', '').trim();
      else if (line.startsWith('silhouette:')) silhouette = line.replace('silhouette:', '').trim();
      else if (line.startsWith('style:')) style = line.replace('style:', '').trim();
    }
    
    return {
      color: COLOR_OPTIONS.find(opt => opt.toLowerCase() === color.toLowerCase()) || color,
      silhouette: silhouette === 'N/A' ? null : silhouette,
      style: STYLE_OPTIONS.find(opt => opt.toLowerCase() === style.toLowerCase()) || style
    };
  } catch (error) {
    console.error('Failed to parse extraction response:', error);
    return null;
  }
}

module.exports = {
  colorsMatch,
  silhouettesMatch,
  calculateSimilarityScore,
  findCriticalDuplicates,
  analyzeDuplicatesForAI,
  generateExtractionPrompt,
  parseExtractionResponse,
  COLOR_OPTIONS,
  STYLE_OPTIONS,
  SILHOUETTE_OPTIONS
};
