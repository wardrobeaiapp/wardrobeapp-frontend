const generateObjectiveFinalReason = require('./generateObjectiveFinalReason');
const { calculateVarietyScoreModifier } = require('../duplicateDetectionUtils');

/**
 * Format variety analysis into natural user-facing message
 */
function formatVarietyMessage(varietyModifier) {
  if (!varietyModifier || varietyModifier.impact === 'NEUTRAL' || varietyModifier.impact === 'SKIPPED') {
    return '';
  }
  
  if (varietyModifier.modifier > 0) {
    // Positive variety impact
    const boosts = varietyModifier.variety_boosts || [];
    const varietyTypes = boosts.map(boost => {
      switch (boost) {
        case 'NEW_COLOR': return 'color';
        case 'NEW_STYLE': return 'style';
        case 'NEW_SILHOUETTE': return 'silhouette';
        default: return boost.toLowerCase().replace('new_', '');
      }
    });
    
    if (varietyTypes.length === 1) {
      return ` This piece would expand your styling options by adding a new ${varietyTypes[0]}.`;
    } else if (varietyTypes.length === 2) {
      return ` This piece would expand your styling options by adding new ${varietyTypes.join(' and ')}.`;
    } else if (varietyTypes.length > 2) {
      return ` This piece would expand your styling options with new ${varietyTypes.slice(0, -1).join(', ')} and ${varietyTypes[varietyTypes.length - 1]}.`;
    }
  } else if (varietyModifier.modifier < 0) {
    // Negative variety impact
    return ', but this would limit your styling variety as you already have many similar pieces.';
  }
  
  return '';
}

/**
 * Analyze scenario coverage to determine initial score based on gap analysis
 * @param {Array} scenarioCoverage - Scenario coverage data
 * @param {string[]} suitableScenarios - Array of suitable scenario names from Claude analysis
 * @param {Object} formData - Form data with category/subcategory info
 * @param {Array} userGoals - User goals that affect scoring
 * @param {Object} duplicateAnalysis - Optional duplicate detection results
 * @returns {Object} Analysis results with score and reason data
 */
function analyzeScenarioCoverageForScore(scenarioCoverage, suitableScenarios, formData, userGoals, duplicateAnalysis) {
  // PRIORITY 1: Check for duplicates first
  if (duplicateAnalysis && duplicateAnalysis.duplicate_analysis && duplicateAnalysis.duplicate_analysis.found) {
    const duplicateCount = duplicateAnalysis.duplicate_analysis.count;
    const severity = duplicateAnalysis.duplicate_analysis.severity;
    const duplicateItems = duplicateAnalysis.duplicate_analysis.items;
    
    console.log('🚫 DUPLICATE DETECTED - Setting low score based on duplicate severity');
    console.log(`   - Found ${duplicateCount} duplicate(s): ${duplicateItems.join(', ')}`);
    console.log(`   - Severity: ${severity}`);
    
    let score;
    let reason;
    
    if (duplicateCount >= 2) {
      // Multiple duplicates - very low score
      score = 1.0;
      reason = `You already have ${duplicateCount} very similar items (${duplicateItems.join(', ')}). Adding this would create excessive redundancy in your wardrobe.`;
    } else {
      // One duplicate - low score
      score = 2.0;
      reason = `You already have a very similar item: "${duplicateItems[0]}". Consider if you really need another similar piece.`;
    }
    
    return {
      score,
      reason,
      relevantCoverage: [],
      gapType: 'duplicate',
      duplicateInfo: {
        count: duplicateCount,
        severity,
        items: duplicateItems
      }
    };
  }
  
  // PRIORITY 2: No duplicates found - proceed with scenario coverage analysis
  if (!scenarioCoverage || !Array.isArray(scenarioCoverage) || scenarioCoverage.length === 0) {
    return {
      score: 5.0,
      reason: "No coverage data available for analysis.",
      relevantCoverage: [],
      gapType: null
    };
  }
  
  console.log('✅ No duplicates detected - analyzing scenario coverage for score...');
  console.log('Suitable scenarios from Claude:', suitableScenarios);
  console.log('Raw scenario coverage entries:', scenarioCoverage.length);
  
  // DEDUPLICATE scenario coverage data (fix for duplicate database rows)
  const uniqueCoverage = [];
  const seen = new Set();
  
  scenarioCoverage.forEach((coverage, index) => {
    console.log(`  [${index}] ${coverage.scenarioName} - ${coverage.category} - ${coverage.gapType || 'no gap'} - season: ${coverage.season || 'none'}`);
    
    const key = `${coverage.scenarioName || 'unknown'}-${coverage.category || 'unknown'}-${coverage.season || 'none'}-${coverage.subcategoryName || 'unknown'}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueCoverage.push(coverage);
    }
  });
  
  console.log('After deduplication:', uniqueCoverage.length, 'unique entries');
  
  // Use deduplicated data for the rest of the analysis
  scenarioCoverage = uniqueCoverage;
  
  let relevantCoverage = [];
  
  // Filter coverage based on suitable scenarios, but handle special cases
  if (suitableScenarios && suitableScenarios.length > 0) {
    // Check only suitable scenarios
    relevantCoverage = scenarioCoverage.filter(coverage => {
      // Always include "All scenarios" coverage (e.g. outerwear)
      if (coverage.scenarioName.toLowerCase().includes('all scenarios')) {
        return true;
      }
      
      // Include specific scenarios that match
      return suitableScenarios.some(scenario => 
        coverage.scenarioName.toLowerCase().includes(scenario.toLowerCase()) ||
        scenario.toLowerCase().includes(coverage.scenarioName.toLowerCase())
      );
    });
    console.log('Filtered coverage for suitable scenarios:', relevantCoverage.length, 'entries');
    
    // If filtering resulted in 0 entries, use all coverage as fallback
    if (relevantCoverage.length === 0) {
      console.log('No matches found, falling back to all coverage');
      relevantCoverage = scenarioCoverage;
    }
  } else {
    // Use all coverage if no suitable scenarios identified
    relevantCoverage = scenarioCoverage;
    console.log('Using all coverage data:', relevantCoverage.length, 'entries');
  }
  
  if (relevantCoverage.length === 0) {
    console.log('No relevant coverage found, using default score');
    return {
      score: 5.0,
      reason: "No relevant coverage found for this analysis.",
      relevantCoverage: [],
      gapType: null
    };
  }
  
  // Find the most critical gap type to determine score
  let gapType = null;
  
  for (const coverage of relevantCoverage) {
    console.log(`Coverage: ${coverage.scenarioName} - ${coverage.category} - ${coverage.gapType}`);
    
    if (coverage.gapType) {
      // Simple priority: critical > improvement > expansion > satisfied > oversaturated
      if (!gapType || 
          (coverage.gapType === 'critical') ||
          (coverage.gapType === 'improvement' && gapType !== 'critical') ||
          (coverage.gapType === 'expansion' && !['critical', 'improvement'].includes(gapType))) {
        gapType = coverage.gapType;
      }
    }
  }
  
  // Check if user has decluttering/money-saving goals
  const hasConstraintGoals = userGoals && userGoals.some(goal => 
    ['buy-less-shop-more-intentionally', 'declutter-downsize', 'save-money'].includes(goal)
  );
  
  // Convert gap type to score with userGoals consideration
  let initialScore = 5.0;
  
  if (hasConstraintGoals) {
    // CONSTRAINED SCORING (declutter/save money goals)
    switch (gapType) {
      case 'critical':
        initialScore = 10;
        break;
      case 'improvement':
        initialScore = 9;
        break;
      case 'expansion':
        initialScore = 6; // Lower score - probably skip
        break;
      case 'satisfied':
        initialScore = 4; // Lower score - skip, you have enough
        break;
      case 'oversaturated':
        initialScore = 2; // Lower score - definitely skip
        break;
      default:
        initialScore = 5.0;
    }
    console.log(`Constrained scoring (${userGoals.filter(g => ['buy-less-shop-more-intentionally', 'declutter-downsize', 'save-money'].includes(g)).join(', ')}) - Gap type '${gapType}': ${initialScore}`);
  } else {
    // STANDARD SCORING
    switch (gapType) {
      case 'critical':
        initialScore = 10;
        break;
      case 'improvement':
        initialScore = 9;
        break;
      case 'expansion':
        initialScore = 8;
        break;
      case 'satisfied':
        initialScore = 6;
        break;
      case 'oversaturated':
        initialScore = 3;
        break;
      default:
        initialScore = 5.0;
    }
    console.log(`Standard scoring - Gap type '${gapType}': ${initialScore}`);
  }
  
  // VARIETY ANALYSIS (only for expansion gaps)
  let varietyModifier = null;
  let finalScore = initialScore;
  
  if (gapType === 'expansion' && duplicateAnalysis && !duplicateAnalysis.duplicate_analysis.found) {
    // Only run variety analysis for expansion gaps when no duplicates found
    // We need the newItem from duplicateAnalysis context - for now, skip if not available
    console.log(' Running variety analysis for expansion gap...');
    // TODO: Implement when we have access to newItem and existingItems
    // varietyModifier = calculateVarietyScoreModifier(newItem, existingItems, gapType);
    // finalScore = initialScore + varietyModifier.modifier;
  }
  
  // Generate objective final reason
  const objectiveReason = generateObjectiveFinalReason(relevantCoverage, gapType, suitableScenarios, hasConstraintGoals, formData, userGoals);
  
  // Add variety messaging if applicable
  let finalReason = objectiveReason;
  if (varietyModifier) {
    finalReason += formatVarietyMessage(varietyModifier);
  }
  
  return {
    score: finalScore,
    reason: finalReason,
    relevantCoverage: relevantCoverage,
    gapType: gapType,
    varietyAnalysis: varietyModifier
  };
}

module.exports = analyzeScenarioCoverageForScore;
module.exports.formatVarietyMessage = formatVarietyMessage;
