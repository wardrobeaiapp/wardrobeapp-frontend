/**
 * Helper functions for capsule CRUD operations
 */

import { Capsule } from '../../../types';
import { supabase } from '../../core';
import {
  CAPSULES_TABLE,
  cacheState,
  getCurrentUser,
  isGuestModeEnabled
} from './capsuleBaseService';
import { shouldLogDetails } from './capsuleUtils';

/**
 * Prepare a capsule object for database insertion or update
 */
export const prepareDbCapsule = (capsule: Partial<Capsule>, userId: string | null, isGuestMode: boolean): Record<string, any> => {
  const dbCapsule: Record<string, any> = {};
  
  // Map capsule properties to database fields
  if (capsule.name !== undefined) dbCapsule.name = capsule.name;
  if (capsule.seasons !== undefined) dbCapsule.seasons = Array.isArray(capsule.seasons) ? capsule.seasons : null;
  if (capsule.mainItemId !== undefined) dbCapsule.main_item_id = capsule.mainItemId || null;
  if (capsule.selectedItems !== undefined) dbCapsule.selected_items = Array.isArray(capsule.selectedItems) ? capsule.selectedItems : null;
  
  // Add user ID for authorization
  if (userId || isGuestMode) {
    dbCapsule.user_id = isGuestMode ? 'guest' : userId;
  }
  
  return dbCapsule;
};

/**
 * Get authenticated user context for CRUD operations
 */
export const getUserContext = async (): Promise<{
  user: any | null;
  isGuestMode: boolean;
  shouldLog: boolean;
}> => {
  const shouldLog = shouldLogDetails();
  
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
  
  return { user, isGuestMode, shouldLog };
};

/**
 * Execute a database query with proper error handling and logging
 */
export const executeDbQuery = async <T>(
  operation: string,
  queryFn: () => Promise<{ data: T | null; error: any }>,
  shouldLog: boolean
): Promise<T | null> => {
  try {
    const { data, error } = await queryFn();
    
    if (error) {
      console.error(`❌ [ERROR] Database error ${operation}:`, error);
      throw error;
    }
    
    if (shouldLog) {
      console.log(`✅ [SUCCESS] ${operation} completed successfully`);
    }
    
    return data;
  } catch (error) {
    console.error(`❌ [ERROR] ${operation} failed:`, error);
    throw error;
  }
};

/**
 * Validates that a capsule exists
 * 
 * @param capsuleId - The ID of the capsule to validate
 * @returns Promise resolving to true if the capsule exists, false otherwise
 */
export const validateCapsuleExists = async (capsuleId: string): Promise<boolean> => {
  // Check if the capsule exists
  const { data } = await supabase
    .from(CAPSULES_TABLE)
    .select('id')
    .eq('id', capsuleId)
    .single();
  
  return !!data;
};

/**
 * Resets the cache for capsules
 * Useful for forcing a refresh after known changes
 */
export const resetCapsuleCache = (): void => {
  cacheState.capsulesFetchInProgress = null;
};
