/**
 * Core CRUD operations for capsules
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
  isGuestModeEnabled,
  getCurrentUser,
  API_URL
} from './capsuleBaseService';
import { v4 as uuidv4 } from 'uuid';
import { fetchCapsulesFromDB } from './capsuleQueryService';
import { 
  shouldLogDetails, 
  updateCacheWithCapsule, 
  updateGuestModeCapsule,
  getGuestModeCapsules,
  manageCapsuleScenarios,
  removeCapsuleFromCache,
  removeGuestModeCapsule,
  tryLegacyApiFallback
} from './capsuleUtils';
import { updateCapsuleItems } from './capsuleItemUtils';

/**
 * Fetches all capsules for the current user with smart caching
 * 
 * @remarks
 * This function uses a caching mechanism to reduce database queries:
 * - Returns cached data if it's less than 5 minutes old
 * - Prevents duplicate fetches if a request is already in progress
 * - Updates the cache with fresh data when needed
 * 
 * @returns Promise resolving to an array of Capsule objects
 */
export const fetchCapsules = async (): Promise<Capsule[]> => {
  // Check if we have cached data that's less than 5 minutes old
  const now = Date.now();
  const cacheAge = now - cacheState.capsulesCache.timestamp;
  const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds
  
  if (cacheState.capsulesCache.data && cacheAge < CACHE_TTL) {
    console.log('🔄 [CACHE] Using cached capsules data - No database query needed');
    return cacheState.capsulesCache.data as Capsule[];
  }
  
  // If there's already a fetch in progress, wait for it instead of starting a new one
  if (cacheState.capsulesFetchInProgress) {
    console.log('⏳ [PENDING] Another fetch already in progress - Waiting for completion');
    return cacheState.capsulesFetchInProgress as Promise<Capsule[]>;
  }
  
  // Create a new fetch promise and store it in the module-level variable
  console.log('🔍 [DATABASE] Cache miss - Fetching fresh data from database');
  cacheState.capsulesFetchInProgress = fetchCapsulesFromDB();
  
  try {
    // Wait for the fetch to complete
    const result = await cacheState.capsulesFetchInProgress;
    return result as Capsule[];
  } finally {
    // Clear the in-progress flag when done (success or error)
    cacheState.capsulesFetchInProgress = null;
  }
};

/**
 * Creates a new capsule in the database with fallback mechanisms
 * 
 * @remarks
 * This function handles multiple paths for capsule creation:
 * - Primary path: Creates capsule in Supabase database with proper relationships
 * - Guest mode: Stores capsule in local storage if user is not authenticated
 * - Cache update: Updates the application cache for quick access
 * - Legacy fallback: Attempts creation via legacy API if database fails
 * - Client-only fallback: Creates a local-only capsule as last resort
 * 
 * @param capsule - The capsule data without ID or creation date
 * @returns Promise resolving to the created Capsule with generated ID
 */
export const createCapsule = async (capsule: Omit<Capsule, 'id' | 'dateCreated'>): Promise<Capsule> => {
  const shouldLog = shouldLogDetails();
  
  if (shouldLog) {
    console.log('📝 [INFO] Creating new capsule:', { name: capsule.name });
  }
  
  try {
    // Get the current user
    const user = await getCurrentUser();
    
    if (shouldLog) {
      console.log('👤 [DATABASE] User authentication:', { authenticated: !!user });
    }
    
    // Create new capsule with UUID format
    const newCapsule: Capsule = {
      ...capsule,
      id: uuidv4(),
      dateCreated: new Date().toISOString()
    };
    
    // Determine if we're in guest mode
    const isGuestMode = !user && isGuestModeEnabled();
    
    if (shouldLog) {
      console.log('🔑 [DATABASE] Guest mode:', isGuestMode);
    }
    
    // Prepare the database record
    const dbCapsule = {
      id: newCapsule.id,
      name: newCapsule.name,
      description: newCapsule.description || null,
      style: newCapsule.style || null,
      seasons: Array.isArray(newCapsule.seasons) ? newCapsule.seasons : null,
      // Note: scenarios column has been removed, now using capsule_scenarios table only
      selected_items: Array.isArray(newCapsule.selectedItems) ? newCapsule.selectedItems : null,
      main_item_id: newCapsule.mainItemId || null,
      date_created: newCapsule.dateCreated,
      user_id: isGuestMode ? 'guest' : user?.id || null
    };
    
    // If a real user is logged in, or we're in guest mode, save to the database
    if (user || isGuestMode) {
      // First, insert the main capsule record
      const { error } = await supabase
        .from(CAPSULES_TABLE)
        .insert(dbCapsule)
        .select();
      
      if (error) {
        console.error('❌ [ERROR] Database error creating capsule:', error);
        throw error;
      }
      
      if (shouldLog) {
        console.log('✅ [SUCCESS] Capsule created successfully in database');
      }
      
      // Handle join tables for scenarios
      if (newCapsule.scenarios && newCapsule.scenarios.length > 0) {
        await manageCapsuleScenarios(newCapsule.id, newCapsule.scenarios);
      }
      
      // Handle join tables for items
      if (newCapsule.selectedItems && newCapsule.selectedItems.length > 0) {
        await updateCapsuleItems(newCapsule.id, newCapsule.selectedItems);
      }
    }
    
    // If in guest mode, also store in local storage
    if (isGuestMode) {
      updateGuestModeCapsule(newCapsule);
    }
    
    // Update cache with new capsule
    updateCacheWithCapsule(newCapsule);
    
    return newCapsule;
  } catch (error) {
    console.error('❌ [ERROR] Creating capsule failed:', error);
    
    // Try legacy API as fallback
    const legacyResult = await tryLegacyApiFallback('POST', '/capsules', capsule);
    
    if (legacyResult) {
      return legacyResult;
    }
    
    // If all else fails, create a client-side-only capsule
    const clientCapsule: Capsule = {
      ...capsule,
      id: `local-capsule-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      dateCreated: new Date().toISOString()
    };
    
    return clientCapsule;
  }
};

/**
 * Updates an existing capsule with comprehensive fallback strategies
 * 
 * @remarks
 * This function handles capsule updates with multiple fallback mechanisms:
 * - Primary path: Updates capsule in Supabase database and related join tables
 * - Guest mode: Updates capsule in local storage if user is not authenticated
 * - Cache update: Keeps application cache in sync with latest changes
 * - Selective updates: Only updates fields provided in the capsule parameter
 * - Legacy fallback: Attempts update via legacy API if database operation fails
 * 
 * @param id - The unique identifier of the capsule to update
 * @param capsule - Partial capsule data containing only fields to update
 * @returns Promise resolving to the updated Capsule or null if update fails
 */
export const updateCapsule = async (id: string, capsule: Partial<Capsule>): Promise<Capsule | null> => {
  const shouldLog = shouldLogDetails();
  
  if (shouldLog) {
    console.log('📝 [INFO] Updating capsule:', { id, name: capsule.name });
  }
  
  try {
    // Get the current user
    const user = await getCurrentUser();
    
    if (shouldLog) {
      console.log('👤 [DATABASE] User authentication:', { authenticated: !!user });
    }
    
    // Determine if we're in guest mode
    const isGuestMode = !user && isGuestModeEnabled();
    
    if (shouldLog) {
      console.log('🔑 [DATABASE] Guest mode:', isGuestMode);
    }
    
    // Prepare the database record with only the fields that are being updated
    const dbCapsule: Record<string, any> = {};
    
    if (capsule.name !== undefined) dbCapsule.name = capsule.name;
    if (capsule.description !== undefined) dbCapsule.description = capsule.description || null;
    if (capsule.style !== undefined) dbCapsule.style = capsule.style || null;
    if (capsule.seasons !== undefined) dbCapsule.seasons = Array.isArray(capsule.seasons) ? capsule.seasons : null;
    if (capsule.mainItemId !== undefined) dbCapsule.main_item_id = capsule.mainItemId || null;
    
    // Note: scenarios column has been removed, now using capsule_scenarios table only
    if (capsule.selectedItems !== undefined) dbCapsule.selected_items = Array.isArray(capsule.selectedItems) ? capsule.selectedItems : null;
    
    let updatedCapsule: Capsule | null = null;
    
    // Update the database if there are fields to update
    if (Object.keys(dbCapsule).length > 0) {
      // Update the capsule record
      const { error } = await supabase
        .from(CAPSULES_TABLE)
        .update(dbCapsule)
        .eq('id', id)
        .select();
      
      if (error) {
        console.error('❌ [ERROR] Database error updating capsule:', error);
        throw error;
      }
      
      if (shouldLog) {
        console.log('✅ [SUCCESS] Capsule updated successfully in database');
      }
    }
      
    // Handle scenarios if they were provided
    if (capsule.scenarios !== undefined) {
      await manageCapsuleScenarios(id, capsule.scenarios, true); // true means it's an update operation
    }
    
    // Handle item relationships
    if (capsule.selectedItems !== undefined) {
      await updateCapsuleItems(id, capsule.selectedItems);
    }
    
    // Fetch the updated capsule to get the latest data including join tables
    const freshCapsules = await fetchCapsules();
    updatedCapsule = freshCapsules.find(c => c.id === id) || null;
    
    // If in guest mode, also update in local storage
    if (isGuestMode) {
      // Get the current capsule from local storage to merge with updates
      const capsules = getGuestModeCapsules();
      const existingCapsule = capsules.find(c => c.id === id);
      
      if (existingCapsule) {
        // Create updated capsule by merging the old one with the updates
        const mergedCapsule = {
          ...existingCapsule,
          ...capsule,
          // Ensure arrays are properly handled
          seasons: capsule.seasons || existingCapsule.seasons,
          // Scenarios are handled via join table, not in the main capsule record
          scenarios: capsule.scenarios || existingCapsule.scenarios || [],
          selectedItems: capsule.selectedItems || existingCapsule.selectedItems
        };
        
        updateGuestModeCapsule(mergedCapsule);
        
        // If we don't have an updatedCapsule from the database, use the local one
        if (!updatedCapsule) {
          updatedCapsule = mergedCapsule;
        }
      } else {
        console.warn('⚠️ [WARNING] Capsule not found in local storage:', id);
      }
    }
    
    // Update cache if we have an updated capsule
    if (updatedCapsule) {
      updateCacheWithCapsule(updatedCapsule);
    }
    
    return updatedCapsule;
  } catch (error) {
    console.error('❌ [ERROR] Updating capsule failed:', error);
    
    // Try legacy API as fallback
    // First try to update
    await tryLegacyApiFallback('PUT', `/capsules/${id}`, capsule);
    
    // Then try to fetch the updated capsule
    try {
      const headers = getAuthHeaders();
      const updatedCapsule = await apiRequest<Capsule>(`${API_URL}/capsules/${id}`, { headers });
      return updatedCapsule;
    } catch (fetchError) {
      console.error('❌ [ERROR] Legacy API fetch failed for updated capsule:', fetchError);
      return null;
    }
  }
};

/**
 * Deletes a capsule and its related data with multiple fallback strategies
 * 
 * @remarks
 * This function performs a multi-stage deletion process with fallbacks:
 * - Deletes related join table records (capsule_scenarios and capsule_items)
 * - Deletes the main capsule record from the database
 * - Updates the application cache to remove the deleted capsule
 * - Handles guest mode by removing from local storage if needed
 * - Provides legacy API fallback if the database operation fails
 * - Non-blocking approach for join table deletions to improve reliability
 * 
 * @param id - The unique identifier of the capsule to delete
 * @returns Promise that resolves when deletion is complete
 * @throws Will throw an error if all deletion attempts fail
 */
export const deleteCapsule = async (id: string): Promise<void> => {
  const shouldLog = shouldLogDetails();
  
  if (shouldLog) {
    console.log('📝 [INFO] Deleting capsule:', { id });
  }
  
  try {
    // Get the current user
    const user = await getCurrentUser();
    
    if (shouldLog) {
      console.log('👤 [DATABASE] User authentication:', { authenticated: !!user });
    }
    
    // Determine if we're in guest mode
    const isGuestMode = !user && isGuestModeEnabled();
    
    if (shouldLog) {
      console.log('🔑 [DATABASE] Guest mode:', isGuestMode);
    }
    
    // Delete related records first (cascade delete not automatic in Supabase)
    // 1. Delete from the capsule_scenarios join table
    const { error: scenariosError } = await supabase
      .from(CAPSULE_SCENARIOS_TABLE)
      .delete()
      .eq('capsule_id', id);
      
    if (scenariosError) {
      console.warn('⚠️ [WARNING] Could not delete capsule scenarios relationships:', scenariosError);
      // Non-blocking error, continue execution
    } else if (shouldLog) {
      console.log('✅ [SUCCESS] Removed capsule scenarios relationships');
    }
    
    // 2. Delete from capsule_items join table
    const { error: itemsError } = await supabase
      .from(CAPSULE_ITEMS_TABLE)
      .delete()
      .eq('capsule_id', id);
    
    if (itemsError) {
      console.warn('⚠️ [WARNING] Could not delete capsule items relationships:', itemsError);
      // Non-blocking error, continue execution
    } else if (shouldLog) {
      console.log('✅ [SUCCESS] Removed capsule item relationships');
    }
    
    // Finally, delete the capsule itself
    const { error } = await supabase
      .from(CAPSULES_TABLE)
      .delete()
      .eq('id', id);
    
    if (error) {
      // Always log database errors
      console.error('❌ [ERROR] Database error deleting capsule:', error);
      throw error;
    }
    
    if (shouldLog) {
      console.log('✅ [SUCCESS] Capsule deleted successfully from database');
    }
    
    // Remove the deleted capsule from cache
    removeCapsuleFromCache(id);
    
    // If in guest mode, remove from local storage as well
    if (isGuestMode) {
      removeGuestModeCapsule(id);
    }
  } catch (error) {
    // Always log errors
    console.error('❌ [ERROR] Deleting capsule failed:', error);
    
    // Try local storage fallback for guest mode
    if (isGuestModeEnabled()) {
      if (shouldLog) {
        console.log('📂 [INFO] Attempting local storage fallback for guest mode');
      }
      
      // Remove from local storage
      removeGuestModeCapsule(id);
    }
    
    // Try legacy API as fallback
    try {
      await tryLegacyApiFallback('DELETE', `/capsules/${id}`);
      
      if (shouldLog) {
        console.log('✅ [SUCCESS] Capsule deleted via legacy API fallback');
      }
    } catch (legacyError) {
      console.error('❌ [ERROR] Legacy API delete fallback failed:', legacyError);
      throw error; // Re-throw the original error if legacy API also fails
    }
  }

};
