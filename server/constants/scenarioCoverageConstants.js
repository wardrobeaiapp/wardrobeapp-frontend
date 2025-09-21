/**
 * Constants for scenario coverage analysis
 */

// Seasonal outerwear targets - Realistic for different seasons
const SEASONAL_OUTERWEAR_TARGETS = {
  'summer': { min: 1, ideal: 2, max: 3 },           // Light cardigan, light jacket
  'winter': { min: 2, ideal: 3, max: 4 },           // Heavy coat, warm jacket, maybe backup
  'spring/fall': { min: 3, ideal: 4, max: 5 },      // Need variety: light jacket, medium coat, rain jacket, blazer
  'default': { min: 2, ideal: 3, max: 4 }           // Fallback - more realistic
};

// Gap analysis thresholds
const GAP_THRESHOLDS = {
  COVERAGE_THRESHOLD: 60,  // Less than 60% = gap for regular items
  CRITICAL_THRESHOLD: 20,  // Less than 20% = critical
  HIGH_THRESHOLD: 40,      // Less than 40% = high priority
  MODERATE_THRESHOLD: 80   // Less than 80% = moderate priority
};

// Inappropriate scenario combinations
const INAPPROPRIATE_SCENARIO_COMBOS = {
  'light outdoor activities': ['heels', 'dress shoes', 'formal shoes'],
  'staying at home': ['heels', 'dress shoes', 'formal shoes'],
  'exercise': ['heels', 'dress shoes', 'formal shoes'],
  'sports': ['heels', 'dress shoes', 'formal shoes'],
  'hiking': ['heels', 'dress shoes', 'formal shoes'],
  'gym': ['heels', 'dress shoes', 'formal shoes']
};

// Essential fields to keep when filtering scenario coverage data
const ESSENTIAL_COVERAGE_FIELDS = [
  'scenarioName',
  'scenarioFrequency', 
  'season',
  'category',
  'currentItems',
  'coveragePercent',
  'gapCount',
  'isCritical',
  'categoryRecommendations',
  'neededItemsMin',
  'neededItemsIdeal', 
  'neededItemsMax'
];

module.exports = {
  SEASONAL_OUTERWEAR_TARGETS,
  GAP_THRESHOLDS,
  INAPPROPRIATE_SCENARIO_COMBOS,
  ESSENTIAL_COVERAGE_FIELDS
};
