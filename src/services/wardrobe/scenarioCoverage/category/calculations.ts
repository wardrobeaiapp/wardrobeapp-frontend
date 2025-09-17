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
  // Accessories are never critical - always nice-to-have
  if (category === ItemCategory.ACCESSORY) {
    if (currentItems === 0) return 4; // Low priority (optional)
    if (gapCount > 0) return 5; // Very low priority (variety enhancement)
    return 5; // Satisfied
  }
  
  // Regular categories
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

  // Special handling for accessories
  if (category === ItemCategory.ACCESSORY) {
    if (currentItems === 0) {
      recommendations.push(`💎 Optional: Add some accessories to enhance your ${scenarioName} outfits - belts, jewelry, or bags can add personal flair`);
    } else if (currentItems < categoryNeed.ideal) {
      recommendations.push(`✨ Style tip: Consider adding variety to your ${scenarioName} accessories - mix different types like scarves, jewelry, or belts`);
    } else {
      recommendations.push(`💫 Perfect! You have great accessory variety for ${scenarioName} - focus on mixing and matching for different looks`);
    }
    return recommendations;
  }

  // Regular categories
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
      // Accessories are about variety, not quantity - focus on having some options
      min: 0,
      ideal: Math.min(5, Math.max(2, Math.ceil(outfitsNeeded * 0.1))), // Cap at 5, min 2 for variety
      max: Math.min(8, Math.ceil(outfitsNeeded * 0.2)) // Reasonable cap
    },
    [ItemCategory.OTHER]: {
      min: 0,
      ideal: Math.ceil(outfitsNeeded * 0.1), // Minimal needs for 'other' items
      max: Math.ceil(outfitsNeeded * 0.3)
    }
  };
}

/**
 * Get accessory subcategory limits (matching actual form subcategories)
 */
function getAccessorySubcategoryLimits(outfitsNeeded: number) {
  return {
    // Jewelry is collectible - no practical maximum, just provide guidance on variety
    'Jewelry': { min: 0, ideal: Math.min(12, Math.max(3, outfitsNeeded * 0.4)), max: 999 }, // Essentially unlimited
    
    // Bags are more expensive and you need fewer
    'Bag': { min: 0, ideal: Math.min(4, Math.max(1, Math.ceil(outfitsNeeded * 0.1))), max: 6 },
    
    // Belts provide functional variety
    'Belt': { min: 0, ideal: Math.min(5, Math.max(2, Math.ceil(outfitsNeeded * 0.2))), max: 8 },
    
    // Scarves for seasonal/style variety
    'Scarf': { min: 0, ideal: Math.min(6, Math.max(2, Math.ceil(outfitsNeeded * 0.15))), max: 10 },
    
    // Hats are more specialized
    'Hat': { min: 0, ideal: Math.min(3, Math.max(1, Math.ceil(outfitsNeeded * 0.08))), max: 5 },
    
    // Sunglasses - seasonal/functional
    'Sunglasses': { min: 0, ideal: Math.min(3, Math.max(1, Math.ceil(outfitsNeeded * 0.05))), max: 4 },
    
    // Watches - usually have 1-2 good ones
    'Watch': { min: 0, ideal: Math.min(2, Math.max(1, Math.ceil(outfitsNeeded * 0.03))), max: 3 },
    
    // Socks - more functional, seasonal
    'Socks': { min: 0, ideal: Math.min(8, Math.max(3, Math.ceil(outfitsNeeded * 0.3))), max: 12 },
    
    // Tights - seasonal, fewer needed
    'Tights': { min: 0, ideal: Math.min(4, Math.max(2, Math.ceil(outfitsNeeded * 0.1))), max: 6 }
  };
}

/**
 * Get accessory subcategory - simplified since subcategory field is reliable
 */
function getAccessorySubcategory(item: WardrobeItem): string {
  const validSubcategories = ['Hat', 'Scarf', 'Belt', 'Bag', 'Jewelry', 'Sunglasses', 'Watch', 'Socks', 'Tights'];
  
  // Use subcategory field directly if it's valid
  if (item.subcategory && validSubcategories.includes(item.subcategory)) {
    return item.subcategory;
  }
  
  // Fallback to Jewelry for any edge cases (shouldn't happen with proper data)
  console.warn(`⚠️ Accessory item "${item.name}" has invalid/missing subcategory: "${item.subcategory}". Defaulting to Jewelry.`);
  return 'Jewelry';
}

/**
 * Calculate accessory coverage by analyzing subcategories separately
 */
async function calculateAccessorySubcategoryCoverage(
  userId: string,
  scenarioId: string,
  scenarioName: string,
  scenarioFrequency: string,
  season: Season,
  categoryItems: WardrobeItem[]
): Promise<CategoryCoverage> {
  const usesPerSeason = parseFrequencyToSeasonalUse(scenarioFrequency);
  const outfitsNeeded = calculateOutfitNeeds(usesPerSeason);
  const subcategoryLimits = getAccessorySubcategoryLimits(outfitsNeeded);
  
  // Group accessories by subcategory
  const subcategoryGroups: Record<string, WardrobeItem[]> = {};
  for (const item of categoryItems) {
    const subcat = getAccessorySubcategory(item);
    if (!subcategoryGroups[subcat]) subcategoryGroups[subcat] = [];
    subcategoryGroups[subcat].push(item);
  }
  
  // Analyze each subcategory
  const subcategoryAnalysis: Array<{
    name: string;
    current: number;
    ideal: number;
    coverage: number;
    recommendations: string[];
  }> = [];
  
  let totalIdeal = 0;
  let totalCurrent = 0;
  
  for (const [subcatName, limits] of Object.entries(subcategoryLimits)) {
    const currentCount = subcategoryGroups[subcatName]?.length || 0;
    const coverage = limits.ideal > 0 
      ? Math.min(100, Math.round((currentCount / limits.ideal) * 100))
      : 100;
    
    totalIdeal += limits.ideal;
    totalCurrent += currentCount;
    
    // Generate subcategory-specific recommendations
    const recommendations: string[] = [];
    const displayName = subcatName.toLowerCase(); // Convert "Bag" -> "bag" for display
    
    // Special handling for jewelry - encourage when minimal, celebrate when abundant
    if (subcatName === 'Jewelry') {
      if (currentCount === 0) {
        recommendations.push(`💎 Consider adding jewelry to refresh and personalize your ${scenarioName} outfits - even a few pieces can transform your looks`);
      } else if (currentCount <= 2) {
        recommendations.push(`✨ A bit more jewelry could add variety to your ${scenarioName} style - mix metals, textures, or colors for different moods`);
      } else {
        // No gaps mentioned - just positive acknowledgment
        recommendations.push(`💫 Your jewelry collection adds beautiful personal touches to your ${scenarioName} outfits`);
      }
    } else {
      // Regular subcategories
      if (currentCount === 0) {
        recommendations.push(`💎 Consider adding ${displayName}${displayName.endsWith('s') ? '' : 's'} to enhance your ${scenarioName} style`);
      } else if (currentCount < limits.ideal) {
        const needed = limits.ideal - currentCount;
        recommendations.push(`✨ Your ${displayName} collection could use ${needed} more piece${needed > 1 ? 's' : ''} for variety`);
      } else {
        recommendations.push(`💫 Great ${displayName} variety for ${scenarioName}!`);
      }
    }
    
    subcategoryAnalysis.push({
      name: subcatName,
      current: currentCount,
      ideal: limits.ideal,
      coverage,
      recommendations
    });
  }
  
  // Overall accessory coverage
  const overallCoverage = totalIdeal > 0 
    ? Math.min(100, Math.round((totalCurrent / totalIdeal) * 100))
    : 100;
    
  // Combine recommendations from all subcategories
  const combinedRecommendations = subcategoryAnalysis
    .filter(analysis => analysis.current < analysis.ideal)
    .slice(0, 3) // Top 3 priorities
    .map(analysis => analysis.recommendations[0]);
    
  if (combinedRecommendations.length === 0) {
    combinedRecommendations.push(`💫 Perfect! Your accessory variety for ${scenarioName} is excellent across all categories`);
  }

  return {
    userId,
    scenarioId,
    scenarioName,
    scenarioFrequency,
    season,
    category: ItemCategory.ACCESSORY,
    currentItems: totalCurrent,
    neededItemsMin: 0, // Always optional
    neededItemsIdeal: totalIdeal,
    neededItemsMax: Object.values(subcategoryLimits).reduce((sum, limits) => sum + limits.max, 0),
    coveragePercent: overallCoverage,
    gapCount: Math.max(0, totalIdeal - totalCurrent),
    isCritical: false, // Never critical
    isBottleneck: false,
    priorityLevel: totalCurrent === 0 ? 4 : 5, // Low to very low priority
    categoryRecommendations: combinedRecommendations,
    separatesFocusedTarget: 0,
    dressFocusedTarget: 0,
    balancedTarget: 0,
    lastUpdated: new Date().toISOString()
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

  // Special handling for accessories - analyze by subcategory
  if (category === ItemCategory.ACCESSORY) {
    return calculateAccessorySubcategoryCoverage(
      userId, scenarioId, scenarioName, scenarioFrequency, season, categoryItems
    );
  }

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
  const isCritical = currentItems === 0 && 
                     [ItemCategory.TOP, ItemCategory.BOTTOM, ItemCategory.FOOTWEAR].includes(category);
  
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
