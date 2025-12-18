/**
 * Utility functions for generating AI prompt sections
 */

/**
 * Generate outerwear-specific prompt section
 */
function generateOuterwearPromptSection(seasonalGaps, userGoals = []) {
  let promptSection = `\n\n=== OUTERWEAR SEASONAL ANALYSIS ===`;
  promptSection += `\nAnalyzing ${seasonalGaps.length} seasonal outerwear need(s):\n`;
  
  seasonalGaps.forEach(gap => {
    promptSection += `\n• ${gap.season} season: ${gap.gapType} (${gap.currentItems}/${gap.targetIdeal} items, ${gap.coveragePercent}% coverage)`;
  });

  promptSection += generateOuterwearInstructions(seasonalGaps, userGoals);
  return promptSection;
}

/**
 * Generate regular item prompt section
 */
function generateRegularPromptSection(seasonalGaps, userGoals = []) {
  let promptSection = `\n\n=== SEASONAL GAP ANALYSIS ===`;
  promptSection += `\nThis item could potentially fill the following seasonal gaps:\n`;
  
  seasonalGaps.forEach(gap => {
    const severity = calculateSeverity(null, gap.currentCoverage);
    
    promptSection += `\n• ${gap.scenario} (${gap.frequency}) in ${gap.season}:`;
    promptSection += `\n  - Current coverage: ${gap.currentCoverage}% (${gap.currentItems} items)`;
    promptSection += `\n  - Gap severity: ${severity}`;
  });
  
  promptSection += generateRegularInstructions(seasonalGaps, userGoals);
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
function generateOuterwearInstructions(seasonalGaps, userGoals = []) {
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
        instructions += `\n- RECOMMENDATION: Skip this item.`;
        break;
      default:
        instructions += `\n- GAP TYPE: ${gap.gapType} - Current items: ${gap.currentItems}`;
    }
  });
  
  instructions += generateMandatoryScoring(userGoals);
  
  return instructions;
}

/**
 * Generate regular item instructions
 */
function generateRegularInstructions(seasonalGaps, userGoals = []) {
  let instructions = `\n\n**TARGETED RECOMMENDATION INSTRUCTION:**`;
  instructions += `\nIn your FINAL RECOMMENDATION, specifically mention ONLY the seasonal gaps listed above.`;
  instructions += `\nDO NOT mention seasons that are not listed as gaps above.`;
  instructions += `\nThe gaps to mention are: ${seasonalGaps.map(g => `${g.scenario} in ${g.season}`).join(', ')}.`;
  instructions += `\nDO NOT add any other seasons beyond what is listed here.`;
  instructions += `\nExample: "This item would be particularly valuable for your ${seasonalGaps.map(g => `${g.scenario} in ${g.season}`).join(', ')} wardrobe gap${seasonalGaps.length > 1 ? 's' : ''}."`;
  instructions += `\nBe specific about ONLY the identified gaps and their coverage levels.`;
  
  instructions += generateMandatoryScoring(userGoals);
  
  return instructions;
}

/**
 * Generate universal mandatory scoring instructions with user goal adjustments
 */
function generateMandatoryScoring(userGoals = []) {
  // Check if user has conservative/minimalist goals
  const conservativeGoalIds = [
    'optimize-my-wardrobe',     
    'buy-less-shop-more-intentionally',
    'declutter-downsize', 
    'save-money'
  ];
  
  const hasConservativeGoals = userGoals.some(goal => 
    conservativeGoalIds.includes(goal.toLowerCase()) ||
    goal.toLowerCase().includes('optimize') ||
    goal.toLowerCase().includes('minimalist') ||
    goal.toLowerCase().includes('buy less') ||
    goal.toLowerCase().includes('declutter')
  );
  
  // Debug logging
  console.log(`🎯 User Goals Check:`, userGoals);
  console.log(`🎯 Conservative Goals Detected:`, hasConservativeGoals);
  
  let instructions = `\n\n**🚨 CRITICAL SCORING INSTRUCTION:**`;
  instructions += `\nYour final score MUST be based ONLY on the gap analysis above. DO NOT adjust for other factors.`;
  
  if (hasConservativeGoals) {
    instructions += `\n\n**⚠️ USER HAS CONSERVATIVE GOALS:** User wants to buy less, build capsule wardrobe, declutter, or save money.`;
    instructions += `\nBe MORE STRICT with scoring - recommend skipping items earlier than usual.`;
    
    instructions += `\n\n**CONSERVATIVE SCORING (Gap Type System):**`;
    instructions += `\n- If gap type is 'oversaturated': Score MUST be 2 (definitely skip)`;
    instructions += `\n- If gap type is 'satisfied': Score MUST be 4 (skip - you have enough)`;
    instructions += `\n- If gap type is 'expansion': Score MUST be 6 (probably skip unless very special)`;
    instructions += `\n- If gap type is 'improvement': Score MUST be 9`;
    instructions += `\n- If gap type is 'critical': Score MUST be 10`;
    
    instructions += `\n\n**CONSERVATIVE SCORING (Coverage % System):**`;
    instructions += `\n- Coverage 0-20%: Score MUST be 10`;
    instructions += `\n- Coverage 21-50%: Score MUST be 9`;
    instructions += `\n- Coverage 51-80%: Score MUST be 6 (probably skip)`;
    instructions += `\n- Coverage 81-100%: Score MUST be 4 (skip - you have enough)`;
    instructions += `\n- Coverage >100%: Score MUST be 2 (definitely skip)`;
    
  } else {
    instructions += `\n\n**STANDARD SCORING (Gap Type System):**`;
    instructions += `\n- If gap type is 'oversaturated': Score MUST be 3`;
    instructions += `\n- If gap type is 'satisfied': Score MUST be 6`;
    instructions += `\n- If gap type is 'expansion': Score MUST be 8`;
    instructions += `\n- If gap type is 'improvement': Score MUST be 9`;
    instructions += `\n- If gap type is 'critical': Score MUST be 10`;
    
    instructions += `\n\n**STANDARD SCORING (Coverage % System):**`;
    instructions += `\n- Coverage 0-20%: Score MUST be 10 (critical gap)`;
    instructions += `\n- Coverage 21-50%: Score MUST be 9 (improvement needed)`;
    instructions += `\n- Coverage 51-80%: Score MUST be 8 (expansion opportunity)`;
    instructions += `\n- Coverage 81-100%: Score MUST be 6 (satisfied)`;
    instructions += `\n- Coverage >100%: Score MUST be 3 (oversaturated)`;
  }
  
  instructions += `\n\nDO NOT consider quality, style, or duplicates. Use ONLY the gap analysis data and user goals.`;
  
  return instructions;
}

module.exports = {
  generateOuterwearPromptSection,
  generateRegularPromptSection,
  generateMandatoryScoring,
  calculateSeverity
};
