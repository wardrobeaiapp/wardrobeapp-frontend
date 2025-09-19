/**
 * Accessory-specific analysis helpers for subcategory gap analysis and prompt generation
 * Extracted from scenarioCoverageService.js for better modularity
 */

/**
 * Analyze accessory gaps (subcategory-based)
 * Groups accessories by subcategory and analyzes coverage for each
 */
function analyzeAccessoryGaps(scenarioCoverage, formData, itemSeasons) {
  const accessoryGaps = [];
  
  console.log('💎 Analyzing ACCESSORY subcategory coverage');
  
  // Group coverage by subcategory
  const subcategoryCoverage = {};
  scenarioCoverage.forEach(coverage => {
    const subcat = coverage.subcategory || 'General';
    if (!subcategoryCoverage[subcat]) subcategoryCoverage[subcat] = [];
    subcategoryCoverage[subcat].push(coverage);
  });

  // Analyze each subcategory
  Object.entries(subcategoryCoverage).forEach(([subcategory, coverageData]) => {
    const mainCoverage = coverageData[0]; // Take the first (or only) record
    
    const gapData = {
      season: mainCoverage.season,
      category: 'accessory',
      subcategory: subcategory,
      currentItems: mainCoverage.currentItems || 0,
      coveragePercent: mainCoverage.coveragePercent || 0,
      gapType: mainCoverage.gapType || 'improvement',
      isCritical: mainCoverage.isCritical || false,
      scenarios: ['All scenarios'] // Accessories are scenario-agnostic
    };
    
    accessoryGaps.push(gapData);
    console.log(`💎   ${subcategory}: ${gapData.currentItems} items (${gapData.coveragePercent}%, ${gapData.gapType})`);
  });

  logAccessoryGaps('Accessory', accessoryGaps);
  return accessoryGaps;
}

/**
 * Generate accessory-specific prompt section with subcategory information
 * Creates detailed breakdown of each subcategory's coverage status
 */
function generateAccessoryPromptSection(gaps) {
  let prompt = '\n=== ACCESSORY WARDROBE ANALYSIS ===\n';
  
  // Group by subcategory
  const subcategoryGaps = {};
  gaps.forEach(gap => {
    const subcat = gap.subcategory || 'General';
    if (!subcategoryGaps[subcat]) subcategoryGaps[subcat] = [];
    subcategoryGaps[subcat].push(gap);
  });

  Object.entries(subcategoryGaps).forEach(([subcategory, subcatGaps]) => {
    const mainGap = subcatGaps[0];
    const seasonInfo = mainGap.season === 'all_seasons' ? 'all seasons' : mainGap.season;
    
    prompt += `\n**${subcategory} (${seasonInfo})**:\n`;
    prompt += `- Current: ${mainGap.currentItems || 0} items\n`;
    prompt += `- Coverage: ${mainGap.coveragePercent || 0}%\n`;
    
    if (mainGap.gapType) {
      const gapMessages = getGapTypeMessages();
      prompt += `- Status: ${gapMessages[mainGap.gapType] || mainGap.gapType}\n`;
    }
  });

  prompt += '\nConsider how this accessory fits within your existing subcategory coverage when providing recommendations.\n';
  return prompt;
}

/**
 * Get standardized gap type messages for accessory analysis
 */
function getGapTypeMessages() {
  return {
    'critical': 'URGENT: No items in this subcategory',
    'improvement': 'Could benefit from 1-2 additional items',
    'expansion': 'Well-covered, room for variety',
    'satisfied': 'Perfect coverage',
    'oversaturated': 'Consider decluttering excess items'
  };
}

/**
 * Log accessory gap analysis results
 */
function logAccessoryGaps(type, accessoryGaps) {
  console.log(`📊 Final ${type} Subcategory Gaps: ${accessoryGaps.length}`);
  accessoryGaps.forEach(gap => {
    const subcategoryInfo = gap.subcategory ? `/${gap.subcategory}` : '';
    const seasonInfo = gap.season === 'all_seasons' ? 'all seasons' : gap.season;
    console.log(`   - ${gap.category}${subcategoryInfo} (${seasonInfo}): ${gap.currentItems} items (${gap.coveragePercent}%, ${gap.gapType})`);
  });
}

/**
 * Check if coverage data contains accessory subcategory information
 */
function hasAccessorySubcategoryData(scenarioCoverage) {
  return scenarioCoverage.some(coverage => 
    coverage.category === 'accessory' && coverage.subcategory
  );
}

/**
 * Filter and validate accessory coverage data
 */
function validateAccessoryCoverage(scenarioCoverage) {
  const accessoryCoverage = scenarioCoverage.filter(coverage => 
    coverage.category === 'accessory'
  );

  // Check if we have subcategory breakdown
  const hasSubcategories = accessoryCoverage.some(coverage => coverage.subcategory);
  
  if (!hasSubcategories) {
    console.log('⚠️  No subcategory data found in accessory coverage - using general accessory analysis');
  }

  return {
    coverage: accessoryCoverage,
    hasSubcategories,
    subcategoryCount: hasSubcategories ? 
      [...new Set(accessoryCoverage.map(c => c.subcategory))].length : 0
  };
}

module.exports = {
  analyzeAccessoryGaps,
  generateAccessoryPromptSection,
  getGapTypeMessages,
  logAccessoryGaps,
  hasAccessorySubcategoryData,
  validateAccessoryCoverage
};
