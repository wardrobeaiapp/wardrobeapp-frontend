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
 * Analyze scenario coverage data and generate comprehensive score + reason
 * @param {Array} scenarioCoverage - Coverage data from scenario analysis
 * @param {Array} suitableScenarios - Scenarios from Claude analysis  
 * @param {Object} formData - Form data with category, subcategory, etc.
 * @param {Array} userGoals - User goals that affect scoring
 * @param {Object} duplicateAnalysis - Optional duplicate detection results
 * @param {Object} outfitData - Optional outfit combination data for practical scoring
 * @param {number} outfitData.totalOutfits - Total number of outfit combinations possible
 * @param {Array} outfitData.coverageGapsWithNoOutfits - Coverage gaps that have 0 outfits
 * @returns {Object} Analysis results with score and reason data
 */
function analyzeScenarioCoverageForScore(scenarioCoverage, suitableScenarios, formData, userGoals, duplicateAnalysis, outfitData) {
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
  
  // OUTFIT-BASED SCORING ADJUSTMENTS
  if (outfitData) {
    const { totalOutfits, coverageGapsWithNoOutfits, isAccessoryOrOuterwear, totalCompatibleItems } = outfitData;
    let outfitPenalty = 0;
    
    console.log('\n🎯 OUTFIT-BASED SCORING ADJUSTMENTS:');
    
    // Special case: Accessories and outerwear don't need outfit generation
    if (totalOutfits === -1 || isAccessoryOrOuterwear) {
      console.log(`   💎/🧥 ACCESSORY/OUTERWEAR: Outfit analysis not applicable`);
      
      // Check if item is a bag - bags intentionally have no styling context
      const isBag = formData?.category?.toLowerCase() === 'accessory' && 
                   formData?.subcategory?.toLowerCase() === 'bag';
      
      // But still check compatibility - accessories/outerwear need SOME compatible items
      // EXCEPT bags - they intentionally have no styling context
      if (totalCompatibleItems === 0 && !isBag) {
        outfitPenalty += 2;
        console.log(`   ❌ No compatible items found: -2 points (total: ${totalCompatibleItems} compatible items)`);
        console.log(`   📝 Even accessories/outerwear need to work with existing wardrobe pieces`);
      } else if (isBag) {
        console.log(`   🎒 BAG: Skipping compatibility penalty - bags intentionally have no styling context`);
      } else {
        console.log(`   ✅ Compatible items found: ${totalCompatibleItems} items - no compatibility penalty`);
      }
    }
    // Penalty 1: No outfits at all (major practical issue) - only for core items
    else if (totalOutfits === 0) {
      outfitPenalty += 3;
      console.log(`   ❌ No outfits possible: -3 points (total: ${totalOutfits} outfits)`);
    } else {
      console.log(`   ✅ Outfits available: ${totalOutfits} combinations found`);
    }
    
    // Penalty 2: Coverage gaps with no outfits (only for core items with styling utility issues)
    // Skip this penalty for accessories and outerwear
    if (totalOutfits !== -1 && !isAccessoryOrOuterwear) {
      if (totalOutfits > 0 && coverageGapsWithNoOutfits && coverageGapsWithNoOutfits.length > 0) {
        // Only penalize if item has limited styling utility (few outfits relative to coverage expectations)
        const hasLimitedUtility = totalOutfits <= 2 && coverageGapsWithNoOutfits.length >= 2;
        
        if (hasLimitedUtility) {
          outfitPenalty += 2;
          console.log(`   ⚠️  Coverage gaps with no outfits: -2 points (${coverageGapsWithNoOutfits.length} gaps affected)`);
          console.log(`   📝  Item has limited styling utility (${totalOutfits} outfits) with multiple unstyleable gaps`);
          coverageGapsWithNoOutfits.forEach(gap => {
            console.log(`      • ${gap.description} (${gap.gapType}) - can't be styled`);
          });
        } else {
          console.log(`   ✅ Item has good styling utility (${totalOutfits} outfits) despite ${coverageGapsWithNoOutfits.length} unstyleable coverage gaps`);
          console.log(`   📝  No penalty applied - item serves its purpose well`);
          coverageGapsWithNoOutfits.forEach(gap => {
            console.log(`      • ${gap.description} (${gap.gapType}) - can't be styled (but item still useful)`);
          });
        }
      } else if (totalOutfits === 0 && coverageGapsWithNoOutfits && coverageGapsWithNoOutfits.length > 0) {
        console.log(`   ℹ️  Coverage gaps exist but already penalized by "no outfits" penalty`);
      }
    }
    
    if (outfitPenalty > 0) {
      finalScore = Math.max(1.0, finalScore - outfitPenalty); // Don't go below 1.0
      console.log(`   📊 Applied outfit penalty: -${outfitPenalty} points`);
      console.log(`   📊 Adjusted score: ${initialScore} → ${finalScore}`);
    } else {
      console.log('   ✅ No outfit-based penalties applied');
    }
  }
  
  // Generate objective final reason
  const objectiveReason = generateObjectiveFinalReason(relevantCoverage, gapType, suitableScenarios, hasConstraintGoals, formData, userGoals);
  
  // Add variety messaging if applicable
  let finalReason = objectiveReason;
  if (varietyModifier) {
    finalReason += formatVarietyMessage(varietyModifier);
  }
  
  // Add outfit-based messaging if applicable
  if (outfitData) {
    const { totalOutfits, coverageGapsWithNoOutfits, isAccessoryOrOuterwear, totalCompatibleItems } = outfitData;
    
    // Handle messaging for accessories and outerwear
    if (totalOutfits === -1 || isAccessoryOrOuterwear) {
      // Only add negative messaging if no compatible items found
      if (totalCompatibleItems === 0) {
        finalReason += " Unfortunately, this piece doesn't seem to work well with your current wardrobe items.";
      }
      // Otherwise no additional messaging needed for accessories/outerwear
    }
    else if (totalOutfits === 0) {
      // Context-aware transition based on coverage analysis tone
      if (gapType === 'critical' || gapType === 'improvement') {
        // Positive coverage message - smooth transition
        finalReason += " However, you'll also need to add some compatible pieces to create complete outfits with this item.";
      } else if (gapType === 'expansion') {
        // Neutral coverage message - acknowledge styling limitation
        finalReason += " Plus, you don't currently have the right pieces to style this item effectively.";
      } else {
        // Negative coverage message (satisfied/oversaturated) - reinforce the negative
        finalReason += " Additionally, you don't have the right pieces in your wardrobe to style this item.";
      }
    } else if (totalOutfits > 0 && coverageGapsWithNoOutfits && coverageGapsWithNoOutfits.length > 0) {
      // Only mention coverage gaps if penalty was actually applied (limited styling utility)
      const hasLimitedUtility = totalOutfits <= 2 && coverageGapsWithNoOutfits.length >= 2;
      
      if (hasLimitedUtility) {
        const gapCount = coverageGapsWithNoOutfits.length;
        if (gapCount === 1) {
          finalReason += " However, you're missing some key pieces to style this for all occasions.";
        } else {
          finalReason += " However, you're missing several key pieces to style this for all occasions.";
        }
      }
    }
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
