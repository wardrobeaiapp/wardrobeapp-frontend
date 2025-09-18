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
    promptSection += `\n  - Current: ${gap.currentItems} items (Target: ${gap.targetIdeal})`;
    promptSection += `\n  - Coverage: ${gap.coveragePercent.toFixed(1)}%`;
    promptSection += `\n  - Gap severity: ${severity}`;
    
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
  instructions += `\nFocus on SEASONAL NEEDS rather than specific scenarios.`;
  instructions += `\nThe seasonal gaps to mention are: ${seasonalGaps.map(g => `${g.season} season`).join(', ')}.`;
  instructions += `\nHighlight the versatility of outerwear across different activities and occasions.`;
  instructions += `\nExample: "This outerwear piece would be valuable for your ${seasonalGaps.map(g => g.season).join(' and ')} wardrobe, providing versatile coverage across multiple scenarios."`;
  
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
