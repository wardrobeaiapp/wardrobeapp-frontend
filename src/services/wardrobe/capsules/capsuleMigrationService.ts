/**
 * Migration utilities for capsules
 */

import { Capsule } from '../../../types';
import { supabase } from '../../core';
import {
  CAPSULES_TABLE,
  CAPSULE_ITEMS_TABLE,
  CAPSULE_SCENARIOS_TABLE,
  cacheState,
  apiRequest,
  getAuthHeaders,
  API_URL,
  getCurrentUser
} from './capsuleBaseService';

/**
 * Migrate capsules from API to Supabase
 */
export const migrateCapsulesToSupabase = async (capsules: Capsule[]): Promise<void> => {
  // Track if we should be logging details
  const now = Date.now();
  const shouldLog = now - cacheState.lastQueryLogTime > 500;
  cacheState.lastQueryLogTime = now;
  
  if (shouldLog) {
    console.log('🔄 [MIGRATION] Migrating capsules to Supabase:', { count: capsules.length });
  }
  
  try {
    // Get current user
    const user = await getCurrentUser();
    
    if (!user) {
      console.warn('⚠️ [MIGRATION] No authenticated user for migration');
      return;
    }
    
    const userId = user.id;
    
    // Prepare capsules data for Supabase
    const capsulesData = capsules.map(capsule => ({
      id: capsule.id,
      name: capsule.name,
      seasons: Array.isArray(capsule.seasons) ? capsule.seasons : null,
      // Note: scenarios column has been removed, now using capsule_scenarios table only
      selected_items: Array.isArray(capsule.selectedItems) ? capsule.selectedItems : null,
      main_item_id: capsule.mainItemId || null,
      date_created: capsule.dateCreated,
      user_id: userId
    }));
    
    // Insert capsules into Supabase
    const { error } = await supabase
      .from(CAPSULES_TABLE)
      .upsert(capsulesData);
      
    if (error) {
      console.error('❌ [MIGRATION] Error inserting capsules:', error);
      throw error;
    }
    
    if (shouldLog) {
      console.log('✅ [MIGRATION] Successfully migrated capsules to Supabase');
    }
    
    // Create join table records for items and scenarios
    for (const capsule of capsules) {
      // Handle items
      if (capsule.selectedItems && capsule.selectedItems.length > 0) {
        const itemRecords = capsule.selectedItems.map(itemId => ({
          capsule_id: capsule.id,
          item_id: itemId
        }));
        
        const { error: itemsError } = await supabase
          .from(CAPSULE_ITEMS_TABLE)
          .upsert(itemRecords, { onConflict: 'capsule_id,item_id' });
        
        if (itemsError) {
          console.warn('⚠️ [MIGRATION] Error migrating capsule items:', itemsError);
        }
      }
      
      // Handle scenarios
      if (capsule.scenarios && capsule.scenarios.length > 0) {
        const scenarioRecords = capsule.scenarios.map(scenarioId => ({
          capsule_id: capsule.id,
          scenario_id: scenarioId
        }));
        
        const { error: scenariosError } = await supabase
          .from(CAPSULE_SCENARIOS_TABLE)
          .upsert(scenarioRecords, { onConflict: 'capsule_id,scenario_id' });
        
        if (scenariosError) {
          console.warn('⚠️ [MIGRATION] Error migrating capsule scenarios:', scenariosError);
        }
      }
    }
    
    // Update cache
    cacheState.capsulesCache.data = capsules;
    cacheState.capsulesCache.timestamp = Date.now();
    
    if (shouldLog) {
      console.log('🔄 [CACHE] Updated cache with migrated data');
    }
  } catch (error) {
    console.error('❌ [MIGRATION] Error during capsule migration:', error);
    throw error;
  }
};

/**
 * Fetch capsules from legacy API
 */
export const fetchCapsulesFromLegacyApi = async (): Promise<Capsule[]> => {
  try {
    console.log('🔍 [LEGACY] Attempting to fetch capsules from legacy API');
    const headers = await getAuthHeaders();
    const legacyCapsules = await apiRequest<Capsule[]>(`${API_URL}/capsules`, { headers });
    
    console.log('✅ [LEGACY] Successfully fetched capsules from legacy API:', { count: legacyCapsules.length });
    return legacyCapsules;
  } catch (error) {
    console.error('❌ [LEGACY] Error fetching from legacy API:', error);
    return [];
  }
};

/**
 * Migrate capsules from local storage to Supabase
 */
export const migrateLocalStorageCapsulesToSupabase = async (): Promise<void> => {
  try {
    console.log('🔄 [MIGRATION] Migrating local storage capsules to Supabase');
    
    // Get capsules from local storage
    const storedCapsules = localStorage.getItem('guestCapsules');
    if (!storedCapsules) {
      console.log('ℹ️ [MIGRATION] No local storage capsules found');
      return;
    }
    
    // Parse local storage capsules
    const capsules: Capsule[] = JSON.parse(storedCapsules);
    if (!Array.isArray(capsules) || capsules.length === 0) {
      console.log('ℹ️ [MIGRATION] No valid capsules in local storage');
      return;
    }
    
    // Migrate to Supabase
    await migrateCapsulesToSupabase(capsules);
    
    console.log('✅ [MIGRATION] Successfully migrated local storage capsules to Supabase');
    
    // Clear local storage capsules after successful migration
    localStorage.removeItem('guestCapsules');
    console.log('🗑️ [MIGRATION] Cleared local storage capsules after migration');
  } catch (error) {
    console.error('❌ [MIGRATION] Error migrating local storage capsules:', error);
  }
};
