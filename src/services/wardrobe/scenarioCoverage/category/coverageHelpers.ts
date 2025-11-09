import { ItemCategory } from '../../../../types';

/**
 * Determine priority level for category coverage gaps
 * Higher numbers = lower priority (1 = highest priority)
 */
export function determinePriorityLevel(
  category: ItemCategory,
  currentItems: number,
  gapCount: number,
  gapType: string
): number {
  // Critical gaps always get highest priority
  if (gapType === 'critical') return 1; // Critical

  // Category-specific high-priority conditions
  if (category === ItemCategory.FOOTWEAR && currentItems < 2) return 2; // High
  if ([ItemCategory.TOP, ItemCategory.BOTTOM].includes(category) && gapCount > 3) return 2; // High
  
  // Regular categories - use gapType instead of isCritical
  if (gapCount > 0) return 3; // Medium
  return 4; // Low priority / satisfied
}
