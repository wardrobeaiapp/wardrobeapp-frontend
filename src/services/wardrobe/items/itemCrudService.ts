import { supabase } from '../../../services/core';
import { WardrobeItem, WishlistStatus, Season } from '../../../types';
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
    itemToAdd.season = [Season.SPRING, Season.SUMMER, Season.FALL, Season.WINTER];
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
  
  return updatedItem;
};

/**
 * Deletes a wardrobe item
 * @param id Item ID to delete
 */
export const deleteWardrobeItem = async (id: string): Promise<void> => {
  // First, remove this item from all outfits
  await removeItemFromAllOutfits(id);
  
  const { error } = await supabase
    .from(TABLE_NAME)
    .delete()
    .eq('id', id);

  handleSupabaseError(error, 'deleting wardrobe item');
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
