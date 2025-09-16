// Simple outfit analysis helper for AI prompts
// Replaces complex backend scenario coverage system

/**
 * Calculate outfit combinations and duplicates for AI analysis
 */
function analyzeWardrobeForPrompt(formData, wardrobeItems, scenarios) {
  const targetSeasons = formData.seasons || ['spring', 'summer', 'fall', 'winter'];
  
  // Filter items for target seasons
  const seasonItems = wardrobeItems.filter(item => {
    if (!item.season || item.season.length === 0) return true; // Include unseasoned items
    return targetSeasons.some(season => item.season.includes(season));
  });

  let analysis = {
    duplicateCheck: checkForDuplicates(formData, seasonItems),
    scenarioCoverage: [],
    gapAnalysis: ''
  };

  // Analyze each scenario
  if (scenarios && scenarios.length > 0) {
    analysis.scenarioCoverage = scenarios.map(scenario => 
      analyzeScenario(scenario, seasonItems, targetSeasons[0] || 'current season')
    );
    
    // Create gap analysis summary
    analysis.gapAnalysis = createGapSummary(analysis.scenarioCoverage, formData);
  }

  return analysis;
}

/**
 * Check for exact duplicates in same subcategory and color
 */
function checkForDuplicates(formData, items) {
  const sameSubcategory = items.filter(item => 
    item.subcategory?.toLowerCase() === formData.subcategory?.toLowerCase()
  );
  
  const exactDuplicates = sameSubcategory.filter(item => 
    item.color?.toLowerCase() === formData.color?.toLowerCase()
  );

  return {
    found: exactDuplicates.length > 0,
    count: exactDuplicates.length,
    items: exactDuplicates.map(item => item.name),
    message: exactDuplicates.length > 0 ? 
      `${exactDuplicates.length} identical ${formData.color?.toLowerCase() || ''} ${formData.subcategory?.toLowerCase() || 'items'} found` : 
      'No exact duplicates found'
  };
}

/**
 * Analyze outfit possibilities for a specific scenario
 */
function analyzeScenario(scenario, seasonItems, season) {
  // Get items suitable for this scenario
  const suitableItems = seasonItems.filter(item => 
    isItemSuitableForScenario(item, scenario)
  );

  // Group by category
  const tops = suitableItems.filter(item => item.category === 'TOP');
  const bottoms = suitableItems.filter(item => item.category === 'BOTTOM');  
  const dresses = suitableItems.filter(item => 
    item.category === 'ONE_PIECE' && item.subcategory === 'dress'
  );
  const footwear = suitableItems.filter(item => item.category === 'FOOTWEAR');

  // Calculate complete outfits
  let completeOutfits = 0;
  let bottleneck = null;

  if (footwear.length === 0) {
    bottleneck = 'footwear';
  } else {
    // Top + Bottom combinations
    if (tops.length > 0 && bottoms.length > 0) {
      completeOutfits += tops.length * bottoms.length;
    }
    // Add dresses
    completeOutfits += dresses.length;
    
    // Identify bottleneck
    if (completeOutfits === 0) {
      if (tops.length === 0 && dresses.length === 0) {
        bottleneck = 'tops or dresses';
      } else if (bottoms.length === 0 && dresses.length === 0) {
        bottleneck = 'bottoms or dresses';
      }
    }
  }

  // Coverage level (0-5)
  let coverageLevel = 0;
  if (completeOutfits >= 1) coverageLevel = 1;
  if (completeOutfits >= 3) coverageLevel = 2;
  if (completeOutfits >= 6) coverageLevel = 3;
  if (completeOutfits >= 10) coverageLevel = 4;
  if (completeOutfits >= 15) coverageLevel = 5;

  return {
    name: scenario.name,
    frequency: scenario.frequency,
    season,
    completeOutfits,
    coverageLevel,
    bottleneck,
    itemCounts: {
      tops: tops.length,
      bottoms: bottoms.length,
      dresses: dresses.length,
      footwear: footwear.length
    },
    status: completeOutfits === 0 ? 'CRITICAL GAP' : 
            coverageLevel <= 2 ? 'SIGNIFICANT GAP' :
            coverageLevel <= 3 ? 'BASIC COVERAGE' : 'GOOD COVERAGE'
  };
}

/**
 * Create gap analysis summary for AI
 */
function createGapSummary(scenarioCoverage, formData) {
  const criticalGaps = scenarioCoverage.filter(s => s.completeOutfits === 0);
  const significantGaps = scenarioCoverage.filter(s => s.coverageLevel <= 2 && s.completeOutfits > 0);
  
  if (criticalGaps.length > 0) {
    const gap = criticalGaps[0];
    return `CRITICAL: ${gap.name} has 0 complete outfits (missing: ${gap.bottleneck})`;
  }
  
  if (significantGaps.length > 0) {
    const gap = significantGaps[0];
    return `SIGNIFICANT: ${gap.name} has only ${gap.completeOutfits} outfits`;
  }
  
  return 'No major gaps detected';
}

/**
 * Determine if item is suitable for scenario
 */
function isItemSuitableForScenario(item, scenario) {
  const scenarioName = scenario.name.toLowerCase();
  const itemSubcategory = item.subcategory?.toLowerCase() || '';
  const itemStyle = item.style?.toLowerCase() || '';
  
  // Check if item is explicitly tagged for this scenario
  if (item.occasion && item.occasion.some(occ => 
    occ.toLowerCase().includes(scenarioName) || 
    scenarioName.includes(occ.toLowerCase())
  )) {
    return true;
  }
  
  // Office Work / Professional scenarios
  if (scenarioName.includes('office') || scenarioName.includes('work') || scenarioName.includes('professional')) {
    return ['blazer', 'shirt', 'blouse', 'dress shirt', 'trousers', 'dress pants', 'dress', 'heels', 'dress shoes'].includes(itemSubcategory) ||
           itemStyle.includes('formal') || itemStyle.includes('business');
  }
  
  // Casual / Weekend scenarios
  if (scenarioName.includes('casual') || scenarioName.includes('weekend')) {
    return ['t-shirt', 'jeans', 'shorts', 'sneakers', 'casual dress', 'sandals'].includes(itemSubcategory) ||
           itemStyle.includes('casual');
  }
  
  // Dinner / Evening scenarios
  if (scenarioName.includes('dinner') || scenarioName.includes('evening') || scenarioName.includes('date')) {
    return ['dress', 'blouse', 'nice shirt', 'heels', 'dress shoes'].includes(itemSubcategory) ||
           itemStyle.includes('elegant') || itemStyle.includes('dressy');
  }
  
  // Exercise / Gym scenarios
  if (scenarioName.includes('exercise') || scenarioName.includes('gym') || scenarioName.includes('workout')) {
    return ['activewear', 'sportswear', 'sneakers', 'athletic'].some(term => 
           itemSubcategory.includes(term) || itemStyle.includes(term));
  }
  
  // Default: consider versatile pieces suitable for most scenarios
  return ['jeans', 'shirt', 'sweater', 'cardigan', 'dress'].includes(itemSubcategory);
}

/**
 * Generate structured prompt section for AI
 */
function generateStructuredPrompt(analysis) {
  let prompt = '\n=== WARDROBE ANALYSIS ===\n';
  
  // Duplicate check
  prompt += `\nDUPLICATE CHECK: ${analysis.duplicateCheck.message}`;
  if (analysis.duplicateCheck.found) {
    prompt += `\n- Found: ${analysis.duplicateCheck.items.join(', ')}`;
  }
  
  // Scenario coverage
  if (analysis.scenarioCoverage.length > 0) {
    prompt += '\n\nSCENARIO COVERAGE:';
    analysis.scenarioCoverage.forEach(scenario => {
      prompt += `\n${scenario.name} [${scenario.frequency}]: ${scenario.completeOutfits} complete outfits (${scenario.status})`;
      prompt += `\n- Available: ${scenario.itemCounts.tops} tops, ${scenario.itemCounts.bottoms} bottoms, ${scenario.itemCounts.dresses} dresses, ${scenario.itemCounts.footwear} footwear`;
      if (scenario.bottleneck) {
        prompt += `\n- Bottleneck: ${scenario.bottleneck}`;
      }
    });
  }
  
  // Gap analysis
  prompt += `\n\nGAP ANALYSIS: ${analysis.gapAnalysis}`;
  
  return prompt;
}

module.exports = {
  analyzeWardrobeForPrompt,
  generateStructuredPrompt,
  checkForDuplicates,
  analyzeScenario
};
