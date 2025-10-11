/**
 * Core similarity scoring engine for duplicate detection
 * Calculates similarity scores using dynamic weights based on available attributes
 */

const { getCategoryWeights } = require('./categoryWeights');
const {
  colorsMatch,
  silhouettesMatch,
  styleMatches,
  materialMatches,
  patternMatches,
  necklineMatches,
  sleevesMatch,
  heelHeightMatches,
  bootHeightMatches,
  riseMatches,
  lengthMatches
} = require('./attributeMatchers');

/**
 * Calculate dynamic max score and applicable weights based on available attributes
 * Includes attributes even if one item is missing data (more forgiving approach)
 */
function calculateApplicableWeights(weights, newItem, existingItem) {
  let maxScore = 0;
  const applicableWeights = {};
  
  // Helper to check if attribute exists and isn't undefined/null
  const hasAttribute = (item, key) => {
    const value = item[key];
    return value !== null && value !== undefined && value !== 'undefined' && value !== '';
  };
  
  const attributeChecks = [
    { key: 'color', check: () => hasAttribute(newItem, 'color') || hasAttribute(existingItem, 'color') },
    { key: 'silhouette', check: () => hasAttribute(newItem, 'silhouette') || hasAttribute(existingItem, 'silhouette') },
    { key: 'style', check: () => hasAttribute(newItem, 'style') || hasAttribute(existingItem, 'style') },
    { key: 'material', check: () => hasAttribute(newItem, 'material') || hasAttribute(existingItem, 'material') },
    { key: 'pattern', check: () => hasAttribute(newItem, 'pattern') || hasAttribute(existingItem, 'pattern') },
    { key: 'neckline', check: () => hasAttribute(newItem, 'neckline') || hasAttribute(existingItem, 'neckline') },
    { key: 'sleeves', check: () => hasAttribute(newItem, 'sleeves') || hasAttribute(existingItem, 'sleeves') },
    { key: 'heelHeight', check: () => hasAttribute(newItem, 'heelHeight') || hasAttribute(existingItem, 'heelHeight') },
    { key: 'bootHeight', check: () => hasAttribute(newItem, 'bootHeight') || hasAttribute(existingItem, 'bootHeight') },
    { key: 'rise', check: () => hasAttribute(newItem, 'rise') || hasAttribute(existingItem, 'rise') },
    { key: 'length', check: () => hasAttribute(newItem, 'length') || hasAttribute(existingItem, 'length') }
  ];
  
  attributeChecks.forEach(({ key, check }) => {
    if (weights[key] && check()) {
      maxScore += weights[key];
      applicableWeights[key] = weights[key];
    }
  });
  
  return { maxScore, applicableWeights };
}

/**
 * Calculate actual score based on matching attributes
 * Handles true (full credit), false (no credit), null (partial credit for missing data)
 */
function calculateMatchScore(applicableWeights, newItem, existingItem) {
  let score = 0;
  
  const matchers = {
    color: () => colorsMatch(newItem.color, existingItem.color),
    silhouette: () => silhouettesMatch(newItem.silhouette, existingItem.silhouette, newItem.category, newItem.subcategory),
    style: () => styleMatches(newItem.style, existingItem.style),
    material: () => materialMatches(newItem.material, existingItem.material),
    pattern: () => patternMatches(newItem.pattern, existingItem.pattern),
    neckline: () => necklineMatches(newItem.neckline, existingItem.neckline),
    sleeves: () => sleevesMatch(newItem.sleeves, existingItem.sleeves),
    heelHeight: () => heelHeightMatches(newItem.heelHeight, existingItem.heelHeight),
    bootHeight: () => bootHeightMatches(newItem.bootHeight, existingItem.bootHeight),
    rise: () => riseMatches(newItem.rise, existingItem.rise),
    length: () => lengthMatches(newItem.length, existingItem.length)
  };
  
  Object.keys(applicableWeights).forEach(key => {
    if (matchers[key]) {
      const matchResult = matchers[key]();
      if (matchResult === true) {
        // Full credit for definite match
        score += applicableWeights[key];
      } else if (matchResult === null) {
        // Partial credit for missing/unknown data (50% weight)
        score += applicableWeights[key] * 0.5;
      }
      // false = no credit (definite mismatch)
    }
  });
  
  return score;
}

/**
 * Calculate similarity score between two items (0-100)
 * Uses category-specific weights and dynamic scoring
 */
function calculateSimilarityScore(newItem, existingItem) {
  // Must match category and subcategory (case insensitive)
  if (newItem.category?.toLowerCase() !== existingItem.category?.toLowerCase() || 
      newItem.subcategory?.toLowerCase() !== existingItem.subcategory?.toLowerCase()) {
    return 0;
  }
  
  // Get category-specific weights
  const weights = getCategoryWeights(newItem.category, newItem.subcategory);
  
  // Calculate dynamic weights based on available attributes
  const { maxScore, applicableWeights } = calculateApplicableWeights(weights, newItem, existingItem);
  
  // If no common attributes, can't compare
  if (maxScore === 0) return 0;
  
  // Calculate actual match score
  const score = calculateMatchScore(applicableWeights, newItem, existingItem);
  
  return Math.round((score / maxScore) * 100);
}

module.exports = {
  calculateSimilarityScore,
  calculateApplicableWeights,
  calculateMatchScore
};
