/**
 * Utilities for managing capsule items relationships
 */

import { supabase } from '../../core';
import { CAPSULE_ITEMS_TABLE, getCurrentUser } from './capsuleBaseService';
import { shouldLogDetails } from './capsuleUtils';

/**
 * Update item relationships for a capsule
 * @param capsuleId The capsule ID
 * @param itemIds Array of item IDs to associate with the capsule
 * @returns True if successful, false if there were errors
 */
export const updateCapsuleItems = async (
  capsuleId: string,
  itemIds: string[],
  userId?: string
): Promise<boolean> => {
  const shouldLog = shouldLogDetails();
  
  if (shouldLog) {
    console.log('ud83dudd04 [DATABASE] Updating items for capsule:', {
      capsuleId,
      itemCount: itemIds.length
    });
  }
  
  // First, delete all existing item relationships for this capsule
  const { error: deleteError } = await supabase
    .from(CAPSULE_ITEMS_TABLE)
    .delete()
    .eq('capsule_id', capsuleId);
  
  if (deleteError) {
    console.warn('u26a0ufe0f [DATABASE] Warning: Could not delete existing items:', deleteError);
    return false;
  } else if (shouldLog) {
    console.log('u2705 [DATABASE] Removed existing items from capsule');
  }
  
  // If there are no new items to add, we're done
  if (!itemIds.length) {
    return true;
  }
  
  // Get the current user ID for the join table
  const finalUserId = userId || (await getCurrentUser())?.id;
  if (!finalUserId) {
    console.error('⚠️ [DATABASE] No user ID available for capsule items insertion');
    return false;
  }

  // Prepare bulk insert data for items join table
  const itemInserts = itemIds.map(itemId => ({
    capsule_id: capsuleId,
    item_id: itemId,
    user_id: finalUserId  // Include user_id to satisfy NOT NULL constraint
  }));
  
  // Insert all item relationships
  const { error: insertError } = await supabase
    .from(CAPSULE_ITEMS_TABLE)
    .insert(itemInserts);
  
  if (insertError) {
    console.error('⚠️ [DATABASE] DETAILED ERROR - Could not insert items:', {
      error: insertError,
      errorCode: insertError.code,
      errorMessage: insertError.message,
      errorDetails: insertError.details,
      capsuleId,
      itemIds,
      itemInserts
    });
    return false;
  } else if (shouldLog) {
    console.log('u2705 [DATABASE] Added', itemInserts.length, 'items to capsule');
  }
  
  return true;
};
