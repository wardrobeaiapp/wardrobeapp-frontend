/**
 * Scenario Utilities
 * 
 * Contains logic for scenario-specific behavior and requirements.
 * Currently handles home scenario detection and footwear requirements.
 */

// Constants for scenario classification
const HOME_KEYWORDS = ['home', 'house', 'remote work'];

/**
 * Check if a scenario is home-based (doesn't require footwear)
 * Backend version matching the frontend function
 * @param {string} scenarioName - Name of the scenario
 * @returns {boolean} true if it's a home scenario
 */
function isHomeScenario(scenarioName) {
  if (!scenarioName) return false;
  
  const name = scenarioName.toLowerCase();
  
  return HOME_KEYWORDS.some(keyword => name.includes(keyword));
}

/**
 * Get footwear options for a scenario
 * Returns null array item for home scenarios if no footwear available
 * @param {Array} footwear - Available footwear items
 * @param {string} scenario - Scenario name
 * @returns {Array} Array of footwear items or [null] for home scenarios
 */
function getFootwearOptions(footwear, scenario) {
  const isHome = isHomeScenario(scenario);
  
  if (footwear.length > 0) {
    return footwear;
  }
  
  // If no footwear available, allow null only for home scenarios
  return isHome ? [null] : [];
}

/**
 * Check if footwear is required for a scenario
 * @param {string} scenario - Scenario name
 * @returns {boolean} true if footwear is required
 */
function requiresFootwear(scenario) {
  return !isHomeScenario(scenario);
}

/**
 * Get outfit type suffix for home scenarios
 * @param {boolean} isHome - Whether scenario is home-based
 * @param {boolean} hasShoes - Whether shoes are included in outfit
 * @param {string} baseType - Base outfit type
 * @returns {string} Complete outfit type name
 */
function getOutfitType(isHome, hasShoes, baseType) {
  if (isHome && !hasShoes) {
    return `${baseType}-home`;
  }
  return baseType;
}

module.exports = {
  isHomeScenario,
  getFootwearOptions,
  requiresFootwear,
  getOutfitType,
  // Export constants for testing
  HOME_KEYWORDS
};
