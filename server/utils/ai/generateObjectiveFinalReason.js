/**
 * Generate objective final reason based on gap analysis results
 * @param {Array} relevantCoverage - Filtered coverage data used for analysis
 * @param {string} gapType - Most critical gap type found
 * @param {string[]} suitableScenarios - Suitable scenarios from Claude
 * @param {boolean} hasConstraintGoals - Whether user has declutter/save money goals
 * @param {Object} formData - Form data with category info
 * @param {Array} userGoals - User goals that affect the response
 * @returns {string} Objective reason based on gap analysis
 */
function generateObjectiveFinalReason(relevantCoverage, gapType, suitableScenarios, hasConstraintGoals, formData, userGoals) {
  if (!relevantCoverage || relevantCoverage.length === 0) {
    return "No coverage data available for analysis.";
  }
  
  const category = formData?.category || "this category";
  
  // Use subcategory from formData first, then fall back to coverage data
  // This ensures we use the correct subcategory for the item being analyzed
  let itemType = category;
  
  if (formData?.subcategory) {
    // Use the actual subcategory of the item being analyzed (most reliable)
    itemType = formData.subcategory.toLowerCase();
    // Make it plural for better readability (e.g., "bags" instead of "bag")  
    if (!itemType.endsWith('s')) itemType += 's';
  } else if (relevantCoverage.length > 0 && relevantCoverage[0].subcategory) {
    // Fallback to coverage data subcategory
    itemType = relevantCoverage[0].subcategory.toLowerCase();
    if (!itemType.endsWith('s')) itemType += 's';
  }
  
  let reason = "";
  
  // Check if this is a non-seasonal accessory that shouldn't have season info
  const nonSeasonalAccessories = ['bag', 'belt', 'jewelry', 'watch', 'sunglasses'];
  const isNonSeasonalAccessory = formData?.subcategory && 
    nonSeasonalAccessories.includes(formData.subcategory.toLowerCase());

  // Build reason based on gap type - human-readable and friendly
  switch (gapType) {
    case 'critical':
      reason = `You're missing essential ${itemType} pieces`;
      if (relevantCoverage.length > 0) {
        const coverage = relevantCoverage[0];
        if (coverage.season && coverage.season !== 'all_seasons' && !isNonSeasonalAccessory) reason += ` for ${coverage.season}`;
        if (coverage.scenarioName !== 'All scenarios') reason += ` for ${coverage.scenarioName}`;
      }
      reason += ". This could be a great addition to fill that gap!";
      break;
      
    case 'improvement':
      reason = `Your ${itemType} collection could use some variety`;
      if (relevantCoverage.length > 0) {
        const coverage = relevantCoverage[0];
        if (coverage.season && coverage.season !== 'all_seasons' && !isNonSeasonalAccessory) reason += ` for ${coverage.season}`;
        // Only mention scenarios if this coverage uses scenario-specific analysis
        if (coverage.scenarioName !== 'All scenarios' && suitableScenarios && suitableScenarios.length > 0) {
          reason += `, especially for ${suitableScenarios.join(' and ')}`;
        }
      }
      reason += ". This would be a nice addition!";
      break;
      
    case 'expansion':
      reason = `You have good coverage in ${itemType}`;
      if (relevantCoverage.length > 0) {
        const coverage = relevantCoverage[0];
        if (coverage.season && coverage.season !== 'all_seasons' && !isNonSeasonalAccessory) reason += ` for ${coverage.season}`;
      }
      reason += hasConstraintGoals 
        ? ". Maybe skip unless it's really special?" 
        : ", so this would be nice-to-have rather than essential.";
      break;
      
    case 'satisfied':
      reason = `You're well-stocked with ${itemType}`;
      if (relevantCoverage.length > 0) {
        const coverage = relevantCoverage[0];
        if (coverage.season && coverage.season !== 'all_seasons' && !isNonSeasonalAccessory) reason += ` for ${coverage.season}`;
        if (coverage.scenarioName !== 'All scenarios') reason += ` for ${coverage.scenarioName}`;
      }
      reason += hasConstraintGoals 
        ? ". This might be a pass." 
        : ". Only consider if it offers something truly unique.";
      break;
      
    case 'oversaturated':
      reason = `You already have plenty of ${itemType}`;
      if (relevantCoverage.length > 0) {
        const coverage = relevantCoverage[0];
        if (coverage.season && coverage.season !== 'all_seasons' && !isNonSeasonalAccessory) reason += ` for ${coverage.season}`;
        if (coverage.scenarioName !== 'All scenarios') reason += ` for ${coverage.scenarioName}`;
      }
      reason += ".";
      break;
      
    default:
      reason = `Based on your current wardrobe, this would be a moderate priority.`;
  }
  
  return reason;
}

module.exports = generateObjectiveFinalReason;
