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
 * Check if two colors are considered matching (case insensitive)
 */
function colorsMatch(color1, color2) {
  if (!color1 || !color2) return false;
  if (color1.toLowerCase() === color2.toLowerCase()) return true;
  
  // For color families, we need to find the canonical color name first
  const findCanonicalColor = (color) => {
    for (const family of Object.values(COLOR_FAMILIES)) {
      const match = family.find(c => c.toLowerCase() === color.toLowerCase());
      if (match) return match;
    }
    return color; // Return original if not found in families
  };
  
  const canonical1 = findCanonicalColor(color1);
  const canonical2 = findCanonicalColor(color2);
  
  for (const family of Object.values(COLOR_FAMILIES)) {
    if (family.includes(canonical1) && family.includes(canonical2)) {
      return true;
    }
  }
  return false;
}

/**
 * Check if two silhouettes are considered matching
 * For basic casual tops (t-shirts, tanks), Fitted and Regular are considered similar
 */
function silhouettesMatch(silhouette1, silhouette2, category, subcategory) {
  if (!silhouette1 || !silhouette2) return false;
  if (silhouette1.toLowerCase() === silhouette2.toLowerCase()) return true;
  
  // Special case: For basic casual tops, treat Fitted and Regular as similar
  const isBasicTop = category?.toLowerCase() === 'top' && 
                     (subcategory?.toLowerCase() === 't-shirt' || 
                      subcategory?.toLowerCase() === 'tank top');
  
  if (isBasicTop) {
    const basicFits = ['Fitted', 'Regular'];
    if (basicFits.includes(silhouette1) && basicFits.includes(silhouette2)) {
      return true;
    }
  }
  
  // Check silhouette families for other categories
  for (const family of Object.values(SILHOUETTE_FAMILIES)) {
    if (family.includes(silhouette1) && family.includes(silhouette2)) {
      return true;
    }
  }
  return false;
}

/**
 * Check if two styles are considered matching (case insensitive)
 */
function styleMatches(style1, style2) {
  if (!style1 || !style2) return false;
  return style1.toLowerCase() === style2.toLowerCase();
}

/**
 * Check if two materials are considered matching (case insensitive)  
 */
function materialMatches(material1, material2) {
  if (!material1 || !material2) return false;
  return material1.toLowerCase() === material2.toLowerCase();
}

/**
 * Check if two patterns are considered matching (case insensitive)
 */
function patternMatches(pattern1, pattern2) {
  if (!pattern1 || !pattern2) return false;
  // Normalize empty strings and 'solid' to mean the same thing
  const normalize = (p) => {
    const lower = p.toLowerCase().trim();
    return (lower === '' || lower === 'solid' || lower === 'plain') ? 'solid' : lower;
  };
  return normalize(pattern1) === normalize(pattern2);
}

/**
 * Check if two necklines are considered matching (case insensitive)
 */
function necklineMatches(neckline1, neckline2) {
  if (!neckline1 || !neckline2) return false;
  return neckline1.toLowerCase() === neckline2.toLowerCase();
}

/**
 * Check if two sleeve types are considered matching (case insensitive)
 */
function sleevesMatch(sleeves1, sleeves2) {
  if (!sleeves1 || !sleeves2) return false;
  return sleeves1.toLowerCase() === sleeves2.toLowerCase();
}

/**
 * Check if two heel heights are considered matching (case insensitive)
 */
function heelHeightMatches(heel1, heel2) {
  if (!heel1 || !heel2) return false;
  return heel1.toLowerCase() === heel2.toLowerCase();
}

/**
 * Check if two boot heights are considered matching (case insensitive)
 */
function bootHeightMatches(boot1, boot2) {
  if (!boot1 || !boot2) return false;
  return boot1.toLowerCase() === boot2.toLowerCase();
}

/**
 * Check if two rise types are considered matching (case insensitive)
 */
function riseMatches(rise1, rise2) {
  if (!rise1 || !rise2) return false;
  return rise1.toLowerCase() === rise2.toLowerCase();
}

/**
 * Check if two length types are considered matching (case insensitive)
 */
function lengthMatches(length1, length2) {
  if (!length1 || !length2) return false;
  return length1.toLowerCase() === length2.toLowerCase();
}

/**
 * Calculate similarity score between items (0-100)
 * Uses category-specific weights for more accurate duplicate detection
 */
function calculateSimilarityScore(newItem, existingItem) {
  // Must match category and subcategory (case insensitive)
  if (newItem.category?.toLowerCase() !== existingItem.category?.toLowerCase() || 
      newItem.subcategory?.toLowerCase() !== existingItem.subcategory?.toLowerCase()) {
    return 0;
  }
  
  let score = 0;
  let weights;
  
  // Category-specific weights
  const category = newItem.category?.toLowerCase();
  const subcategory = newItem.subcategory?.toLowerCase();
  
  if (category === 'top' && (subcategory === 't-shirt' || subcategory === 'tank top')) {
    // For t-shirts/tanks: pattern, neckline, sleeves matter more than exact silhouette
    weights = { 
      color: 40, 
      pattern: 20,      // Plain vs patterned is important
      neckline: 15,     // Crew vs v-neck vs scoop matters
      sleeves: 10,      // Short vs long matters
      silhouette: 10,   // Less important for basic tops
      style: 5 
    };
  } else if (category === 'bottom') {
    // For bottoms: silhouette is very important (skinny vs wide leg)
    weights = { 
      color: 40, 
      silhouette: 35,   // Very important for pants/skirts
      style: 15, 
      material: 10,
      rise: 10,         // High-rise vs low-rise matters
      length: 10        // Full-length vs cropped matters
    };
  } else if (category === 'outerwear') {
    // For outerwear: style and silhouette matter a lot
    weights = { 
      color: 35, 
      silhouette: 30, 
      style: 25, 
      material: 10,
      length: 10        // Long coat vs short jacket
    };
  } else if (category === 'footwear') {
    // For footwear: heel height and boot height are defining characteristics
    weights = {
      color: 35,
      heelHeight: 30,   // Flat vs high heel is crucial
      bootHeight: 20,   // Ankle vs knee-high for boots
      style: 10,
      material: 5
    };
  } else {
    // Default weights for other categories
    weights = { 
      color: 50, 
      silhouette: 30, 
      style: 10, 
      material: 10 
    };
  }
  
  // Calculate dynamic max score based on available attributes
  // Only count weights for attributes that exist on BOTH items
  let maxScore = 0;
  let applicableWeights = {};
  
  if (weights.color && newItem.color && existingItem.color) {
    maxScore += weights.color;
    applicableWeights.color = weights.color;
  }
  if (weights.silhouette && newItem.silhouette && existingItem.silhouette) {
    maxScore += weights.silhouette;
    applicableWeights.silhouette = weights.silhouette;
  }
  if (weights.style && newItem.style && existingItem.style) {
    maxScore += weights.style;
    applicableWeights.style = weights.style;
  }
  if (weights.material && newItem.material && existingItem.material) {
    maxScore += weights.material;
    applicableWeights.material = weights.material;
  }
  if (weights.pattern && newItem.pattern && existingItem.pattern) {
    maxScore += weights.pattern;
    applicableWeights.pattern = weights.pattern;
  }
  if (weights.neckline && newItem.neckline && existingItem.neckline) {
    maxScore += weights.neckline;
    applicableWeights.neckline = weights.neckline;
  }
  if (weights.sleeves && newItem.sleeves && existingItem.sleeves) {
    maxScore += weights.sleeves;
    applicableWeights.sleeves = weights.sleeves;
  }
  if (weights.heelHeight && newItem.heelHeight && existingItem.heelHeight) {
    maxScore += weights.heelHeight;
    applicableWeights.heelHeight = weights.heelHeight;
  }
  if (weights.bootHeight && newItem.bootHeight && existingItem.bootHeight) {
    maxScore += weights.bootHeight;
    applicableWeights.bootHeight = weights.bootHeight;
  }
  if (weights.rise && newItem.rise && existingItem.rise) {
    maxScore += weights.rise;
    applicableWeights.rise = weights.rise;
  }
  if (weights.length && newItem.length && existingItem.length) {
    maxScore += weights.length;
    applicableWeights.length = weights.length;
  }
  
  // If no common attributes, can't compare
  if (maxScore === 0) return 0;
  
  // Calculate score based on available attributes
  if (applicableWeights.color && colorsMatch(newItem.color, existingItem.color)) score += applicableWeights.color;
  if (applicableWeights.silhouette && silhouettesMatch(newItem.silhouette, existingItem.silhouette, newItem.category, newItem.subcategory)) score += applicableWeights.silhouette;
  if (applicableWeights.style && styleMatches(newItem.style, existingItem.style)) score += applicableWeights.style;
  if (applicableWeights.material && materialMatches(newItem.material, existingItem.material)) score += applicableWeights.material;
  if (applicableWeights.pattern && patternMatches(newItem.pattern, existingItem.pattern)) score += applicableWeights.pattern;
  if (applicableWeights.neckline && necklineMatches(newItem.neckline, existingItem.neckline)) score += applicableWeights.neckline;
  if (applicableWeights.sleeves && sleevesMatch(newItem.sleeves, existingItem.sleeves)) score += applicableWeights.sleeves;
  if (applicableWeights.heelHeight && heelHeightMatches(newItem.heelHeight, existingItem.heelHeight)) score += applicableWeights.heelHeight;
  if (applicableWeights.bootHeight && bootHeightMatches(newItem.bootHeight, existingItem.bootHeight)) score += applicableWeights.bootHeight;
  if (applicableWeights.rise && riseMatches(newItem.rise, existingItem.rise)) score += applicableWeights.rise;
  if (applicableWeights.length && lengthMatches(newItem.length, existingItem.length)) score += applicableWeights.length;
  
  return Math.round((score / maxScore) * 100);
}

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
  colorsMatch,
  silhouettesMatch,
  styleMatches,
  materialMatches,
  calculateSimilarityScore,
  findCriticalDuplicates,
  analyzeDuplicatesForAI,
  generateExtractionPrompt,
  parseExtractionResponse,
  COLOR_OPTIONS,
  STYLE_OPTIONS,
  SILHOUETTE_OPTIONS
};
