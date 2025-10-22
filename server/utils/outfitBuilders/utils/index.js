/**
 * Outfit Builders Utilities
 * 
 * Clean exports for all outfit building utility modules.
 * Enables unified imports: import { ... } from './utils'
 */

const {
  isSuitableBaseLayer,
  isLayeringOnly,
  isLayeringType,
  hasNegativeClosurePhrases,
  hasPositiveClosureIndicators,
  GOOD_BASE_LAYERS,
  BAD_BASE_LAYERS,
  LAYERING_TYPES,
  NEGATIVE_CLOSURE_PHRASES,
  POSITIVE_CLOSURE_PHRASES
} = require('./layerCompatibilityUtils');

const {
  isHomeScenario,
  getFootwearOptions,
  requiresFootwear,
  getOutfitType,
  HOME_KEYWORDS
} = require('./scenarioUtils');

module.exports = {
  // Layer Compatibility Utils
  isSuitableBaseLayer,
  isLayeringOnly,
  isLayeringType,
  hasNegativeClosurePhrases,
  hasPositiveClosureIndicators,
  GOOD_BASE_LAYERS,
  BAD_BASE_LAYERS,
  LAYERING_TYPES,
  NEGATIVE_CLOSURE_PHRASES,
  POSITIVE_CLOSURE_PHRASES,
  
  // Scenario Utils
  isHomeScenario,
  getFootwearOptions,
  requiresFootwear,
  getOutfitType,
  HOME_KEYWORDS
};
