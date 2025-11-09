import { WardrobeItem, Season, ItemCategory } from '../../../../types';
import { CategoryCoverage } from './types';
import { getLifestyleTargets, getLifestyleMultiplier, LifestyleAnalysis } from '../lifestyle/lifestyleDetectionService';
import { calculateOutfitNeeds } from './categoryNeeds';

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
const ALL_SEASONS_VALUE = 'all_seasons' as Season; // Special season value for non-seasonal accessories

/**
 * Calculate accessory coverage by creating separate records for each subcategory
 */
export async function calculateAccessorySubcategoryCoverage(
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
