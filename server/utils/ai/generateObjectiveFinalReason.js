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
/**
 * Helper function to format seasons - returns "all seasons" if all main seasons are covered
 */
function formatSeasons(seasonsArray) {
  const uniqueSeasons = [...new Set(seasonsArray)];
  const allMainSeasons = ['summer', 'winter', 'spring/fall'];
  
  // Check if we have all main seasons
  const hasAllSeasons = allMainSeasons.every(season => uniqueSeasons.includes(season));
  
  if (hasAllSeasons && uniqueSeasons.length === 3) {
    return 'all seasons';
  }
  
  // Otherwise join with "and" as before
  return uniqueSeasons.join(' and ');
}

/**
 * Validate and filter scenario names to only include user's actual scenarios
 * @param {string[]} scenarioNames - Array of scenario names to validate
 * @param {array} validScenarios - Array of valid scenario objects
 * @returns {string[]} Array of validated scenario names
 */
function validateScenarioNames(scenarioNames, validScenarios) {
  if (!validScenarios || validScenarios.length === 0 || !scenarioNames || scenarioNames.length === 0) {
    return scenarioNames || [];
  }
  
  const validScenarioNames = validScenarios.map(s => s.name);
  const validatedNames = [];
  
  for (const scenarioName of scenarioNames) {
    const matchingScenario = validScenarioNames.find(validName => 
      // Exact match first
      validName.toLowerCase() === scenarioName.toLowerCase() ||
      // Partial match (coverage data sometimes has variations)
      validName.toLowerCase().includes(scenarioName.toLowerCase()) ||
      scenarioName.toLowerCase().includes(validName.toLowerCase())
    );
    
    if (matchingScenario) {
      // Use the exact scenario name from user's list
      if (!validatedNames.includes(matchingScenario)) {
        validatedNames.push(matchingScenario);
      }
    } else {
      console.log(`❌ FINAL REASON: Filtered out invalid scenario: "${scenarioName}"`);
      console.log(`   Valid scenarios: [${validScenarioNames.join(', ')}]`);
    }
  }
  
  return validatedNames;
}

function generateObjectiveFinalReason(relevantCoverage, gapType, suitableScenarios, hasConstraintGoals, formData, userGoals, validScenarios = []) {
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
  
  // Convert technical category names to user-friendly terms
  // Note: one_piece items could be dresses, jumpsuits, rompers, etc. 
  // Use generic language to avoid assuming specific item type
  const categoryMapping = {
    'one_piece': null, // Use generic language instead of assuming "dress"
    'one_pieces': null, // Use generic language instead of assuming "dresses"
    'top': 'tops',
    'bottom': 'bottoms',
    'footwear': 'shoes',
    'outerwear': 'outerwear',
    'accessory': 'accessories'
  };
  
  // Use user-friendly category name if available, or null for generic language
  if (categoryMapping.hasOwnProperty(itemType)) {
    itemType = categoryMapping[itemType]; // Could be null for generic language
  } else {
    // Fallback: Make it plural for better readability (e.g., "tops" instead of "top")
    // Handle special cases: mass nouns and words that are already plural
    const massNouns = ['outerwear', 'footwear', 'sleepwear', 'activewear', 'underwear'];
    if (!itemType.endsWith('s') && !massNouns.includes(itemType)) {
      itemType += 's';
    }
  }
  
  // Flag for using generic language when we can't specify the category
  const useGenericLanguage = itemType === null;
  
  let reason = "";
  
  // Check if this is a non-seasonal accessory that shouldn't have season info
  const nonSeasonalAccessories = ['bag', 'belt', 'jewelry', 'watch', 'sunglasses'];
  const isNonSeasonalAccessory = formData?.subcategory && 
    nonSeasonalAccessories.includes(formData.subcategory.toLowerCase());

  // Build reason based on gap type - human-readable and friendly
  switch (gapType) {
    case 'critical':
      if (useGenericLanguage || category.toLowerCase() === 'one_piece') {
        // Special case: one_piece items - focus on scenario coverage since separates might already cover it
        if (relevantCoverage.length > 0) {
          const prioritizedCoverage = relevantCoverage.sort((a, b) => {
            if (a.gapCount !== b.gapCount) {
              return b.gapCount - a.gapCount;
            }
            return a.coveragePercent - b.coveragePercent;
          })[0];
          
          reason = `This could add versatility for ${prioritizedCoverage.scenarioName}`;
          
          const seasonsWithGaps = relevantCoverage
            .filter(item => item.season && item.season !== 'all_seasons' && !isNonSeasonalAccessory)
            .map(item => item.season);
          
          if (seasonsWithGaps.length > 1) {
            reason += ` in ${formatSeasons(seasonsWithGaps)}`;
          } else if (prioritizedCoverage.season && prioritizedCoverage.season !== 'all_seasons' && !isNonSeasonalAccessory) {
            reason += ` in ${prioritizedCoverage.season}`;
          }
        } else {
          reason = `This could add versatility to your wardrobe`;
        }
        reason += ", even if you already have separates that work.";
      } else {
        // Normal case: other categories
        reason = `You're missing essential ${itemType} pieces`;
        if (relevantCoverage.length > 0) {
          const prioritizedCoverage = relevantCoverage.sort((a, b) => {
            if (a.gapCount !== b.gapCount) {
              return b.gapCount - a.gapCount;
            }
            return a.coveragePercent - b.coveragePercent;
          })[0];
          
          const seasonsWithGaps = relevantCoverage
            .filter(item => item.season && item.season !== 'all_seasons' && !isNonSeasonalAccessory)
            .map(item => item.season);
          
          if (seasonsWithGaps.length > 1) {
            reason += ` for ${formatSeasons(seasonsWithGaps)}`;
          } else if (prioritizedCoverage.season && prioritizedCoverage.season !== 'all_seasons' && !isNonSeasonalAccessory) {
            reason += ` for ${prioritizedCoverage.season}`;
          }
          
          if (prioritizedCoverage.scenarioName !== 'All scenarios') reason += ` for ${prioritizedCoverage.scenarioName}`;
        }
        reason += ". This could be a great addition to fill that gap!";
      }
      break;
      
    case 'improvement':
      if (useGenericLanguage || category.toLowerCase() === 'one_piece') {
        // Special case: one_piece items - focus on adding styling options since separates might already provide variety
        if (relevantCoverage.length > 0) {
          const prioritizedCoverage = relevantCoverage.sort((a, b) => {
            if (a.gapCount !== b.gapCount) {
              return b.gapCount - a.gapCount;
            }
            return a.coveragePercent - b.coveragePercent;
          })[0];
          
          reason = `This could add a different styling option for ${prioritizedCoverage.scenarioName}`;
          
          const seasonsWithGaps = relevantCoverage
            .filter(item => item.season && item.season !== 'all_seasons' && !isNonSeasonalAccessory)
            .map(item => item.season);
          
          if (seasonsWithGaps.length > 1) {
            reason += ` in ${formatSeasons(seasonsWithGaps)}`;
          } else if (prioritizedCoverage.season && prioritizedCoverage.season !== 'all_seasons' && !isNonSeasonalAccessory) {
            reason += ` in ${prioritizedCoverage.season}`;
          }
        } else {
          reason = `This could add a different styling option to your wardrobe`;
        }
        reason += ", complementing your existing separates.";
      } else {
        // Normal case: other categories
        reason = `Your ${itemType} collection could use some variety`;
        if (relevantCoverage.length > 0) {
          const prioritizedCoverage = relevantCoverage.sort((a, b) => {
            if (a.gapCount !== b.gapCount) {
              return b.gapCount - a.gapCount;
            }
            return a.coveragePercent - b.coveragePercent;
          })[0];
          
          const seasonsWithGaps = relevantCoverage
            .filter(item => item.season && item.season !== 'all_seasons' && !isNonSeasonalAccessory)
            .map(item => item.season);
          
          if (seasonsWithGaps.length > 1) {
            reason += ` for ${formatSeasons(seasonsWithGaps)}`;
          } else if (prioritizedCoverage.season && prioritizedCoverage.season !== 'all_seasons' && !isNonSeasonalAccessory) {
            reason += ` for ${prioritizedCoverage.season}`;
          }
          
          // Check if coverage is scenario-specific before using suitableScenarios
          const coverageScenarioNames = [...new Set(
            relevantCoverage
              .map(c => c.scenarioName)
              .filter(name => name && name !== 'All scenarios')
          )];
          
          // Only use suitableScenarios if coverage is actually scenario-specific
          const rawScenarioNames = coverageScenarioNames.length > 0 && suitableScenarios && suitableScenarios.length > 0 
            ? suitableScenarios.filter(name => name && name !== 'All scenarios')
            : coverageScenarioNames;
            
          // VALIDATE: Only use scenario names that match user's actual scenarios
          const validatedScenarioNames = validateScenarioNames(rawScenarioNames, validScenarios);
            
          if (validatedScenarioNames.length > 0) {
            reason += `, especially for ${validatedScenarioNames.join(' and ')}`;
          }
        }
        reason += ". This would be a nice addition!";
      }
      break;
      
    case 'expansion':
      if (relevantCoverage.length > 0) {
        // Find the coverage item with the biggest gap (lowest coverage percentage or highest gap count)
        const prioritizedCoverage = relevantCoverage.sort((a, b) => {
          // Prioritize by gap count first, then by coverage percentage (lower is worse)
          if (a.gapCount !== b.gapCount) {
            return b.gapCount - a.gapCount; // Higher gap count = higher priority
          }
          return a.coveragePercent - b.coveragePercent; // Lower coverage = higher priority
        })[0];
        
        console.log(`📊 EXPANSION GAP DETAIL: ${prioritizedCoverage.scenarioName} - ${itemType} - ${prioritizedCoverage.season || 'all seasons'} (${prioritizedCoverage.gapCount} gaps, ${prioritizedCoverage.coveragePercent}% coverage)`);
        
        // Special case: one_piece items can be replaced by separates for the same scenario
        if (useGenericLanguage || category.toLowerCase() === 'one_piece') {
          reason = `You have good coverage for ${prioritizedCoverage.scenarioName}`;
          
          // Add season info for one_piece scenario-based messaging
          const seasonsWithGaps = relevantCoverage
            .filter(item => item.season && item.season !== 'all_seasons' && !isNonSeasonalAccessory)
            .map(item => item.season);
          
          if (seasonsWithGaps.length > 1) {
            reason += ` in ${formatSeasons(seasonsWithGaps)}`;
          } else if (prioritizedCoverage.season && prioritizedCoverage.season !== 'all_seasons' && !isNonSeasonalAccessory) {
            reason += ` in ${prioritizedCoverage.season}`;
          }
        } else {
          // Normal case: category-specific coverage makes sense for other items
          reason = useGenericLanguage ? 
            `You have good coverage` : 
            `You have good coverage in ${itemType}`;
          
          // Check if there are multiple seasons with similar gaps
          const seasonsWithGaps = relevantCoverage
            .filter(item => item.season && item.season !== 'all_seasons' && !isNonSeasonalAccessory)
            .map(item => item.season);
          
          if (seasonsWithGaps.length > 1) {
            // Multiple seasons - show all of them or "all seasons" if complete
            reason += ` for ${formatSeasons(seasonsWithGaps)}`;
          } else if (prioritizedCoverage.season && prioritizedCoverage.season !== 'all_seasons' && !isNonSeasonalAccessory) {
            // Single season
            reason += ` for ${prioritizedCoverage.season}`;
          }
          
          if (prioritizedCoverage.scenarioName !== 'All scenarios') reason += ` for ${prioritizedCoverage.scenarioName}`;
        }
      } else {
        // Fallback when no coverage data available
        reason = useGenericLanguage ? 
          `You have good coverage` : 
          `You have good coverage in ${itemType}`;
      }
      reason += hasConstraintGoals 
        ? ". Maybe skip unless it's really special?" 
        : ", so this would be nice-to-have rather than essential.";
      break;
      
    case 'satisfied':
      reason = useGenericLanguage ? 
        `You're well-stocked` : 
        `You're well-stocked with ${itemType}`;
      if (relevantCoverage.length > 0) {
        // Find the coverage item with the highest coverage/lowest gap count for satisfied items
        const prioritizedCoverage = relevantCoverage.sort((a, b) => {
          if (a.gapCount !== b.gapCount) {
            return a.gapCount - b.gapCount; // Lower gap count = higher satisfaction
          }
          return b.coveragePercent - a.coveragePercent; // Higher coverage = higher satisfaction
        })[0];
        
        // Check if there are multiple seasons that are satisfied
        const seasonsWithGaps = relevantCoverage
          .filter(item => item.season && item.season !== 'all_seasons' && !isNonSeasonalAccessory)
          .map(item => item.season);
        
        if (seasonsWithGaps.length > 1) {
          // Multiple seasons - show all of them or "all seasons" if complete
          reason += ` for ${formatSeasons(seasonsWithGaps)}`;
        } else if (prioritizedCoverage.season && prioritizedCoverage.season !== 'all_seasons' && !isNonSeasonalAccessory) {
          // Single season
          reason += ` for ${prioritizedCoverage.season}`;
        }
        
        if (prioritizedCoverage.scenarioName !== 'All scenarios') reason += ` for ${prioritizedCoverage.scenarioName}`;
      }
      reason += hasConstraintGoals 
        ? ". This might be a pass." 
        : ". Only consider if it offers something truly unique.";
      break;
      
    case 'oversaturated':
      reason = useGenericLanguage ? 
        `You already have plenty in this category` : 
        `You already have plenty of ${itemType}`;
      if (relevantCoverage.length > 0) {
        // Find the coverage item with the highest coverage/lowest gap count for oversaturated items
        const prioritizedCoverage = relevantCoverage.sort((a, b) => {
          if (a.gapCount !== b.gapCount) {
            return a.gapCount - b.gapCount; // Lower gap count = more oversaturated
          }
          return b.coveragePercent - a.coveragePercent; // Higher coverage = more oversaturated
        })[0];
        
        // Check if there are multiple seasons that are oversaturated
        const seasonsWithGaps = relevantCoverage
          .filter(item => item.season && item.season !== 'all_seasons' && !isNonSeasonalAccessory)
          .map(item => item.season);
        
        if (seasonsWithGaps.length > 1) {
          // Multiple seasons - show all of them or "all seasons" if complete
          reason += ` for ${formatSeasons(seasonsWithGaps)}`;
        } else if (prioritizedCoverage.season && prioritizedCoverage.season !== 'all_seasons' && !isNonSeasonalAccessory) {
          // Single season
          reason += ` for ${prioritizedCoverage.season}`;
        }
        
        if (prioritizedCoverage.scenarioName !== 'All scenarios') reason += ` for ${prioritizedCoverage.scenarioName}`;
      }
      reason += ".";
      break;
      
    default:
      reason = `Based on your current wardrobe, this would be a moderate priority.`;
  }
  
  return reason;
}

module.exports = generateObjectiveFinalReason;
