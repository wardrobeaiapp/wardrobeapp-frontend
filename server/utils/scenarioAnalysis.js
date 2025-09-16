// Helper functions for analyzing scenario coverage with existing wardrobe

function analyzeScenarioCoverage(scenarios, wardrobeItems, targetSeasons = null) {
  return scenarios.map(scenario => {
    console.log('Scenario:', scenario);
    console.log('Target seasons for analysis:', targetSeasons);
    
    // Get items that are suitable for this scenario
    let suitableItems = wardrobeItems.filter(item => {
      // Check if item is explicitly tagged for this scenario
      if (item.scenarios && item.scenarios.includes(scenario.name)) {
        return true;
      }
      
      // Auto-detect suitability based on scenario type and item characteristics
      return isItemSuitableForScenario(item, scenario);
    });
    
    // Filter by season if target seasons are specified
    if (targetSeasons && targetSeasons.length > 0) {
      suitableItems = suitableItems.filter(item => {
        // Include item if it has matching seasons or no season data
        return !item.season || item.season.length === 0 || 
               targetSeasons.some(targetSeason => 
                 item.season.includes(targetSeason)
               );
      });
      console.log(`Filtered to ${suitableItems.length} seasonal items for seasons: ${targetSeasons.join(', ')}`);
    }

    // Analyze coverage by category
    const categoryAnalysis = analyzeCategoryBalance(suitableItems);
    const coverageLevel = calculateCoverageScore(categoryAnalysis, scenario);
    const gaps = identifyGaps(categoryAnalysis, scenario);
    const strengths = identifyStrengths(categoryAnalysis);

    return {
      scenarioName: scenario.name,
      frequency: scenario.frequency,
      suitableItems: suitableItems.length,
      coverageLevel,
      coverageDescription: getCoverageDescription(coverageLevel),
      gaps,
      strengths,
      categoryBreakdown: categoryAnalysis
    };
  });
}

function isItemSuitableForScenario(item, scenario) {
  const scenarioName = scenario.name.toLowerCase();
  const itemCategory = item.category?.toLowerCase() || '';
  const itemSubcategory = item.subcategory?.toLowerCase() || '';
  const itemStyle = item.style?.toLowerCase() || '';
  
  // Office Work / Professional scenarios
  if (scenarioName.includes('office') || scenarioName.includes('work') || scenarioName.includes('professional')) {
    return ['blazer', 'shirt', 'blouse', 'dress shirt', 'trousers', 'dress pants', 'dress', 'formal shoes', 'heels'].includes(itemSubcategory) ||
           itemStyle.includes('formal') || itemStyle.includes('business');
  }
  
  // Casual / Weekend scenarios
  if (scenarioName.includes('casual') || scenarioName.includes('weekend')) {
    return ['t-shirt', 'jeans', 'shorts', 'sneakers', 'casual dress'].includes(itemSubcategory) ||
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

function analyzeCategoryBalance(items) {
  const analysis = {
    tops: items.filter(item => item.category === 'TOP').length,
    bottoms: items.filter(item => item.category === 'BOTTOM').length,
    dresses: items.filter(item => item.category === 'ONE_PIECE' && item.subcategory === 'dress').length,
    outerwear: items.filter(item => item.category === 'OUTERWEAR').length,
    footwear: items.filter(item => item.category === 'FOOTWEAR').length,
    accessories: items.filter(item => item.category === 'ACCESSORY').length
  };
  analysis.total = items.length;
  return analysis;
}

function calculateCoverageScore(categoryAnalysis, scenario) {
  let score = 0;
  const scenarioName = scenario.name.toLowerCase();
  
  // Base score from having any suitable items
  if (categoryAnalysis.total === 0) return 0;
  if (categoryAnalysis.total >= 1) score += 1;
  if (categoryAnalysis.total >= 3) score += 1;
  
  // Bonus for category balance
  const hasTopOrDress = categoryAnalysis.tops > 0 || categoryAnalysis.dresses > 0;
  const hasBottoms = categoryAnalysis.bottoms > 0;
  const hasFootwear = categoryAnalysis.footwear > 0;
  
  if (hasTopOrDress) score += 1;
  if (hasBottoms || categoryAnalysis.dresses > 0) score += 1; // Dresses can replace bottoms
  if (hasFootwear) score += 1;
  
  return Math.min(5, score);
}

function identifyGaps(categoryAnalysis, scenario) {
  const gaps = [];
  
  if (categoryAnalysis.tops === 0 && categoryAnalysis.dresses === 0) {
    gaps.push('suitable tops or dresses');
  }
  if (categoryAnalysis.bottoms === 0 && categoryAnalysis.dresses === 0) {
    gaps.push('suitable bottoms');
  }
  if (categoryAnalysis.footwear === 0) {
    gaps.push('appropriate footwear');
  }
  if (categoryAnalysis.outerwear === 0) {
    gaps.push('layering pieces');
  }
  
  return gaps;
}

function identifyStrengths(categoryAnalysis) {
  const strengths = [];
  
  if (categoryAnalysis.tops >= 2) strengths.push('variety of tops');
  if (categoryAnalysis.bottoms >= 2) strengths.push('bottom options');
  if (categoryAnalysis.dresses >= 1) strengths.push('dress options');
  if (categoryAnalysis.outerwear >= 1) strengths.push('layering pieces');
  if (categoryAnalysis.footwear >= 2) strengths.push('footwear variety');
  
  return strengths;
}

function getCoverageDescription(level) {
  const descriptions = {
    0: 'No suitable items - significant gap',
    1: 'Minimal coverage - major gaps',
    2: 'Basic coverage - several gaps',
    3: 'Good coverage - minor gaps',
    4: 'Strong coverage - well equipped',
    5: 'Excellent coverage - fully equipped'
  };
  return descriptions[level] || 'Unknown coverage level';
}

module.exports = {
  analyzeScenarioCoverage,
  isItemSuitableForScenario,
  analyzeCategoryBalance,
  calculateCoverageScore,
  identifyGaps,
  identifyStrengths,
  getCoverageDescription
};
