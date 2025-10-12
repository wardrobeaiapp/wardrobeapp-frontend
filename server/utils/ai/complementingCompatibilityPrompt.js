/**
 * Compatibility checking prompt builder for complementing items
 * Refactored to use modular architecture - main entry point
 */

const { buildCompatibilityCheckingPrompt } = require('./compatibility/compatibilityPromptBuilder');
const { extractItemDataForCompatibility } = require('./compatibility/compatibilityDataExtractor');
const { parseCompatibilityResponse } = require('./compatibility/compatibilityResponseParser');

// Re-export all functions to maintain backward compatibility
module.exports = {
  buildCompatibilityCheckingPrompt,
  extractItemDataForCompatibility,
  parseCompatibilityResponse
};
