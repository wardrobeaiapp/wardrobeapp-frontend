import { supabase } from '../../../services/core';
import { WardrobeItem, ItemCategory, Season, WishlistStatus } from '../../../types';
import { camelToSnakeCase, snakeToCamelCase } from '../../../utils/caseConversionExport';
import { outfitItemsService } from '../outfits';

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
  if (!itemIds || itemIds.length === 0) return [];
  
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .in('id', itemIds);
    
  if (error) {
    console.error('Error fetching items by IDs:', error);
    throw error;
  }
  
  return data.map(item => snakeToCamelCase(item) as WardrobeItem);
};

/**
 * Fetches all wardrobe items for the current user
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
 * Creates a new wardrobe item
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
      category: data.category as ItemCategory,
      subcategory: data.subcategory as string | undefined,
      color: data.color as string,
      size: data.size as string | undefined,
      material: data.material as string | undefined,
      brand: data.brand as string | undefined,
      price: data.price as number | undefined,
      silhouette: data.silhouette as string | undefined,
      length: data.length as string | undefined,
      season: data.season as Season[],
      imageUrl: data.imageUrl as string | undefined,
      dateAdded: (data.dateAdded || data.date_added) as string,
      lastWorn: (data.lastWorn || data.last_worn) as string | undefined,
      timesWorn: (data.timesWorn || data.times_worn || 0) as number,
      // Store the complete tags object as-is with the correct type
      tags: data.tags as Record<string, any> | undefined,
      wishlist: data.wishlist as boolean | undefined,
      wishlistStatus: (data.wishlistStatus || data.wishlist_status) as WishlistStatus | undefined,
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
    };
    
    // Save to local storage
    const storedItems = localStorage.getItem('guestItems');
    const items = storedItems ? JSON.parse(storedItems) : [];
    const updatedItems = [newItem, ...items];
    localStorage.setItem('guestItems', JSON.stringify(updatedItems));
    
    return newItem;
  }
};

/**
 * Updates an existing wardrobe item
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
 * Deletes a wardrobe item
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
