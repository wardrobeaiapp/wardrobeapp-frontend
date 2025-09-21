/**
 * Utility functions for gap analysis calculations
 */

/**
 * Calculate gap severity based on coverage or current items
 */
function calculateGapSeverity(currentItems, targetMin, coveragePercent = null) {
  if (currentItems === 0) return 'CRITICAL';
  if (currentItems < targetMin) return 'HIGH';
  if (coveragePercent && coveragePercent < 50) return 'HIGH';
  if (coveragePercent && coveragePercent < 80) return 'MODERATE';
  return 'LOW';
}

/**
 * Calculate coverage percentage
 */
function calculateCoveragePercent(currentItems, targetIdeal) {
  if (targetIdeal === 0) return 100;
  return Math.min(100, (currentItems / targetIdeal) * 100);
}

/**
 * Check if there's a gap (below minimum only)
 * Oversaturated is not a "gap" - it's the opposite problem
 */
function hasGap(currentItems, targetMin, targetMax = null, coveragePercent = null, threshold = 60) {
  if (coveragePercent !== null) {
    return coveragePercent < threshold;
  }
  // Gap only exists if below minimum (not for oversaturation)
  return currentItems < targetMin;
}

/**
 * Calculate gap type based on current items vs thresholds
 */
function calculateGapType(currentItems, targetMin, targetIdeal, targetMax) {
  if (currentItems === 0) return 'critical';
  if (currentItems < targetMin) return 'critical';
  if (currentItems < targetIdeal) return 'improvement';
  if (currentItems < targetMax) return 'expansion';
  if (currentItems === targetMax) return 'satisfied';
  if (currentItems > targetMax) return 'oversaturated';
  return 'improvement'; // fallback
}

/**
 * Get base recommendation score based on gap type
 */
function getBaseScoreFromGapType(gapType) {
  const scoreMap = {
    'critical': 10,
    'improvement': 9,
    'expansion': 8,
    'satisfied': 6,
    'oversaturated': 3
  };
  return scoreMap[gapType] || 7; // fallback score
}

/**
 * Create gap data structure
 */
function createGapData(gapInfo) {
  const baseData = {
    season: gapInfo.season,
    currentItems: gapInfo.currentItems,
    coveragePercent: gapInfo.coveragePercent
  };

  if (gapInfo.isOuterwear) {
    return {
      ...baseData,
      targetMin: gapInfo.targetMin,
      targetIdeal: gapInfo.targetIdeal,
      targetMax: gapInfo.targetMax,
      scenarios: gapInfo.scenarios || ['All scenarios'],
      isOuterwearGap: true,
      isCritical: gapInfo.isCritical || false,
      gapType: gapInfo.gapType,
      baseScore: gapInfo.baseScore,
      hasGap: gapInfo.hasGap
    };
  } else {
    return {
      ...baseData,
      scenario: gapInfo.scenario,
      currentCoverage: gapInfo.coveragePercent,
      frequency: gapInfo.frequency,
      category: gapInfo.category
    };
  }
}

/**
 * Log gap analysis debug information
 */
function logGapAnalysis(type, seasonOrScenario, season, data) {
  if (type === 'outerwear') {
    console.log(`🔍 Outerwear Season Analysis: ${seasonOrScenario}`);
    console.log(`   Current items: ${data.currentItems}, Target min: ${data.targetMin}, ideal: ${data.targetIdeal}, max: ${data.targetMax || 'N/A'}`);
    console.log(`   Gap Type: ${data.gapType || 'unknown'}, Base Score: ${data.baseScore || 'N/A'}, Coverage: ${data.coveragePercent.toFixed(1)}%`);
    console.log(`   Has gap: ${data.hasGap} (gap = below minimum only)`);
  } else {
    console.log(`🔍 Regular Gap Analysis: ${seasonOrScenario} ${season}`);
    console.log(`   Coverage: ${data.coveragePercent}%, HasGap: ${data.hasGap} (< 60%), SeasonMatch: ${data.seasonMatch}, ScenarioAppropriate: ${data.scenarioAppropriate}`);
  }
}

module.exports = {
  calculateGapSeverity,
  calculateCoveragePercent,
  hasGap,
  calculateGapType,
  getBaseScoreFromGapType,
  createGapData,
  logGapAnalysis
};
