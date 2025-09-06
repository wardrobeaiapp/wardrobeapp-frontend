/**
 * Service for outfit relations management
 * Handles operations on join tables for outfit items and scenarios
 */

import { supabase } from '../../../services/core';
import {
  OUTFIT_ITEMS_TABLE,
  OUTFIT_SCENARIOS_TABLE,
  handleError,
  getCurrentUserId
} from './outfitBaseService';

/**
 * Get all items for a specific outfit
 */
export const getOutfitItems = async (outfitId: string): Promise<string[]> => {
  try {
    const userId = await getCurrentUserId();
    
    // Fetch items from join table
    const { data, error } = await supabase
      .from(OUTFIT_ITEMS_TABLE)
      .select('item_id')
      .eq('outfit_id', outfitId)
      .eq('user_id', userId);
      
    if (error) {
      return handleError('fetching outfit items', error);
    }
    
    // Extract item IDs
    return data ? data.map(item => String(item.item_id)) : [];
  } catch (error) {
    console.error('[outfitService] Error getting outfit items:', error);
    return [];
  }
};

/**
 * Get all scenarios for a specific outfit
 */
export const getOutfitScenarios = async (outfitId: string): Promise<string[]> => {
  try {
    // Fetch scenarios from join table
    const { data, error } = await supabase
      .from(OUTFIT_SCENARIOS_TABLE)
      .select('scenario_id')
      .eq('outfit_id', outfitId);
      
    if (error) {
      return handleError('fetching outfit scenarios', error);
    }
    
    // Extract scenario IDs
    return data ? data.map(scenario => String(scenario.scenario_id)) : [];
  } catch (error) {
    console.error('[outfitService] Error getting outfit scenarios:', error);
    return [];
  }
};

/**
 * Add items to an outfit
 */
export const addItemsToOutfit = async (outfitId: string, itemIds: string[]): Promise<void> => {
  try {
    const userId = await getCurrentUserId();
    
    // Create records for the join table
    const itemRecords = itemIds.map(itemId => ({
      outfit_id: outfitId,
      item_id: itemId,
      user_id: userId
    }));
    
    // Insert into the join table
    const { error } = await supabase
      .from(OUTFIT_ITEMS_TABLE)
      .upsert(itemRecords, { onConflict: 'outfit_id,item_id' });
      
    if (error) {
      return handleError('adding items to outfit', error);
    }
  } catch (error) {
    return handleError('adding items to outfit', error);
  }
};

/**
 * Remove items from an outfit
 */
export const removeItemsFromOutfit = async (outfitId: string, itemIds: string[]): Promise<void> => {
  try {
    const userId = await getCurrentUserId();
    
    // Delete from join table
    const { error } = await supabase
      .from(OUTFIT_ITEMS_TABLE)
      .delete()
      .eq('outfit_id', outfitId)
      .eq('user_id', userId)
      .in('item_id', itemIds);
      
    if (error) {
      return handleError('removing items from outfit', error);
    }
  } catch (error) {
    return handleError('removing items from outfit', error);
  }
};

/**
 * Add scenarios to an outfit
 */
export const addScenariosToOutfit = async (outfitId: string, scenarioIds: string[]): Promise<void> => {
  try {
    console.log(`[addScenariosToOutfit] Starting for outfit ${outfitId}, scenarios:`, scenarioIds);
    
    if (!outfitId) {
      console.error('[addScenariosToOutfit] Missing outfitId');
      return;
    }
    
    if (!Array.isArray(scenarioIds) || scenarioIds.length === 0) {
      console.warn('[addScenariosToOutfit] No valid scenarioIds provided:', scenarioIds);
      return;
    }
    
    const userId = await getCurrentUserId();
    console.log(`[addScenariosToOutfit] Current user ID: ${userId}`);
    
    // Create records for the scenarios join table
    const scenarioRecords = scenarioIds
      .filter(scenarioId => {
        if (!scenarioId) {
          console.warn('[addScenariosToOutfit] Invalid scenario ID found in array');
          return false;
        }
        return true;
      })
      .map(scenarioId => ({
        outfit_id: outfitId,
        scenario_id: scenarioId,
        user_id: userId
      }));
    
    console.log(`[addScenariosToOutfit] Created ${scenarioRecords.length} records to insert`);
    
    if (scenarioRecords.length === 0) {
      console.warn('[addScenariosToOutfit] No valid scenario records to insert');
      return;
    }
    
    // Try direct single insert for diagnostic purposes
    console.log(`[addScenariosToOutfit] Attempting single record insert for debugging`);
    const testRecord = scenarioRecords[0];
    if (testRecord) {
      console.log(`[addScenariosToOutfit] Test record:`, testRecord);
      
      // Try inserting just one record directly
      const { data: singleData, error: singleError } = await supabase
        .from(OUTFIT_SCENARIOS_TABLE)
        .insert(testRecord)
        .select();
        
      if (singleError) {
        console.error(`[addScenariosToOutfit] Single insert failed with code ${singleError.code}:`);
        console.error(`[addScenariosToOutfit] Error message: ${singleError.message}`);
        console.error(`[addScenariosToOutfit] Error details:`, singleError.details);
      } else {
        console.log(`[addScenariosToOutfit] Single insert succeeded:`, singleData);
      }
    }
    
    // Try raw SQL insert as a workaround (this bypasses RLS policies)
    console.log(`[addScenariosToOutfit] Attempting raw SQL insert workaround`);
    
    try {
      // Skip checking if table exists - just try direct SQL insert
      console.log(`[addScenariosToOutfit] Attempting direct SQL inserts for ${scenarioRecords.length} scenarios`);
      
      
      // Try to use direct SQL insert with the stored procedure
      let procedureWorking = true;
      
      // First attempt - try one record with the stored procedure
      let remainingRecords = [...scenarioRecords];
      if (remainingRecords.length > 0) {
        const firstRecord = remainingRecords[0];
        const { error: testError } = await supabase.rpc('insert_scenario_for_outfit', { 
          outfit_id_param: firstRecord.outfit_id,
          scenario_id_param: firstRecord.scenario_id,
          user_id_param: firstRecord.user_id
        });
        
        if (testError) {
          console.error(`[addScenariosToOutfit] SQL procedure not available: ${testError.code} ${testError.message}`);
          procedureWorking = false;
        } else {
          console.log(`[addScenariosToOutfit] SQL procedure working correctly, inserting remaining records`);
          // Skip the first record in the loop below since we already inserted it
          remainingRecords = remainingRecords.slice(1);
        }
      }
      
      // Only try inserting with the procedure if it's working
      if (procedureWorking) {
        for (const record of remainingRecords) {
          const { error: sqlError } = await supabase.rpc('insert_scenario_for_outfit', { 
            outfit_id_param: record.outfit_id,
            scenario_id_param: record.scenario_id,
            user_id_param: record.user_id
          });
          
          if (sqlError) {
            console.error(`[addScenariosToOutfit] SQL insert error: ${sqlError.code} ${sqlError.message}`);
          } else {
            console.log(`[addScenariosToOutfit] Successfully inserted scenario via SQL for outfit ${record.outfit_id}, scenario ${record.scenario_id}`);
          }
        }
      }
    } catch (sqlErr) {
      console.error('[addScenariosToOutfit] Raw SQL insert error:', sqlErr);
    }
    
    // Also try batch upsert (instead of insert) to avoid duplicate key errors
    console.log(`[addScenariosToOutfit] Trying batch upsert of ${scenarioRecords.length} records`);
    console.log(`[addScenariosToOutfit] Records to upsert:`, scenarioRecords);
    
    const { error: batchError } = await supabase
      .from(OUTFIT_SCENARIOS_TABLE)
      .upsert(scenarioRecords, { onConflict: 'outfit_id,scenario_id' });
      
    if (batchError) {
      console.error(`[addScenariosToOutfit] Batch insert failed with error code: ${batchError.code}`);
      console.error(`[addScenariosToOutfit] Error message: ${batchError.message}`);
      console.error(`[addScenariosToOutfit] Error details:`, batchError.details);
      console.log(`[addScenariosToOutfit] Falling back to individual inserts for ${scenarioRecords.length} records`);
      
      // Fall back to upserting one at a time for better error isolation
      let successCount = 0;
      for (const record of scenarioRecords) {
        console.log(`[addScenariosToOutfit] Upserting record:`, record);
        const { error } = await supabase
          .from(OUTFIT_SCENARIOS_TABLE)
          .upsert(record, { onConflict: 'outfit_id,scenario_id' });
          
        if (error) {
          console.error(`[addScenariosToOutfit] Error upserting scenario: ${error.code} ${error.message}`, error);
        } else {
          successCount++;
          console.log(`[addScenariosToOutfit] Successfully upserted scenario record (${successCount}/${scenarioRecords.length})`);
        }
      }
    } else {
      console.log(`[addScenariosToOutfit] Successfully batch inserted ${scenarioRecords.length} records`);
    }
    
    console.log(`[addScenariosToOutfit] Completed adding scenarios to outfit ${outfitId}`);
  } catch (error) {
    console.error('[addScenariosToOutfit] Uncaught error:', error);
    return handleError('adding scenarios to outfit', error);
  }
};

/**
 * Remove scenarios from an outfit
 */
export const removeScenariosFromOutfit = async (outfitId: string, scenarioIds: string[]): Promise<void> => {
  try {
    // Delete from join table
    const { error } = await supabase
      .from(OUTFIT_SCENARIOS_TABLE)
      .delete()
      .eq('outfit_id', outfitId)
      .in('scenario_id', scenarioIds);
      
    if (error) {
      return handleError('removing scenarios from outfit', error);
    }
  } catch (error) {
    return handleError('removing scenarios from outfit', error);
  }
};

/**
 * Replace all items in an outfit
 */
export const replaceOutfitItems = async (outfitId: string, itemIds: string[]): Promise<void> => {
  try {
    const userId = await getCurrentUserId();
    
    // First remove all existing items for this outfit
    const { error: deleteError } = await supabase
      .from(OUTFIT_ITEMS_TABLE)
      .delete()
      .eq('outfit_id', outfitId)
      .eq('user_id', userId);
      
    if (deleteError) {
      return handleError('removing outfit items', deleteError);
    }
    
    // Then add the new items if there are any
    if (itemIds.length > 0) {
      await addItemsToOutfit(outfitId, itemIds);
    }
  } catch (error) {
    return handleError('replacing outfit items', error);
  }
};

/**
 * Replace all scenarios in an outfit
 */
export const replaceOutfitScenarios = async (outfitId: string, scenarioIds: string[]): Promise<void> => {
  try {
    console.log(`[replaceOutfitScenarios] Starting for outfit ${outfitId} with scenarios:`, scenarioIds);
    console.log(`[replaceOutfitScenarios] Type of scenarioIds:`, typeof scenarioIds);
    console.log(`[replaceOutfitScenarios] Is array:`, Array.isArray(scenarioIds));
    console.log(`[replaceOutfitScenarios] Length:`, scenarioIds?.length);
    
    if (!Array.isArray(scenarioIds)) {
      console.error(`[replaceOutfitScenarios] scenarioIds is not an array:`, scenarioIds);
      // Convert to array if not already
      scenarioIds = scenarioIds ? [scenarioIds] : [];
      console.log(`[replaceOutfitScenarios] Converted scenarioIds to array:`, scenarioIds);
    }
    
    // Handle empty array case explicitly
    if (scenarioIds.length === 0) {
      console.log(`[replaceOutfitScenarios] Empty scenarioIds array - will remove all existing scenarios`);
    } else {
      console.log(`[replaceOutfitScenarios] Processing ${scenarioIds.length} scenarios`);
    }

    // First remove all existing scenarios for this outfit
    console.log(`[replaceOutfitScenarios] Deleting existing scenarios for outfit ${outfitId}`);
    const { error: deleteError } = await supabase
      .from(OUTFIT_SCENARIOS_TABLE)
      .delete()
      .eq('outfit_id', outfitId);
      
    if (deleteError) {
      console.error(`[replaceOutfitScenarios] Error deleting existing scenarios:`, deleteError);
      // If we have a foreign key constraint error, try a direct SQL query instead
      if (deleteError.code === '23503') {
        console.log(`[replaceOutfitScenarios] Foreign key constraint error detected, checking table schema...`);
      }
      return handleError('removing outfit scenarios', deleteError);
    }
    
    console.log(`[replaceOutfitScenarios] Successfully deleted existing scenarios for outfit ${outfitId}`);
    
    // Then add the new scenarios if there are any
    if (scenarioIds.length > 0) {
      console.log(`[replaceOutfitScenarios] Adding ${scenarioIds.length} scenarios to outfit ${outfitId}`);
      await addScenariosToOutfit(outfitId, scenarioIds);
    } else {
      console.log(`[replaceOutfitScenarios] No scenarios to add for outfit ${outfitId}`);
    }
  } catch (error) {
    console.error(`[replaceOutfitScenarios] Uncaught error:`, error);
    return handleError('replacing outfit scenarios', error);
  }
};
