/**
 * Frontend service to trigger scenario coverage recalculation
 * This is now a lightweight wrapper around the new frontend calculation service
 */

import { WardrobeItem, Scenario, Season, ItemCategory } from '../../../types';
import { ScenarioCoverageService } from './scenarioCoverageService';
import { updateCategoryCoverage, updateAllCategoriesForScenario } from './categoryBasedCoverageService';

const scenarioCoverageService = ScenarioCoverageService.getInstance();

/**
 * Trigger scenario coverage recalculation when an item is added
 * Uses efficient category-based approach - only updates affected category
 */
export const triggerItemAddedCoverage = async (
  userId: string, 
  items: WardrobeItem[],
  scenarios: Scenario[],
  newItem: WardrobeItem,
  season: Season
): Promise<void> => {
  try {
    console.log('🟦 CATEGORY COVERAGE - Triggering efficient coverage for added item:', newItem.name);
    
    // Update old system for backward compatibility
    await scenarioCoverageService.onItemAdded(userId, items, scenarios, newItem, season);
    
    // Update new category-based system - only affected scenarios and category
    if (newItem.category && newItem.scenarios?.length) {
      const updatePromises = newItem.scenarios.map(scenarioId => {
        const scenario = scenarios.find(s => s.id === scenarioId);
        if (!scenario) return Promise.resolve();
        
        console.log(`🟦 CATEGORY COVERAGE - Updating ${scenario.name}/${season}/${newItem.category}`);
        return updateCategoryCoverage(
          userId,
          scenario.id,
          scenario.name,
          scenario.frequency || '',
          season,
          newItem.category!,
          items
        );
      });
      
      await Promise.all(updatePromises);
    }
    
    console.log('🟢 CATEGORY COVERAGE - Successfully calculated coverage for added item');
  } catch (error) {
    console.error('🔴 CATEGORY COVERAGE - Failed to calculate coverage for added item:', error);
  }
};

/**
 * Trigger scenario coverage recalculation when an item is updated
 * Now uses efficient category-based approach - only updates affected categories
 */
export const triggerItemUpdatedCoverage = async (
  userId: string,
  items: WardrobeItem[],
  scenarios: Scenario[],
  oldItem: WardrobeItem, 
  newItem: WardrobeItem,
  season: Season
): Promise<void> => {
  try {
    console.log('🟦 CATEGORY COVERAGE - Triggering efficient category-based coverage for updated item:', newItem.name);
    
    // Update old coverage system (for backward compatibility)
    await scenarioCoverageService.onItemUpdated(userId, items, scenarios, oldItem, newItem, season);
    
    // Get affected categories and scenarios
    const affectedCategories = new Set<ItemCategory>();
    const affectedScenarios = new Set<string>();
    
    // Track old item's categories and scenarios
    if (oldItem.category) affectedCategories.add(oldItem.category);
    oldItem.scenarios?.forEach(scenarioId => affectedScenarios.add(scenarioId));
    
    // Track new item's categories and scenarios  
    if (newItem.category) affectedCategories.add(newItem.category);
    newItem.scenarios?.forEach(scenarioId => affectedScenarios.add(scenarioId));
    
    // Update only affected category/scenario combinations
    const updatePromises: Promise<void>[] = [];
    
    for (const scenarioId of affectedScenarios) {
      const scenario = scenarios.find(s => s.id === scenarioId);
      if (!scenario) continue;
      
      for (const category of affectedCategories) {
        console.log(`🟦 CATEGORY COVERAGE - Updating ${scenario.name}/${season}/${category}`);
        updatePromises.push(
          updateCategoryCoverage(
            userId,
            scenario.id,
            scenario.name,
            scenario.frequency || '',
            season,
            category,
            items
          )
        );
      }
    }
    
    await Promise.all(updatePromises);
    
    console.log('🟢 CATEGORY COVERAGE - Successfully updated category-based coverage for updated item');
  } catch (error) {
    console.error('🔴 CATEGORY COVERAGE - Failed to calculate coverage for updated item:', error);
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
  season: Season
): Promise<void> => {
  try {
    console.log('🟦 SCENARIO COVERAGE - Triggering coverage calculation for deleted item:', deletedItem.name);
    await scenarioCoverageService.onItemDeleted(userId, items, scenarios, deletedItem, season);
    console.log('🟢 SCENARIO COVERAGE - Successfully calculated coverage for deleted item');
  } catch (error) {
    console.error('🔴 SCENARIO COVERAGE - Failed to calculate coverage for deleted item:', error);
  }
};
