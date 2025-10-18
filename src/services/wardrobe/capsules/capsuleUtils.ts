/**
 * Shared utilities for capsule operations
 */

import { Capsule } from '../../../types';
import { supabase } from '../../core';
import {
  CAPSULE_SCENARIOS_TABLE,
  cacheState,
  getCurrentUser,
  isGuestModeEnabled,
  getAuthHeaders,
  apiRequest,
  API_URL
} from './capsuleBaseService';

/**
 * Logging utility to prevent log spam during rapid operations
 * @returns Whether details should be logged
 */
export const shouldLogDetails = (): boolean => {
  const now = Date.now();
  const shouldLog = now - cacheState.lastQueryLogTime > 500;
  cacheState.lastQueryLogTime = now;
  return shouldLog;
};

/**
 * Update the in-memory cache with a new or updated capsule
 * @param capsule The capsule to add or update in cache
 */
export const updateCacheWithCapsule = (capsule: Capsule): void => {
  if (!cacheState.capsulesCache.data) return;
  
  const shouldLog = shouldLogDetails();
  
  if (shouldLog) {
    console.log('🔄 [CACHE] Updating cache with capsule:', { id: capsule.id });
  }
  
  const index = cacheState.capsulesCache.data.findIndex(c => c.id === capsule.id);
  
  if (index >= 0) {
    // Update existing capsule
    cacheState.capsulesCache.data[index] = capsule;
  } else {
    // Add new capsule
    cacheState.capsulesCache.data.push(capsule);
  }
  
  cacheState.capsulesCache.timestamp = Date.now();
  
  if (shouldLog) {
    console.log('✅ [CACHE] Cache updated');
  }
};

/**
 * Remove a capsule from the in-memory cache
 * @param capsuleId ID of capsule to remove
 */
export const removeCapsuleFromCache = (capsuleId: string): void => {
  if (!cacheState.capsulesCache.data) return;
  
  const shouldLog = shouldLogDetails();
  
  if (shouldLog) {
    console.log('🔄 [CACHE] Removing capsule from cache:', { id: capsuleId });
  }
  
  cacheState.capsulesCache.data = cacheState.capsulesCache.data.filter(c => c.id !== capsuleId);
  cacheState.capsulesCache.timestamp = Date.now();
  
  if (shouldLog) {
    console.log('✅ [CACHE] Cache updated after removal');
  }
};

/**
 * Get capsule from guest mode local storage
 * @returns Array of capsules from local storage
 */
export const getGuestModeCapsules = (): Capsule[] => {
  const storedCapsules = localStorage.getItem('guestCapsules');
  if (!storedCapsules) return [];
  
  try {
    const capsules = JSON.parse(storedCapsules);
    return Array.isArray(capsules) ? capsules : [];
  } catch (e) {
    console.error('❌ [LOCAL] Error parsing stored capsules:', e);
    return [];
  }
};

/**
 * Save capsules to guest mode local storage
 * @param capsules Array of capsules to save
 */
export const saveGuestModeCapsules = (capsules: Capsule[]): void => {
  localStorage.setItem('guestCapsules', JSON.stringify(capsules));
};

/**
 * Add or update a capsule in guest mode local storage
 * @param capsule Capsule to add or update
 */
export const updateGuestModeCapsule = (capsule: Capsule): void => {
  const shouldLog = shouldLogDetails();
  
  if (shouldLog) {
    console.log('💾 [LOCAL] Updating capsule in local storage for guest mode');
  }
  
  const capsules = getGuestModeCapsules();
  const index = capsules.findIndex(c => c.id === capsule.id);
  
  if (index >= 0) {
    // Update existing capsule
    capsules[index] = capsule;
  } else {
    // Add new capsule
    capsules.push(capsule);
  }
  
  saveGuestModeCapsules(capsules);
  
  if (shouldLog) {
    console.log('✅ [LOCAL] Successfully updated in local storage');
  }
};

/**
 * Remove a capsule from guest mode local storage
 * @param capsuleId ID of capsule to remove
 */
export const removeGuestModeCapsule = (capsuleId: string): void => {
  const shouldLog = shouldLogDetails();
  
  if (shouldLog) {
    console.log('📂 [LOCAL] Removing capsule from local storage');
  }
  
  const capsules = getGuestModeCapsules();
  const updatedCapsules = capsules.filter(c => c.id !== capsuleId);
  saveGuestModeCapsules(updatedCapsules);
  
  if (shouldLog) {
    console.log('✅ [LOCAL] Successfully updated local storage');
  }
};

/**
 * Manage scenarios for a capsule (create/update scenarios)
 * @param capsuleId The capsule ID
 * @param scenarios Array of scenario IDs to associate with the capsule
 * @returns True if successful, false if there were errors
 */
export const manageCapsuleScenarios = async (
  capsuleId: string,
  scenarios: string[],
  isUpdate: boolean = false
): Promise<boolean> => {
  const shouldLog = shouldLogDetails();
  const user = await getCurrentUser();
  const isGuestMode = !user && isGuestModeEnabled();
  
  if (shouldLog) {
    console.log(`🔄 [DATABASE] ${isUpdate ? 'Updating' : 'Creating'} scenarios for capsule:`, {
      capsuleId,
      scenarios,
      isGuestMode
    });
  }
  
  // If guest mode, we don't need to do database operations
  if (isGuestMode) {
    if (shouldLog) {
      console.log('👤 [GUEST] Updating scenarios in local cache');
    }
    return true;
  }
  
  // If updating, first delete existing scenarios
  if (isUpdate) {
    try {
      const { error: deleteError } = await supabase
        .from(CAPSULE_SCENARIOS_TABLE)
        .delete()
        .eq('capsule_id', capsuleId);
        
      if (deleteError) {
        console.error('❌ [DATABASE] Error deleting existing scenarios:', deleteError);
      } else if (shouldLog) {
        console.log('✅ [DATABASE] Deleted existing scenarios for capsule:', capsuleId);
      }
    } catch (err) {
      console.warn('⚠️ [DATABASE] Failed to delete existing scenarios:', err);
    }
  }
  
  // If no scenarios to add, we're done
  if (!scenarios.length) {
    return true;
  }
  
  // Insert scenarios one by one to avoid RLS batch issues
  let insertedCount = 0;
  let hasErrors = false;
  
  for (const scenarioId of scenarios) {
    const scenarioInsert = {
      capsule_id: capsuleId,
      scenario_id: scenarioId,
      user_id: user?.id
    };
    
    if (shouldLog) {
      console.log('🔍 [DATABASE] Inserting scenario:', {
        table: CAPSULE_SCENARIOS_TABLE,
        capsule_id: capsuleId,
        scenario_id: scenarioId,
        user_id: isGuestMode ? 'guest' : user?.id || null
      });
    }
    
    const { error: scenarioError } = await supabase
      .from(CAPSULE_SCENARIOS_TABLE)
      .insert(scenarioInsert);
    
    if (scenarioError) {
      console.warn('⚠️ [DATABASE] Warning: Could not insert scenario:', {
        scenarioId,
        error: scenarioError
      });
      hasErrors = true;
    } else {
      insertedCount++;
    }
  }
  
  // Summary logging
  if (hasErrors) {
    console.warn('⚠️ [DATABASE] Warning: Inserted ' + insertedCount + ' of ' + 
      scenarios.length + ' scenarios with some errors');
  } else if (shouldLog) {
    console.log('✅ [DATABASE] Successfully inserted all ' + insertedCount + ' scenarios');
  }
  
  return !hasErrors;
};

/**
 * Try to use the legacy API as a fallback for database operations
 * @param method The HTTP method to use (POST, PUT, DELETE)
 * @param endpoint The API endpoint to call (will be appended to API_URL)
 * @param data Optional data to send in the request body
 * @returns The API response data if successful, null if failed
 */
export const tryLegacyApiFallback = async (
  method: 'POST'|'PUT'|'DELETE', 
  endpoint: string, 
  data?: any
): Promise<any> => {
  try {
    const headers = await getAuthHeaders();
    const options: any = { method, headers };
    
    if (data) {
      options.body = JSON.stringify(data);
    }
    
    const result = await apiRequest(`${API_URL}${endpoint}`, options);
    console.log(`✅ [LEGACY] Successfully ${method === 'POST' ? 'created' : method === 'PUT' ? 'updated' : 'deleted'} via legacy API`);
    return result;
  } catch (legacyError) {
    console.error(`❌ [LEGACY] Error in legacy API fallback for ${method}:`, legacyError);
    return null;
  }
};
