/**
 * Utility functions for generating AI prompt sections
 */

/**
 * Generate outerwear-specific prompt section
 */
function generateOuterwearPromptSection(seasonalGaps) {
  let promptSection = `\n\n=== OUTERWEAR SEASONAL ANALYSIS ===`;
  promptSection += `\nThis outerwear item could help fill the following seasonal needs:\n`;
  
  seasonalGaps.forEach(gap => {
    const severity = calculateSeverity(gap.currentItems, gap.coveragePercent);
    
    promptSection += `\n• ${gap.season} season outerwear:`;
    promptSection += `\n  - Current: ${gap.currentItems} items (Min: ${gap.targetMin}, Ideal: ${gap.targetIdeal}, Max: ${gap.targetMax})`;
    promptSection += `\n  - Coverage: ${gap.coveragePercent.toFixed(1)}%`;
    promptSection += `\n  - Gap Type: ${gap.gapType || 'unknown'}`;
    promptSection += `\n  - Base Score: ${gap.baseScore || 'N/A'} (critical=10, improvement=9, expansion=8, satisfied=6, oversaturated=3)`;
    promptSection += `\n  - Gap severity (legacy): ${severity}`;
    
    if (gap.scenarios && gap.scenarios.length > 0) {
      promptSection += `\n  - Used across scenarios: ${gap.scenarios.join(', ')}`;
    }
  });
  
  promptSection += generateOuterwearInstructions(seasonalGaps);
  return promptSection;
}

/**
 * Generate regular item prompt section
 */
function generateRegularPromptSection(seasonalGaps) {
  let promptSection = `\n\n=== SEASONAL GAP ANALYSIS ===`;
  promptSection += `\nThis item could potentially fill the following seasonal gaps:\n`;
  
  seasonalGaps.forEach(gap => {
    const severity = calculateSeverity(null, gap.currentCoverage);
    
    promptSection += `\n• ${gap.scenario} (${gap.frequency}) in ${gap.season}:`;
    promptSection += `\n  - Current coverage: ${gap.currentCoverage}% (${gap.currentItems} items)`;
    promptSection += `\n  - Gap severity: ${severity}`;
  });
  
  promptSection += generateRegularInstructions(seasonalGaps);
  return promptSection;
}

/**
 * Calculate severity for prompt display
 */
function calculateSeverity(currentItems, coveragePercent) {
  if (currentItems === 0) return 'CRITICAL';
  if (coveragePercent < 20) return 'CRITICAL';
  if (coveragePercent < 40 || (currentItems && currentItems < 1)) return 'HIGH';
  if (coveragePercent < 50) return 'HIGH';
  return 'MODERATE';
}

/**
 * Generate outerwear-specific instructions
 */
function generateOuterwearInstructions(seasonalGaps) {
  let instructions = `\n\n**OUTERWEAR RECOMMENDATION INSTRUCTION:**`;
  instructions += `\nThis is an OUTERWEAR item that can be worn across multiple scenarios.`;
  instructions += `\nFocus on SEASONAL NEEDS and GAP TYPE rather than specific scenarios.`;
  
  // Add gap type specific instructions
  seasonalGaps.forEach(gap => {
    instructions += `\n\n**${gap.season} Season Analysis:**`;
    switch (gap.gapType) {
      case 'critical':
        instructions += `\n- GAP TYPE: CRITICAL - User has ${gap.currentItems} items but needs minimum ${gap.targetMin}`;
        instructions += `\n- MANDATORY SCORE: 10 - Strongly recommend this item. Critical gap needs filling.`;
        break;
      case 'improvement':
        instructions += `\n- GAP TYPE: IMPROVEMENT - User has ${gap.currentItems} items (above min ${gap.targetMin}, below ideal ${gap.targetIdeal})`;
        instructions += `\n- MANDATORY SCORE: 9 - Good addition for variety and better coverage.`;
        break;
      case 'expansion':
        instructions += `\n- GAP TYPE: EXPANSION - User has ${gap.currentItems} items (above ideal ${gap.targetIdeal}, below max ${gap.targetMax})`;
        instructions += `\n- MANDATORY SCORE: 8 - Well-covered but room for strategic growth.`;
        break;
      case 'satisfied':
        instructions += `\n- GAP TYPE: SATISFIED - User has ${gap.currentItems} items (at maximum ${gap.targetMax})`;
        instructions += `\n- MANDATORY SCORE: 6 - Perfect amount. Focus budget elsewhere.`;
        break;
      case 'oversaturated':
        instructions += `\n- GAP TYPE: OVERSATURATED - User has ${gap.currentItems} items (above maximum ${gap.targetMax})`;
        instructions += `\n- MANDATORY SCORE: 3 - DO NOT buy more items. User needs to declutter, not add more.`;
        instructions += `\n- RECOMMENDATION: Skip this item. Suggest decluttering existing items instead.`;
        break;
      default:
        instructions += `\n- GAP TYPE: ${gap.gapType} - Current items: ${gap.currentItems}`;
    }
  });
  
  instructions += `\n\n**CRITICAL SCORING INSTRUCTION:**`;
  instructions += `\nYour final score MUST be exactly the Base Score shown above. DO NOT adjust for other factors.`;
  instructions += `\nIf gap type is 'oversaturated' (Base Score: 3), your final score MUST be 3.`;
  instructions += `\nIf gap type is 'satisfied' (Base Score: 6), your final score MUST be 6.`;
  instructions += `\nIf gap type is 'expansion' (Base Score: 8), your final score MUST be 8.`;
  instructions += `\nIf gap type is 'improvement' (Base Score: 9), your final score MUST be 9.`;
  instructions += `\nIf gap type is 'critical' (Base Score: 10), your final score MUST be 10.`;
  instructions += `\nDO NOT consider quality, style, or duplicates. Use ONLY the Base Score from gap analysis.`;
  
  return instructions;
}

/**
 * Generate regular item instructions
 */
function generateRegularInstructions(seasonalGaps) {
  let instructions = `\n\n**TARGETED RECOMMENDATION INSTRUCTION:**`;
  instructions += `\nIn your FINAL RECOMMENDATION, specifically mention ONLY the seasonal gaps listed above.`;
  instructions += `\nDO NOT mention seasons that are not listed as gaps above.`;
  instructions += `\nThe gaps to mention are: ${seasonalGaps.map(g => `${g.scenario} in ${g.season}`).join(', ')}.`;
  instructions += `\nDO NOT add any other seasons beyond what is listed here.`;
  instructions += `\nExample: "This item would be particularly valuable for your ${seasonalGaps.map(g => `${g.scenario} in ${g.season}`).join(', ')} wardrobe gap${seasonalGaps.length > 1 ? 's' : ''}."`;
  instructions += `\nBe specific about ONLY the identified gaps and their coverage levels.`;
  
  return instructions;
}

module.exports = {
  generateOuterwearPromptSection,
  generateRegularPromptSection,
  calculateSeverity
};
