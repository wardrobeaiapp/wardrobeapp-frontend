import { WardrobeItem, Scenario, Season, ItemCategory } from '../../../types';
import { supabase } from '../../core';

// Season constants using enum values  
const ALL_SEASONS: Season[] = [Season.SPRING, Season.SUMMER, Season.FALL, Season.WINTER];

// Simplified category needs calculation for the new normalized approach
type CategoryNeed = {
  min: number;
  ideal: number;
  max: number;
};

type CategoryNeeds = {
  [ItemCategory.TOP]: CategoryNeed;
  [ItemCategory.BOTTOM]: CategoryNeed;
  [ItemCategory.ONE_PIECE]: CategoryNeed;
  [ItemCategory.OUTERWEAR]: CategoryNeed;
  [ItemCategory.FOOTWEAR]: CategoryNeed;
  [ItemCategory.ACCESSORY]: CategoryNeed;
  [ItemCategory.OTHER]: CategoryNeed;
};

export type CategoryCoverage = {
  userId: string;
  scenarioId: string;
  scenarioName: string;
  scenarioFrequency: string;
  season: Season;
  category: ItemCategory;
  currentItems: number;
  neededItemsMin: number;
  neededItemsIdeal: number;
  neededItemsMax: number;
  coveragePercent: number;
  gapCount: number;
  isCritical: boolean;
  isBottleneck: boolean;
  priorityLevel: number; // 1-5, 1=critical
  categoryRecommendations: string[];
  separatesFocusedTarget: number;
  dressFocusedTarget: number;
  balancedTarget: number;
  lastUpdated: string;
};

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

  // Calculate needs for this category (simplified version)
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

/**
 * Update coverage for a single category (efficient selective update)
 */
export const updateCategoryCoverage = async (
  userId: string,
  scenarioId: string,
  scenarioName: string,
  scenarioFrequency: string,
  season: Season,
  category: ItemCategory,
  items: WardrobeItem[]
): Promise<void> => {
  const coverage = await calculateCategoryCoverage(
    userId, scenarioId, scenarioName, scenarioFrequency, season, category, items
  );

  await saveCategoryCoverage(coverage);
};

/**
 * Update coverage for all categories in a scenario (when adding new scenarios)
 */
export const updateAllCategoriesForScenario = async (
  userId: string,
  scenario: Scenario,
  season: Season,
  items: WardrobeItem[]
): Promise<void> => {
  const categories: ItemCategory[] = [
    ItemCategory.TOP, 
    ItemCategory.BOTTOM, 
    ItemCategory.ONE_PIECE, 
    ItemCategory.OUTERWEAR, 
    ItemCategory.FOOTWEAR, 
    ItemCategory.ACCESSORY,
    ItemCategory.OTHER
  ];
  
  const coveragePromises = categories.map(category => 
    updateCategoryCoverage(
      userId, 
      scenario.id, 
      scenario.name, 
      scenario.frequency || '', 
      season, 
      category, 
      items
    )
  );

  await Promise.all(coveragePromises);
};

/**
 * Initialize coverage for a new scenario (called when user creates scenario)
 * Creates coverage rows for current season + critical categories only
 */
export const initializeNewScenarioCoverage = async (
  userId: string,
  scenario: Scenario,
  currentSeason: Season,
  items: WardrobeItem[]
): Promise<void> => {
  console.log(`🟦 INIT SCENARIO - Creating coverage for new scenario: ${scenario.name}`);
  
  // Initialize current season for all categories (for immediate AI insights)
  const categories: ItemCategory[] = [
    ItemCategory.TOP, 
    ItemCategory.BOTTOM, 
    ItemCategory.ONE_PIECE, 
    ItemCategory.OUTERWEAR, 
    ItemCategory.FOOTWEAR, 
    ItemCategory.ACCESSORY,
    ItemCategory.OTHER
  ];

  const initPromises = categories.map(category => 
    updateCategoryCoverage(
      userId,
      scenario.id,
      scenario.name,
      scenario.frequency || '',
      currentSeason,
      category,
      items
    )
  );

  await Promise.all(initPromises);
  
  console.log(`🟢 INIT SCENARIO - Created ${categories.length} coverage entries for ${scenario.name}/${currentSeason}`);
};

/**
 * Initialize complete coverage matrix for a user (useful for new users or data rebuilds)
 */
export const initializeCompleteCoverageMatrix = async (
  userId: string,
  scenarios: Scenario[],
  items: WardrobeItem[]
): Promise<void> => {
  console.log('🟦 INIT COVERAGE - Creating complete coverage matrix for user');
  
  const seasons = ALL_SEASONS;
  const categories: ItemCategory[] = [
    ItemCategory.TOP, 
    ItemCategory.BOTTOM, 
    ItemCategory.ONE_PIECE, 
    ItemCategory.OUTERWEAR, 
    ItemCategory.FOOTWEAR, 
    ItemCategory.ACCESSORY,
    ItemCategory.OTHER
  ];

  const initPromises: Promise<void>[] = [];

  for (const scenario of scenarios) {
    for (const season of seasons) {
      for (const category of categories) {
        initPromises.push(
          updateCategoryCoverage(
            userId,
            scenario.id,
            scenario.name,
            scenario.frequency || '',
            season,
            category,
            items
          )
        );
      }
    }
  }

  await Promise.all(initPromises);
  
  const totalCombinations = scenarios.length * seasons.length * categories.length;
  console.log(`🟢 INIT COVERAGE - Initialized ${totalCombinations} coverage combinations for user`);
};

/**
 * Get category coverage for AI prompts - calculates missing combinations on-demand
 */
export const getCategoryCoverageForAI = async (
  userId: string,
  category: ItemCategory,
  season?: Season,
  scenarios?: Scenario[],
  items?: WardrobeItem[]
): Promise<CategoryCoverage[]> => {
  console.log(`🟦 AI QUERY - Fetching ${category} coverage for user ${userId}`);

  let query = supabase
    .from('scenario_coverage_by_category')
    .select('*')
    .eq('user_id', userId)
    .eq('category', category);

  if (season) {
    query = query.eq('season', season);
  }

  const { data: existingData, error } = await query.order('priority_level', { ascending: true });

  if (error) {
    console.error('🔴 Failed to fetch category coverage for AI:', error);
    throw error;
  }

  const existingCoverage = (existingData || []).map(mapDatabaseRowToCategoryCoverage);

  // If we have scenarios and items available, check for missing combinations and calculate them
  if (scenarios && items) {
    const seasonsToCheck = season ? [season] : ALL_SEASONS;
    const existingKeys = new Set(
      existingCoverage.map(c => `${c.scenarioId}_${c.season}`)
    );

    const missingCombinations: CategoryCoverage[] = [];

    for (const scenario of scenarios) {
      for (const seasonToCheck of seasonsToCheck) {
        const key = `${scenario.id}_${seasonToCheck}`;
        
        if (!existingKeys.has(key)) {
          console.log(`🔄 AI QUERY - Computing missing coverage: ${scenario.name}/${seasonToCheck}/${category}`);
          
          // Calculate missing coverage on-demand
          const missingCoverage = await calculateCategoryCoverage(
            userId,
            scenario.id,
            scenario.name,
            scenario.frequency || '',
            seasonToCheck as Season,
            category,
            items
          );
          
          missingCombinations.push(missingCoverage);
          
          // Optionally save to database for future queries (cache it)
          await saveCategoryCoverage(missingCoverage);
        }
      }
    }

    // Combine existing and calculated data
    const allCoverage = [...existingCoverage, ...missingCombinations];
    return allCoverage.sort((a, b) => a.priorityLevel - b.priorityLevel);
  }

  return existingCoverage;
};

/**
 * Get critical gaps across all categories - for dashboard/alerts
 */
export const getCriticalCoverageGaps = async (userId: string): Promise<CategoryCoverage[]> => {
  const { data, error } = await supabase
    .from('scenario_coverage_by_category')
    .select('*')
    .eq('user_id', userId)
    .eq('is_critical', true)
    .order('priority_level', { ascending: true })
    .limit(10);

  if (error) {
    console.error('🔴 Failed to fetch critical gaps:', error);
    throw error;
  }

  return (data || []).map(mapDatabaseRowToCategoryCoverage);
};

// Helper functions (simplified versions from the main calculator)
function calculateCategoryNeeds(outfitsNeeded: number): CategoryNeeds {
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

function parseFrequencyToSeasonalUse(frequency: string): number {
  // Same logic as in frequencyBasedNeedsCalculator
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
  if (category === 'footwear' && currentItems < 2) return 2; // High
  if (['top', 'bottom'].includes(category) && gapCount > 3) return 2; // High
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
    const categoryName = category === 'one_piece' ? 'dresses' : category;
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

function getStrategyTarget(strategy: any, category: ItemCategory): number {
  return strategy[category] || strategy[category + 's'] || 0;
}

async function saveCategoryCoverage(coverage: CategoryCoverage): Promise<void> {
  const record = {
    user_id: coverage.userId,
    scenario_id: coverage.scenarioId,
    scenario_name: coverage.scenarioName,
    scenario_frequency: coverage.scenarioFrequency,
    season: coverage.season,
    category: coverage.category,
    current_items: coverage.currentItems,
    needed_items_min: coverage.neededItemsMin,
    needed_items_ideal: coverage.neededItemsIdeal,
    needed_items_max: coverage.neededItemsMax,
    coverage_percent: coverage.coveragePercent,
    gap_count: coverage.gapCount,
    is_critical: coverage.isCritical,
    is_bottleneck: coverage.isBottleneck,
    priority_level: coverage.priorityLevel,
    category_recommendations: coverage.categoryRecommendations,
    separates_focused_target: coverage.separatesFocusedTarget,
    dress_focused_target: coverage.dressFocusedTarget,
    balanced_target: coverage.balancedTarget,
    last_updated: coverage.lastUpdated
  };

  const { error } = await supabase
    .from('scenario_coverage_by_category')
    .upsert(record, { onConflict: 'user_id,scenario_id,season,category' });

  if (error) {
    console.error('🔴 Failed to save category coverage:', error);
    throw error;
  }
}

function mapDatabaseRowToCategoryCoverage(row: any): CategoryCoverage {
  return {
    userId: row.user_id,
    scenarioId: row.scenario_id,
    scenarioName: row.scenario_name,
    scenarioFrequency: row.scenario_frequency,
    season: row.season,
    category: row.category,
    currentItems: row.current_items,
    neededItemsMin: row.needed_items_min,
    neededItemsIdeal: row.needed_items_ideal,
    neededItemsMax: row.needed_items_max,
    coveragePercent: row.coverage_percent,
    gapCount: row.gap_count,
    isCritical: row.is_critical,
    isBottleneck: row.is_bottleneck,
    priorityLevel: row.priority_level,
    categoryRecommendations: row.category_recommendations || [],
    separatesFocusedTarget: row.separates_focused_target,
    dressFocusedTarget: row.dress_focused_target,
    balancedTarget: row.balanced_target,
    lastUpdated: row.last_updated
  };
}
