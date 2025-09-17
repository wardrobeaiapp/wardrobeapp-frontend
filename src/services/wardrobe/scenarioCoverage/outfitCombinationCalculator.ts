import { WardrobeItem, Season } from '../../../types';
import { OutfitRequirement, OutfitAlternative, CategoryRequirement } from './outfitRequirements';

export type OutfitCombination = {
  items: WardrobeItem[];
  alternativeName: string;
  isComplete: boolean;
};

export type OutfitAnalysis = {
  scenarioId: string;
  scenarioName: string;
  season: Season;
  targetQuantity: number;
  possibleOutfits: number;
  coverage: number; // percentage of target met
  completeCombinations: OutfitCombination[];
  missingCategories: string[];
  bottleneckCategory?: string; // category that limits the most combinations
  recommendations: string[];
};

/**
 * Calculate how many complete outfits can be made for a scenario
 */
export const calculateOutfitCombinations = (
  items: WardrobeItem[],
  requirement: OutfitRequirement
): OutfitAnalysis => {
  console.log(`🟦 OUTFIT CALC - Calculating combinations for ${requirement.scenarioName} in ${requirement.season}`);

  // Filter items by scenario and season
  const relevantItems = items.filter(item => {
    const matchesScenario = item.scenarios?.includes(requirement.scenarioId) || false;
    const matchesSeason = !item.season || 
                         item.season.length === 0 || 
                         item.season.includes(requirement.season);
    return matchesScenario && matchesSeason;
  });

  console.log(`🟦 OUTFIT CALC - Found ${relevantItems.length} relevant items`);

  // Group items by category
  const itemsByCategory = relevantItems.reduce<Record<string, WardrobeItem[]>>((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});

  // Calculate combinations for each alternative
  const alternativeResults = requirement.alternatives.map(alternative => 
    calculateCombinationsForAlternative(itemsByCategory, alternative)
  );

  // Get the best result (most combinations possible)
  const bestAlternative = alternativeResults.reduce((best, current) => 
    current.possibleOutfits > best.possibleOutfits ? current : best
  , alternativeResults[0] || { possibleOutfits: 0, combinations: [], bottleneckCategory: undefined });

  // Analyze what's missing across all alternatives
  const allMissingCategories = new Set<string>();
  const allRecommendations = new Set<string>();
  
  alternativeResults.forEach(result => {
    result.missingCategories.forEach(cat => allMissingCategories.add(cat));
    result.recommendations.forEach(rec => allRecommendations.add(rec));
  });

  const coverage = requirement.targetQuantity > 0 
    ? Math.round((bestAlternative.possibleOutfits / requirement.targetQuantity) * 100)
    : 0;

  const analysis: OutfitAnalysis = {
    scenarioId: requirement.scenarioId,
    scenarioName: requirement.scenarioName,
    season: requirement.season,
    targetQuantity: requirement.targetQuantity,
    possibleOutfits: bestAlternative.possibleOutfits,
    coverage,
    completeCombinations: bestAlternative.combinations,
    missingCategories: Array.from(allMissingCategories),
    bottleneckCategory: bestAlternative.bottleneckCategory,
    recommendations: Array.from(allRecommendations)
  };

  console.log(`🟢 OUTFIT CALC - ${requirement.scenarioName}: ${bestAlternative.possibleOutfits}/${requirement.targetQuantity} outfits (${coverage}%)`);
  return analysis;
};

/**
 * Calculate combinations for a specific outfit alternative
 */
function calculateCombinationsForAlternative(
  itemsByCategory: Record<string, WardrobeItem[]>,
  alternative: OutfitAlternative
): {
  possibleOutfits: number;
  combinations: OutfitCombination[];
  missingCategories: string[];
  bottleneckCategory?: string;
  recommendations: string[];
} {
  const missingCategories: string[] = [];
  const recommendations: string[] = [];
  let minCombinations = Infinity;
  let bottleneckCategory: string | undefined;

  // Check required categories
  for (const requirement of alternative.required) {
    const availableItems = getAvailableItems(itemsByCategory, requirement);
    const availableCount = availableItems.length;
    
    if (availableCount === 0) {
      missingCategories.push(requirement.category);
      recommendations.push(`Add ${requirement.quantity} ${requirement.category} for ${alternative.name}`);
    }
    
    const possibleFromThisCategory = Math.floor(availableCount / requirement.quantity);
    if (possibleFromThisCategory < minCombinations) {
      minCombinations = possibleFromThisCategory;
      bottleneckCategory = requirement.category;
    }
  }

  // If any required category is missing, no complete outfits possible
  if (missingCategories.length > 0) {
    return {
      possibleOutfits: 0,
      combinations: [],
      missingCategories,
      bottleneckCategory,
      recommendations
    };
  }

  const possibleOutfits = Math.max(0, minCombinations);

  // Generate actual combinations (limit to first 10 for performance)
  const combinations = generateCombinations(
    itemsByCategory, 
    alternative, 
    Math.min(possibleOutfits, 10)
  );

  // Add quantity recommendations if we have items but not enough
  if (possibleOutfits > 0 && bottleneckCategory) {
    const currentCount = itemsByCategory[bottleneckCategory]?.length || 0;
    const neededForMoreOutfits = currentCount + 1;
    recommendations.push(
      `Add 1 more ${bottleneckCategory} to increase ${alternative.name} options (currently limited by ${bottleneckCategory}: ${currentCount} items)`
    );
  }

  return {
    possibleOutfits,
    combinations,
    missingCategories,
    bottleneckCategory,
    recommendations
  };
}

/**
 * Get available items for a category requirement, including interchangeable items
 */
function getAvailableItems(
  itemsByCategory: Record<string, WardrobeItem[]>,
  requirement: CategoryRequirement
): WardrobeItem[] {
  let items = itemsByCategory[requirement.category] || [];
  
  // Add interchangeable items
  if (requirement.interchangeable) {
    requirement.interchangeable.forEach(category => {
      items = items.concat(itemsByCategory[category] || []);
    });
  }
  
  return items;
}

/**
 * Generate actual outfit combinations
 */
function generateCombinations(
  itemsByCategory: Record<string, WardrobeItem[]>,
  alternative: OutfitAlternative,
  maxCombinations: number
): OutfitCombination[] {
  const combinations: OutfitCombination[] = [];
  
  // This is a simplified combination generator
  // For now, we'll create combinations by taking the first available item from each required category
  // A more sophisticated version would generate all possible combinations
  
  for (let i = 0; i < maxCombinations; i++) {
    const outfit: WardrobeItem[] = [];
    let isComplete = true;
    
    for (const requirement of alternative.required) {
      const availableItems = getAvailableItems(itemsByCategory, requirement);
      
      if (availableItems.length > i * requirement.quantity) {
        // Add required items for this outfit
        for (let j = 0; j < requirement.quantity; j++) {
          const itemIndex = (i * requirement.quantity) + j;
          if (itemIndex < availableItems.length) {
            outfit.push(availableItems[itemIndex]);
          } else {
            isComplete = false;
            break;
          }
        }
      } else {
        isComplete = false;
        break;
      }
    }
    
    if (isComplete && outfit.length > 0) {
      combinations.push({
        items: outfit,
        alternativeName: alternative.name,
        isComplete
      });
    }
  }
  
  return combinations;
}
