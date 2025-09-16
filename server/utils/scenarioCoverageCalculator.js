// Pre-calculated scenario coverage system with outfit combination logic

/**
 * Calculate complete outfit possibilities for a scenario/season combination
 * Handles interchangeable items (top+bottom vs dress vs jumpsuit)
 */
function calculateOutfitCombinations(wardrobeItems, scenario, season) {
  console.log(`Calculating outfit combinations for ${scenario.name} in ${season}`);
  
  // Filter items suitable for this scenario and season
  const suitableItems = wardrobeItems.filter(item => {
    // Check season match
    const seasonMatch = !item.season || item.season.length === 0 || 
                       item.season.includes(season);
    
    // Check scenario suitability  
    const scenarioMatch = isItemSuitableForScenario(item, scenario) ||
                         (item.scenarios && item.scenarios.includes(scenario.name));
    
    return seasonMatch && scenarioMatch;
  });

  // Group by category
  const tops = suitableItems.filter(item => item.category === 'TOP');
  const bottoms = suitableItems.filter(item => item.category === 'BOTTOM');
  const dresses = suitableItems.filter(item => 
    item.category === 'ONE_PIECE' && item.subcategory === 'dress');
  const jumpsuits = suitableItems.filter(item => 
    item.category === 'ONE_PIECE' && item.subcategory === 'jumpsuit');
  const footwear = suitableItems.filter(item => item.category === 'FOOTWEAR');
  const outerwear = suitableItems.filter(item => item.category === 'OUTERWEAR');

  // Calculate outfit combinations
  let totalOutfits = 0;
  let outfitBreakdown = {
    topBottomCombos: 0,
    dresses: 0,
    jumpsuits: 0
  };

  // Top + Bottom combinations (both need footwear)
  if (tops.length > 0 && bottoms.length > 0 && footwear.length > 0) {
    outfitBreakdown.topBottomCombos = tops.length * bottoms.length;
    totalOutfits += outfitBreakdown.topBottomCombos;
  }

  // Dresses (need footwear)
  if (dresses.length > 0 && footwear.length > 0) {
    outfitBreakdown.dresses = dresses.length;
    totalOutfits += outfitBreakdown.dresses;
  }

  // Jumpsuits (need footwear)
  if (jumpsuits.length > 0 && footwear.length > 0) {
    outfitBreakdown.jumpsuits = jumpsuits.length;
    totalOutfits += outfitBreakdown.jumpsuits;
  }

  // Identify bottleneck (limiting factor)
  let bottleneck = null;
  let missingForNextOutfit = null;

  if (footwear.length === 0) {
    bottleneck = 'footwear';
    missingForNextOutfit = 'Adding appropriate footwear would unlock outfit combinations';
  } else if (tops.length === 0 && dresses.length === 0 && jumpsuits.length === 0) {
    bottleneck = 'tops_or_dresses';
    missingForNextOutfit = 'Need tops/dresses to create complete outfits';
  } else if (bottoms.length === 0 && dresses.length === 0 && jumpsuits.length === 0) {
    bottleneck = 'bottoms_or_dresses';
    missingForNextOutfit = 'Need bottoms/dresses to create complete outfits';
  } else if (tops.length > 0 && bottoms.length > 0) {
    // Calculate what adding one more item would give
    const potentialTops = tops.length + 1;
    const potentialBottoms = bottoms.length + 1;
    
    if (potentialTops * bottoms.length > tops.length * potentialBottoms) {
      missingForNextOutfit = `Adding 1 more top would create ${tops.length * bottoms.length + bottoms.length} total outfits`;
    } else {
      missingForNextOutfit = `Adding 1 more bottom would create ${tops.length * bottoms.length + tops.length} total outfits`;
    }
  }

  // Calculate coverage level (0-5)
  let coverageLevel = 0;
  if (totalOutfits >= 1) coverageLevel = 1;
  if (totalOutfits >= 3) coverageLevel = 2;
  if (totalOutfits >= 6) coverageLevel = 3;
  if (totalOutfits >= 10) coverageLevel = 4;
  if (totalOutfits >= 15) coverageLevel = 5;

  return {
    totalOutfits,
    outfitBreakdown,
    coverageLevel,
    bottleneck,
    missingForNextOutfit,
    itemCounts: {
      tops: tops.length,
      bottoms: bottoms.length,
      dresses: dresses.length,
      jumpsuits: jumpsuits.length,
      footwear: footwear.length,
      outerwear: outerwear.length
    }
  };
}

/**
 * Calculate and store scenario coverage for all user scenarios
 */
async function recalculateScenarioCoverage(userId, affectedSeasons = null, affectedScenarios = null) {
  console.log(`Recalculating scenario coverage for user ${userId}`);
  
  try {
    // Get user's wardrobe items
    const wardrobeItems = await getUserWardrobeItems(userId);
    
    // Get user's scenarios
    const scenarios = await getUserScenarios(userId);
    
    // Get seasons to process (all seasons if not specified)
    const seasons = affectedSeasons || ['spring', 'summer', 'fall', 'winter'];
    
    // Filter scenarios if specified
    const scenariosToProcess = affectedScenarios ? 
      scenarios.filter(s => affectedScenarios.includes(s.name)) : scenarios;

    const coverageResults = [];

    // Calculate for each scenario/season combination
    for (const scenario of scenariosToProcess) {
      for (const season of seasons) {
        const coverage = calculateOutfitCombinations(wardrobeItems, scenario, season);
        
        coverageResults.push({
          userId,
          scenarioName: scenario.name,
          scenarioFrequency: scenario.frequency,
          season,
          totalOutfits: coverage.totalOutfits,
          coverageLevel: coverage.coverageLevel,
          outfitBreakdown: coverage.outfitBreakdown,
          bottleneck: coverage.bottleneck,
          missingForNextOutfit: coverage.missingForNextOutfit,
          itemCounts: coverage.itemCounts,
          lastUpdated: new Date().toISOString()
        });
      }
    }

    // Store results in database
    await storeScenarioCoverage(userId, coverageResults);
    
    console.log(`Stored ${coverageResults.length} scenario coverage records`);
    return coverageResults;
    
  } catch (error) {
    console.error('Error recalculating scenario coverage:', error);
    throw error;
  }
}

/**
 * Get stored scenario coverage for analysis
 */
async function getScenarioCoverageForAnalysis(userId, targetSeasons) {
  try {
    const coverage = await getStoredScenarioCoverage(userId, targetSeasons);
    
    return coverage.map(item => ({
      scenarioName: item.scenario_name,
      frequency: item.scenario_frequency,
      season: item.season,
      totalOutfits: item.total_outfits,
      coverageLevel: item.coverage_level,
      coverageDescription: getCoverageDescription(item.coverage_level),
      bottleneck: item.bottleneck,
      gaps: item.bottleneck ? [item.bottleneck] : [],
      strengths: item.coverage_level >= 4 ? ['good outfit variety'] : [],
      suitableItems: item.total_outfits // Use total outfits as "suitable items" count
    }));
  } catch (error) {
    console.error('Error getting scenario coverage for analysis:', error);
    return [];
  }
}

function getCoverageDescription(level) {
  const descriptions = {
    0: 'No complete outfits possible - major gap',
    1: 'Very limited options (1-2 outfits) - significant gap',
    2: 'Basic coverage (3-5 outfits) - room for improvement',
    3: 'Good variety (6-9 outfits) - adequate options',
    4: 'Strong coverage (10-14 outfits) - excellent variety',
    5: 'Outstanding coverage (15+ outfits) - exceptional options'
  };
  return descriptions[level] || 'Unknown coverage level';
}

// Helper function to determine item suitability (imported from scenarioAnalysis.js)
function isItemSuitableForScenario(item, scenario) {
  const scenarioName = scenario.name.toLowerCase();
  const itemSubcategory = item.subcategory?.toLowerCase() || '';
  const itemStyle = item.style?.toLowerCase() || '';
  
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

// Database helper functions (to be implemented)
async function getUserWardrobeItems(userId) {
  // TODO: Implement database query to get user's wardrobe items
  throw new Error('getUserWardrobeItems not implemented');
}

async function getUserScenarios(userId) {
  // TODO: Implement database query to get user's scenarios
  throw new Error('getUserScenarios not implemented');
}

async function storeScenarioCoverage(userId, coverageResults) {
  // TODO: Implement database storage for scenario coverage
  throw new Error('storeScenarioCoverage not implemented');
}

async function getStoredScenarioCoverage(userId, seasons) {
  // TODO: Implement database query for stored coverage
  throw new Error('getStoredScenarioCoverage not implemented');
}

module.exports = {
  calculateOutfitCombinations,
  recalculateScenarioCoverage,
  getScenarioCoverageForAnalysis,
  getCoverageDescription
};
