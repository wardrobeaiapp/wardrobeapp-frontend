import { Season, ItemCategory } from '../../../../types';

// Season constants using enum values  
export const ALL_SEASONS: Season[] = [Season.SUMMER, Season.WINTER, Season.TRANSITIONAL];

// Category needs calculation types
export type CategoryNeed = {
  min: number;
  ideal: number;
  max: number;
};

export type CategoryNeeds = {
  [ItemCategory.TOP]: CategoryNeed;
  [ItemCategory.BOTTOM]: CategoryNeed;
  [ItemCategory.ONE_PIECE]: CategoryNeed;
  [ItemCategory.OUTERWEAR]: CategoryNeed;
  [ItemCategory.FOOTWEAR]: CategoryNeed;
  [ItemCategory.ACCESSORY]: CategoryNeed;
  [ItemCategory.OTHER]: CategoryNeed;
};

// Main category coverage data structure
export type CategoryCoverage = {
  userId: string;
  scenarioId: string;
  scenarioName: string;
  season: Season;
  category: ItemCategory;
  currentItems: number;
  neededItemsMin: number;
  neededItemsIdeal: number;
  neededItemsMax: number;
  coveragePercent: number;
  gapCount: number;
  gapType: 'critical' | 'improvement' | 'expansion' | 'satisfied' | 'oversaturated';
  isCritical: boolean;
  priorityLevel: number; // 1-5, 1=critical, 5=nice-to-have (accessories)
  lastUpdated: string;
};
