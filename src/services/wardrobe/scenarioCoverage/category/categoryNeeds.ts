import { Season, ItemCategory } from '../../../../types';
import { CategoryNeeds } from './types';
import { isHomeScenario } from '../lifestyle/lifestyleDetectionService';

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
 * Get variety multiplier based on scenario type and description
 * Unified system that handles all scenario-based variety requirements
 */
export function getVarietyMultiplier(scenarioName: string, scenarioDescription?: string): number {
  // HOME SCENARIOS - Direct integration (replaces existing separate logic)
  if (isHomeScenario(scenarioName)) {
    return 0.6; // 40% reduction for home scenarios
  }
  
  // UNIFORM STUDENTS - Low variety since they wear the same thing daily
  if (scenarioName === 'School/University' && 
      scenarioDescription?.toLowerCase().includes('uniform')) {
    return 0.4;
  }
  
  // HIGH VARIETY (1.0) - Daily social visibility scenarios
  if (scenarioName === 'Office Work' || 
      scenarioName === 'Creative Work' ||
      scenarioName === 'School/University') { // Non-uniform students
    return 1.0;
  }
  
  // MODERATE VARIETY (0.7) - Social scenarios
  if (scenarioName.includes('Social Outings') || 
      scenarioName.includes('social') ||
      scenarioName.includes('dating')) {
    return 0.7;
  }
  
  // LOW VARIETY (0.4) - Everything else (sports, errands, physical work, etc.)
  return 0.4;
}

/**
 * Calculate outfit needs based on seasonal usage with variety adjustment
 */
export function calculateOutfitNeeds(usesPerSeason: number, varietyMultiplier: number = 1.0): number {
  const weeksPerSeason = 13;
  const adjustedUses = usesPerSeason * varietyMultiplier;
  const usesPerWeek = adjustedUses / weeksPerSeason;
  
  if (usesPerWeek <= 1) {
    return Math.max(1, Math.ceil(adjustedUses / 4));
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
 * Calculate seasonal top needs based on outfit frequency
 * Spring/fall requires more variety for layering and weather transitions
 */
export function calculateSeasonalTopNeeds(outfitsNeeded: number, season: Season): { min: number; ideal: number; max: number } {
  if (season === Season.TRANSITIONAL) { // spring/fall
    // More variety needed: light layers, medium sweaters, cardigans, transitional pieces
    return {
      min: Math.max(3, Math.ceil(outfitsNeeded * 0.5)), // Higher minimum for layering needs
      ideal: Math.max(4, Math.ceil(outfitsNeeded * 0.8)), // More variety for weather changes
      max: Math.max(5, Math.ceil(outfitsNeeded * 1.1))     // Room for layering combinations
    };
  } else {
    // Summer/winter - more consistent weather, standard variety
    return {
      min: Math.max(2, Math.ceil(outfitsNeeded * 0.4)),
      ideal: Math.max(3, Math.ceil(outfitsNeeded * 0.7)), 
      max: Math.max(4, Math.ceil(outfitsNeeded * 1.0))
    };
  }
}

/**
 * Calculate seasonal bottom needs based on outfit frequency
 * Spring/fall requires more variety for weather transitions
 */
export function calculateSeasonalBottomNeeds(outfitsNeeded: number, season: Season): { min: number; ideal: number; max: number } {
  if (season === Season.TRANSITIONAL) { // spring/fall
    // More variety needed: jeans, trousers, lighter pants for temperature changes
    return {
      min: Math.max(2, Math.ceil(outfitsNeeded * 0.25)), // Slightly higher minimum
      ideal: Math.max(3, Math.ceil(outfitsNeeded * 0.4)), // More variety for weather
      max: Math.max(4, Math.ceil(outfitsNeeded * 0.6))     // Extra room for different weights
    };
  } else {
    // Summer/winter - more consistent weather, standard variety
    return {
      min: Math.max(1, Math.ceil(outfitsNeeded * 0.2)),
      ideal: Math.max(2, Math.ceil(outfitsNeeded * 0.35)),
      max: Math.max(3, Math.ceil(outfitsNeeded * 0.5))
    };
  }
}

/**
 * Calculate seasonal one-piece needs based on outfit frequency
 * Spring/fall requires more variety for different weather conditions
 */
export function calculateSeasonalOnePieceNeeds(outfitsNeeded: number, season: Season): { min: number; ideal: number; max: number } {
  if (season === Season.TRANSITIONAL) { // spring/fall
    // More variety needed: lighter dresses, midi-weight pieces for layering
    return {
      min: 0, // Still optional
      ideal: Math.max(3, Math.ceil(outfitsNeeded * 0.25)), // Slightly more for weather variety
      max: Math.max(4, Math.ceil(outfitsNeeded * 0.5))     // More room for different weights/lengths
    };
  } else {
    // Summer/winter - standard variety
    return {
      min: 0, // Optional category
      ideal: Math.max(2, Math.ceil(outfitsNeeded * 0.2)),
      max: Math.max(3, Math.ceil(outfitsNeeded * 0.4))
    };
  }
}

/**
 * Calculate category needs based on outfit frequency with seasonal adjustments
 * Now includes seasonal logic for tops, bottoms, and one-pieces (not just outerwear/footwear)
 */
export function calculateCategoryNeeds(outfitsNeeded: number, season?: Season): CategoryNeeds {
  return {
    [ItemCategory.TOP]: season 
      ? calculateSeasonalTopNeeds(outfitsNeeded, season)
      : { // Fallback if no season provided
          min: Math.max(1, Math.ceil(outfitsNeeded * 0.4)),
          ideal: Math.max(2, Math.ceil(outfitsNeeded * 0.7)), 
          max: Math.max(3, Math.ceil(outfitsNeeded * 1.0))
        },
    [ItemCategory.BOTTOM]: season
      ? calculateSeasonalBottomNeeds(outfitsNeeded, season)
      : { // Fallback if no season provided
          min: Math.max(1, Math.ceil(outfitsNeeded * 0.2)),
          ideal: Math.max(2, Math.ceil(outfitsNeeded * 0.35)),
          max: Math.max(3, Math.ceil(outfitsNeeded * 0.5))
        },
    [ItemCategory.ONE_PIECE]: season
      ? calculateSeasonalOnePieceNeeds(outfitsNeeded, season)
      : { // Fallback if no season provided
          min: 0, // Optional category
          ideal: Math.max(1, Math.ceil(outfitsNeeded * 0.2)),
          max: Math.max(2, Math.ceil(outfitsNeeded * 0.4))
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
