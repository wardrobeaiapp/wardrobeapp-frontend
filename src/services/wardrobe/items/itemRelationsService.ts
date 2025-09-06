/**
 * Service for wardrobe item relations management
 * Handles operations on join tables for item scenarios
 */

import { supabase } from '../../core';
import {
  WARDROBE_ITEM_SCENARIOS_TABLE,
  handleError,
  getCurrentUserId
} from './itemBaseService';

/**
 * Get all scenarios for a specific item
 */
export const getItemScenarios = async (itemId: string): Promise<string[]> => {
  try {
    // Fetch scenarios from join table
    const { data, error } = await supabase
      .from(WARDROBE_ITEM_SCENARIOS_TABLE)
      .select('scenario_id')
      .eq('item_id', itemId);
      
    if (error) {
      return handleError('fetching item scenarios', error);
    }
    
    // Extract scenario IDs
    return data ? data.map(scenario => String(scenario.scenario_id)) : [];
  } catch (error) {
    console.error('[itemService] Error getting item scenarios:', error);
    return [];
  }
};

/**
 * Get scenarios for multiple items in a single batch query
 * @param itemIds Array of item IDs to fetch scenarios for
 * @returns Map of item IDs to their associated scenario IDs
 */
export const getBatchItemScenarios = async (itemIds: string[]): Promise<Map<string, string[]>> => {
  try {
    if (!itemIds.length) {
      return new Map();
    }
    
    // Fetch scenarios for all items in a single query
    const { data, error } = await supabase
      .from(WARDROBE_ITEM_SCENARIOS_TABLE)
      .select('item_id, scenario_id')
      .in('item_id', itemIds);
      
    if (error) {
      console.error('[itemService] Error fetching batch item scenarios:', error);
      return new Map();
    }
    
    // Organize data by item_id
    const scenariosByItem = new Map<string, string[]>();
    
    // Initialize the map with empty arrays for all item IDs
    itemIds.forEach(id => scenariosByItem.set(id, []));
    
    // Populate the map with scenario IDs
    if (data) {
      data.forEach(record => {
        const itemId = String(record.item_id);
        const scenarioId = String(record.scenario_id);
        
        if (scenariosByItem.has(itemId)) {
          scenariosByItem.get(itemId)?.push(scenarioId);
        } else {
          scenariosByItem.set(itemId, [scenarioId]);
        }
      });
    }
    
    return scenariosByItem;
  } catch (error) {
    console.error('[itemService] Error getting batch item scenarios:', error);
    return new Map();
  }
};

/**
 * Add scenarios to an item
 */
export const addScenariosToItem = async (itemId: string, scenarioIds: string[]): Promise<void> => {
  try {
    const userId = await getCurrentUserId();
    
    // Create records for the scenarios join table
    const scenarioRecords = scenarioIds.map(scenarioId => ({
      item_id: itemId,
      scenario_id: scenarioId,
      user_id: userId
    }));
    
    // Insert into the join table
    // Note: Using upsert to avoid conflicts if records already exist
    const { error } = await supabase
      .from(WARDROBE_ITEM_SCENARIOS_TABLE)
      .upsert(scenarioRecords, { onConflict: 'item_id,scenario_id' });
      
    if (error) {
      return handleError('adding scenarios to item', error);
    }
  } catch (error) {
    return handleError('adding scenarios to item', error);
  }
};

/**
 * Remove scenarios from an item
 */
export const removeScenariosFromItem = async (itemId: string, scenarioIds: string[]): Promise<void> => {
  try {
    // Delete from join table
    const { error } = await supabase
      .from(WARDROBE_ITEM_SCENARIOS_TABLE)
      .delete()
      .eq('item_id', itemId)
      .in('scenario_id', scenarioIds);
      
    if (error) {
      return handleError('removing scenarios from item', error);
    }
  } catch (error) {
    return handleError('removing scenarios from item', error);
  }
};

/**
 * Replace all scenarios for an item
 */
export const replaceItemScenarios = async (itemId: string, scenarioIds: string[]): Promise<void> => {
  try {
    
    // First remove all existing scenarios for this item
    const { error: deleteError } = await supabase
      .from(WARDROBE_ITEM_SCENARIOS_TABLE)
      .delete()
      .eq('item_id', itemId);
      
    if (deleteError) {
      return handleError('removing item scenarios', deleteError);
    }
    
    // Then add the new scenarios if there are any
    if (scenarioIds.length > 0) {
      await addScenariosToItem(itemId, scenarioIds);
    }
  } catch (error) {
    return handleError('replacing item scenarios', error);
  }
};
