import { WardrobeItem, Season, ItemCategory } from '../../../../types';
import { CategoryNeeds, CategoryCoverage } from './types';
import { Scenario } from '../../../scenarios/types';
import { detectLifestyleType, getLifestyleTargets, getOuterwearTargets, getLifestyleMultiplier, analyzeAndLogLifestyle, LifestyleAnalysis } from '../lifestyle/lifestyleDetectionService';

// Performance optimization: Cache lifestyle analysis to avoid redundant calculations
let lifestyleCache: { scenarioKey: string; result: LifestyleAnalysis } | null = null;

/**
 * Get cached lifestyle analysis to avoid redundant calculations during bulk updates
 */
function getCachedLifestyleAnalysis(scenarios: Scenario[]): LifestyleAnalysis {
  // Create a cache key based on scenario names and frequencies
  const scenarioKey = scenarios
    .map(s => `${s.name}:${s.frequency}`)
    .sort()
    .join('|');
  
  // Return cached result if scenarios haven't changed
  if (lifestyleCache && lifestyleCache.scenarioKey === scenarioKey) {
    console.log(`🏠🏃 LIFESTYLE CACHE HIT - Using cached ${lifestyleCache.result.type} analysis`);
    return lifestyleCache.result;
  }
  
  // Calculate new lifestyle analysis and cache it
  const result = analyzeAndLogLifestyle(scenarios);
  lifestyleCache = { scenarioKey, result };
  console.log(`🏠🏃 LIFESTYLE CACHE MISS - Calculated and cached ${result.type} analysis`);
  
  return result;
}

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
  gapType: 'critical' | 'improvement' | 'expansion' | 'satisfied' | 'oversaturated'
): number {
  // Accessories are never critical - always nice-to-have
  if (category === ItemCategory.ACCESSORY) {
    if (currentItems === 0) return 4; // Low priority (optional)
    if (gapCount > 0) return 5; // Very low priority (variety enhancement)
    return 5; // Satisfied
  }
  
  // Regular categories - use gapType instead of isCritical
  if (gapType === 'critical') return 1; // Critical
  if (category === ItemCategory.FOOTWEAR && currentItems < 2) return 2; // High
  if ([ItemCategory.TOP, ItemCategory.BOTTOM].includes(category) && gapCount > 3) return 2; // High
  if (gapCount > 0) return 3; // Medium
  return 4; // Low priority / satisfied
}


/**
 * FIXED: Sensible baseline category needs (no more stupid multipliers!)
 * These are reasonable defaults that get overridden by lifestyle logic
 */
export function calculateCategoryNeeds(outfitsNeeded: number): CategoryNeeds {
  return {
    [ItemCategory.TOP]: {
      min: Math.max(5, Math.ceil(outfitsNeeded * 0.4)),
      ideal: Math.max(8, Math.ceil(outfitsNeeded * 0.7)), 
      max: Math.max(12, Math.ceil(outfitsNeeded * 1.0))
    },
    [ItemCategory.BOTTOM]: {
      min: Math.max(3, Math.ceil(outfitsNeeded * 0.25)),
      ideal: Math.max(5, Math.ceil(outfitsNeeded * 0.5)),
      max: Math.max(8, Math.ceil(outfitsNeeded * 0.8))
    },
    [ItemCategory.ONE_PIECE]: {
      min: 0, // Optional category
      ideal: Math.max(2, Math.ceil(outfitsNeeded * 0.2)),
      max: Math.max(4, Math.ceil(outfitsNeeded * 0.4))
    },
    [ItemCategory.OUTERWEAR]: {
      // Will be overridden by seasonal logic anyway
      min: 2,
      ideal: 3,
      max: 5
    },
    [ItemCategory.FOOTWEAR]: {
      // Will be overridden by lifestyle logic anyway
      min: 3,
      ideal: 5,
      max: 7
    },
    [ItemCategory.ACCESSORY]: {
      // FIXED: Reasonable baseline that gets overridden by lifestyle subcategory logic
      min: 3, // Everyone needs basic accessories
      ideal: 5,
      max: 8
    },
    [ItemCategory.OTHER]: {
      min: 0, // Optional
      ideal: 2,
      max: 4
    }
  };
}

/**
 * Get accessory subcategory limits with lifestyle adjustments
 */
function getAccessorySubcategoryLimits(outfitsNeeded: number, lifestyleAnalysis?: LifestyleAnalysis) {
  // Get lifestyle targets for bags and multiplier for accessories
  const bagTargets = lifestyleAnalysis ? getLifestyleTargets('bags', lifestyleAnalysis.type) : { min: 3, ideal: 4, max: 6 };
  const accessoryMultiplier = lifestyleAnalysis ? getLifestyleMultiplier('accessories', lifestyleAnalysis.type) : 1.0;
  
  return {
    // Jewelry is collectible - no practical maximum, just provide guidance on variety
    'Jewelry': { 
      min: 0, 
      ideal: Math.min(12, Math.max(3, Math.ceil(outfitsNeeded * 0.4 * accessoryMultiplier))), 
      max: 999 
    },
    
    // Bags - FIXED: Realistic numbers based on lifestyle (no more multipliers!)
    // People need different bags: work bag, casual bag, evening bag, travel bag, etc.
    'Bag': bagTargets,
    
    // Belts provide functional variety
    'Belt': { 
      min: 0, 
      ideal: Math.min(5, Math.max(2, Math.ceil(outfitsNeeded * 0.2 * accessoryMultiplier))), 
      max: 8 
    },
    
    // Scarves for seasonal/style variety
    'Scarf': { 
      min: 0, 
      ideal: Math.min(6, Math.max(2, Math.ceil(outfitsNeeded * 0.15 * accessoryMultiplier))), 
      max: 10 
    },
    
    // Hats are more specialized
    'Hat': { 
      min: 0, 
      ideal: Math.min(3, Math.max(1, Math.ceil(outfitsNeeded * 0.08 * accessoryMultiplier))), 
      max: 5 
    },
    
    // Sunglasses - seasonal/functional
    'Sunglasses': { 
      min: 0, 
      ideal: Math.min(3, Math.max(1, Math.ceil(outfitsNeeded * 0.05 * accessoryMultiplier))), 
      max: 4 
    },
    
    // Watches - usually have 1-2 good ones
    'Watch': { 
      min: 0, 
      ideal: Math.min(2, Math.max(1, Math.ceil(outfitsNeeded * 0.03))), 
      max: 3 
    },
    
    // Socks - more functional, seasonal
    'Socks': { 
      min: 0, 
      ideal: Math.min(8, Math.max(3, Math.ceil(outfitsNeeded * 0.3))), 
      max: 12 
    },
    
    // Tights - seasonal, fewer needed
    'Tights': { 
      min: 0, 
      ideal: Math.min(4, Math.max(2, Math.ceil(outfitsNeeded * 0.1))), 
      max: 6 
    }
  };
}

/**
 * Get accessory subcategory - map specific bag types to generic 'Bag' for coverage calculation
 */
function getAccessorySubcategory(item: WardrobeItem): string {
  const validSubcategories = ['Hat', 'Scarf', 'Belt', 'Bag', 'Jewelry', 'Sunglasses', 'Watch', 'Socks', 'Tights'];
  const bagTypes = ['Handbag', 'Backpack', 'Tote', 'Clutch', 'Wallet', 'Purse'];
  
  if (!item.subcategory) {
    console.warn(`⚠️ Accessory item "${item.name}" has missing subcategory. Defaulting to Jewelry.`);
    return 'Jewelry';
  }
  
  // Map specific bag types to generic 'Bag' for coverage calculation
  if (bagTypes.includes(item.subcategory)) {
    return 'Bag';
  }
  
  // Use subcategory field directly if it's in our valid list
  if (validSubcategories.includes(item.subcategory)) {
    return item.subcategory;
  }
  
  // Fallback to Jewelry for unrecognized subcategories
  console.warn(`⚠️ Accessory item "${item.name}" has invalid subcategory: "${item.subcategory}". Defaulting to Jewelry.`);
  return 'Jewelry';
}

/**
 * Define which accessory subcategories are seasonal vs non-seasonal
 */
const SEASONAL_ACCESSORY_SUBCATEGORIES = ['Scarf', 'Hat', 'Tights', 'Socks'];
const NON_SEASONAL_ACCESSORY_SUBCATEGORIES = ['Bag', 'Belt', 'Jewelry', 'Watch', 'Sunglasses'];
const ALL_SEASONS_VALUE = 'all_seasons' as Season; // Special season value for non-seasonal accessories

/**
 * Calculate accessory coverage by creating separate records for each subcategory
 */
async function calculateAccessorySubcategoryCoverage(
  userId: string,
  scenarioId: string | null,
  scenarioName: string,
  scenarioFrequency: string,
  season: Season,
  categoryItems: WardrobeItem[],
  lifestyleAnalysis?: LifestyleAnalysis
): Promise<CategoryCoverage[]> {
  console.log(`🟦 ACCESSORY SUBCATEGORY - Creating separate coverage records for each subcategory`);
  
  const usesPerSeason = 5; // Default seasonal usage for accessories
  const outfitsNeeded = calculateOutfitNeeds(usesPerSeason);
  const subcategoryLimits = getAccessorySubcategoryLimits(outfitsNeeded, lifestyleAnalysis);
  
  // Group accessories by subcategory
  const subcategoryGroups: Record<string, WardrobeItem[]> = {};
  for (const item of categoryItems) {
    const subcat = getAccessorySubcategory(item);
    if (!subcategoryGroups[subcat]) subcategoryGroups[subcat] = [];
    subcategoryGroups[subcat].push(item);
  }
  
  // Create separate coverage record for each subcategory
  const coverageRecords: CategoryCoverage[] = [];
  
  for (const [subcatName, limits] of Object.entries(subcategoryLimits)) {
    // Determine if this subcategory is seasonal or non-seasonal
    const isSeasonal = SEASONAL_ACCESSORY_SUBCATEGORIES.includes(subcatName);
    const recordSeason = isSeasonal ? season : ALL_SEASONS_VALUE; // Use special value for "all seasons"
    const displaySeason = isSeasonal ? season : 'all seasons';
    
    // For seasonal subcategories, filter items by season
    // For non-seasonal subcategories, use all items of that subcategory
    let subcategoryItems: WardrobeItem[];
    if (isSeasonal) {
      subcategoryItems = subcategoryGroups[subcatName]?.filter(item => 
        !item.season || item.season.length === 0 || item.season.includes(season)
      ) || [];
    } else {
      subcategoryItems = subcategoryGroups[subcatName] || [];
    }
    
    const currentCount = subcategoryItems.length;
    const coverage = limits.ideal > 0 
      ? Math.min(100, Math.round((currentCount / limits.ideal) * 100))
      : 100;
    
    // Calculate gap information
    const gapCount = Math.max(0, limits.ideal - currentCount);
    let gapType: 'critical' | 'improvement' | 'expansion' | 'satisfied' | 'oversaturated';
    
    if (currentCount === 0) {
      gapType = 'improvement'; // Accessories are never critical
    } else if (currentCount < limits.ideal) {
      gapType = 'improvement';
    } else if (currentCount < limits.max) {
      gapType = 'expansion';
    } else if (currentCount === limits.max) {
      gapType = 'satisfied';
    } else {
      gapType = 'oversaturated';
    }
    
    const coverageRecord: CategoryCoverage = {
      userId,
      scenarioId,
      scenarioName: isSeasonal ? scenarioName : 'All scenarios', // Keep consistent
      season: recordSeason, // null for non-seasonal, actual season for seasonal
      category: ItemCategory.ACCESSORY,
      subcategory: subcatName,
      currentItems: currentCount,
      neededItemsMin: limits.min, // Use actual lifestyle-based minimum!
      neededItemsIdeal: limits.ideal,
      neededItemsMax: limits.max,
      coveragePercent: coverage,
      gapCount,
      gapType,
      priorityLevel: currentCount === 0 ? 4 : 5, // Low to very low priority
      lastUpdated: new Date().toISOString()
    };
    
    console.log(`🟦 ACCESSORY SUBCATEGORY - ${subcatName} (${displaySeason}): ${currentCount}/${limits.ideal} (${coverage}%)`);
    coverageRecords.push(coverageRecord);
  }
  
  return coverageRecords;
}

/**
 * Calculate category-specific coverage for a single category with lifestyle adjustments
 */
export const calculateCategoryCoverage = async (
  userId: string,
  scenarioId: string | null,
  scenarioName: string,
  scenarioFrequency: string,
  season: Season,
  category: ItemCategory,
  items: WardrobeItem[],
  scenarios?: Scenario[]
): Promise<CategoryCoverage | CategoryCoverage[]> => {
  console.log(`🟦 CATEGORY COVERAGE - Calculating for ${scenarioName}/${season}/${category}`);
  
  // Detect lifestyle type if scenarios are provided (with caching)
  let lifestyleAnalysis: LifestyleAnalysis | undefined;
  if (scenarios && scenarios.length > 0) {
    lifestyleAnalysis = getCachedLifestyleAnalysis(scenarios);
  }

  // Filter items for this specific category and season
  // Special handling: Outerwear and Accessories are scenario-agnostic
  const categoryItems = items.filter(item => {
    const matchesCategory = item.category === category;
    const matchesSeason = !item.season || 
                         item.season.length === 0 || 
                         item.season.includes(season);
    
    // CRITICAL: Exclude wishlist items from all coverage calculations
    const isWardrobeItem = item.wishlist === false || item.wishlist === null || item.wishlist === undefined;
    
    if (category === ItemCategory.OUTERWEAR || category === ItemCategory.ACCESSORY) {
      // Outerwear and Accessories: ignore scenario filtering (universal across scenarios)
      return matchesCategory && matchesSeason && isWardrobeItem;
    } else {
      // Other categories: filter by scenario
      const matchesScenario = scenarioId ? (item.scenarios?.includes(scenarioId) || false) : false;
      return matchesCategory && matchesScenario && matchesSeason && isWardrobeItem;
    }
  });

  const currentItems = categoryItems.length;

  // Special handling for accessories - analyze by subcategory (scenario-agnostic like outerwear)
  if (category === ItemCategory.ACCESSORY) {
    return calculateAccessorySubcategoryCoverage(
      userId, scenarioId, scenarioName, scenarioFrequency, season, categoryItems, lifestyleAnalysis
    );
  }

  // Calculate needs for this category
  let usesPerSeason: number;
  if (category === ItemCategory.OUTERWEAR) {
    // Outerwear needs are based on weather/seasons, not scenario frequency
    usesPerSeason = 5; // Default for outerwear
  } else {
    // For other categories, use frequency-based calculations
    usesPerSeason = parseFrequencyToSeasonalUse(scenarioFrequency);
  }
  
  const outfitsNeeded = calculateOutfitNeeds(usesPerSeason);
  let categoryNeeds = calculateCategoryNeeds(outfitsNeeded);

  // Apply realistic lifestyle targets for outerwear and footwear (NO MORE WEIRD MULTIPLIERS!)
  if (lifestyleAnalysis) {
    if (category === ItemCategory.OUTERWEAR) {
      // Outerwear uses seasonal + lifestyle logic
      const lifestyleTargets = getOuterwearTargets(season, lifestyleAnalysis.type);
      console.log(`🏠🏃 SEASONAL OUTERWEAR - ${season}: ${lifestyleTargets.min}/${lifestyleTargets.ideal}/${lifestyleTargets.max} (${lifestyleAnalysis.type})`);
      categoryNeeds[category] = lifestyleTargets;
    } else if (category === ItemCategory.FOOTWEAR) {
      // Footwear uses lifestyle targets
      const lifestyleTargets = getLifestyleTargets('footwear', lifestyleAnalysis.type);
      console.log(`🏠🏃 LIFESTYLE TARGETS - ${category}: ${lifestyleTargets.min}/${lifestyleTargets.ideal}/${lifestyleTargets.max} (${lifestyleAnalysis.type})`);
      categoryNeeds[category] = lifestyleTargets;
    }
  }

  const categoryNeed = categoryNeeds[category];
  
  // Calculate coverage
  const coveragePercent = categoryNeed.ideal > 0 
    ? Math.min(100, Math.round((currentItems / categoryNeed.ideal) * 100))
    : 100;

  // Enhanced 5-tier gap calculation logic
  // Replaces old simple logic: gapCount = max(0, ideal - current)
  // New logic provides nuanced guidance for over-ideal scenarios
  let gapCount: number;
  let gapType: 'critical' | 'improvement' | 'expansion' | 'satisfied' | 'oversaturated';
  
  if (currentItems === 0) {
    // No items at all - critical gap
    gapCount = categoryNeed.ideal;
    gapType = 'critical';
  } else if (currentItems < categoryNeed.min) {
    // Below minimum - critical gap to reach min
    gapCount = categoryNeed.min - currentItems;
    gapType = 'critical';
  } else if (currentItems < categoryNeed.ideal) {
    // Between min and ideal - improvement gap
    gapCount = categoryNeed.ideal - currentItems;
    gapType = 'improvement';
  } else if (currentItems < categoryNeed.max) {
    // Between ideal and max - expansion opportunity
    gapCount = categoryNeed.max - currentItems;
    gapType = 'expansion';
  } else if (currentItems === categoryNeed.max) {
    // At maximum - satisfied, no gap
    gapCount = 0;
    gapType = 'satisfied';
  } else {
    // Over maximum - oversaturated
    gapCount = 0;
    gapType = 'oversaturated';
  }
  
  // Determine priority level using gapType instead of isCritical
  const priorityLevel = determinePriorityLevel(category, currentItems, gapCount, gapType);

  const coverage: CategoryCoverage = {
    userId,
    scenarioId,
    scenarioName,
    season,
    category,
    currentItems,
    neededItemsMin: categoryNeed.min,
    neededItemsIdeal: categoryNeed.ideal,
    neededItemsMax: categoryNeed.max,
    coveragePercent,
    gapCount,
    gapType,
    priorityLevel,
    lastUpdated: new Date().toISOString()
  };

  console.log(`🟢 CATEGORY COVERAGE - ${category}: ${currentItems}/${categoryNeed.ideal} (${coveragePercent}%)`);
  return coverage;
};
