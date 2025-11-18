/**
 * Service for outfit CRUD operations
 * Handles create, read, update, delete operations for outfits
 */

import { Outfit } from '../../../types';
import { supabase } from '../../../services/core';
import {
  OUTFITS_TABLE,
  OUTFIT_ITEMS_TABLE,
  convertToOutfit,
  handleError,
  getCurrentUserId
} from './outfitBaseService';
import { replaceOutfitScenarios } from './outfitRelationsService';

/**
 * Fetch all outfits for the current user from Supabase
 */
export const fetchOutfitsFromSupabase = async (): Promise<Outfit[]> => {
  try {
    console.log('[outfitService] fetchOutfitsFromSupabase: Getting current user...');
    // Get current user
    const userId = await getCurrentUserId();
    console.log('[outfitService] fetchOutfitsFromSupabase: User ID:', userId);
    
    // PERFORMANCE OPTIMIZATION: Fetch outfits and items in single query using JOIN
    console.log('[outfitService] fetchOutfitsFromSupabase: Querying Supabase with optimized JOIN...');
    
    // Single query to get outfits with their items (no N+1 problem)
    const { data, error } = await supabase
      .from(OUTFITS_TABLE)
      .select(`
        *,
        ${OUTFIT_ITEMS_TABLE}!inner(item_id)
      `)
      .eq('user_uuid', userId);
    
    console.log('[outfitService] fetchOutfitsFromSupabase: Supabase response - data:', data, 'error:', error);
      
    if (error) {
      console.error('[outfitService] fetchOutfitsFromSupabase: Supabase error detected:', error);
      
      // Fallback to original query if JOIN fails
      console.log('[outfitService] Falling back to original query method...');
      const { data: fallbackData, error: fallbackError } = await supabase
        .from(OUTFITS_TABLE)
        .select('*')
        .eq('user_uuid', userId);
      
      if (fallbackError) {
        console.error('[outfitService] Fallback query also failed:', fallbackError);
        return [];
      }
      
      // Process fallback data without items (will use stored items array)
      const processedOutfits = (fallbackData || []).map(outfitData => {
        const outfit = convertToOutfit(outfitData);
        return {
          ...outfit,
          items: Array.isArray(outfitData.items) ? outfitData.items.map(id => String(id)) : [],
          scenarios: Array.isArray(outfitData.scenarios) ? outfitData.scenarios.map(id => String(id)) : []
        };
      });
      
      return processedOutfits as Outfit[];
    }

    // PERFORMANCE: Process with minimal blocking (using synchronous map but with better structure)
    const outfitsWithRelations = (data || []).map(outfitData => {
      try {
        // Convert base outfit data
        const outfit = convertToOutfit(outfitData);
        
        // Extract item IDs from JOIN result (already fetched in single query)
        const itemIds = Array.isArray(outfitData[OUTFIT_ITEMS_TABLE]) 
          ? outfitData[OUTFIT_ITEMS_TABLE].map((item: any) => String(item.item_id))
          : (Array.isArray(outfitData.items) ? outfitData.items.map(id => String(id)) : []);
        
        // Scenarios are stored directly in the outfits table
        const scenarioIds = Array.isArray(outfitData.scenarios) 
          ? outfitData.scenarios.map(id => String(id))
          : [];
        
        // Return outfit with items and scenarios
        return {
          ...outfit,
          items: itemIds,
          scenarios: scenarioIds
        };
      } catch (error) {
        console.warn('[outfitService] Error processing outfit relations:', error);
        // Return basic outfit with empty arrays if processing fails
        const basicOutfit = convertToOutfit(outfitData);
        return {
          ...basicOutfit,
          items: [],
          scenarios: []
        };
      }
    });
    
    console.log('[outfitService] fetchOutfitsFromSupabase: Successfully processed', outfitsWithRelations.length, 'outfits');
    return outfitsWithRelations as Outfit[];
  } catch (error) {
    console.error('[outfitService] Error in fetchOutfitsFromSupabase:', error);
    console.error('[outfitService] Error details:', (error as Error).message);
    // Return empty array instead of throwing error to allow fallback to legacy API
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

// Public API functions using pure Supabase (like wardrobe items)

/**
 * Fetch outfits using Supabase
 */
export const fetchOutfits = async (): Promise<Outfit[]> => {
  try {
    // Use pure Supabase like wardrobe items do - no legacy API fallback needed
    const outfits = await fetchOutfitsFromSupabase();
    return outfits;
  } catch (error) {
    console.error('[outfitService] Error fetching outfits:', error);
    return [];
  }
};

/**
 * Create outfit using Supabase
 */
export const createOutfit = async (outfit: Omit<Outfit, 'id' | 'dateCreated'>): Promise<Outfit> => {
  // Use pure Supabase like wardrobe items do - no legacy API fallback needed
  const newOutfit = await createOutfitInSupabase(outfit);
  return newOutfit;
};

/**
 * Update outfit using Supabase
 */
export const updateOutfit = async (id: string, outfit: Partial<Outfit>): Promise<void> => {
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
  
  // Use pure Supabase like wardrobe items do - no legacy API fallback needed
  await updateOutfitInSupabase(id, updateData);
};

/**
 * Delete outfit using Supabase
 */
export const deleteOutfit = async (id: string): Promise<void> => {
  // Use pure Supabase like wardrobe items do - no legacy API fallback needed
  await deleteOutfitInSupabase(id);
};
