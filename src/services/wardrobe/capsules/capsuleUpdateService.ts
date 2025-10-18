/**
 * Service for updating capsules
 */

import { Capsule } from '../../../types';
import { supabase } from '../../core';
import {
  CAPSULES_TABLE,
  API_URL,
  getAuthHeaders,
  apiRequest
} from './capsuleBaseService';
import { 
  updateCacheWithCapsule, 
  manageCapsuleScenarios,
  getGuestModeCapsules,
  updateGuestModeCapsule
} from './capsuleUtils';
import { updateCapsuleItems } from './capsuleItemUtils';
import { getUserContext, prepareDbCapsule } from './capsuleCrudHelpers';
import { 
  tryLegacyApiStrategy,
  tryGuestModeStrategy,
  executeWithFallbacks
} from './capsuleFallbackStrategies';
import { fetchCapsulesFromDB } from './capsuleQueryService';

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
  // Get the user context (user, isGuestMode, shouldLog)
  const { user, isGuestMode, shouldLog } = await getUserContext();
  
  if (shouldLog) {
    console.log('ud83dudcdd [INFO] Updating capsule:', { id, name: capsule.name });
  }
  
  // Execute with fallback strategies
  return executeWithFallbacks(
    // Primary function: Update in database
    async () => {
      // Prepare the database record with only the fields that are being updated
      const dbCapsule = prepareDbCapsule(capsule, user?.id, isGuestMode);
      
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
          console.error('u274c [ERROR] Database error updating capsule:', error);
          throw error;
        }
        
        if (shouldLog) {
          console.log('u2705 [SUCCESS] Capsule updated successfully in database');
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
      const freshCapsules = await fetchCapsulesFromDB();
      updatedCapsule = freshCapsules.find((c: Capsule) => c.id === id) || null;
      
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
        } else if (shouldLog) {
          console.warn('u26a0ufe0f [WARNING] Capsule not found in local storage:', id);
        }
      }
      
      // Update cache if we have an updated capsule
      if (updatedCapsule) {
        updateCacheWithCapsule(updatedCapsule);
      }
      
      return updatedCapsule || null;
    },
    // Fallback strategies in order of preference
    [
      // First fallback: Try legacy API
      async () => {
        // First try to update
        await tryLegacyApiStrategy('PUT', `/capsules/${id}`, capsule);
        
        // Then try to fetch the updated capsule
        try {
          const headers = await getAuthHeaders();
          const updatedCapsule = await apiRequest<Capsule>(`${API_URL}/capsules/${id}`, { headers });
          return updatedCapsule;
        } catch (fetchError) {
          console.error('u274c [ERROR] Legacy API fetch failed for updated capsule:', fetchError);
          return null;
        }
      },
      // Second fallback: Try guest mode storage if applicable
      async () => await tryGuestModeStrategy('update', capsule, id)
    ],
    // No final fallback for update (returns null if all else fails)
    undefined
  );
};
