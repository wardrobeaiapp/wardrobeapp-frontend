/**
 * Service for creating capsules
 */

import { Capsule } from '../../../types';
import { supabase } from '../../core';
import {
  CAPSULES_TABLE,
} from './capsuleBaseService';
import { v4 as uuidv4 } from 'uuid';
import { 
  updateCacheWithCapsule, 
  manageCapsuleScenarios, 
  updateGuestModeCapsule,
} from './capsuleUtils';
import { updateCapsuleItems } from './capsuleItemUtils';
import { getUserContext, prepareDbCapsule } from './capsuleCrudHelpers';
import { 
  tryLegacyApiStrategy,
  tryGuestModeStrategy,
  createClientOnlyCapsule,
  executeWithFallbacks
} from './capsuleFallbackStrategies';

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
  // Get the user context (user, isGuestMode, shouldLog)
  const { user, isGuestMode, shouldLog } = await getUserContext();
  
  if (shouldLog) {
    console.log('📝 [INFO] Creating new capsule:', { name: capsule.name });
  }
  
  // Create new capsule with UUID format
  const newCapsule: Capsule = {
    ...capsule,
    id: uuidv4(),
    dateCreated: new Date().toISOString()
  };
  
  // Execute with fallback strategies
  return executeWithFallbacks(
    // Primary function: Create in database
    async () => {
      // Prepare the database record
      const dbCapsule = prepareDbCapsule(newCapsule, user?.id, isGuestMode);
      
      // Add required fields for a new capsule
      dbCapsule.id = newCapsule.id;
      dbCapsule.date_created = newCapsule.dateCreated;
      
      // Insert the main capsule record
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
        await updateCapsuleItems(newCapsule.id, newCapsule.selectedItems, user?.id);
      }
      
      // If in guest mode, also store in local storage
      if (isGuestMode) {
        updateGuestModeCapsule(newCapsule);
      }
      
      // Update cache with new capsule
      updateCacheWithCapsule(newCapsule);
      
      return newCapsule;
    },
    // Fallback strategies in order of preference
    [
      // First fallback: Try legacy API
      async () => await tryLegacyApiStrategy('POST', '/capsules', capsule),
      // Second fallback: Try guest mode storage if applicable
      async () => await tryGuestModeStrategy('create', newCapsule)
    ],
    // Final fallback: Create client-side-only capsule
    () => createClientOnlyCapsule(newCapsule)
  );
};
