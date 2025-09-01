import { supabase } from './core';

// Table name for day plan items
const TABLE_NAME = 'day_plan_items';

/**
 * Get all items for a specific day plan
 * @param dayPlanId The day plan ID to fetch items for
 * @returns Array of item IDs
 */
export const getItemsForDayPlan = async (dayPlanId: string): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('item_id')
      .eq('day_plan_id', dayPlanId);
      
    if (error) {
      // Error handling for fetching day plan items
      throw error;
    }
    
    return data ? data.map(row => row.item_id as string) : [];
  } catch (error) {
    // Error handling in getItemsForDayPlan
    throw error;
  }
};

/**
 * Get all day plans that include a specific item
 * @param itemId The item ID to find day plans for
 * @returns Array of day plan IDs
 */
export const getDayPlansForItem = async (itemId: string): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('day_plan_id')
      .eq('item_id', itemId);
      
    if (error) {
      // Error handling for fetching day plans for item
      throw error;
    }
    
    return data ? data.map(row => row.day_plan_id as string) : [];
  } catch (error) {
    // Error handling in getDayPlansForItem
    throw error;
  }
};

/**
 * Add an item to a day plan
 * @param dayPlanId The day plan ID
 * @param itemId The item ID to add
 * @param userId The user ID
 * @returns True if successful
 */
export const addItemToDayPlan = async (
  dayPlanId: string, 
  itemId: string, 
  userId: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from(TABLE_NAME)
      .insert({
        day_plan_id: dayPlanId,
        item_id: itemId,
        user_id: userId
      });
      
    if (error) {
      // If it's a unique constraint violation, the item is already in the day plan
      if (error.code === '23505') {
        return true;
      }
      // Error handling for adding item to day plan
      throw error;
    }
    
    return true;
  } catch (error) {
    // Error handling in addItemToDayPlan
    throw error;
  }
};

/**
 * Remove an item from a day plan
 * @param dayPlanId The day plan ID
 * @param itemId The item ID to remove
 * @returns True if successful
 */
export const removeItemFromDayPlan = async (
  dayPlanId: string, 
  itemId: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('day_plan_id', dayPlanId)
      .eq('item_id', itemId);
      
    if (error) {
      // Error handling for removing item from day plan
      throw error;
    }
    
    return true;
  } catch (error) {
    // Error handling in removeItemFromDayPlan
    throw error;
  }
};

/**
 * Update the items in a day plan (replace all)
 * @param dayPlanId The day plan ID
 * @param itemIds Array of item IDs to set for the day plan
 * @param userId The user ID
 * @returns True if successful
 */
export const updateDayPlanItems = async (
  dayPlanId: string, 
  itemIds: string[], 
  userId: string
): Promise<boolean> => {
  try {
    // First, remove all existing items for this day plan
    const { error: deleteError } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('day_plan_id', dayPlanId);
      
    if (deleteError) {
      // Error handling for removing existing day plan items
      throw deleteError;
    }
    
    // If there are no items to add, we're done
    if (!itemIds.length) {
      return true;
    }
    
    // Then, add all the new items
    const itemsToInsert = itemIds.map(itemId => ({
      day_plan_id: dayPlanId,
      item_id: itemId,
      user_id: userId
    }));
    
    const { error: insertError } = await supabase
      .from(TABLE_NAME)
      .insert(itemsToInsert);
      
    if (insertError) {
      // Error handling for adding new day plan items
      throw insertError;
    }
    
    return true;
  } catch (error) {
    // Error handling in updateDayPlanItems
    throw error;
  }
};

/**
 * Delete all items for a day plan
 * @param dayPlanId The day plan ID to remove all items for
 * @returns True if successful
 */
export const deleteAllItemsForDayPlan = async (dayPlanId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('day_plan_id', dayPlanId);
      
    if (error) {
      // Error handling for deleting all items for day plan
      throw error;
    }
    
    return true;
  } catch (error) {
    // Error handling in deleteAllItemsForDayPlan
    throw error;
  }
};
