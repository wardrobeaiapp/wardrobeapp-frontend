/**
 * Service for handling capsule join table operations
 */

import { supabase } from '../../core';
import {
  CAPSULE_ITEMS_TABLE,
  CAPSULE_SCENARIOS_TABLE,
  cacheState,
  getCurrentUser
} from './capsuleBaseService';

/**
 * Add item to capsule
 */
export const addItemToCapsule = async (capsuleId: string, itemId: string): Promise<boolean> => {
  // Track if we should be logging details
  const now = Date.now();
  const shouldLog = now - cacheState.lastQueryLogTime > 500;
  cacheState.lastQueryLogTime = now;
  
  if (shouldLog) {
    console.log('ud83dudcdd [DATABASE] Adding item to capsule:', { capsuleId, itemId });
  }
  
  try {
    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      console.warn('u26a0ufe0f [DATABASE] No authenticated user');
      return false;
    }
    
    // Insert new relationship
    const { error } = await supabase
      .from(CAPSULE_ITEMS_TABLE)
      .upsert({ capsule_id: capsuleId, item_id: itemId }, { onConflict: 'capsule_id,item_id' });
    
    if (error) {
      console.error('u274c [DATABASE] Error adding item to capsule:', error);
      return false;
    }
    
    if (shouldLog) {
      console.log('u2705 [DATABASE] Successfully added item to capsule');
    }
    
    return true;
  } catch (error) {
    console.error('u274c [DATABASE] Error adding item to capsule:', error);
    return false;
  }
};

/**
 * Remove item from capsule
 */
export const removeItemFromCapsule = async (capsuleId: string, itemId: string): Promise<boolean> => {
  // Track if we should be logging details
  const now = Date.now();
  const shouldLog = now - cacheState.lastQueryLogTime > 500;
  cacheState.lastQueryLogTime = now;
  
  if (shouldLog) {
    console.log('ud83dudcdd [DATABASE] Removing item from capsule:', { capsuleId, itemId });
  }
  
  try {
    // Delete the relationship
    const { error } = await supabase
      .from(CAPSULE_ITEMS_TABLE)
      .delete()
      .eq('capsule_id', capsuleId)
      .eq('item_id', itemId);
    
    if (error) {
      console.error('u274c [DATABASE] Error removing item from capsule:', error);
      return false;
    }
    
    if (shouldLog) {
      console.log('u2705 [DATABASE] Successfully removed item from capsule');
    }
    
    return true;
  } catch (error) {
    console.error('u274c [DATABASE] Error removing item from capsule:', error);
    return false;
  }
};

/**
 * Add scenario to capsule
 */
export const addScenarioToCapsule = async (capsuleId: string, scenarioId: string): Promise<boolean> => {
  // Track if we should be logging details
  const now = Date.now();
  const shouldLog = now - cacheState.lastQueryLogTime > 500;
  cacheState.lastQueryLogTime = now;
  
  if (shouldLog) {
    console.log('ud83dudcdd [DATABASE] Adding scenario to capsule:', { capsuleId, scenarioId });
  }
  
  try {
    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      console.warn('u26a0ufe0f [DATABASE] No authenticated user');
      return false;
    }
    
    // Insert new relationship
    const { error } = await supabase
      .from(CAPSULE_SCENARIOS_TABLE)
      .upsert({ capsule_id: capsuleId, scenario_id: scenarioId }, { onConflict: 'capsule_id,scenario_id' });
    
    if (error) {
      console.error('u274c [DATABASE] Error adding scenario to capsule:', error);
      return false;
    }
    
    if (shouldLog) {
      console.log('u2705 [DATABASE] Successfully added scenario to capsule');
    }
    
    return true;
  } catch (error) {
    console.error('u274c [DATABASE] Error adding scenario to capsule:', error);
    return false;
  }
};

/**
 * Remove scenario from capsule
 */
export const removeScenarioFromCapsule = async (capsuleId: string, scenarioId: string): Promise<boolean> => {
  // Track if we should be logging details
  const now = Date.now();
  const shouldLog = now - cacheState.lastQueryLogTime > 500;
  cacheState.lastQueryLogTime = now;
  
  if (shouldLog) {
    console.log('ud83dudcdd [DATABASE] Removing scenario from capsule:', { capsuleId, scenarioId });
  }
  
  try {
    // Delete the relationship
    const { error } = await supabase
      .from(CAPSULE_SCENARIOS_TABLE)
      .delete()
      .eq('capsule_id', capsuleId)
      .eq('scenario_id', scenarioId);
    
    if (error) {
      console.error('u274c [DATABASE] Error removing scenario from capsule:', error);
      return false;
    }
    
    if (shouldLog) {
      console.log('u2705 [DATABASE] Successfully removed scenario from capsule');
    }
    
    return true;
  } catch (error) {
    console.error('u274c [DATABASE] Error removing scenario from capsule:', error);
    return false;
  }
};

/**
 * Set main item for capsule
 */
export const setMainItemForCapsule = async (capsuleId: string, itemId: string | null): Promise<boolean> => {
  // Track if we should be logging details
  const now = Date.now();
  const shouldLog = now - cacheState.lastQueryLogTime > 500;
  cacheState.lastQueryLogTime = now;
  
  if (shouldLog) {
    console.log('ud83dudcdd [DATABASE] Setting main item for capsule:', { capsuleId, itemId });
  }
  
  try {
    // Update the capsule with the new main item
    const { error } = await supabase
      .from('capsules')
      .update({ main_item_id: itemId })
      .eq('id', capsuleId);
    
    if (error) {
      console.error('u274c [DATABASE] Error setting main item for capsule:', error);
      return false;
    }
    
    if (shouldLog) {
      console.log('u2705 [DATABASE] Successfully set main item for capsule');
    }
    
    return true;
  } catch (error) {
    console.error('u274c [DATABASE] Error setting main item for capsule:', error);
    return false;
  }
};

/**
 * Get items in capsule
 */
export const getItemsInCapsule = async (capsuleId: string): Promise<string[]> => {
  try {
    // Query the join table
    const { data, error } = await supabase
      .from(CAPSULE_ITEMS_TABLE)
      .select('item_id')
      .eq('capsule_id', capsuleId);
    
    if (error) {
      console.error('u274c [DATABASE] Error getting items in capsule:', error);
      return [];
    }
    
    // Extract item IDs and explicitly cast to string array
    return data.map(record => record.item_id as string);
  } catch (error) {
    console.error('u274c [DATABASE] Error getting items in capsule:', error);
    return [];
  }
};

/**
 * Get scenarios for capsule
 */
export const getScenariosForCapsule = async (capsuleId: string): Promise<string[]> => {
  try {
    // Query the join table
    const { data, error } = await supabase
      .from(CAPSULE_SCENARIOS_TABLE)
      .select('scenario_id')
      .eq('capsule_id', capsuleId);
    
    if (error) {
      console.error('u274c [DATABASE] Error getting scenarios for capsule:', error);
      return [];
    }
    
    // Extract scenario IDs and explicitly cast to string array
    return data.map(record => record.scenario_id as string);
  } catch (error) {
    console.error('u274c [DATABASE] Error getting scenarios for capsule:', error);
    return [];
  }
};
