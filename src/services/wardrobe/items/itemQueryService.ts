import { supabase } from '../../../services/core';
import { WardrobeItem, ItemCategory } from '../../../types';
import { 
  TABLE_NAME, 
  handleSupabaseError, 
  convertToWardrobeItems 
} from './itemBaseService';

/**
 * Fetches wardrobe items by category
 * @param userId User ID to fetch items for
 * @param category Item category to filter by
 * @returns Array of WardrobeItem objects matching the category
 */
export const getItemsByCategory = async (userId: string, category: ItemCategory): Promise<WardrobeItem[]> => {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('user_id', userId)
    .eq('category', category)
    .eq('is_active', true);

  handleSupabaseError(error, 'fetching items by category');
  return convertToWardrobeItems(data || []);
};

/**
 * Fetches wardrobe items with expired image URLs
 * @param userId User ID to fetch items for
 * @returns Array of WardrobeItem objects with expired image URLs
 */
export const getItemsWithExpiredImageUrls = async (userId: string): Promise<WardrobeItem[]> => {
  // Get items where image URL is not null and image_url_expiry is either in the past or null
  const now = new Date().toISOString();
  
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('user_id', userId)
    .not('image_url', 'is', null)
    .or(`image_url_expiry.lt.${now},image_url_expiry.is.null`);
  
  handleSupabaseError(error, 'fetching items with expired image URLs');
  return convertToWardrobeItems(data || []);
};

/**
 * Fetches wardrobe items without hashtags
 * @param userId User ID to fetch items for
 * @returns Array of WardrobeItem objects without hashtags
 */
export const getItemsWithoutHashtags = async (userId: string): Promise<WardrobeItem[]> => {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('user_id', userId)
    .is('hashtags', null);
    
  handleSupabaseError(error, 'fetching items without hashtags');
  return convertToWardrobeItems(data || []);
};

/**
 * Fetches wardrobe items by IDs
 * @param itemIds Array of item IDs to fetch
 * @returns Array of WardrobeItem objects matching the IDs
 */
export const getItemsByIds = async (itemIds: string[]): Promise<WardrobeItem[]> => {
  if (!itemIds || itemIds.length === 0) return [];
  
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .in('id', itemIds);
    
  handleSupabaseError(error, 'fetching items by IDs');
  return convertToWardrobeItems(data || []);
};
