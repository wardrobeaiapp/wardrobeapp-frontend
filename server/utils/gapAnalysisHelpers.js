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
 * Check if there's a gap based on minimum requirements
 */
function hasGap(currentItems, targetMin, coveragePercent = null, threshold = 60) {
  if (coveragePercent !== null) {
    return coveragePercent < threshold;
  }
  return currentItems < targetMin;
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
      isCritical: gapInfo.isCritical || false
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
    console.log(`   Current items: ${data.currentItems}, Target min: ${data.targetMin}, ideal: ${data.targetIdeal}`);
    console.log(`   Has gap: ${data.hasGap}, Coverage: ${data.coveragePercent.toFixed(1)}%`);
  } else {
    console.log(`🔍 Regular Gap Analysis: ${seasonOrScenario} ${season}`);
    console.log(`   Coverage: ${data.coveragePercent}%, HasGap: ${data.hasGap} (< 60%), SeasonMatch: ${data.seasonMatch}, ScenarioAppropriate: ${data.scenarioAppropriate}`);
  }
}

module.exports = {
  calculateGapSeverity,
  calculateCoveragePercent,
  hasGap,
  createGapData,
  logGapAnalysis
};
