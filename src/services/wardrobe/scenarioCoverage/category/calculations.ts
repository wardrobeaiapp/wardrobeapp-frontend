import { WardrobeItem, Season, ItemCategory } from '../../../../types';
import { CategoryCoverage } from './types';
import { Scenario } from '../../../scenarios/types';
import { getOuterwearTargets, LifestyleAnalysis } from '../lifestyle/lifestyleDetectionService';
import { getCachedLifestyleAnalysis } from './lifestyleCache';
import { parseFrequencyToSeasonalUse, calculateOutfitNeeds, calculateCategoryNeeds } from './categoryNeeds';
import { determinePriorityLevel } from './coverageHelpers';
import { calculateAccessorySubcategoryCoverage } from './accessoryCalculation';

// All helper functions moved to separate files for maintainability

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
  // ✅ NEW: Account for category interchangeability (tops/bottoms can be replaced by one-pieces)
  const categoryItems = items.filter(item => {
    // Determine category match with interchangeability
    let matchesCategory;
    if (category === ItemCategory.TOP) {
      // Tops: count both tops and one-pieces (dresses replace top need)
      matchesCategory = item.category === ItemCategory.TOP || item.category === ItemCategory.ONE_PIECE;
    } else if (category === ItemCategory.BOTTOM) {
      // Bottoms: count both bottoms and one-pieces (dresses replace bottom need)
      matchesCategory = item.category === ItemCategory.BOTTOM || item.category === ItemCategory.ONE_PIECE;
    } else {
      // Other categories: exact match only (footwear, outerwear, accessories)
      matchesCategory = item.category === category;
    }
    
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
  let categoryNeeds = calculateCategoryNeeds(outfitsNeeded, season);

  // Apply realistic lifestyle targets for outerwear only (footwear now uses frequency + seasonal logic)
  if (lifestyleAnalysis && category === ItemCategory.OUTERWEAR) {
    // Outerwear uses seasonal + lifestyle logic
    const lifestyleTargets = getOuterwearTargets(season, lifestyleAnalysis.type);
    console.log(`🏠🏃 SEASONAL OUTERWEAR - ${season}: ${lifestyleTargets.min}/${lifestyleTargets.ideal}/${lifestyleTargets.max} (${lifestyleAnalysis.type})`);
    categoryNeeds[category] = lifestyleTargets;
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
