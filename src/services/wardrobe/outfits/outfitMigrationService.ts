/**
 * Service for outfit migration utilities
 * Handles migrations from legacy API to Supabase
 */

import { Outfit } from '../../../types';
import { supabase } from '../../../services/core';
import {
  OUTFITS_TABLE,
  API_URL,
  getAuthHeaders,
  apiRequest,
  getCurrentUserId
} from './outfitBaseService';
import {
  fetchOutfitsFromSupabase,
  createOutfitInSupabase
} from './outfitCrudService';
import { checkOutfitTablesExist } from './outfitQueryService';

/**
 * Migrate legacy API outfits to Supabase
 * Only runs if Supabase tables exist but no outfits are found
 */
export const migrateOutfitsToSupabase = async (): Promise<boolean> => {
  try {
    // First check if tables exist
    const tablesExist = await checkOutfitTablesExist();
    if (!tablesExist) {
      console.warn('[outfitService] Outfits tables do not exist in Supabase, cannot migrate');
      return false;
    }
    
    // Check if we already have outfits in Supabase
    const existingOutfits = await fetchOutfitsFromSupabase();
    if (existingOutfits && existingOutfits.length > 0) {
      // Already have outfits in Supabase, no need to migrate
      return true;
    }
    
    // Fetch outfits from legacy API
    const authHeaders = await getAuthHeaders();
    const legacyOutfits = await apiRequest<Outfit[]>(`${API_URL}/outfits`, { headers: authHeaders });
    
    if (!legacyOutfits || legacyOutfits.length === 0) {
      // No outfits to migrate
      return true;
    }
    
    // Migrate each outfit to Supabase
    let success = true;
    for (const outfit of legacyOutfits) {
      try {
        // Strip ID and dateCreated since they'll be set by Supabase
        const { id, dateCreated, ...outfitData } = outfit;
        
        // Ensure required properties exist
        const outfitToCreate = {
          ...outfitData,
          items: outfitData.items || [],
          scenarios: outfitData.scenarios || [],
          scenarioNames: outfitData.scenarioNames || [],
          season: outfitData.season || [],
        };
        
        await createOutfitInSupabase(outfitToCreate);
      } catch (outfitError) {
        console.error(`[outfitService] Error migrating outfit ${outfit.id}:`, outfitError);
        success = false;
      }
    }
    
    return success;
  } catch (error) {
    console.error('[outfitService] Error migrating outfits to Supabase:', error);
    return false;
  }
};

/**
 * Check if migrations are complete for the current user
 */
export const checkMigrationStatus = async (): Promise<boolean> => {
  try {
    // Check if tables exist
    const tablesExist = await checkOutfitTablesExist();
    if (!tablesExist) return false;
    
    // Get current user
    const userId = await getCurrentUserId();
    
    // Check if user has outfits in Supabase
    const { count, error } = await supabase
      .from(OUTFITS_TABLE)
      .select('id', { count: 'exact', head: true })
      .eq('user_uuid', userId);
    
    if (error) {
      console.warn('[outfitService] Error checking migration status:', error);
      return false;
    }
    
    // If we have outfits, migration is complete
    return count !== null && count > 0;
  } catch (error) {
    console.warn('[outfitService] Error checking migration status:', error);
    return false;
  }
};
