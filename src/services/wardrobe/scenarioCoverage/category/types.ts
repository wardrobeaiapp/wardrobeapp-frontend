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
  scenarioId: string | null;
  scenarioName: string;
  season: Season; // Note: for non-seasonal accessories, we'll use a special value
  category: ItemCategory;
  subcategory?: string | null; // Only used for accessories
  currentItems: number;
  neededItemsMin: number;
  neededItemsIdeal: number;
  neededItemsMax: number;
  coveragePercent: number;
  gapCount: number;
  /**
   * Gap type classification based on current items vs. min/ideal/max thresholds:
   * 
   * - 'critical': 0 items OR below minimum threshold
   *   → Urgent action needed, category is blocking outfit creation
   *   → Message: "Urgent: Add immediately"
   * 
   * - 'improvement': Between minimum and ideal threshold  
   *   → Good foundation exists, but more variety would help
   *   → Message: "Consider adding for better variety"
   * 
   * - 'expansion': Between ideal and maximum threshold
   *   → Well-covered category with room for strategic growth
   *   → Message: "Well-covered, room for growth" 
   * 
   * - 'satisfied': At maximum threshold exactly
   *   → Perfect amount, focus energy elsewhere
   *   → Message: "Perfect! Focus elsewhere"
   * 
   * - 'oversaturated': Above maximum threshold
   *   → Too many items, consider decluttering
   *   → Message: "Consider decluttering"
   */
  gapType: 'critical' | 'improvement' | 'expansion' | 'satisfied' | 'oversaturated';
  isCritical: boolean;
  priorityLevel: number; // 1-5, 1=critical, 5=nice-to-have (accessories)
  lastUpdated: string;
};
