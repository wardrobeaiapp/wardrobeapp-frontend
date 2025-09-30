/**
 * Main duplicate detection utilities - orchestrates modular components
 * Refactored for better maintainability and testability
 */

const { COLOR_OPTIONS, STYLE_OPTIONS, SILHOUETTE_OPTIONS, getSilhouetteOptionsForCategory } = require('../constants/wardrobeOptions');
const { calculateSimilarityScore } = require('./duplicateDetection/scoringEngine');
const { colorsMatch, silhouettesMatch } = require('./duplicateDetection/attributeMatchers');

/**
 * Find critical duplicates (85%+ similarity)
 */
function findCriticalDuplicates(newItem, existingItems) {
  console.log('🔍 DEBUG - Finding duplicates for:', JSON.stringify(newItem, null, 2));
  
  const categoryMatches = existingItems.filter(item => 
    item.category?.toLowerCase() === newItem.category?.toLowerCase() && 
    item.subcategory?.toLowerCase() === newItem.subcategory?.toLowerCase()
  );
  
  console.log('🔍 DEBUG - Category/subcategory matches found:', categoryMatches.length);
  
  const withScores = categoryMatches.map(item => {
    const score = calculateSimilarityScore(newItem, item);
    console.log(`🔍 DEBUG - Comparing with "${item.name}":`, {
      itemAttributes: { 
        category: item.category, 
        subcategory: item.subcategory, 
        color: item.color, 
        silhouette: item.silhouette, 
        style: item.style,
        pattern: item.pattern,
        neckline: item.neckline,
        sleeves: item.sleeves,
        material: item.material
      },
      similarityScore: score,
      passesThreshold: score >= 85
    });
    
    return {
      item,
      similarity_score: score,
      overlap_factors: getOverlapFactors(newItem, item)
    };
  });
  
  const duplicates = withScores.filter(match => match.similarity_score >= 85);
  console.log('🔍 DEBUG - Duplicates found (85%+ threshold):', duplicates.length);
  
  return duplicates.sort((a, b) => b.similarity_score - a.similarity_score);
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
  // Core functions
  calculateSimilarityScore,
  findCriticalDuplicates,
  analyzeDuplicatesForAI,
  generateExtractionPrompt,
  parseExtractionResponse,
  
  // Re-export matchers for backward compatibility
  colorsMatch,
  silhouettesMatch,
  
  // Re-export constants
  COLOR_OPTIONS,
  STYLE_OPTIONS,
  SILHOUETTE_OPTIONS
};
