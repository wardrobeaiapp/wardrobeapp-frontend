/**
 * Service for specialized outfit queries
 * Handles filtered queries and advanced search operations
 */

import { Outfit } from '../../../types';
import { supabase } from '../../../services/core';
import {
  OUTFITS_TABLE,
  OUTFIT_ITEMS_TABLE,
  OUTFIT_SCENARIOS_TABLE,
  handleError,
  getCurrentUserId
} from './outfitBaseService';

/**
 * Check if the outfit tables exist in Supabase
 */
export const checkOutfitTablesExist = async (): Promise<boolean> => {
  try {
    // Try to fetch a single record from outfits table to see if it exists
    const { count, error } = await supabase
      .from(OUTFITS_TABLE)
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.warn('[outfitService] Table check error:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.warn('[outfitService] Table existence check failed:', error);
    return false;
  }
};

/**
 * Find outfits by season
 */
export const findOutfitsBySeason = async (season: string): Promise<Outfit[]> => {
  try {
    const userId = await getCurrentUserId();
    
    // Fetch outfits with the specified season
    const { data, error } = await supabase
      .from(OUTFITS_TABLE)
      .select('*')
      .eq('user_uuid', userId)
      .contains('season', [season]);
      
    if (error) {
      return handleError('finding outfits by season', error);
    }
    
    // Convert to Outfit objects
    return data.map(outfit => ({
      id: String(outfit.id),
      name: String(outfit.name),
      items: [], // These would need to be populated in a follow-up query
      scenarios: [], // These would need to be populated in a follow-up query
      scenarioNames: Array.isArray(outfit.scenario_names) ? outfit.scenario_names : [],
      season: Array.isArray(outfit.season) ? outfit.season : [],
      favorite: Boolean(outfit.favorite),
      dateCreated: String(outfit.date_created),
      lastWorn: outfit.last_worn ? String(outfit.last_worn) : undefined
    }));
  } catch (error) {
    console.error('[outfitService] Error finding outfits by season:', error);
    return [];
  }
};

/**
 * Find outfits by scenario
 */
export const findOutfitsByScenario = async (scenarioId: string): Promise<Outfit[]> => {
  try {
    const userId = await getCurrentUserId();
    
    // Find outfits with the specified scenario via join table
    const { data: joinData, error: joinError } = await supabase
      .from(OUTFIT_SCENARIOS_TABLE)
      .select('outfit_id')
      .eq('scenario_id', scenarioId);
      
    if (joinError) {
      return handleError('finding outfits by scenario (join query)', joinError);
    }
    
    // If no outfits found with this scenario, return empty array
    if (!joinData || joinData.length === 0) {
      return [];
    }
    
    // Extract outfit IDs
    const outfitIds = joinData.map(item => item.outfit_id);
    
    // Fetch full outfit data for these IDs
    const { data, error } = await supabase
      .from(OUTFITS_TABLE)
      .select('*')
      .eq('user_uuid', userId)
      .in('id', outfitIds);
      
    if (error) {
      return handleError('finding outfits by scenario (outfits query)', error);
    }
    
    // Convert to Outfit objects
    return data.map(outfit => ({
      id: String(outfit.id),
      name: String(outfit.name),
      items: [], // These would need to be populated in a follow-up query
      scenarios: [scenarioId], // We know this scenario is associated
      scenarioNames: Array.isArray(outfit.scenario_names) ? outfit.scenario_names : [],
      season: Array.isArray(outfit.season) ? outfit.season : [],
      favorite: Boolean(outfit.favorite),
      dateCreated: String(outfit.date_created),
      lastWorn: outfit.last_worn ? String(outfit.last_worn) : undefined
    }));
  } catch (error) {
    console.error('[outfitService] Error finding outfits by scenario:', error);
    return [];
  }
};

/**
 * Find outfits containing a specific item
 */
export const findOutfitsByItem = async (itemId: string): Promise<Outfit[]> => {
  try {
    const userId = await getCurrentUserId();
    
    // Find outfits with the specified item via join table
    const { data: joinData, error: joinError } = await supabase
      .from(OUTFIT_ITEMS_TABLE)
      .select('outfit_id')
      .eq('item_id', itemId)
      .eq('user_id', userId);
      
    if (joinError) {
      return handleError('finding outfits by item (join query)', joinError);
    }
    
    // If no outfits found with this item, return empty array
    if (!joinData || joinData.length === 0) {
      return [];
    }
    
    // Extract outfit IDs
    const outfitIds = joinData.map(item => item.outfit_id);
    
    // Fetch full outfit data for these IDs
    const { data, error } = await supabase
      .from(OUTFITS_TABLE)
      .select('*')
      .eq('user_uuid', userId)
      .in('id', outfitIds);
      
    if (error) {
      return handleError('finding outfits by item (outfits query)', error);
    }
    
    // Convert to Outfit objects
    return data.map(outfit => ({
      id: String(outfit.id),
      name: String(outfit.name),
      items: [itemId], // We know this item is in the outfit
      scenarios: [], // These would need to be populated in a follow-up query
      scenarioNames: Array.isArray(outfit.scenario_names) ? outfit.scenario_names : [],
      season: Array.isArray(outfit.season) ? outfit.season : [],
      favorite: Boolean(outfit.favorite),
      dateCreated: String(outfit.date_created),
      lastWorn: outfit.last_worn ? String(outfit.last_worn) : undefined
    }));
  } catch (error) {
    console.error('[outfitService] Error finding outfits by item:', error);
    return [];
  }
};

/**
 * Find favorite outfits
 */
export const findFavoriteOutfits = async (): Promise<Outfit[]> => {
  try {
    const userId = await getCurrentUserId();
    
    // Fetch favorite outfits
    const { data, error } = await supabase
      .from(OUTFITS_TABLE)
      .select('*')
      .eq('user_uuid', userId)
      .eq('favorite', true);
      
    if (error) {
      return handleError('finding favorite outfits', error);
    }
    
    // Convert to Outfit objects
    return data.map(outfit => ({
      id: String(outfit.id),
      name: String(outfit.name),
      items: [], // These would need to be populated in a follow-up query
      scenarios: [], // These would need to be populated in a follow-up query
      scenarioNames: Array.isArray(outfit.scenario_names) ? outfit.scenario_names : [],
      season: Array.isArray(outfit.season) ? outfit.season : [],
      favorite: true, // We know these are favorites
      dateCreated: String(outfit.date_created),
      lastWorn: outfit.last_worn ? String(outfit.last_worn) : undefined
    }));
  } catch (error) {
    console.error('[outfitService] Error finding favorite outfits:', error);
    return [];
  }
};
