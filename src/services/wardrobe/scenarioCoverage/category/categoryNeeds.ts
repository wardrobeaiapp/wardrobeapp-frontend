import { Season, ItemCategory } from '../../../../types';
import { CategoryNeeds } from './types';

/**
 * Parse scenario frequency to seasonal usage count
 */
export function parseFrequencyToSeasonalUse(frequency: string): number {
  if (!frequency) return 5;
  
  const freq = frequency.toLowerCase();
  if (freq.includes('daily')) return 90;
  if (freq.includes('per week')) {
    const times = parseInt(freq.match(/(\d+)/)?.[0] || '1', 10);
    return times * 13; // weeks per season
  }
  if (freq.includes('per month')) {
    const times = parseInt(freq.match(/(\d+)/)?.[0] || '1', 10);
    return times * 3; // months per season
  }
  
  return 5;
}

/**
 * Calculate outfit needs based on seasonal usage
 */
export function calculateOutfitNeeds(usesPerSeason: number): number {
  const weeksPerSeason = 13;
  const usesPerWeek = usesPerSeason / weeksPerSeason;
  
  if (usesPerWeek <= 1) {
    return Math.max(1, Math.ceil(usesPerSeason / 4));
  } else {
    return Math.ceil(usesPerWeek * 2);
  }
}

/**
 * Calculate seasonal footwear needs based on outfit frequency
 * Footwear needs are much lower than clothing since shoes are reused across outfits
 */
export function calculateSeasonalFootwearNeeds(outfitsNeeded: number, season: Season): { min: number; ideal: number; max: number } {
  if (season === Season.TRANSITIONAL) { // spring/fall
    // More variety needed for weather transitions: rain boots, dress shoes, casual shoes, etc.
    return {
      min: 2, // Always need at least 2 pairs for weather variety
      ideal: Math.max(2, Math.ceil(outfitsNeeded * 0.3)), // outfitsNeeded=10 → 3, outfitsNeeded=6 → 2  
      max: Math.max(3, Math.ceil(outfitsNeeded * 0.4))     // outfitsNeeded=10 → 4, outfitsNeeded=6 → 3
    };
  } else {
    // Summer/winter - more consistent weather, same shoes work across many outfits
    return {
      min: 2, // Always need at least 2 pairs
      ideal: Math.max(2, Math.ceil(outfitsNeeded * 0.2)), // outfitsNeeded=10 → 2, outfitsNeeded=6 → 2
      max: Math.max(2, Math.ceil(outfitsNeeded * 0.3))     // outfitsNeeded=10 → 3, outfitsNeeded=6 → 2  
    };
  }
}

/**
 * Calculate category needs based on outfit frequency with realistic baselines
 * These are reasonable defaults that get overridden by lifestyle logic for outerwear only
 */
export function calculateCategoryNeeds(outfitsNeeded: number, season?: Season): CategoryNeeds {
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
    [ItemCategory.FOOTWEAR]: season 
      ? calculateSeasonalFootwearNeeds(outfitsNeeded, season)
      : { min: 2, ideal: 3, max: 4 }, // Fallback if no season provided
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
