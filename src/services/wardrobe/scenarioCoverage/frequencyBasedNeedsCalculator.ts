import { WardrobeItem, Scenario, Season } from '../../../types';

export type FrequencyBasedNeed = {
  scenarioId: string;
  scenarioName: string;
  frequency: string;
  season: Season;
  
  // Calculated needs
  outfitsNeededPerSeason: number;
  
  // Category breakdown of needs (flexible ranges)
  categoryNeeds: {
    top: { min: number; max: number; ideal: number };
    bottom: { min: number; max: number; ideal: number };
    one_piece: { min: number; max: number; ideal: number };
    outerwear: { min: number; max: number; ideal: number };
    footwear: { min: number; max: number; ideal: number };
    accessory: { min: number; max: number; ideal: number };
  };
  
  // Flexible outfit strategies
  outfitStrategies: {
    separatesFocused: { tops: number; bottoms: number; description: string };
    dressFocused: { one_piece: number; tops?: number; description: string };
    balanced: { tops: number; bottoms: number; one_piece: number; description: string };
  };
  
  // Current vs needed
  currentItems: {
    top: number;
    bottom: number;
    one_piece: number;
    outerwear: number;
    footwear: number;
    accessory: number;
  };
  
  // Gap analysis
  gaps: {
    top: number;
    bottom: number;
    one_piece: number;
    outerwear: number;
    footwear: number;
    accessory: number;
  };
  
  // Category-specific coverage levels
  categoryCoverage: {
    top: { current: number; needed: number; coverage: number };
    bottom: { current: number; needed: number; coverage: number };
    one_piece: { current: number; needed: number; coverage: number };
    outerwear: { current: number; needed: number; coverage: number };
    footwear: { current: number; needed: number; coverage: number };
    accessory: { current: number; needed: number; coverage: number };
  };
  
  // Overall coverage
  overallCoverage: number; // percentage
  possibleOutfits: number;
  lastUpdated: string;
};

/**
 * Get the duration in months for a specific season
 */
const getSeasonDurationInMonths = (season: Season): number => {
  switch (season) {
    case Season.SUMMER:
    case Season.WINTER:
      return 3; // Individual seasons are ~3 months
    case Season.TRANSITIONAL:
      return 6; // Spring/fall combined is ~6 months (Mar-May + Sep-Nov)
    default:
      return 3; // Default fallback
  }
};

/**
 * Parse frequency text and calculate uses per season (season-aware)
 */
const parseFrequencyToSeasonalUse = (frequency: string, season: Season): number => {
  if (!frequency) return 0;
  
  const freq = frequency.toLowerCase();
  const seasonMonths = getSeasonDurationInMonths(season);
  const seasonDays = seasonMonths * 30; // Approximate days per season
  
  // Parse patterns like "5 times per week", "twice per month", "daily", etc.
  if (freq.includes('daily') || freq.includes('every day')) {
    return seasonDays; // Adjusted for season duration
  }
  
  if (freq.includes('per week') || freq.includes('weekly')) {
    const match = freq.match(/(\d+)\s*times?\s*per\s*week/);
    if (match) {
      const timesPerWeek = parseInt(match[1]);
      const weeksPerSeason = Math.round(seasonMonths * 4.33); // ~4.33 weeks per month
      return timesPerWeek * weeksPerSeason;
    }
    
    // Handle "weekly", "twice per week", etc.
    const weeksPerSeason = Math.round(seasonMonths * 4.33);
    if (freq.includes('twice')) return 2 * weeksPerSeason;
    if (freq.includes('weekly')) return weeksPerSeason;
  }
  
  if (freq.includes('per month') || freq.includes('monthly')) {
    const match = freq.match(/(\d+)\s*times?\s*per\s*month/);
    if (match) {
      const timesPerMonth = parseInt(match[1]);
      return timesPerMonth * seasonMonths; // Adjusted for season duration
    }
    
    // Handle "monthly", "twice per month", etc.
    if (freq.includes('twice')) return 2 * seasonMonths;
    if (freq.includes('monthly')) return seasonMonths;
  }
  
  if (freq.includes('rarely') || freq.includes('seldom')) {
    return 2; // Just a few times per season
  }
  
  if (freq.includes('often') || freq.includes('frequently')) {
    return 30; // Assume ~2-3 times per week
  }
  
  // Try to extract any number as a fallback
  const numberMatch = freq.match(/(\d+)/);
  if (numberMatch) {
    return Math.min(parseInt(numberMatch[1]) * 4, 90); // Cap at daily usage
  }
  
  // Default fallback
  return 5;
};

/**
 * Calculate outfit needs based on usage frequency
 * Rule: You need variety, so you shouldn't wear the same outfit more than once per week
 */
const calculateOutfitNeeds = (usesPerSeason: number): number => {
  // If you use this scenario more than 7 times per season, you need multiple outfits
  // to avoid wearing the same thing too often
  const weeksPerSeason = 13;
  const usesPerWeek = usesPerSeason / weeksPerSeason;
  
  if (usesPerWeek <= 1) {
    return Math.max(1, Math.ceil(usesPerSeason / 4)); // Can repeat outfit every 4 uses
  } else {
    return Math.ceil(usesPerWeek * 2); // Need 2x variety for frequent use
  }
};

/**
 * Calculate flexible category needs with ranges and strategies
 */
const calculateFlexibleCategoryNeeds = (outfitsNeeded: number) => {
  const categoryNeeds = {
    top: {
      min: Math.ceil(outfitsNeeded * 0.5),
      ideal: Math.ceil(outfitsNeeded * 0.8), 
      max: Math.ceil(outfitsNeeded * 1.2)
    },
    bottom: {
      min: Math.ceil(outfitsNeeded * 0.3),
      ideal: Math.ceil(outfitsNeeded * 0.6),
      max: Math.ceil(outfitsNeeded * 0.9)
    },
    one_piece: {
      min: 0,
      ideal: Math.ceil(outfitsNeeded * 0.3),
      max: Math.ceil(outfitsNeeded * 0.7)
    },
    outerwear: {
      min: Math.ceil(outfitsNeeded * 0.1),
      ideal: Math.ceil(outfitsNeeded * 0.2),
      max: Math.ceil(outfitsNeeded * 0.4)
    },
    footwear: {
      min: Math.max(1, Math.ceil(outfitsNeeded * 0.2)),
      ideal: Math.ceil(outfitsNeeded * 0.4),
      max: Math.ceil(outfitsNeeded * 0.6)
    },
    accessory: {
      min: 0,
      ideal: Math.ceil(outfitsNeeded * 0.3),
      max: Math.ceil(outfitsNeeded * 0.5)
    }
  };

  const outfitStrategies = {
    separatesFocused: {
      tops: Math.ceil(outfitsNeeded * 0.9),
      bottoms: Math.ceil(outfitsNeeded * 0.7),
      description: `Focus on ${Math.ceil(outfitsNeeded * 0.9)} versatile tops + ${Math.ceil(outfitsNeeded * 0.7)} bottoms for mix-and-match flexibility`
    },
    dressFocused: {
      one_piece: Math.ceil(outfitsNeeded * 0.6),
      tops: Math.ceil(outfitsNeeded * 0.3),
      description: `Build around ${Math.ceil(outfitsNeeded * 0.6)} dresses/one-pieces with ${Math.ceil(outfitsNeeded * 0.3)} tops for layering`
    },
    balanced: {
      tops: Math.ceil(outfitsNeeded * 0.6),
      bottoms: Math.ceil(outfitsNeeded * 0.4),
      one_piece: Math.ceil(outfitsNeeded * 0.3),
      description: `Balanced approach: ${Math.ceil(outfitsNeeded * 0.6)} tops, ${Math.ceil(outfitsNeeded * 0.4)} bottoms, ${Math.ceil(outfitsNeeded * 0.3)} dresses`
    }
  };

  return { categoryNeeds, outfitStrategies };
};

/**
 * Calculate frequency-based needs for all scenarios
 */
export const calculateFrequencyBasedNeeds = async (
  userId: string,
  items: WardrobeItem[],
  scenarios: Scenario[],
  season: Season
): Promise<FrequencyBasedNeed[]> => {
  console.log('🟦 FREQUENCY NEEDS - Calculating frequency-based needs for', scenarios.length, 'scenarios');
  
  const results: FrequencyBasedNeed[] = [];
  
  for (const scenario of scenarios) {
    console.log(`🟦 FREQUENCY NEEDS - Processing: ${scenario.name} (${scenario.frequency})`);
    
    // Parse frequency to get seasonal usage (now season-aware)
    const usesPerSeason = parseFrequencyToSeasonalUse(scenario.frequency || '', season);
    const outfitsNeeded = calculateOutfitNeeds(usesPerSeason);
    const { categoryNeeds, outfitStrategies } = calculateFlexibleCategoryNeeds(outfitsNeeded);
    
    // Get current items for this scenario and season
    const scenarioItems = items.filter(item => {
      const matchesScenario = item.scenarios?.includes(scenario.id) || false;
      const matchesSeason = !item.season || 
                           item.season.length === 0 || 
                           item.season.includes(season);
      return matchesScenario && matchesSeason;
    });
    
    // Count current items by category
    const currentItems = {
      top: scenarioItems.filter(item => item.category === 'top').length,
      bottom: scenarioItems.filter(item => item.category === 'bottom').length,
      one_piece: scenarioItems.filter(item => item.category === 'one_piece').length,
      outerwear: scenarioItems.filter(item => item.category === 'outerwear').length,
      footwear: scenarioItems.filter(item => item.category === 'footwear').length,
      accessory: scenarioItems.filter(item => item.category === 'accessory').length,
    };
    
    // Calculate gaps (using ideal targets)
    const gaps = {
      top: Math.max(0, categoryNeeds.top.ideal - currentItems.top),
      bottom: Math.max(0, categoryNeeds.bottom.ideal - currentItems.bottom),
      one_piece: Math.max(0, categoryNeeds.one_piece.ideal - currentItems.one_piece),
      outerwear: Math.max(0, categoryNeeds.outerwear.ideal - currentItems.outerwear),
      footwear: Math.max(0, categoryNeeds.footwear.ideal - currentItems.footwear),
      accessory: Math.max(0, categoryNeeds.accessory.ideal - currentItems.accessory),
    };
    
    // Calculate possible outfits (simplified: top+bottom OR one_piece)
    const topBottomOutfits = Math.min(currentItems.top, currentItems.bottom);
    const onePieceOutfits = currentItems.one_piece;
    const possibleOutfits = topBottomOutfits + onePieceOutfits;
    
    // Calculate coverage (cap at 100% for database compatibility)
    const overallCoverage = outfitsNeeded > 0 
      ? Math.min(100, Math.round((possibleOutfits / outfitsNeeded) * 100))
      : 100;

    // Calculate category-specific coverage
    const categoryCoverage = {
      top: {
        current: currentItems.top,
        needed: categoryNeeds.top.ideal,
        coverage: categoryNeeds.top.ideal > 0 
          ? Math.min(100, Math.round((currentItems.top / categoryNeeds.top.ideal) * 100))
          : 100
      },
      bottom: {
        current: currentItems.bottom,
        needed: categoryNeeds.bottom.ideal,
        coverage: categoryNeeds.bottom.ideal > 0 
          ? Math.min(100, Math.round((currentItems.bottom / categoryNeeds.bottom.ideal) * 100))
          : 100
      },
      one_piece: {
        current: currentItems.one_piece,
        needed: categoryNeeds.one_piece.ideal,
        coverage: categoryNeeds.one_piece.ideal > 0 
          ? Math.min(100, Math.round((currentItems.one_piece / categoryNeeds.one_piece.ideal) * 100))
          : 100
      },
      outerwear: {
        current: currentItems.outerwear,
        needed: categoryNeeds.outerwear.ideal,
        coverage: categoryNeeds.outerwear.ideal > 0 
          ? Math.min(100, Math.round((currentItems.outerwear / categoryNeeds.outerwear.ideal) * 100))
          : 100
      },
      footwear: {
        current: currentItems.footwear,
        needed: categoryNeeds.footwear.ideal,
        coverage: categoryNeeds.footwear.ideal > 0 
          ? Math.min(100, Math.round((currentItems.footwear / categoryNeeds.footwear.ideal) * 100))
          : 100
      },
      accessory: {
        current: currentItems.accessory,
        needed: categoryNeeds.accessory.ideal,
        coverage: categoryNeeds.accessory.ideal > 0 
          ? Math.min(100, Math.round((currentItems.accessory / categoryNeeds.accessory.ideal) * 100))
          : 100
      }
    };
    
    const result: FrequencyBasedNeed = {
      scenarioId: scenario.id,
      scenarioName: scenario.name,
      frequency: scenario.frequency || '',
      season,
      outfitsNeededPerSeason: outfitsNeeded,
      categoryNeeds,
      outfitStrategies,
      currentItems,
      gaps,
      categoryCoverage,
      overallCoverage,
      possibleOutfits,
      lastUpdated: new Date().toISOString()
    };
    
    results.push(result);
    
    console.log(`🟢 FREQUENCY NEEDS - ${scenario.name}: ${possibleOutfits}/${outfitsNeeded} outfits (${overallCoverage}%)`);
  }
  
  console.log('🟢 FREQUENCY NEEDS - Frequency-based needs calculation complete');
  return results;
};

/**
 * Get shopping recommendations based on frequency needs
 */
export const getFrequencyBasedRecommendations = (needs: FrequencyBasedNeed[]): string[] => {
  const recommendations: string[] = [];
  
  // Find scenarios with the biggest gaps
  const scenariosWithGaps = needs
    .filter(need => need.overallCoverage < 80)
    .sort((a, b) => b.outfitsNeededPerSeason - a.outfitsNeededPerSeason);
  
  scenariosWithGaps.slice(0, 3).forEach(need => {
    const biggestGaps = Object.entries(need.gaps)
      .filter(([_, count]) => count > 0)
      .sort(([_, a], [__, b]) => b - a)
      .slice(0, 2);
    
    biggestGaps.forEach(([category, count]) => {
      recommendations.push(
        `Add ${count} more ${category} for "${need.scenarioName}" (used ${need.frequency})`
      );
    });
  });
  
  return recommendations.slice(0, 5);
};
