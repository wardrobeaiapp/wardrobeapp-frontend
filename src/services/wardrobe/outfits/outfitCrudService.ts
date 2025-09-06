/**
 * Service for outfit CRUD operations
 * Handles create, read, update, delete operations for outfits
 */

import { Outfit } from '../../../types';
import { supabase } from '../../../services/core';
import {
  OUTFITS_TABLE,
  OUTFIT_ITEMS_TABLE,
  OUTFIT_SCENARIOS_TABLE,
  API_URL,
  getAuthHeaders,
  apiRequest,
  convertToOutfits,
  handleError,
  getCurrentUserId
} from './outfitBaseService';
import { replaceOutfitScenarios } from './outfitRelationsService';

/**
 * Fetch all outfits for the current user from Supabase
 */
export const fetchOutfitsFromSupabase = async (): Promise<Outfit[]> => {
  try {
    // Get current user
    const userId = await getCurrentUserId();
    
    // Fetch outfits from Supabase
    const { data, error } = await supabase
      .from(OUTFITS_TABLE)
      .select('*')
      .eq('user_uuid', userId);
      
    if (error) {
      return handleError('fetching outfits', error);
    }
    
    // Convert Supabase data format to app's Outfit format
    const outfitsWithoutItems = convertToOutfits(data || []);
    
    // For each outfit, fetch its items and scenarios from join tables
    const outfitsWithRelations = await Promise.all(
      outfitsWithoutItems.map(async (outfit) => {
        try {
          // Get items for this outfit from the join table
          const { data: itemsData, error: itemsError } = await supabase
            .from(OUTFIT_ITEMS_TABLE)
            .select('item_id')
            .eq('outfit_id', outfit.id as string)
            .eq('user_id', userId);
          
          if (itemsError) {
            console.warn('[outfitService] Error fetching outfit items:', itemsError);
          }
          
          // Extract item IDs
          const itemIds = itemsData ? itemsData.map(item => String(item.item_id)) : [];
          
          // Get scenarios for this outfit from the join table
          const { data: scenariosData, error: scenariosError } = await supabase
            .from(OUTFIT_SCENARIOS_TABLE)
            .select('scenario_id')
            .eq('outfit_id', outfit.id as string);
          
          if (scenariosError) {
            console.warn('[outfitService] Error fetching outfit scenarios:', scenariosError);
          }
          
          // Extract scenario IDs
          const scenarioIds = scenariosData ? scenariosData.map(item => String(item.scenario_id)) : [];
          
          // Return outfit with items and scenarios
          return {
            ...outfit,
            items: itemIds,
            scenarios: scenarioIds
          };
        } catch (error) {
          console.warn('[outfitService] Error processing outfit relations:', error);
          return outfit; // Return outfit with empty arrays
        }
      })
    );
    
    return outfitsWithRelations as Outfit[];
  } catch (error) {
    console.error('[outfitService] Error in fetchOutfitsFromSupabase:', error);
    return [];
  }
};

/**
 * Create a new outfit in Supabase
 */
export const createOutfitInSupabase = async (outfit: Omit<Outfit, 'id' | 'dateCreated'>): Promise<Outfit> => {
  try {
    const userId = await getCurrentUserId();
    const dateCreated = new Date().toISOString();
    
    // Extract items and scenarios from the outfit object
    const { items, scenarios } = outfit;
    
    // Prepare outfit data for Supabase
    const outfitData = {
      name: outfit.name,
      season: outfit.season.map(s => String(s)), // Convert Season enum values to strings
      date_created: dateCreated,
      // Remove scenario_names as it doesn't exist in the database schema
      user_uuid: userId
    };
    
    // Insert outfit into Supabase
    const { data: createdData, error } = await supabase
      .from(OUTFITS_TABLE)
      .insert(outfitData)
      .select()
      .single();
      
    if (error) {
      return handleError('creating outfit', error);
    }
    
    if (!createdData) {
      throw new Error('[outfitService] No data returned from Supabase after outfit creation');
    }
    
    // Add items to the join table if there are any
    if (items && items.length > 0) {
      try {
        // Create records for the join table
        const itemRecords = items.map(itemId => ({
          outfit_id: createdData.id,
          item_id: itemId,
          user_id: userId
        }));
        
        // Insert into the join table
        const { error: joinError } = await supabase
          .from(OUTFIT_ITEMS_TABLE)
          .upsert(itemRecords, { onConflict: 'outfit_id,item_id' });
          
        if (joinError) {
          console.warn('[outfitService] Error adding items to outfit:', joinError);
        }
      } catch (joinError) {
        console.warn('[outfitService] Error in outfit-items relation:', joinError);
      }
    }
    
    // Add scenarios to the join table if there are any
    console.log('[createOutfitInSupabase] Saving scenarios for outfit:', createdData.id, 'scenarios:', scenarios);
    if (scenarios && scenarios.length > 0) {
      try {
        // Use the enhanced replaceOutfitScenarios function which handles batch inserts
        const scenarioIds = scenarios.map(id => String(id));
        await replaceOutfitScenarios(String(createdData.id), scenarioIds);
        console.log('[createOutfitInSupabase] Successfully saved scenarios using replaceOutfitScenarios');
      } catch (scenariosJoinError) {
        console.error('[createOutfitInSupabase] Error in outfit-scenarios relation:', scenariosJoinError);
      }
    } else {
      console.log('[createOutfitInSupabase] No scenarios to save for outfit:', createdData.id);
    }
    
    // Convert Supabase response to Outfit format
    const createdOutfit: Outfit = {
      id: String(createdData.id),
      name: String(createdData.name),
      items: items || [],
      scenarios: scenarios || [],
      season: Array.isArray(createdData.season) ? createdData.season : [],
      scenarioNames: outfit.scenarioNames || [], // Use the input scenarioNames instead of database field
      dateCreated: String(createdData.date_created),
    };
    
    return createdOutfit;
  } catch (error) {
    return handleError('creating outfit', error);
  }
};

/**
 * Update an existing outfit in Supabase
 */
export const updateOutfitInSupabase = async (id: string, outfit: Partial<Outfit>): Promise<void> => {
  try {
    const userId = await getCurrentUserId();
    
    // Extract items and scenarios from the outfit object
    const { items, scenarios, ...outfitWithoutRelations } = outfit;
    
    // Prepare outfit data for Supabase (convert camelCase to snake_case)
    const outfitData: any = {};
    
    if (outfitWithoutRelations.name !== undefined) outfitData.name = outfitWithoutRelations.name;
    if (outfitWithoutRelations.season !== undefined) outfitData.season = outfitWithoutRelations.season;
    
    // Update outfit in Supabase
    const { error } = await supabase
      .from(OUTFITS_TABLE)
      .update(outfitData)
      .eq('id', id)
      .eq('user_uuid', userId);
      
    if (error) {
      return handleError('updating outfit', error);
    }
    
    // Update items in the join table if they were provided
    if (items !== undefined) {
      try {
        // First remove all existing items for this outfit
        const { error: deleteError } = await supabase
          .from(OUTFIT_ITEMS_TABLE)
          .delete()
          .eq('outfit_id', id);
          
        if (deleteError) {
          console.warn('[outfitService] Error removing outfit items:', deleteError);
        }
        
        // Then add the new items if there are any
        if (items && items.length > 0) {
          // Create records for the join table
          const itemRecords = items.map(itemId => ({
            outfit_id: id,
            item_id: itemId,
            user_id: userId
          }));
          
          // Insert into the join table
          const { error: insertError } = await supabase
            .from(OUTFIT_ITEMS_TABLE)
            .upsert(itemRecords, { onConflict: 'outfit_id,item_id' });
            
          if (insertError) {
            console.warn('[outfitService] Error adding items to outfit:', insertError);
          }
        }
      } catch (joinError) {
        console.warn('[outfitService] Error updating outfit-items relation:', joinError);
      }
    }
    
    // Update scenarios in the join table if they were provided
    if (scenarios !== undefined) {
      console.log('[updateOutfitInSupabase] Updating scenarios for outfit:', id, 'scenarios:', scenarios);
      try {
        // Use the enhanced replaceOutfitScenarios function which handles deletion and insertion in one call
        const scenarioIds = scenarios.map(id => String(id));
        await replaceOutfitScenarios(String(id), scenarioIds);
        console.log('[updateOutfitInSupabase] Successfully updated scenarios using replaceOutfitScenarios');
      } catch (scenariosJoinError) {
        console.error('[updateOutfitInSupabase] Error updating outfit-scenarios relation:', scenariosJoinError);
      }
    } else {
      console.log('[updateOutfitInSupabase] No scenario updates requested for outfit:', id);
    }
  } catch (error) {
    return handleError('updating outfit', error);
  }
};

/**
 * Delete an outfit from Supabase
 */
export const deleteOutfitInSupabase = async (id: string): Promise<void> => {
  try {
    const userId = await getCurrentUserId();
    
    // Delete outfit from Supabase
    const { error } = await supabase
      .from(OUTFITS_TABLE)
      .delete()
      .eq('id', id)
      .eq('user_uuid', userId);
      
    if (error) {
      return handleError('deleting outfit', error);
    }
  } catch (error) {
    return handleError('deleting outfit', error);
  }
};

// Public API functions with fallback to legacy API

/**
 * Fetch outfits with fallback to legacy API
 */
export const fetchOutfits = async (): Promise<Outfit[]> => {
  try {
    // Try to fetch from Supabase first
    const outfits = await fetchOutfitsFromSupabase();
    
    // If we got outfits from Supabase, return them
    if (outfits && outfits.length > 0) {
      return outfits;
    }
    
    // If no outfits, try legacy API
    const authHeaders = getAuthHeaders();
    const legacyOutfits = await apiRequest<Outfit[]>(`${API_URL}/outfits`, { headers: authHeaders });
    
    return legacyOutfits.map(outfit => ({
      ...outfit,
      scenarioNames: outfit.scenarioNames || []
    }));
  } catch (error) {
    console.error('[outfitService] Error fetching outfits:', error);
    return [];
  }
};

/**
 * Create outfit with fallback to legacy API
 */
export const createOutfit = async (outfit: Omit<Outfit, 'id' | 'dateCreated'>): Promise<Outfit> => {
  try {
    // Create a copy of the outfit without modifying scenarioNames
    const outfitWithScenarios = {
      ...outfit
    };
    
    // Try to create in Supabase first
    const newOutfit = await createOutfitInSupabase(outfitWithScenarios);
    return newOutfit;
  } catch (error) {
    console.error('[outfitService] Error creating outfit in Supabase:', error);
    // Fallback to API
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(outfit)
    };
    
    const response = await apiRequest(`${API_URL}/outfits`, options);
    return response as Outfit;
  }
};

/**
 * Update outfit with fallback to legacy API
 */
export const updateOutfit = async (id: string, outfit: Partial<Outfit>): Promise<void> => {
  try {
    console.log('[outfitCrudService.updateOutfit] Starting update for outfit:', id);
    console.log('[outfitCrudService.updateOutfit] Received outfit data:', outfit);
    console.log('[outfitCrudService.updateOutfit] Scenarios in outfit data:', outfit.scenarios);
    
    // Make sure scenarios are properly passed through, even if undefined
    const updateData = {
      ...outfit,
      // Ensure scenarios are included and properly typed
      scenarios: Array.isArray(outfit.scenarios) ? outfit.scenarios : (outfit.scenarios || []),
      // Ensure scenarioNames is properly set if it exists
      ...(outfit.scenarioNames !== undefined && { scenarioNames: outfit.scenarioNames || [] })
    };
    
    console.log('[outfitCrudService.updateOutfit] Prepared updateData:', updateData);
    console.log('[outfitCrudService.updateOutfit] Scenarios in updateData:', updateData.scenarios);
    
    // Try to update in Supabase first
    await updateOutfitInSupabase(id, updateData);
  } catch (error) {
    console.error('[outfitService] Error updating outfit in Supabase:', error);
    // Fallback to legacy API
    const authHeaders = getAuthHeaders();
    const options = {
      method: 'PUT',
      headers: {
        ...authHeaders,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(outfit)
    };
    await apiRequest(`${API_URL}/outfits/${id}`, options);
  }
};

/**
 * Delete outfit with fallback to legacy API
 */
export const deleteOutfit = async (id: string): Promise<void> => {
  try {
    // Try to delete from Supabase first
    await deleteOutfitInSupabase(id);
  } catch (error) {
    console.error('[outfitService] Error deleting outfit from Supabase:', error);
    // Fallback to legacy API
    const authHeaders = getAuthHeaders();
    const options = {
      method: 'DELETE',
      headers: authHeaders
    };
    await apiRequest(`${API_URL}/outfits/${id}`, options);
  }
};
