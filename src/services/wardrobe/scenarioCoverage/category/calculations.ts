import { WardrobeItem, Season, ItemCategory } from '../../../../types';
import { CategoryNeeds, CategoryCoverage } from './types';

// Import helper functions inline to avoid circular dependency
function parseFrequencyToSeasonalUse(frequency: string): number {
  if (!frequency) return 5;
  
  const freq = frequency.toLowerCase();
  if (freq.includes('daily')) return 90;
  if (freq.includes('per week')) {
    const match = freq.match(/(\d+)\s*times?\s*per\s*week/);
    return match ? parseInt(match[1]) * 13 : 13;
  }
  if (freq.includes('per month')) {
    const match = freq.match(/(\d+)\s*times?\s*per\s*month/);
    return match ? parseInt(match[1]) * 3 : 3;
  }
  return 5;
}

function calculateOutfitNeeds(usesPerSeason: number): number {
  const weeksPerSeason = 13;
  const usesPerWeek = usesPerSeason / weeksPerSeason;
  
  if (usesPerWeek <= 1) {
    return Math.max(1, Math.ceil(usesPerSeason / 4));
  } else {
    return Math.ceil(usesPerWeek * 2);
  }
}

function determinePriorityLevel(
  category: ItemCategory,
  currentItems: number,
  gapCount: number,
  isCritical: boolean
): number {
  if (isCritical) return 1; // Critical
  if (category === ItemCategory.FOOTWEAR && currentItems < 2) return 2; // High
  if ([ItemCategory.TOP, ItemCategory.BOTTOM].includes(category) && gapCount > 3) return 2; // High
  if (gapCount > 0) return 3; // Medium
  return 4; // Low priority / satisfied
}

function generateCategoryRecommendations(
  category: ItemCategory,
  currentItems: number,
  categoryNeed: any,
  scenarioName: string,
  isCritical: boolean
): string[] {
  const recommendations: string[] = [];

  if (isCritical) {
    const categoryName = category === ItemCategory.ONE_PIECE ? 'dresses' : category;
    recommendations.push(`🚨 Critical: Add ${categoryName} for ${scenarioName} - you can't create any outfits without them`);
  } else if (currentItems < categoryNeed.min) {
    recommendations.push(`Add ${categoryNeed.min - currentItems} more ${category} to reach minimum for ${scenarioName}`);
  } else if (currentItems < categoryNeed.ideal) {
    recommendations.push(`Consider ${categoryNeed.ideal - currentItems} more ${category} for optimal ${scenarioName} variety`);
  } else {
    recommendations.push(`✅ Your ${category} collection for ${scenarioName} is well-covered`);
  }

  return recommendations;
}

/**
 * Calculate category needs based on outfit requirements
 */
export function calculateCategoryNeeds(outfitsNeeded: number): CategoryNeeds {
  return {
    [ItemCategory.TOP]: {
      min: Math.ceil(outfitsNeeded * 0.5),
      ideal: Math.ceil(outfitsNeeded * 0.8), 
      max: Math.ceil(outfitsNeeded * 1.2)
    },
    [ItemCategory.BOTTOM]: {
      min: Math.ceil(outfitsNeeded * 0.3),
      ideal: Math.ceil(outfitsNeeded * 0.6),
      max: Math.ceil(outfitsNeeded * 0.9)
    },
    [ItemCategory.ONE_PIECE]: {
      min: 0,
      ideal: Math.ceil(outfitsNeeded * 0.3),
      max: Math.ceil(outfitsNeeded * 0.7)
    },
    [ItemCategory.OUTERWEAR]: {
      min: Math.ceil(outfitsNeeded * 0.1),
      ideal: Math.ceil(outfitsNeeded * 0.2),
      max: Math.ceil(outfitsNeeded * 0.4)
    },
    [ItemCategory.FOOTWEAR]: {
      min: Math.max(1, Math.ceil(outfitsNeeded * 0.2)),
      ideal: Math.ceil(outfitsNeeded * 0.4),
      max: Math.ceil(outfitsNeeded * 0.6)
    },
    [ItemCategory.ACCESSORY]: {
      min: 0,
      ideal: Math.ceil(outfitsNeeded * 0.3),
      max: Math.ceil(outfitsNeeded * 0.5)
    },
    [ItemCategory.OTHER]: {
      min: 0,
      ideal: Math.ceil(outfitsNeeded * 0.1), // Minimal needs for 'other' items
      max: Math.ceil(outfitsNeeded * 0.3)
    }
  };
}

/**
 * Calculate category-specific coverage for a single category
 */
export const calculateCategoryCoverage = async (
  userId: string,
  scenarioId: string,
  scenarioName: string,
  scenarioFrequency: string,
  season: Season,
  category: ItemCategory,
  items: WardrobeItem[]
): Promise<CategoryCoverage> => {
  console.log(`🟦 CATEGORY COVERAGE - Calculating for ${scenarioName}/${season}/${category}`);

  // Filter items for this specific category, scenario, and season
  const categoryItems = items.filter(item => {
    const matchesCategory = item.category === category;
    const matchesScenario = item.scenarios?.includes(scenarioId) || false;
    const matchesSeason = !item.season || 
                         item.season.length === 0 || 
                         item.season.includes(season);
    return matchesCategory && matchesScenario && matchesSeason;
  });

  const currentItems = categoryItems.length;

  // Calculate needs for this category
  const usesPerSeason = parseFrequencyToSeasonalUse(scenarioFrequency);
  const outfitsNeeded = calculateOutfitNeeds(usesPerSeason);
  const categoryNeeds = calculateCategoryNeeds(outfitsNeeded);

  const categoryNeed = categoryNeeds[category];
  
  // Calculate coverage
  const coveragePercent = categoryNeed.ideal > 0 
    ? Math.min(100, Math.round((currentItems / categoryNeed.ideal) * 100))
    : 100;

  const gapCount = Math.max(0, categoryNeed.ideal - currentItems);
  const isCritical = currentItems === 0 && ['top', 'bottom', 'footwear'].includes(category);
  
  // Determine priority level
  const priorityLevel = determinePriorityLevel(category, currentItems, gapCount, isCritical);

  // Generate category-specific recommendations
  const categoryRecommendations = generateCategoryRecommendations(
    category, 
    currentItems, 
    categoryNeed, 
    scenarioName,
    isCritical
  );

  const coverage: CategoryCoverage = {
    userId,
    scenarioId,
    scenarioName,
    scenarioFrequency,
    season,
    category,
    currentItems,
    neededItemsMin: categoryNeed.min,
    neededItemsIdeal: categoryNeed.ideal,
    neededItemsMax: categoryNeed.max,
    coveragePercent,
    gapCount,
    isCritical,
    isBottleneck: false, // Will be determined when comparing across categories
    priorityLevel,
    categoryRecommendations,
    separatesFocusedTarget: 0, // Simplified for now
    dressFocusedTarget: 0, // Simplified for now  
    balancedTarget: 0, // Simplified for now
    lastUpdated: new Date().toISOString()
  };

  console.log(`🟢 CATEGORY COVERAGE - ${category}: ${currentItems}/${categoryNeed.ideal} (${coveragePercent}%)`);
  return coverage;
};
