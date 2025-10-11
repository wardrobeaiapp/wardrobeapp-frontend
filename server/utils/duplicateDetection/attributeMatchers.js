/**
 * Generic attribute matching functions for duplicate detection
 * All functions are case-insensitive and handle null/undefined values
 */

const { COLOR_FAMILIES, SILHOUETTE_FAMILIES } = require('../../constants/wardrobeOptions');

/**
 * Generic case-insensitive string matcher
 * Returns null for missing data (let scoring engine decide), true/false for definitive matches
 */
function simpleMatch(value1, value2) {
  // If either is missing, return null (neutral - let other attributes decide)
  if (!value1 || !value2 || value1 === 'undefined' || value2 === 'undefined') return null;
  return value1.toLowerCase() === value2.toLowerCase();
}

/**
 * Check if two colors are considered matching (case insensitive + color families)
 * Returns null for missing data (let scoring engine decide), true/false for definitive matches
 */
function colorsMatch(color1, color2) {
  // If either is missing, return null (neutral - let other attributes decide)  
  if (!color1 || !color2 || color1 === 'undefined' || color2 === 'undefined') return null;
  if (color1.toLowerCase() === color2.toLowerCase()) return true;
  
  // For color families, find canonical color name first
  const findCanonicalColor = (color) => {
    for (const family of Object.values(COLOR_FAMILIES)) {
      const match = family.find(c => c.toLowerCase() === color.toLowerCase());
      if (match) return match;
    }
    return color;
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
 * Special handling for basic casual tops (t-shirts, tanks)
 * Returns null for missing data (let scoring engine decide), true/false for definitive matches
 */
function silhouettesMatch(silhouette1, silhouette2, category, subcategory) {
  // If either is missing, return null (neutral - let other attributes decide)
  if (!silhouette1 || !silhouette2 || silhouette1 === 'undefined' || silhouette2 === 'undefined') return null;
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
 * Check if two patterns are considered matching
 * Normalizes empty strings and 'solid'/'plain' to be equivalent
 */
function patternMatches(pattern1, pattern2) {
  // Handle null/undefined by treating them as empty string
  const p1 = pattern1 || '';
  const p2 = pattern2 || '';
  
  const normalize = (p) => {
    const lower = p.toLowerCase().trim();
    return (lower === '' || lower === 'solid' || lower === 'plain') ? 'solid' : lower;
  };
  
  return normalize(p1) === normalize(p2);
}

// Export all matchers
module.exports = {
  simpleMatch,
  colorsMatch,
  silhouettesMatch,
  patternMatches,
  
  // Simple matchers using the generic function
  styleMatches: simpleMatch,
  materialMatches: simpleMatch,
  necklineMatches: simpleMatch,
  sleevesMatch: simpleMatch,
  heelHeightMatches: simpleMatch,
  bootHeightMatches: simpleMatch,
  riseMatches: simpleMatch,
  lengthMatches: simpleMatch
};
