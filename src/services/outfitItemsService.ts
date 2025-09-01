import { supabase } from './core';

/**
 * Service for managing outfit-item relationships using the join table
 */

// Add an item to an outfit
export const addItemToOutfit = async (
  outfitId: string,
  itemId: string
): Promise<boolean> => {
  try {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('outfit_items')
      .insert({
        outfit_id: outfitId,
        item_id: itemId,
        user_id: authData.user.id
      });

    if (error) {
      console.error('Error adding item to outfit:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error adding item to outfit:', error);
    return false;
  }
};

// Remove an item from an outfit
export const removeItemFromOutfit = async (
  outfitId: string,
  itemId: string
): Promise<boolean> => {
  try {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('outfit_items')
      .delete()
      .eq('outfit_id', outfitId)
      .eq('item_id', itemId)
      .eq('user_id', authData.user.id);

    if (error) {
      console.error('Error removing item from outfit:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error removing item from outfit:', error);
    return false;
  }
};

// Get all items for an outfit
export const getOutfitItems = async (outfitId: string): Promise<string[]> => {
  try {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      return [];
    }

    // Define the type for the query result
    interface OutfitItemRecord {
      item_id: string;
    }

    const { data, error } = await supabase
      .from('outfit_items')
      .select('item_id')
      .eq('outfit_id', outfitId)
      .eq('user_id', authData.user.id) as { data: OutfitItemRecord[] | null, error: any };

    if (error || !data) {
      console.error('Error getting outfit items:', error);
      return [];
    }

    // Use the OutfitItemRecord type we defined earlier
    return data.map((record: OutfitItemRecord) => record.item_id);
  } catch (error) {
    console.error('Error getting outfit items:', error);
    return [];
  }
};

// Get all outfits for an item
export const getItemOutfits = async (itemId: string): Promise<string[]> => {
  try {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      return [];
    }

    const { data, error } = await supabase
      .from('outfit_items')
      .select('outfit_id')
      .eq('item_id', itemId)
      .eq('user_id', authData.user.id);

    if (error || !data) {
      console.error('Error getting item outfits:', error);
      return [];
    }

    return data.map(record => record.outfit_id as string);
  } catch (error) {
    console.error('Error getting item outfits:', error);
    return [];
  }
};

// Add multiple items to an outfit
export const addItemsToOutfit = async (
  outfitId: string,
  itemIds: string[]
): Promise<boolean> => {
  try {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      throw new Error('User not authenticated');
    }

    // Create an array of records to insert
    const records = itemIds.map(itemId => ({
      outfit_id: outfitId,
      item_id: itemId,
      user_id: authData.user.id
    }));

    // Insert the records
    const { error } = await supabase
      .from('outfit_items')
      .upsert(records, { onConflict: 'outfit_id,item_id' });

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error adding items to outfit:', error);
    return false;
  }
};

// Remove all items from an outfit
export const removeAllItemsFromOutfit = async (
  outfitId: string
): Promise<boolean> => {
  try {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('outfit_items')
      .delete()
      .eq('outfit_id', outfitId)
      .eq('user_id', authData.user.id);

    if (error) {
      console.error('Error removing all items from outfit:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error removing all items from outfit:', error);
    return false;
  }
};
