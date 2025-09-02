import { supabase } from '../../../services/core';
import { TABLE_NAME, camelToSnakeCase } from './itemBaseService';
import { WardrobeItem } from '../../../types';

/**
 * Migrates wardrobe items from localStorage to Supabase
 * @returns true if migration was successful, false otherwise
 */
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
        .from(TABLE_NAME)
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
