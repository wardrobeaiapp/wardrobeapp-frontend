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
  let reason = "";
  
  // Build reason based on gap type - human-readable and friendly
  switch (gapType) {
    case 'critical':
      reason = `You're missing essential ${category} pieces`;
      if (relevantCoverage.length > 0) {
        const coverage = relevantCoverage[0];
        if (coverage.season) reason += ` for ${coverage.season}`;
        if (coverage.scenarioName !== 'All scenarios') reason += ` for ${coverage.scenarioName}`;
      }
      reason += ". This could be a great addition to fill that gap!";
      break;
      
    case 'improvement':
      reason = `Your ${category} collection could use some variety`;
      if (relevantCoverage.length > 0) {
        const coverage = relevantCoverage[0];
        if (coverage.season) reason += ` for ${coverage.season}`;
      }
      if (suitableScenarios && suitableScenarios.length > 0) {
        reason += `, especially for ${suitableScenarios.join(' and ')}`;
      }
      reason += ". This would be a nice addition!";
      break;
      
    case 'expansion':
      reason = `You have good coverage in ${category}`;
      if (relevantCoverage.length > 0) {
        const coverage = relevantCoverage[0];
        if (coverage.season) reason += ` for ${coverage.season}`;
      }
      reason += hasConstraintGoals 
        ? ". Maybe skip unless it's really special?" 
        : ", so this would be nice-to-have rather than essential.";
      break;
      
    case 'satisfied':
      reason = `You're well-stocked with ${category}`;
      if (relevantCoverage.length > 0) {
        const coverage = relevantCoverage[0];
        if (coverage.season) reason += ` for ${coverage.season}`;
        if (coverage.scenarioName !== 'All scenarios') reason += ` for ${coverage.scenarioName}`;
      }
      reason += hasConstraintGoals 
        ? ". This might be a pass." 
        : ". Only consider if it offers something truly unique.";
      break;
      
    case 'oversaturated':
      reason = `You already have plenty of ${category}`;
      if (relevantCoverage.length > 0) {
        const coverage = relevantCoverage[0];
        if (coverage.season) reason += ` for ${coverage.season}`;
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
