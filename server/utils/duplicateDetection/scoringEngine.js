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
 * Only counts weights for attributes that exist on BOTH items
 */
function calculateApplicableWeights(weights, newItem, existingItem) {
  let maxScore = 0;
  const applicableWeights = {};
  
  const attributeChecks = [
    { key: 'color', check: () => newItem.color && existingItem.color },
    { key: 'silhouette', check: () => newItem.silhouette && existingItem.silhouette },
    { key: 'style', check: () => newItem.style && existingItem.style },
    { key: 'material', check: () => newItem.material && existingItem.material },
    { key: 'pattern', check: () => newItem.pattern && existingItem.pattern },
    { key: 'neckline', check: () => newItem.neckline && existingItem.neckline },
    { key: 'sleeves', check: () => newItem.sleeves && existingItem.sleeves },
    { key: 'heelHeight', check: () => newItem.heelHeight && existingItem.heelHeight },
    { key: 'bootHeight', check: () => newItem.bootHeight && existingItem.bootHeight },
    { key: 'rise', check: () => newItem.rise && existingItem.rise },
    { key: 'length', check: () => newItem.length && existingItem.length }
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
    if (matchers[key] && matchers[key]()) {
      score += applicableWeights[key];
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
