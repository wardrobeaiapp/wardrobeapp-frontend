import { supabase } from '../core';
import { WardrobeItem, ItemCategory } from '../../types';
import { camelToSnakeCase, snakeToCamelCase } from '../../utils/caseConversionExport';
import * as outfitItemsService from './outfitItemsService';

// Generate a signed URL for an image
export const generateSignedUrl = async (filePath: string, expiresIn: number = 3600): Promise<string> => {
  console.log('[wardrobeItemsService] Calling generate-signed-url function for path:', filePath);
  
  const { data, error } = await supabase.functions.invoke('generate-signed-url', {
    body: {
      filePath: filePath,
      expiresIn: expiresIn
    }
  }); // 1 hour expiration
  
  if (error) {
    console.error('[wardrobeItemsService] Error from generate-signed-url function:', error);
    throw error;
  }
  
  console.log('[wardrobeItemsService] Data from generate-signed-url function:', data);
  return data.url;
};

const TABLE_NAME = 'wardrobe_items';

export const getWardrobeItems = async (userId: string, activeOnly: boolean = false): Promise<WardrobeItem[]> => {
  let query = supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('user_id', userId);

  if (activeOnly) {
    query = query.eq('is_active', true);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[wardrobeItemsService] Error fetching wardrobe items:', error);
    throw error;
  }

  const camelCaseData = data.map(item => snakeToCamelCase(item) as WardrobeItem);
  return camelCaseData;
};

export const getOutfitItems = async (outfitId: string): Promise<WardrobeItem[]> => {
  // First get the item IDs from the outfits_items table
  const itemIds = await outfitItemsService.getItemIdsForOutfit(outfitId);
  
  if (!itemIds.length) {
    return [];
  }
  
  // Then fetch all those items
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .in('id', itemIds);
  
  if (error) {
    console.error('[wardrobeItemsService] Error fetching outfit items:', error);
    throw error;
  }
  
  const camelCaseData = data.map(item => snakeToCamelCase(item) as WardrobeItem);
  return camelCaseData;
};

export const getWardrobeItem = async (id: string): Promise<WardrobeItem | null> => {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Item not found
    }
    console.error('[wardrobeItemsService] Error fetching wardrobe item:', error);
    throw error;
  }

  return snakeToCamelCase(data) as WardrobeItem;
};

export const addWardrobeItem = async (item: Partial<WardrobeItem>): Promise<WardrobeItem> => {
  const snakeCaseItem = camelToSnakeCase(item);

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert([snakeCaseItem])
    .select();

  if (error) {
    console.error('[wardrobeItemsService] Error adding wardrobe item:', error);
    throw error;
  }

  return snakeToCamelCase(data[0]) as WardrobeItem;
};

export const updateWardrobeItem = async (id: string, updates: Partial<WardrobeItem>): Promise<WardrobeItem> => {
  const snakeCaseUpdates = camelToSnakeCase(updates);

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update(snakeCaseUpdates)
    .eq('id', id)
    .select();

  if (error) {
    console.error('[wardrobeItemsService] Error updating wardrobe item:', error);
    throw error;
  }

  return snakeToCamelCase(data[0]) as WardrobeItem;
};

export const deleteWardrobeItem = async (id: string): Promise<void> => {
  // First, remove this item from all outfits
  await outfitItemsService.removeItemFromAllOutfits(id);
  
  const { error } = await supabase
    .from(TABLE_NAME)
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[wardrobeItemsService] Error deleting wardrobe item:', error);
    throw error;
  }
};

export const setWardrobeItemActive = async (id: string, isActive: boolean): Promise<WardrobeItem> => {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update({ is_active: isActive })
    .eq('id', id)
    .select();

  if (error) {
    console.error('[wardrobeItemsService] Error setting wardrobe item active status:', error);
    throw error;
  }

  return snakeToCamelCase(data[0]) as WardrobeItem;
};

export const getItemsByCategory = async (userId: string, category: ItemCategory): Promise<WardrobeItem[]> => {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('user_id', userId)
    .eq('category', category)
    .eq('is_active', true);

  if (error) {
    console.error('[wardrobeItemsService] Error fetching items by category:', error);
    throw error;
  }

  const camelCaseData = data.map(item => snakeToCamelCase(item) as WardrobeItem);
  return camelCaseData;
};

export const getItemsWithExpiredImageUrls = async (userId: string): Promise<WardrobeItem[]> => {
  // Get items where image URL is not null and image_url_expiry is either in the past or null
  const now = new Date().toISOString();
  
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('user_id', userId)
    .not('image_url', 'is', null)
    .or(`image_url_expiry.lt.${now},image_url_expiry.is.null`);
  
  if (error) {
    console.error('[wardrobeItemsService] Error fetching items with expired image URLs:', error);
    throw error;
  }
  
  const camelCaseData = data.map(item => snakeToCamelCase(item) as WardrobeItem);
  return camelCaseData;
};

export const getItemsWithoutHashtags = async (userId: string): Promise<WardrobeItem[]> => {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('user_id', userId)
    .is('hashtags', null);
    
  if (error) {
    console.error('[wardrobeItemsService] Error fetching items without hashtags:', error);
    throw error;
  }
  
  const camelCaseData = data.map(item => snakeToCamelCase(item) as WardrobeItem);
  return camelCaseData;
};

export const getItemsByIds = async (itemIds: string[]): Promise<WardrobeItem[]> => {
  if (!itemIds.length) {
    return [];
  }
  
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .in('id', itemIds);
  
  if (error) {
    console.error('[wardrobeItemsService] Error fetching items by IDs:', error);
    throw error;
  }
  
  const camelCaseData = data.map(item => snakeToCamelCase(item) as WardrobeItem);
  return camelCaseData;
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
