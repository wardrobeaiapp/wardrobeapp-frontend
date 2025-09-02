/**
 * Service for outfit relations management
 * Handles operations on join tables for outfit items and scenarios
 */

import { supabase } from '../../../services/core';
import {
  OUTFIT_ITEMS_TABLE,
  OUTFIT_SCENARIOS_TABLE,
  handleError,
  getCurrentUserId
} from './outfitBaseService';

/**
 * Get all items for a specific outfit
 */
export const getOutfitItems = async (outfitId: string): Promise<string[]> => {
  try {
    const userId = await getCurrentUserId();
    
    // Fetch items from join table
    const { data, error } = await supabase
      .from(OUTFIT_ITEMS_TABLE)
      .select('item_id')
      .eq('outfit_id', outfitId)
      .eq('user_id', userId);
      
    if (error) {
      return handleError('fetching outfit items', error);
    }
    
    // Extract item IDs
    return data ? data.map(item => String(item.item_id)) : [];
  } catch (error) {
    console.error('[outfitService] Error getting outfit items:', error);
    return [];
  }
};

/**
 * Get all scenarios for a specific outfit
 */
export const getOutfitScenarios = async (outfitId: string): Promise<string[]> => {
  try {
    // Fetch scenarios from join table
    const { data, error } = await supabase
      .from(OUTFIT_SCENARIOS_TABLE)
      .select('scenario_id')
      .eq('outfit_id', outfitId);
      
    if (error) {
      return handleError('fetching outfit scenarios', error);
    }
    
    // Extract scenario IDs
    return data ? data.map(scenario => String(scenario.scenario_id)) : [];
  } catch (error) {
    console.error('[outfitService] Error getting outfit scenarios:', error);
    return [];
  }
};

/**
 * Add items to an outfit
 */
export const addItemsToOutfit = async (outfitId: string, itemIds: string[]): Promise<void> => {
  try {
    const userId = await getCurrentUserId();
    
    // Create records for the join table
    const itemRecords = itemIds.map(itemId => ({
      outfit_id: outfitId,
      item_id: itemId,
      user_id: userId
    }));
    
    // Insert into the join table
    const { error } = await supabase
      .from(OUTFIT_ITEMS_TABLE)
      .upsert(itemRecords, { onConflict: 'outfit_id,item_id' });
      
    if (error) {
      return handleError('adding items to outfit', error);
    }
  } catch (error) {
    return handleError('adding items to outfit', error);
  }
};

/**
 * Remove items from an outfit
 */
export const removeItemsFromOutfit = async (outfitId: string, itemIds: string[]): Promise<void> => {
  try {
    const userId = await getCurrentUserId();
    
    // Delete from join table
    const { error } = await supabase
      .from(OUTFIT_ITEMS_TABLE)
      .delete()
      .eq('outfit_id', outfitId)
      .eq('user_id', userId)
      .in('item_id', itemIds);
      
    if (error) {
      return handleError('removing items from outfit', error);
    }
  } catch (error) {
    return handleError('removing items from outfit', error);
  }
};

/**
 * Add scenarios to an outfit
 */
export const addScenariosToOutfit = async (outfitId: string, scenarioIds: string[]): Promise<void> => {
  try {
    const userId = await getCurrentUserId();
    
    // Create records for the scenarios join table
    const scenarioRecords = scenarioIds.map(scenarioId => ({
      outfit_id: outfitId,
      scenario_id: scenarioId,
      user_id: userId
    }));
    
    // Insert one at a time to isolate any problematic records
    for (const record of scenarioRecords) {
      const { error } = await supabase
        .from(OUTFIT_SCENARIOS_TABLE)
        .insert(record);
        
      if (error) {
        console.warn('[outfitService] Error inserting scenario:', error);
      }
    }
  } catch (error) {
    return handleError('adding scenarios to outfit', error);
  }
};

/**
 * Remove scenarios from an outfit
 */
export const removeScenariosFromOutfit = async (outfitId: string, scenarioIds: string[]): Promise<void> => {
  try {
    // Delete from join table
    const { error } = await supabase
      .from(OUTFIT_SCENARIOS_TABLE)
      .delete()
      .eq('outfit_id', outfitId)
      .in('scenario_id', scenarioIds);
      
    if (error) {
      return handleError('removing scenarios from outfit', error);
    }
  } catch (error) {
    return handleError('removing scenarios from outfit', error);
  }
};

/**
 * Replace all items in an outfit
 */
export const replaceOutfitItems = async (outfitId: string, itemIds: string[]): Promise<void> => {
  try {
    const userId = await getCurrentUserId();
    
    // First remove all existing items for this outfit
    const { error: deleteError } = await supabase
      .from(OUTFIT_ITEMS_TABLE)
      .delete()
      .eq('outfit_id', outfitId)
      .eq('user_id', userId);
      
    if (deleteError) {
      return handleError('removing outfit items', deleteError);
    }
    
    // Then add the new items if there are any
    if (itemIds.length > 0) {
      await addItemsToOutfit(outfitId, itemIds);
    }
  } catch (error) {
    return handleError('replacing outfit items', error);
  }
};

/**
 * Replace all scenarios in an outfit
 */
export const replaceOutfitScenarios = async (outfitId: string, scenarioIds: string[]): Promise<void> => {
  try {
    // First remove all existing scenarios for this outfit
    const { error: deleteError } = await supabase
      .from(OUTFIT_SCENARIOS_TABLE)
      .delete()
      .eq('outfit_id', outfitId);
      
    if (deleteError) {
      return handleError('removing outfit scenarios', deleteError);
    }
    
    // Then add the new scenarios if there are any
    if (scenarioIds.length > 0) {
      await addScenariosToOutfit(outfitId, scenarioIds);
    }
  } catch (error) {
    return handleError('replacing outfit scenarios', error);
  }
};
