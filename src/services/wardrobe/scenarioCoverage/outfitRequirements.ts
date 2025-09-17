import { Season } from '../../../types';

export type CategoryRequirement = {
  category: string;
  quantity: number;
  interchangeable?: string[];  // Categories that can substitute for this one
};

export type OutfitAlternative = {
  name: string;  // e.g., "Business formal", "Smart casual"
  required: CategoryRequirement[];
  optional: CategoryRequirement[];
};

export type OutfitRequirement = {
  scenarioId: string;
  scenarioName: string;
  season: Season;
  alternatives: OutfitAlternative[];
  targetQuantity: number;  // How many complete outfits needed
  description?: string;
};

// This file kept for type definitions only
// The actual requirements are now calculated dynamically based on scenario frequency
// in frequencyBasedNeedsCalculator.ts
