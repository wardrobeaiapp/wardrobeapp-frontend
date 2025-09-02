import { supabase } from '../../../services/core';
import { WardrobeItem } from '../../../types';
import { removeItemFromAllOutfits } from '../outfits';
import { 
  TABLE_NAME, 
  camelToSnakeCase, 
  handleSupabaseError, 
  convertToWardrobeItem, 
  convertToWardrobeItems 
} from './itemBaseService';

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

  return convertToWardrobeItems(data || []);
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
  return convertToWardrobeItem(data);
};

/**
 * Adds a new wardrobe item
 * @param item Partial WardrobeItem object
 * @returns Created WardrobeItem object
 */
export const addWardrobeItem = async (item: Partial<WardrobeItem>): Promise<WardrobeItem | null> => {
  const snakeCaseItem = camelToSnakeCase(item);

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert([snakeCaseItem])
    .select();

  handleSupabaseError(error, 'adding wardrobe item');
  if (!data || data.length === 0) {
    return null;
  }
  return convertToWardrobeItem(data[0]) as WardrobeItem;
};

/**
 * Updates an existing wardrobe item
 * @param id Item ID to update
 * @param updates Partial WardrobeItem with updates
 * @returns Updated WardrobeItem object
 */
export const updateWardrobeItem = async (id: string, updates: Partial<WardrobeItem>): Promise<WardrobeItem | null> => {
  const snakeCaseUpdates = camelToSnakeCase(updates);

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update(snakeCaseUpdates)
    .eq('id', id)
    .select();

  handleSupabaseError(error, 'updating wardrobe item');
  if (!data || data.length === 0) {
    return null;
  }
  return convertToWardrobeItem(data[0]) as WardrobeItem;
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

/**
 * For backward compatibility with existing code
 * @deprecated Use getWardrobeItems instead
 */
export const fetchWardrobeItems = async (): Promise<WardrobeItem[]> => {
  try {
    const { data, error } = await supabase
      .from('wardrobe_items')
      .select('*')
      .order('dateAdded', { ascending: false });
    
    if (error) throw error;
    
    // Properly map the data to ensure it conforms to WardrobeItem interface
    const typedItems = data?.map(item => ({
      id: item.id,
      name: item.name,
      category: item.category,
      subcategory: item.subcategory,
      color: item.color,
      size: item.size,
      material: item.material,
      brand: item.brand,
      price: item.price,
      silhouette: item.silhouette,
      length: item.length,
      season: item.season,
      imageUrl: item.imageUrl,
      dateAdded: item.dateAdded || item.date_added,
      lastWorn: item.lastWorn || item.last_worn,
      timesWorn: item.timesWorn || item.times_worn || 0,
      tags: item.tags,
      wishlist: item.wishlist,
      wishlistStatus: item.wishlistStatus || item.wishlist_status,
      userId: item.userId || item.user_id
    })) as WardrobeItem[];
    
    return typedItems || [];
  } catch (error) {
    console.error('[Supabase] Error fetching wardrobe items:', error);
    // Try to get items from local storage as fallback
    const storedItems = localStorage.getItem('guestItems');
    if (storedItems) {
      return JSON.parse(storedItems) as WardrobeItem[];
    }
    throw error;
  }
};

/**
 * For backward compatibility with existing code
 * @deprecated Use addWardrobeItem instead
 */
export const createWardrobeItem = async (item: Omit<WardrobeItem, 'id' | 'dateAdded' | 'timesWorn'>): Promise<WardrobeItem> => {
  try {
    // Add default values for new items
    const newItem = {
      ...item,
      dateAdded: new Date().toISOString(),
      timesWorn: 0,
      // Ensure tags are properly included in the insert
      tags: item.tags ? { ...item.tags } : undefined
    };
    
    console.log('[Supabase] Creating wardrobe item with tags:', newItem.tags);
    
    const { data, error } = await supabase
      .from('wardrobe_items')
      .insert(newItem)
      .select()
      .single();
    
    if (error) throw error;
    
    // Properly map the data to ensure it conforms to WardrobeItem interface
    const typedItem: WardrobeItem = {
      id: data.id as string,
      name: data.name as string,
      category: data.category as any,
      subcategory: data.subcategory as string | undefined,
      color: data.color as string,
      size: data.size as string | undefined,
      material: data.material as string | undefined,
      brand: data.brand as string | undefined,
      price: data.price as number | undefined,
      silhouette: data.silhouette as string | undefined,
      length: data.length as string | undefined,
      season: data.season as any[],
      imageUrl: data.imageUrl as string | undefined,
      dateAdded: (data.dateAdded || data.date_added) as string,
      lastWorn: (data.lastWorn || data.last_worn) as string | undefined,
      timesWorn: (data.timesWorn || data.times_worn || 0) as number,
      // Store the complete tags object as-is with the correct type
      tags: data.tags as Record<string, any> | undefined,
      wishlist: data.wishlist as boolean | undefined,
      wishlistStatus: (data.wishlistStatus || data.wishlist_status) as any | undefined,
      userId: (data.userId || data.user_id) as string | undefined
    };
    
    return typedItem;
  } catch (error) {
    console.error('[Supabase] Error creating wardrobe item:', error);
    
    // Fallback to local storage for guest users
    const newItem: WardrobeItem = {
      ...item,
      id: `item-${Date.now()}`,
      dateAdded: new Date().toISOString(),
      timesWorn: 0
    } as WardrobeItem;
    
    // Save to local storage
    const storedItems = localStorage.getItem('guestItems');
    const items = storedItems ? JSON.parse(storedItems) : [];
    const updatedItems = [newItem, ...items];
    localStorage.setItem('guestItems', JSON.stringify(updatedItems));
    
    return newItem;
  }
};

/**
 * For backward compatibility with existing code
 * @deprecated Use updateWardrobeItem instead
 */
export const updateWardrobeItemApi = async (id: string, updates: Partial<WardrobeItem>): Promise<void> => {
  try {
    // Create a copy of the item to avoid mutating the original
    const updateData = { ...updates };
    
    // If tags is being updated, ensure it's properly handled
    if ('tags' in updateData) {
      console.log('[Supabase] Updating tags for item:', id, 'New tags:', updateData.tags);
      // If tags is an empty object, set it to undefined to remove it from the update
      if (updateData.tags && Object.keys(updateData.tags).length === 0) {
        updateData.tags = undefined;
      } else if (updateData.tags === null) {
        // Convert null to undefined to properly clear the tags
        updateData.tags = undefined;
      }
    }
    
    const { error } = await supabase
      .from('wardrobe_items')
      .update(updateData)
      .eq('id', id);
    
    if (error) throw error;
  } catch (error) {
    console.error('[Supabase] Error updating wardrobe item:', error);
    
    // Fallback to local storage for guest users
    const storedItems = localStorage.getItem('guestItems');
    if (storedItems) {
      const items = JSON.parse(storedItems);
      const updatedItems = items.map((existingItem: WardrobeItem) => 
        existingItem.id === id ? { ...existingItem, ...updates } : existingItem
      );
      localStorage.setItem('guestItems', JSON.stringify(updatedItems));
    }
  }
};

/**
 * For backward compatibility with existing code
 * @deprecated Use deleteWardrobeItem instead
 */
export const deleteWardrobeItemApi = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('wardrobe_items')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  } catch (error) {
    console.error('[Supabase] Error deleting wardrobe item:', error);
    
    // Fallback to local storage for guest users
    const storedItems = localStorage.getItem('guestItems');
    if (storedItems) {
      const items = JSON.parse(storedItems);
      const updatedItems = items.filter((item: WardrobeItem) => item.id !== id);
      localStorage.setItem('guestItems', JSON.stringify(updatedItems));
    }
  }
};
