import { supabase } from './core';

// Table name for capsule items in Supabase
const CAPSULE_ITEMS_TABLE = 'capsule_items';

/**
 * Fetch all items for a specific capsule
 */
export const fetchCapsuleItems = async (capsuleId: string): Promise<string[]> => {
  try {
    console.log('[capsuleItemsService] Fetching items for capsule:', capsuleId);
    
    // Get current user
    const { data: authData, error: authError } = await supabase.auth.getUser();
    
    if (authError || !authData.user) {
      console.error('[capsuleItemsService] User not authenticated:', authError);
      throw new Error('User not authenticated');
    }
    
    const userId = authData.user.id;
    
    // Fetch items from the join table
    const { data, error } = await supabase
      .from(CAPSULE_ITEMS_TABLE)
      .select('item_id')
      .eq('capsule_id', capsuleId)
      .eq('user_id', userId);
      
    if (error) {
      console.error(`[capsuleItemsService] Error fetching items for capsule ${capsuleId}:`, error);
      throw error;
    }
    
    // Extract item IDs
    const itemIds = data.map(item => item.item_id as string);
    console.log(`[capsuleItemsService] Found ${itemIds.length} items for capsule ${capsuleId}`);
    
    return itemIds;
  } catch (error) {
    console.error('[capsuleItemsService] Error in fetchCapsuleItems:', error);
    // Return empty array on error
    return [];
  }
};

/**
 * Add items to a capsule
 */
export const addItemsToCapsule = async (capsuleId: string, itemIds: string[]): Promise<boolean> => {
  try {
    if (!itemIds.length) {
      console.log('[capsuleItemsService] No items to add');
      return true;
    }
    
    console.log(`[capsuleItemsService] Adding ${itemIds.length} items to capsule ${capsuleId}`);
    
    // Get current user
    const { data: authData, error: authError } = await supabase.auth.getUser();
    
    if (authError || !authData.user) {
      console.error('[capsuleItemsService] User not authenticated:', authError);
      throw new Error('User not authenticated');
    }
    
    const userId = authData.user.id;
    
    // Create records for the join table
    const records = itemIds.map(itemId => ({
      capsule_id: capsuleId,
      item_id: itemId,
      user_id: userId
    }));
    
    // Insert into the join table
    const { error } = await supabase
      .from(CAPSULE_ITEMS_TABLE)
      .upsert(records, { onConflict: 'capsule_id,item_id' });
      
    if (error) {
      console.error('[capsuleItemsService] Error adding items to capsule:', error);
      throw error;
    }
    
    console.log('[capsuleItemsService] Successfully added items to capsule');
    return true;
  } catch (error) {
    console.error('[capsuleItemsService] Error in addItemsToCapsule:', error);
    return false;
  }
};

/**
 * Remove items from a capsule
 */
export const removeItemsFromCapsule = async (capsuleId: string, itemIds: string[]): Promise<boolean> => {
  try {
    if (!itemIds.length) {
      console.log('[capsuleItemsService] No items to remove');
      return true;
    }
    
    console.log(`[capsuleItemsService] Removing ${itemIds.length} items from capsule ${capsuleId}`);
    
    // Get current user
    const { data: authData, error: authError } = await supabase.auth.getUser();
    
    if (authError || !authData.user) {
      console.error('[capsuleItemsService] User not authenticated:', authError);
      throw new Error('User not authenticated');
    }
    
    // Remove specific items from the join table
    const { error } = await supabase
      .from(CAPSULE_ITEMS_TABLE)
      .delete()
      .eq('capsule_id', capsuleId)
      .in('item_id', itemIds);
      
    if (error) {
      console.error('[capsuleItemsService] Error removing items from capsule:', error);
      throw error;
    }
    
    console.log('[capsuleItemsService] Successfully removed items from capsule');
    return true;
  } catch (error) {
    console.error('[capsuleItemsService] Error in removeItemsFromCapsule:', error);
    return false;
  }
};

/**
 * Replace all items in a capsule
 */
export const replaceAllCapsuleItems = async (capsuleId: string, itemIds: string[]): Promise<boolean> => {
  try {
    console.log(`[capsuleItemsService] Replacing all items for capsule ${capsuleId}`);
    
    // Get current user
    const { data: authData, error: authError } = await supabase.auth.getUser();
    
    if (authError || !authData.user) {
      console.error('[capsuleItemsService] User not authenticated:', authError);
      throw new Error('User not authenticated');
    }
    
    const userId = authData.user.id;
    
    // First, delete all existing items for this capsule
    const { error: deleteError } = await supabase
      .from(CAPSULE_ITEMS_TABLE)
      .delete()
      .eq('capsule_id', capsuleId)
      .eq('user_id', userId);
      
    if (deleteError) {
      console.error(`[capsuleItemsService] Error deleting items for capsule ${capsuleId}:`, deleteError);
      throw deleteError;
    }
    
    // If there are no new items to add, we're done
    if (!itemIds.length) {
      console.log(`[capsuleItemsService] No new items to add for capsule ${capsuleId}`);
      return true;
    }
    
    // Prepare records for insertion
    const records = itemIds.map(itemId => ({
      capsule_id: capsuleId,
      item_id: itemId,
      user_id: userId
    }));
    
    // Insert new items
    const { error: insertError } = await supabase
      .from(CAPSULE_ITEMS_TABLE)
      .insert(records);
      
    if (insertError) {
      console.error(`[capsuleItemsService] Error adding items to capsule ${capsuleId}:`, insertError);
      throw insertError;
    }
    
    console.log(`[capsuleItemsService] Successfully replaced items for capsule ${capsuleId}`);
    return true;
  } catch (error) {
    console.error('[capsuleItemsService] Error in replaceAllCapsuleItems:', error);
    return false;
  }
};

/**
 * Get all capsules that contain a specific item
 */
export const getItemCapsules = async (itemId: string): Promise<string[]> => {
  try {
    console.log('[capsuleItemsService] Fetching capsules for item:', itemId);
    
    // Get current user
    const { data: authData, error: authError } = await supabase.auth.getUser();
    
    if (authError || !authData.user) {
      console.error('[capsuleItemsService] User not authenticated:', authError);
      throw new Error('User not authenticated');
    }
    
    const userId = authData.user.id;
    
    // Fetch capsules from the join table
    const { data, error } = await supabase
      .from(CAPSULE_ITEMS_TABLE)
      .select('capsule_id')
      .eq('item_id', itemId)
      .eq('user_id', userId);
      
    if (error) {
      console.error(`[capsuleItemsService] Error fetching capsules for item ${itemId}:`, error);
      throw error;
    }
    
    // Extract capsule IDs
    const capsuleIds = data.map(item => item.capsule_id as string);
    console.log(`[capsuleItemsService] Found ${capsuleIds.length} capsules for item ${itemId}`);
    
    return capsuleIds;
  } catch (error) {
    console.error('[capsuleItemsService] Error in getItemCapsules:', error);
    // Return empty array on error
    return [];
  }
};
