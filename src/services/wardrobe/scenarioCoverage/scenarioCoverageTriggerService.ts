/**
 * Frontend service to trigger scenario coverage recalculation
 * This is now a lightweight wrapper around the new frontend calculation service
 */

import { WardrobeItem, Scenario } from '../../../types';
import { ScenarioCoverageService } from './scenarioCoverageService';

const scenarioCoverageService = ScenarioCoverageService.getInstance();

/**
 * Trigger scenario coverage recalculation when an item is added
 */
export const triggerItemAddedCoverage = async (
  userId: string, 
  items: WardrobeItem[],
  scenarios: Scenario[],
  newItem: WardrobeItem,
  season: string = 'all'
): Promise<void> => {
  try {
    console.log('🟦 SCENARIO COVERAGE - Triggering coverage calculation for added item:', newItem.name);
    await scenarioCoverageService.onItemAdded(userId, items, scenarios, newItem, season);
    console.log('🟢 SCENARIO COVERAGE - Successfully calculated coverage for added item');
  } catch (error) {
    console.error('🔴 SCENARIO COVERAGE - Failed to calculate coverage for added item:', error);
  }
};

/**
 * Trigger scenario coverage recalculation when an item is updated
 */
export const triggerItemUpdatedCoverage = async (
  userId: string,
  items: WardrobeItem[],
  scenarios: Scenario[],
  oldItem: WardrobeItem, 
  newItem: WardrobeItem,
  season: string = 'all'
): Promise<void> => {
  try {
    console.log('🟦 SCENARIO COVERAGE - Triggering coverage calculation for updated item:', newItem.name);
    await scenarioCoverageService.onItemUpdated(userId, items, scenarios, oldItem, newItem, season);
    console.log('🟢 SCENARIO COVERAGE - Successfully calculated coverage for updated item');
  } catch (error) {
    console.error('🔴 SCENARIO COVERAGE - Failed to calculate coverage for updated item:', error);
  }
};

/**
 * Trigger scenario coverage recalculation when an item is deleted
 */
export const triggerItemDeletedCoverage = async (
  userId: string,
  items: WardrobeItem[],
  scenarios: Scenario[],
  deletedItem: WardrobeItem,
  season: string = 'all'
): Promise<void> => {
  try {
    console.log('🟦 SCENARIO COVERAGE - Triggering coverage calculation for deleted item:', deletedItem.name);
    await scenarioCoverageService.onItemDeleted(userId, items, scenarios, deletedItem, season);
    console.log('🟢 SCENARIO COVERAGE - Successfully calculated coverage for deleted item');
  } catch (error) {
    console.error('🔴 SCENARIO COVERAGE - Failed to calculate coverage for deleted item:', error);
  }
};
