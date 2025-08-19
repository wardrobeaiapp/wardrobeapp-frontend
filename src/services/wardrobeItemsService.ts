import { supabase } from './supabase';
import { WardrobeItem, ItemCategory } from '../types';
import { camelToSnakeCase, snakeToCamelCase } from '../utils/caseConversionExport';
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
  
  console.log('[wardrobeItemsService] Generated signed URL:', data.signedUrl);
  return data.signedUrl;
};

// Upload file and get signed URL with user-specific folder structure
const uploadAndSignUrl = async (file: File, itemId: string, userId: string): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${itemId}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
  const filePath = `${userId}/${fileName}`; // User-specific folder
  
  console.log('[wardrobeItemsService] Uploading file to path:', filePath);
  
  // Upload the file
  const { error: uploadError } = await supabase.storage
    .from('wardrobe-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });
  
  if (uploadError) {
    console.error('[wardrobeItemsService] Storage upload error:', uploadError);
    throw new Error(`Failed to upload image: ${uploadError.message}`);
  }
  
  console.log('[wardrobeItemsService] File uploaded successfully, generating signed URL...');
  
  // Generate 7-day signed URL for production use
  try {
    const signedUrlData = await generateSignedUrl(filePath, 604800); // 7 days in seconds
    const imageExpiry = new Date(Date.now() + (604800 * 1000)); // 7 days from now
    console.log('Generated 7-day signed URL for production, expires at:', imageExpiry);
    return signedUrlData;
  } catch (signedUrlError) {
    console.error('Failed to generate signed URL:', signedUrlError);
    // Fallback: store file path if signed URL generation fails
    return filePath;
  }
};

// Delete image from storage
const deleteImageFromStorage = async (imageUrl: string | null, userId: string): Promise<void> => {
  try {
    if (!imageUrl) {
      console.log('No image URL provided, skipping deletion');
      return;
    }
    
    // Extract filename from the signed URL or imageUrl
    const urlParts = imageUrl.split('/');
    const filename = urlParts[urlParts.length - 1].split('?')[0]; // Remove query params
    const filePath = `${userId}/${filename}`;
    
    const { error } = await supabase.storage
      .from('wardrobe-images')
      .remove([filePath]);
    
    if (error) {
      console.warn('Error deleting image from storage:', error);
    }
  } catch (error) {
    console.warn('Error parsing image URL for deletion:', error);
  }
};

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

// Add a new wardrobe item with optional file upload
export const addWardrobeItem = async (item: Omit<WardrobeItem, 'id'>, file?: File): Promise<WardrobeItem | null> => {
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

    // Handle file upload if provided - store file path instead of signed URL
    let imageUrl = item.imageUrl;
    let imageExpiry: Date | null = null;
    if (file) {
      console.log('[wardrobeItemsService] Uploading file and storing path instead of signed URL');
      
      // Create a temporary item to get an ID for the file name
      const tempItemData = {
        user_id: authData.user.id,
        name: 'temp_' + Date.now(), // Temporary name
        category: 'other', // Default category
        color: 'unknown', // Default color
        season: ['all'], // Default season
        wishlist: false
      };

      const { data: tempItem, error: tempItemError } = await supabase
        .from('wardrobe_items')
        .insert(tempItemData)
        .select()
        .single();
      
      if (tempItemError) {
        console.error('Error creating temporary item:', tempItemError);
        throw new Error('Failed to create temporary item: ' + tempItemError.message);
      }
      
      if (!tempItem) throw new Error('No data returned when creating temporary item');
      
      // Upload file but store file path instead of signed URL
      if (typeof tempItem.id === 'string') {
        const fileExt = file.name.split('.').pop();
        const fileName = `${tempItem.id}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `${authData.user.id}/${fileName}`;
        
        console.log('[wardrobeItemsService] Uploading file to path:', filePath);
        
        // Upload the file
        const { error: uploadError } = await supabase.storage
          .from('wardrobe-images')
          .upload(filePath, file);

        if (uploadError) {
          console.error('[wardrobeItemsService] Error uploading file:', uploadError);
          throw uploadError;
        }

        console.log('[wardrobeItemsService] File uploaded successfully, generating 1-hour signed URL for testing');
        
        // Generate 1-hour signed URL for testing
        try {
          const signedUrl = await generateSignedUrl(filePath, 604800); // 7 days for production
          imageUrl = signedUrl;
          imageExpiry = new Date(Date.now() + 604800 * 1000); // 7 days from now
          console.log('[wardrobeItemsService] Generated 7-day signed URL, expires at:', imageExpiry);
        } catch (signedUrlError) {
          console.error('[wardrobeItemsService] Failed to generate signed URL:', signedUrlError);
          // Fallback: store file path if signed URL generation fails
          imageUrl = filePath;
        }
      } else {
        throw new Error('Failed to generate item ID for file upload');
      }
      
      // Delete the temporary item
      if (typeof tempItem.id === 'string') {
        await supabase
          .from('wardrobe_items')
          .delete()
          .eq('id', tempItem.id);
      }
    }

    // Convert camelCase to snake_case for database storage
    // Only include imageExpiry if column exists (backwards compatibility)
    const itemData = {
      ...item,
      imageUrl,
      userId: authData.user.id
    };
    
    // TODO: Remove this check once image_expiry column is added to database
    // Only include imageExpiry if column exists and we have a value
    if (imageExpiry) {
      console.log('[wardrobeItemsService] Including imageExpiry in database insert:', imageExpiry);
      // Convert Date object to ISO string for database storage
      (itemData as any).imageExpiry = imageExpiry.toISOString();
    } else {
      console.log('[wardrobeItemsService] Skipping imageExpiry - column may not exist yet');
    }
    
    const snakeCaseItem = camelToSnakeCase(itemData);
    
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

// Update an existing wardrobe item with optional file upload
export const updateWardrobeItem = async (item: WardrobeItem, file?: File): Promise<WardrobeItem | null> => {
  try {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      throw new Error('User not authenticated');
    }

    // Handle file upload if provided
    let imageUrl = item.imageUrl;
    if (file) {
      // Delete old image if exists
      if (item.imageUrl) {
        await deleteImageFromStorage(item.imageUrl, authData.user.id);
      }
      
      // Upload new image
      imageUrl = await uploadAndSignUrl(file, item.id, authData.user.id);
    }

    // Convert camelCase to snake_case for database storage
    const snakeCaseItem = camelToSnakeCase({
      ...item,
      imageUrl,
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

    // Get the item first to check if it has an image
    const { data: itemData } = await supabase
      .from('wardrobe_items')
      .select('image_url')
      .eq('id', itemId)
      .eq('user_id', authData.user.id)
      .single();

    // Delete the image from storage if it exists
    if (itemData?.image_url && typeof itemData.image_url === 'string') {
      await deleteImageFromStorage(itemData.image_url, authData.user.id);
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
