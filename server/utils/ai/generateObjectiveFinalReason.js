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
  
  // ✅ FIXED: Use category-level reasoning to match coverage calculation
  // Coverage checks category-level (e.g., "tops"), so reasoning should too
  let itemType = category.toLowerCase();
  
  // Only use subcategory for accessories (which have subcategory-based coverage)
  if (category === 'accessory' && formData?.subcategory) {
    itemType = formData.subcategory.toLowerCase();
  } else if (category === 'accessory' && relevantCoverage.length > 0 && relevantCoverage[0].subcategory) {
    itemType = relevantCoverage[0].subcategory.toLowerCase();
  }
  
  // Make it plural for better readability (e.g., "tops" instead of "top")
  // Handle special cases: mass nouns and words that are already plural
  const massNouns = ['outerwear', 'footwear', 'sleepwear', 'activewear', 'underwear'];
  if (!itemType.endsWith('s') && !massNouns.includes(itemType)) {
    itemType += 's';
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
        console.log(`📊 EXPANSION GAP DETAIL: ${coverage.scenarioName} - ${itemType} - ${coverage.season || 'all seasons'}`);
        if (coverage.season && coverage.season !== 'all_seasons' && !isNonSeasonalAccessory) reason += ` for ${coverage.season}`;
        if (coverage.scenarioName !== 'All scenarios') reason += ` for ${coverage.scenarioName}`;
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
