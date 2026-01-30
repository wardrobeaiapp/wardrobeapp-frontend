// External imports
import { supabase } from '../../../services/core';
import { WardrobeItem, WishlistStatus, Season, Scenario } from '../../../types';
import { aiCheckHistoryService } from '../../ai/aiCheckHistoryService';

// Internal imports
import { removeItemFromAllOutfits } from '../outfits';
import { 
  TABLE_NAME, 
  camelToSnakeCase, 
  handleSupabaseError, 
  convertToWardrobeItem, 
  convertToWardrobeItems,
  getCurrentUserId
} from './itemBaseService';
import { replaceItemScenarios, getItemScenarios, getBatchItemScenarios } from './itemRelationsService';
import { 
  triggerItemAddedCoverage,
  triggerItemUpdatedCoverage,
  triggerItemDeletedCoverage
} from '../scenarioCoverage';

// Type guard for Season
const isSeason = (value: any): value is Season => {
  return ['summer', 'winter', 'spring/fall'].includes(value);
};

// Helper function to get scenarios for a user
async function getScenariosForUser(userId: string): Promise<Scenario[]> {
  const { data: scenarios, error } = await supabase
    .from('scenarios')
    .select('*')
    .eq('user_id', userId) as { data: Scenario[] | null, error: any };
    
  if (error) {
    console.error('Error fetching scenarios:', error);
    return [];
  }
  
  return scenarios || [];
}

/**
 * Fetches all wardrobe items for a user
 * @param userId User ID to fetch items for
 * @param activeOnly If true, only returns active items
 * @returns Array of WardrobeItem objects
 */
export const getWardrobeItems = async (userId: string, activeOnly: boolean = false): Promise<WardrobeItem[]> => {
  let query = supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('user_id', userId);

  if (activeOnly) {
    query = query.eq('is_active', true);
  }

  const { data, error } = await query;
  handleSupabaseError(error, 'fetching wardrobe items');

  // Convert data to WardrobeItem objects
  const items = convertToWardrobeItems(data || []);
  
  // Skip scenario loading if there are no items
  if (items.length === 0) {
    return items;
  }
  
  // Extract item IDs for batch loading
  const itemIds = items.filter(item => item.id).map(item => item.id as string);
  
  // Batch load scenarios for all items in a single query
  const scenariosByItem = await getBatchItemScenarios(itemIds);
  
  // Assign scenarios to each item
  items.forEach(item => {
    if (item.id && scenariosByItem.has(item.id)) {
      item.scenarios = scenariosByItem.get(item.id) || [];
    } else {
      item.scenarios = [];
    }
  });

  return items;
};

/**
 * Fetches a single wardrobe item by ID
 * @param id Item ID to fetch
 * @returns WardrobeItem object or null if not found
 */
export const getWardrobeItem = async (id: string): Promise<WardrobeItem | null> => {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('id', id)
    .single();

  // Handle not found case
  if (error && error.code === 'PGRST116') {
    return null;
  }
  
  handleSupabaseError(error, 'fetching wardrobe item');
  
  // Convert database item to WardrobeItem
  const item = convertToWardrobeItem(data);
  
  if (item) {
    // Fetch scenarios for this item
    const scenarios = await getItemScenarios(id);
    item.scenarios = scenarios;
  }
  
  return item;
};

/**
 * Adds a new wardrobe item
 * @param item Partial WardrobeItem object
 * @returns Created WardrobeItem object
 */
export const addWardrobeItem = async (item: Partial<WardrobeItem>): Promise<WardrobeItem | null> => {
  // Ensure wishlist status is set to 'not_reviewed' for new wishlist items
  const itemToAdd = { ...item };
  if (itemToAdd.wishlist && !itemToAdd.wishlistStatus) {
    itemToAdd.wishlistStatus = WishlistStatus.NOT_REVIEWED;
  }
  
  // Ensure season field always has a value to satisfy the not-null constraint
  if (!itemToAdd.season || !Array.isArray(itemToAdd.season) || itemToAdd.season.length === 0) {
    // Default to all seasons if not specified
    itemToAdd.season = [Season.SUMMER, Season.WINTER, Season.TRANSITIONAL];
  }
  
  // Extract scenarios before creating item (they're stored in a join table)
  const scenarios = itemToAdd.scenarios || [];
  delete itemToAdd.scenarios;
  
  // Get the current authenticated user ID
  const userId = await getCurrentUserId();
  if (!userId) {
    console.error('[itemService] Cannot add wardrobe item: No authenticated user');
    throw new Error('Authentication required to add wardrobe item');
  }
  
  // Set the user_id field to satisfy RLS policy
  itemToAdd.userId = userId;
  
  const snakeCaseItem = camelToSnakeCase(itemToAdd);

  // Insert the item
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert([snakeCaseItem])
    .select();

  handleSupabaseError(error, 'adding wardrobe item');
  if (!data || data.length === 0) {
    return null;
  }
  
  // Get the created item with its ID
  const createdItem = convertToWardrobeItem(data[0]) as WardrobeItem;
  
  // If we have scenarios, add them to the join table
  if (scenarios.length > 0 && createdItem.id) {
    console.log('ATTEMPTING TO SAVE SCENARIOS for item:', createdItem.id, 'Scenarios:', scenarios);
    try {
      await replaceItemScenarios(createdItem.id, scenarios);
      console.log('SCENARIOS SAVED SUCCESSFULLY for item:', createdItem.id);
    } catch (scenarioError) {
      console.error('ERROR SAVING SCENARIOS:', scenarioError);
    }
    
    // Add scenarios back to the returned item object
    createdItem.scenarios = scenarios;
  } else {
    console.log('NO SCENARIOS TO SAVE for item:', createdItem.id || 'unknown');
    createdItem.scenarios = [];
  }
  
  // Trigger scenario coverage recalculation after item is added
  if (createdItem && userId && createdItem.wishlist !== true) {
    try {
      const items = await getWardrobeItems(userId);
      const scenarios = await getScenariosForUser(userId);
      
      console.log('🟦 SCENARIO COVERAGE - Triggering coverage calculation for added item:', createdItem.name);
      const season = createdItem.season?.[0] || 'all';
      await triggerItemAddedCoverage(userId, items, scenarios, createdItem, season);
    } catch (error) {
      console.error('🔴 SCENARIO COVERAGE - Failed to trigger coverage calculation:', error);
    }
  }
  
  return createdItem;
};

/**
 * Updates an existing wardrobe item
 * @param id Item ID to update
 * @param updates Partial WardrobeItem with updates
 * @returns Updated WardrobeItem object
 */
export const updateWardrobeItem = async (id: string, updates: Partial<WardrobeItem>): Promise<WardrobeItem | null> => {
  const updatesToApply = { ...updates };
  
  // Extract scenarios before updating item (they're stored in a join table)
  const scenarios = updatesToApply.scenarios;
  delete updatesToApply.scenarios;

  // Get the old item for comparison before updating
  const oldItem = await getWardrobeItem(id);
  
  const snakeCaseUpdates = camelToSnakeCase(updatesToApply);

  // Update the item
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update(snakeCaseUpdates)
    .eq('id', id)
    .select();

  handleSupabaseError(error, 'updating wardrobe item');
  if (!data || data.length === 0) {
    return null;
  }
  
  // Get the updated item
  const updatedItem = convertToWardrobeItem(data[0]) as WardrobeItem;
  
  // If scenarios were provided, update them in the join table
  if (scenarios !== undefined) {
    await replaceItemScenarios(id, scenarios || []);
    
    // Add scenarios back to the returned item object
    updatedItem.scenarios = scenarios || [];
  }
  
  // Trigger scenario coverage recalculation after item is updated
  if (oldItem && updatedItem) {
    const userId = await getCurrentUserId();
    if (userId) {
      try {
        const oldWasWishlist = oldItem.wishlist === true;
        const newIsWishlist = updatedItem.wishlist === true;
        const wishlistChanged = oldWasWishlist !== newIsWishlist;

        if (newIsWishlist && !wishlistChanged) {
          return updatedItem;
        }

        const items = await getWardrobeItems(userId);
        const scenarios = await getScenariosForUser(userId);
        
        console.log('🟦 SCENARIO COVERAGE - Triggering coverage calculation for updated item:', updatedItem.name);
        
        // Only process actual seasons, no more 'all' season
        const seasonsToUpdate = updatedItem.season?.length 
          ? updatedItem.season 
          : ['summer', 'winter', 'spring/fall'];
        
        // Special handling for accessories to avoid duplicate non-seasonal subcategory records
        if (updatedItem.category === 'accessory') {
          // For accessories, only trigger once (not per season) to handle both seasonal and non-seasonal subcategories properly
          console.log(`🟦 SCENARIO COVERAGE - Updating accessory coverage (all subcategories)`);
          const representativeSeason = seasonsToUpdate[0]; // Use first season as representative
          if (isSeason(representativeSeason)) {
            await triggerItemUpdatedCoverage(userId, items, scenarios, oldItem, updatedItem, representativeSeason as Season);
          }
        } else {
          // For non-accessories, trigger coverage update for each season
          for (const season of seasonsToUpdate) {
            if (isSeason(season)) {
              console.log(`🟦 SCENARIO COVERAGE - Updating coverage for season: ${season}`);
              await triggerItemUpdatedCoverage(userId, items, scenarios, oldItem, updatedItem, season);
            } else {
              console.warn(`⚠️  Skipping invalid season: ${season}`);
            }
          }
        }
      } catch (error) {
        console.error('🔴 SCENARIO COVERAGE - Failed to trigger coverage calculation:', error);
      }
    }
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('wardrobe:changed', { detail: { type: 'updated', id } }));
  }
  
  return updatedItem;
};

/**
 * Deletes a wardrobe item
 * @param id Item ID to delete
 */
export const deleteWardrobeItem = async (id: string): Promise<void> => {
  // Get the item before deleting it for scenario coverage calculation
  const deletedItem = await getWardrobeItem(id);
  const userId = await getCurrentUserId();

  let historyRecordIdToCleanup: string | null = null;
  const shouldCleanupHistory =
    deletedItem?.wishlist === true &&
    !!deletedItem.wishlistStatus &&
    deletedItem.wishlistStatus !== WishlistStatus.NOT_REVIEWED;

  if (shouldCleanupHistory) {
    const historyResult = await aiCheckHistoryService.getHistoryByWardrobeItemId(id);
    if (historyResult.success && historyResult.record?.id) {
      historyRecordIdToCleanup = historyResult.record.id;

      // IMPORTANT: Prevent ON DELETE CASCADE from removing the history record
      // by detaching the FK link BEFORE deleting the wardrobe item.
      const detachResult = await aiCheckHistoryService.detachHistoryRecord(historyRecordIdToCleanup);
      if (!detachResult.success) {
        throw new Error(detachResult.error || 'Failed to detach AI history record from wardrobe item');
      }

      // After detaching, clean heavy data from analysis_data
      const cleanupResult = await aiCheckHistoryService.cleanupRichData(historyRecordIdToCleanup);
      if (!cleanupResult.success) {
        throw new Error(cleanupResult.error || 'Failed to clean AI history rich data');
      }
    }
  }
  
  // First, remove this item from all outfits
  await removeItemFromAllOutfits(id);
  
  const { error } = await supabase
    .from(TABLE_NAME)
    .delete()
    .eq('id', id);

  handleSupabaseError(error, 'deleting wardrobe item');

  if (historyRecordIdToCleanup) {
    await aiCheckHistoryService.updateRecordStatus(historyRecordIdToCleanup, 'dismissed');
  }
  
  // Trigger scenario coverage recalculation after item is deleted
  if (deletedItem && userId && deletedItem.wishlist !== true) {
    try {
      const items = await getWardrobeItems(userId);
      const scenarios = await getScenariosForUser(userId);
      
      console.log('🟦 SCENARIO COVERAGE - Triggering coverage calculation for deleted item:', deletedItem.name);
      const season = deletedItem.season?.[0] || 'all';
      await triggerItemDeletedCoverage(userId, items, scenarios, deletedItem, season);
    } catch (error) {
      console.error('🔴 SCENARIO COVERAGE - Failed to trigger coverage calculation:', error);
    }
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('wardrobe:changed', { detail: { type: 'deleted', id } }));
  }
};

/**
 * Sets a wardrobe item's active status
 * @param id Item ID to update
 * @param isActive New active status
 * @returns Updated WardrobeItem object
 */
export const setWardrobeItemActive = async (id: string, isActive: boolean): Promise<WardrobeItem | null> => {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update({ is_active: isActive })
    .eq('id', id)
    .select();

  handleSupabaseError(error, 'setting wardrobe item active status');
  if (!data || data.length === 0) {
    return null;
  }
  return convertToWardrobeItem(data[0]) as WardrobeItem;
};
