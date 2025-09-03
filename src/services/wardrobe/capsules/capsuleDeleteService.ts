/**
 * Service for deleting capsules
 */

import { supabase } from '../../core';
import {
  CAPSULES_TABLE,
  CAPSULE_ITEMS_TABLE,
  CAPSULE_SCENARIOS_TABLE,
  isGuestModeEnabled
} from './capsuleBaseService';
import { 
  removeCapsuleFromCache, 
  removeGuestModeCapsule, 
  shouldLogDetails 
} from './capsuleUtils';
import { getUserContext } from './capsuleCrudHelpers';
import { tryLegacyApiStrategy, tryGuestModeStrategy } from './capsuleFallbackStrategies';

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
  // Get the user context (user, isGuestMode, shouldLog)
  const { user, isGuestMode, shouldLog } = await getUserContext();
  
  if (shouldLog) {
    console.log('ud83dudcdd [INFO] Deleting capsule:', { id });
  }
  
  try {
    // Delete related records first (cascade delete not automatic in Supabase)
    // 1. Delete from the capsule_scenarios join table
    const { error: scenariosError } = await supabase
      .from(CAPSULE_SCENARIOS_TABLE)
      .delete()
      .eq('capsule_id', id);
      
    if (scenariosError) {
      console.warn('u26a0ufe0f [WARNING] Could not delete capsule scenarios relationships:', scenariosError);
      // Non-blocking error, continue execution
    } else if (shouldLog) {
      console.log('u2705 [SUCCESS] Removed capsule scenarios relationships');
    }
    
    // 2. Delete from capsule_items join table
    const { error: itemsError } = await supabase
      .from(CAPSULE_ITEMS_TABLE)
      .delete()
      .eq('capsule_id', id);
    
    if (itemsError) {
      console.warn('u26a0ufe0f [WARNING] Could not delete capsule items relationships:', itemsError);
      // Non-blocking error, continue execution
    } else if (shouldLog) {
      console.log('u2705 [SUCCESS] Removed capsule item relationships');
    }
    
    // Finally, delete the capsule itself
    const { error } = await supabase
      .from(CAPSULES_TABLE)
      .delete()
      .eq('id', id);
    
    if (error) {
      // Always log database errors
      console.error('u274c [ERROR] Database error deleting capsule:', error);
      throw error;
    }
    
    if (shouldLog) {
      console.log('u2705 [SUCCESS] Capsule deleted successfully from database');
    }
    
    // Remove the deleted capsule from cache
    removeCapsuleFromCache(id);
    
    // If in guest mode, remove from local storage as well
    if (isGuestMode) {
      removeGuestModeCapsule(id);
    }
  } catch (error) {
    // Always log errors
    console.error('u274c [ERROR] Deleting capsule failed:', error);
    
    // Try fallback strategies
    try {
      // Try local storage fallback for guest mode first
      if (isGuestModeEnabled()) {
        if (shouldLog) {
          console.log('ud83dudcc2 [INFO] Attempting local storage fallback for guest mode');
        }
        
        const guestResult = await tryGuestModeStrategy('delete', undefined, id);
        if (guestResult) {
          return; // Successfully deleted from guest mode
        }
      }
      
      // Try legacy API as fallback
      const legacyResult = await tryLegacyApiStrategy('DELETE', `/capsules/${id}`);
      if (legacyResult !== null) {
        if (shouldLog) {
          console.log('u2705 [SUCCESS] Capsule deleted via legacy API fallback');
        }
        return;
      }
      
      // If we get here, both fallbacks failed
      throw error; // Re-throw the original error
    } catch (fallbackError) {
      console.error('u274c [ERROR] All fallback strategies failed:', fallbackError);
      throw error; // Re-throw the original error if all fallbacks also fail
    }
  }
};
