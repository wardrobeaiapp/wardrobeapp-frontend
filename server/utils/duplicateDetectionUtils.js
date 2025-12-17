/**
 * Main duplicate detection utilities - orchestrates modular components
 * Refactored for better maintainability and testability
 */

const { COLOR_OPTIONS, STYLE_OPTIONS, SILHOUETTE_OPTIONS, getSilhouetteOptionsForCategory } = require('../constants/wardrobeOptions');
const { calculateSimilarityScore } = require('./duplicateDetection/scoringEngine');
const { colorsMatch, silhouettesMatch } = require('./duplicateDetection/attributeMatchers');

/**
 * Find critical duplicates (75%+ similarity)
 */
function findCriticalDuplicates(newItem, existingItems) {
  console.log('🔍 DEBUG - Finding duplicates for:', JSON.stringify(newItem, null, 2));
  
  const categoryMatches = existingItems.filter(item => 
    item.category?.toLowerCase() === newItem.category?.toLowerCase() && 
    item.subcategory?.toLowerCase() === newItem.subcategory?.toLowerCase()
  );
  
  console.log('🔍 DEBUG - Category/subcategory matches found:', categoryMatches.length);
  
  // Enhanced debugging for blazer fit issues
  if (newItem.category?.toLowerCase() === 'top' && newItem.subcategory?.toLowerCase() === 'blazer') {
    console.log('🧥 DEBUG - BLAZER DUPLICATE CHECK:');
    console.log('   - New blazer silhouette:', newItem.silhouette);
    console.log('   - New blazer color:', newItem.color);
    categoryMatches.forEach((match, i) => {
      console.log(`   - Existing blazer ${i+1}: "${match.name}" - silhouette: ${match.silhouette}, color: ${match.color}`);
    });
  }
  
  const withScores = categoryMatches.map(item => {
    const score = calculateSimilarityScore(newItem, item);
    
    // Build category-appropriate attributes for debug output
    const baseAttributes = { 
      category: item.category, 
      subcategory: item.subcategory, 
      color: item.color, 
      silhouette: item.silhouette, 
      type: item.type,
      style: item.style,
      pattern: item.pattern,
      material: item.material
    };
    
    // Add category-specific attributes
    const category = item.category?.toLowerCase();
    if (category === 'top' || category === 'one_piece') {
      baseAttributes.neckline = item.neckline;
      baseAttributes.sleeves = item.sleeves;
    } else if (category === 'bottom') {
      baseAttributes.rise = item.rise;
      baseAttributes.length = item.length;
    } else if (category === 'footwear') {
      baseAttributes.heelHeight = item.heelHeight;
      baseAttributes.bootHeight = item.bootHeight;
    }
    
    console.log(`🔍 DEBUG - Comparing with "${item.name}":`, {
      itemAttributes: baseAttributes,
      similarityScore: score,
      passesThreshold: score >= 75
    });
    
    return {
      item,
      similarity_score: score,
      overlap_factors: identifyDuplicateFactors(newItem, item)
    };
  });
  
  const duplicates = withScores.filter(match => match.similarity_score >= 75);
  console.log('🔍 DEBUG - Duplicates found (75%+ threshold):', duplicates.length);
  
  return duplicates.sort((a, b) => b.similarity_score - a.similarity_score);
}

/**
 * Get overlap factors between items
 */
function identifyDuplicateFactors(newItem, existingItem) {
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
 * Analyze stylistic diversity and identify potential traps
 */
function analyzeStyleDiversity(newItem, existingItems) {
  const categoryItems = existingItems.filter(item => item.category === newItem.category);
  
  // Get items that match seasons (if item has seasons)
  const seasonalItems = newItem.seasons && newItem.seasons.length > 0 ? 
    categoryItems.filter(item => {
      if (!item.seasons || item.seasons.length === 0) return true; // Include items without seasons
      return item.seasons.some(season => newItem.seasons.includes(season));
    }) : categoryItems;
  
  // Analyze different style dimensions
  const styleAnalysis = {};
  const dimensions = ['style', 'silhouette', 'color', 'pattern'];
  
  dimensions.forEach(dim => {
    const counts = {};
    const totalItems = seasonalItems.length + 1; // +1 for new item
    
    // Count existing items
    seasonalItems.forEach(item => {
      if (item[dim]) counts[item[dim]] = (counts[item[dim]] || 0) + 1;
    });
    
    // Add new item
    if (newItem[dim]) counts[newItem[dim]] = (counts[newItem[dim]] || 0) + 1;
    
    const uniqueOptions = Object.keys(counts).length;
    const mostCommon = Object.entries(counts)
      .sort(([,a], [,b]) => b - a)[0];
    
    const dominantPercentage = mostCommon ? Math.round((mostCommon[1] / totalItems) * 100) : 0;
    const isNewOption = newItem[dim] && !seasonalItems.some(item => item[dim] === newItem[dim]);
    
    styleAnalysis[dim] = {
      unique_count: uniqueOptions,
      dominant_option: mostCommon ? mostCommon[0] : null,
      dominant_percentage: dominantPercentage,
      is_monotonous: dominantPercentage >= 70, // 70%+ of same style
      adds_new_option: isNewOption,
      variety_score: uniqueOptions >= 4 ? 'HIGH' : uniqueOptions >= 2 ? 'MEDIUM' : 'LOW'
    };
  });
  
  // Identify stylistic traps
  const traps = [];
  const warnings = [];
  
  if (styleAnalysis.style.is_monotonous) {
    traps.push(`STYLE_TRAP: ${styleAnalysis.style.dominant_percentage}% of items are "${styleAnalysis.style.dominant_option}"`);
  }
  
  if (styleAnalysis.silhouette.is_monotonous) {
    traps.push(`SILHOUETTE_TRAP: ${styleAnalysis.silhouette.dominant_percentage}% are "${styleAnalysis.silhouette.dominant_option}" silhouette`);
  }
  
  if (styleAnalysis.color.is_monotonous) {
    traps.push(`COLOR_TRAP: ${styleAnalysis.color.dominant_percentage}% are "${styleAnalysis.color.dominant_option}" colored`);
  }
  
  // Generate recommendations
  const recommendations = [];
  if (styleAnalysis.style.adds_new_option) {
    recommendations.push(`Adds new style "${newItem.style}" - great for variety!`);
  }
  if (styleAnalysis.silhouette.adds_new_option) {
    recommendations.push(`Introduces "${newItem.silhouette}" silhouette - expands your options`);
  }
  if (styleAnalysis.color.adds_new_option) {
    recommendations.push(`Brings new color "${newItem.color}" to your ${newItem.category} collection`);
  }
  
  return {
    style_analysis: styleAnalysis,
    stylistic_traps: traps,
    variety_benefits: recommendations,
    overall_variety_score: Object.values(styleAnalysis)
      .reduce((sum, analysis) => sum + (analysis.variety_score === 'HIGH' ? 3 : analysis.variety_score === 'MEDIUM' ? 2 : 1), 0)
  };
}

/**
 * Determine if variety analysis should be skipped based on gap type
 * @param {string} gapType - The gap analysis type
 * @returns {boolean} True if variety analysis should be skipped
 */
function shouldSkipVarietyAnalysis(gapType) {
  // Only run variety analysis for expansion gaps - when you have adequate coverage but room to add selectively
  const runAnalysisFor = ['expansion'];
  return !runAnalysisFor.includes(gapType);
}

/**
 * Calculate pure variety score modifier - ONLY about style diversity, NOT duplicates
 * Returns: +2, +1, 0, -1, -2 to modify the base score (1-10 scale)
 * NOTE: Duplicate detection is handled separately in base score
 * 
 * @param {Object} newItem - The item being analyzed
 * @param {Array} existingItems - Existing wardrobe items
 * @param {string} gapType - Gap analysis type: 'critical', 'improvement', 'expansion', 'satisfied', 'oversaturated'
 */
function calculateVarietyScoreModifier(newItem, existingItems, gapType = null) {
  // Skip variety analysis based on gap type
  if (shouldSkipVarietyAnalysis(gapType)) {
    return {
      modifier: 0,
      impact: 'SKIPPED',
      reasoning: [`Variety analysis skipped - ${gapType} gap doesn't benefit from variety scoring`],
      variety_boosts: [],
      monotony_warnings: [],
      skipped_reason: `Gap type "${gapType}" doesn't require variety analysis`
    };
  }
  const categoryItems = existingItems.filter(item => item.category === newItem.category);
  
  // Get items that match seasons (if item has seasons)
  const seasonalItems = newItem.seasons && newItem.seasons.length > 0 ? 
    categoryItems.filter(item => {
      if (!item.seasons || item.seasons.length === 0) return true;
      return item.seasons.some(season => newItem.seasons.includes(season));
    }) : categoryItems;
  
  let scoreModifier = 0;
  let reasoning = [];
  
  // POSITIVE MODIFIERS - Adds new variety dimensions
  const varietyBoosts = [];
  
  // Check if adds new style to category+season
  const existingStyles = seasonalItems.map(item => item.style).filter(Boolean);
  const isNewStyle = newItem.style && !existingStyles.includes(newItem.style);
  if (isNewStyle) varietyBoosts.push('NEW_STYLE');
  
  // Check if adds new silhouette to category+season  
  const existingSilhouettes = seasonalItems.map(item => item.silhouette).filter(Boolean);
  const isNewSilhouette = newItem.silhouette && !existingSilhouettes.includes(newItem.silhouette);
  if (isNewSilhouette) varietyBoosts.push('NEW_SILHOUETTE');
  
  // Check if adds new color to category+season
  const existingColors = seasonalItems.map(item => item.color).filter(Boolean);
  const isNewColor = newItem.color && !existingColors.includes(newItem.color);
  if (isNewColor) varietyBoosts.push('NEW_COLOR');
  
  // Apply positive modifiers based on variety boosts
  if (varietyBoosts.length >= 3) {
    scoreModifier += 2;
    reasoning.push('MAJOR_VARIETY: Adds new style + silhouette + color');
  } else if (varietyBoosts.length >= 2) {
    scoreModifier += 1;
    reasoning.push(`GOOD_VARIETY: Adds ${varietyBoosts.join(' + ').toLowerCase()}`);
  } else if (varietyBoosts.length >= 1) {
    scoreModifier += 1;
    reasoning.push(`MINOR_VARIETY: Adds ${varietyBoosts[0].toLowerCase()}`);
  }
  
  // NEGATIVE MODIFIERS - Creates monotony (style dominance)
  const monotonyWarnings = [];
  
  // Check style monotony (70%+ threshold)
  if (newItem.style) {
    const styleCount = seasonalItems.filter(item => item.style === newItem.style).length + 1;
    const stylePercentage = Math.round((styleCount / (seasonalItems.length + 1)) * 100);
    if (stylePercentage >= 70) {
      monotonyWarnings.push('STYLE_DOMINANCE');
    }
  }
  
  // Check silhouette monotony
  if (newItem.silhouette) {
    const silhouetteCount = seasonalItems.filter(item => item.silhouette === newItem.silhouette).length + 1;
    const silhouettePercentage = Math.round((silhouetteCount / (seasonalItems.length + 1)) * 100);
    if (silhouettePercentage >= 70) {
      monotonyWarnings.push('SILHOUETTE_DOMINANCE');
    }
  }
  
  // Apply negative modifiers (but don't double-penalize with duplicate detection)
  if (monotonyWarnings.length >= 2) {
    scoreModifier -= 1; // Only -1, not -2, since duplicates are handled elsewhere
    reasoning.push('STYLE_MONOTONY: Multiple style dimensions becoming dominant');
  }
  
  // Cap the modifier between -1 and +2 (asymmetric - variety is more valuable than monotony penalty)
  scoreModifier = Math.max(-1, Math.min(2, scoreModifier));
  
  return {
    modifier: scoreModifier,
    impact: scoreModifier > 0 ? 'ENRICHES' : scoreModifier < 0 ? 'MONOTONOUS' : 'NEUTRAL',
    reasoning: reasoning,
    variety_boosts: varietyBoosts,
    monotony_warnings: monotonyWarnings
  };
}

/**
 * Analyze duplicate situation and generate structured output for AI
 */
function analyzeDuplicatesForAI(newItem, existingItems) {
  const criticalDuplicates = findCriticalDuplicates(newItem, existingItems);
  
  return {
    duplicate_analysis: {
      found: criticalDuplicates.length > 0,
      count: criticalDuplicates.length,
      items: criticalDuplicates.map(d => d.item.name),
      similarity_scores: criticalDuplicates.map(d => d.similarity_score),
      overlap_factors: criticalDuplicates.map(d => d.overlap_factors),
      severity: criticalDuplicates.length >= 3 ? 'EXCESSIVE' : 
                criticalDuplicates.length >= 2 ? 'HIGH' : 
                criticalDuplicates.length >= 1 ? 'MODERATE' : 'NONE'
    }
    // All variety analysis removed - will be handled separately after gap analysis
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

IMPORTANT: Pay close attention to FIT/SILHOUETTE differences:
- "Regular" = standard fitted cut
- "Loose" = oversized, relaxed fit  
- "Fitted" = tailored, close to body
For blazers/jackets, the fit is crucial for distinguishing similar items.

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
  findCriticalDuplicates,
  analyzeDuplicatesForAI,
  analyzeStyleDiversity,
  calculateVarietyScoreModifier,
  shouldSkipVarietyAnalysis,
  identifyDuplicateFactors,
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
