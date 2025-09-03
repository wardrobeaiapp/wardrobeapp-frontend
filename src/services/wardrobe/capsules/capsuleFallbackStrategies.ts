/**
 * Fallback strategies for capsule operations when primary operations fail
 */

import { Capsule } from '../../../types';
import {
  API_URL,
  getAuthHeaders,
  apiRequest,
  isGuestModeEnabled
} from './capsuleBaseService';
import {
  getGuestModeCapsules,
  updateGuestModeCapsule,
  removeGuestModeCapsule,
  shouldLogDetails
} from './capsuleUtils';
import { v4 as uuidv4 } from 'uuid';

/**
 * Try the legacy API as a fallback when database operations fail
 */
export const tryLegacyApiStrategy = async (
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  endpoint: string,
  data?: any
): Promise<any> => {
  const shouldLog = shouldLogDetails();
  
  try {
    if (shouldLog) {
      console.log(`\ud83d\udd0d [LEGACY] Attempting ${method} operation via legacy API:`, endpoint);
    }
    
    const headers = getAuthHeaders();
    const options: any = { method, headers };
    
    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(data);
    }
    
    const result = await apiRequest(`${API_URL}${endpoint}`, options);
    
    if (shouldLog) {
      console.log(`\u2705 [LEGACY] Successfully completed ${method} operation via legacy API`);
    }
    
    return result;
  } catch (legacyError) {
    console.error(`\u274c [LEGACY] Error in legacy API fallback for ${method}:`, legacyError);
    return null;
  }
};

/**
 * Try local storage as a fallback for guest mode operations
 */
export const tryGuestModeStrategy = async <T extends Partial<Capsule>>(
  operation: 'create' | 'update' | 'delete',
  capsuleData?: T,
  capsuleId?: string
): Promise<Capsule | null> => {
  const shouldLog = shouldLogDetails();
  
  if (!isGuestModeEnabled()) {
    return null;
  }
  
  try {
    if (shouldLog) {
      console.log(`\ud83d\udcbe [LOCAL] Attempting ${operation} operation in local storage`);
    }
    
    switch (operation) {
      case 'create':
        if (!capsuleData) return null;
        
        const newCapsule: Capsule = {
          ...capsuleData as any,
          id: uuidv4(),
          dateCreated: new Date().toISOString()
        } as Capsule;
        
        updateGuestModeCapsule(newCapsule);
        return newCapsule;
        
      case 'update':
        if (!capsuleData || !capsuleId) return null;
        
        // Get the current capsule from local storage to merge with updates
        const capsules = getGuestModeCapsules();
        const existingCapsule = capsules.find(c => c.id === capsuleId);
        
        if (existingCapsule) {
          // Create updated capsule by merging the old one with the updates
          const mergedCapsule = {
            ...existingCapsule,
            ...capsuleData,
            // Ensure arrays are properly handled
            seasons: capsuleData.seasons || existingCapsule.seasons,
            scenarios: capsuleData.scenarios || existingCapsule.scenarios || [],
            selectedItems: capsuleData.selectedItems || existingCapsule.selectedItems
          };
          
          updateGuestModeCapsule(mergedCapsule);
          return mergedCapsule;
        }
        return null;
        
      case 'delete':
        if (!capsuleId) return null;
        removeGuestModeCapsule(capsuleId);
        return {} as Capsule; // Return empty object to indicate success
        
      default:
        return null;
    }
  } catch (error) {
    console.error(`\u274c [LOCAL] Error in guest mode fallback for ${operation}:`, error);
    return null;
  }
};

/**
 * Create a client-side-only capsule as a last resort
 */
export const createClientOnlyCapsule = (capsuleData: Partial<Capsule>): Capsule => {
  return {
    ...capsuleData as any,
    id: `local-capsule-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    dateCreated: new Date().toISOString()
  } as Capsule;
};

/**
 * Execute operation with multiple fallback strategies
 */
export const executeWithFallbacks = async <T>(
  primaryFn: () => Promise<T>,
  fallbacks: Array<() => Promise<T | null>>,
  finalFallback?: () => T
): Promise<T> => {
  try {
    // Try primary function first
    return await primaryFn();
  } catch (primaryError) {
    // Log primary error
    console.error('\u274c [ERROR] Primary operation failed:', primaryError);
    
    // Try each fallback in sequence
    for (const fallbackFn of fallbacks) {
      try {
        const result = await fallbackFn();
        if (result !== null) {
          return result as T;
        }
      } catch (fallbackError) {
        // Log and continue to next fallback
        console.error('\u274c [ERROR] Fallback operation failed:', fallbackError);
      }
    }
    
    // If all fallbacks fail and we have a final fallback, use it
    if (finalFallback) {
      console.log('\ud83d\udca1 [FALLBACK] Using final client-side fallback');
      return finalFallback();
    }
    
    // If no final fallback, re-throw the primary error
    throw primaryError;
  }
};
