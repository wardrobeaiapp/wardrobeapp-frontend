import { supabase } from './supabase';
import { WardrobeItem, ItemCategory } from '../types';
import { camelToSnakeCase, snakeToCamelCase } from '../utils/caseConversionExport';
import * as outfitItemsService from './outfitItemsService';

// Get all wardrobe items for the current user
export const getWardrobeItems = async (): Promise<WardrobeItem[]> => {
  try {
    // Check if user is authenticated
    const { data: authData, error: authError } = await supabase.auth.getUser();
    
    // If not authenticated, return empty array instead of throwing error
    // This allows the app to work in guest mode
    if (authError) {
      return [];
    }

    if (!authData.user) {
      return [];
    }

    // Query the wardrobe_items table
    const { data, error } = await supabase
      .from('wardrobe_items')
      .select('*')
      .eq('user_id', authData.user.id); // Note: Database column is still user_id
      // Removed the order by created_at as it might not exist yet

    if (error) {
      console.error('Supabase query error:', error);
      // Return empty array instead of throwing
      return [];
    }

    // If no data or empty array, return empty array
    if (!data || data.length === 0) {
      return [];
    }

    // Convert snake_case to camelCase for frontend use
    return data.map(item => snakeToCamelCase(item)) as WardrobeItem[];
  } catch (error: any) {
    console.error('Error fetching wardrobe items:', error.message || error);
    // Return empty array for any errors
    return [];
  }
};

// Add a new wardrobe item
export const addWardrobeItem = async (item: Omit<WardrobeItem, 'id'>): Promise<WardrobeItem | null> => {
  try {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      throw new Error('User not authenticated');
    }
    
    // Validate category before sending to database
    if (!Object.values(ItemCategory).includes(item.category)) {
      console.error('[wardrobeItemsService] Invalid category:', item.category);
      console.error('[wardrobeItemsService] Valid categories:', Object.values(ItemCategory));
      throw new Error(`Invalid category: ${item.category}. Valid categories are: ${Object.values(ItemCategory).join(', ')}`);
    }

    // Convert camelCase to snake_case for database storage
    const snakeCaseItem = camelToSnakeCase({
      ...item,
      userId: authData.user.id
    });
    
    const { data, error } = await supabase
      .from('wardrobe_items')
      .insert(snakeCaseItem)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Convert snake_case back to camelCase for frontend use
    return snakeToCamelCase(data) as WardrobeItem;
  } catch (error) {
    console.error('Error adding wardrobe item:', error);
    return null;
  }
};

// Update an existing wardrobe item
export const updateWardrobeItem = async (item: WardrobeItem): Promise<WardrobeItem | null> => {
  try {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      throw new Error('User not authenticated');
    }

    // Convert camelCase to snake_case for database storage
    const snakeCaseItem = camelToSnakeCase({
      ...item,
      updated_at: new Date().toISOString()
    });

    const { data, error } = await supabase
      .from('wardrobe_items')
      .update(snakeCaseItem)
      .eq('id', item.id)
      .eq('user_id', authData.user.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Convert snake_case back to camelCase for frontend use
    return snakeToCamelCase(data) as WardrobeItem;
  } catch (error) {
    console.error('Error updating wardrobe item:', error);
    return null;
  }
};

// Delete a wardrobe item
export const deleteWardrobeItem = async (itemId: string): Promise<boolean> => {
  try {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      throw new Error('User not authenticated');
    }

    // With CASCADE delete in the database, deleting the item will automatically
    // delete all related outfit_items entries. However, we'll explicitly clean up
    // any references to this item in the join table first just to be safe.
    
    // Get all outfits that contain this item
    const outfitIds = await outfitItemsService.getItemOutfits(itemId);
    
    // For each outfit, remove this item
    for (const outfitId of outfitIds) {
      await outfitItemsService.removeItemFromOutfit(outfitId, itemId);
    }

    // Now delete the item itself
    const { error } = await supabase
      .from('wardrobe_items')
      .delete()
      .eq('id', itemId)
      .eq('user_id', authData.user.id); // Using user_id as per the database schema

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error deleting wardrobe item:', error);
    return false;
  }
};

// Migrate items from localStorage to Supabase
export const migrateLocalStorageItemsToSupabase = async (): Promise<boolean> => {
  try {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      throw new Error('User not authenticated');
    }

    // Get items from localStorage
    const localStorageKey = `wardrobe-items-${authData.user.id}`;
    const localItems = JSON.parse(localStorage.getItem(localStorageKey) || '[]');
    
    if (localItems.length === 0) {
      return true;
    }

    // Prepare items for database insertion
    const itemsToInsert = localItems.map((item: WardrobeItem) => {
      return camelToSnakeCase({
        ...item,
        user_id: authData.user.id,
        // Remove id so Supabase can generate a new one
        id: undefined
      });
    });

    // Insert items in batches to avoid request size limits
    const batchSize = 50;
    for (let i = 0; i < itemsToInsert.length; i += batchSize) {
      const batch = itemsToInsert.slice(i, i + batchSize);
      const { error } = await supabase
        .from('wardrobe_items')
        .insert(batch);

      if (error) {
        throw error;
      }
    }

    // Clear localStorage after successful migration
    localStorage.removeItem(localStorageKey);
    
    return true;
  } catch (error) {
    console.error('Error migrating items to Supabase:', error);
    return false;
  }
};
