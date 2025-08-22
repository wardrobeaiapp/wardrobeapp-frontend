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
      console.log('[deleteImageFromStorage] No image URL provided, skipping deletion');
      return;
    }
    
    console.log('[deleteImageFromStorage] Attempting to delete image:', imageUrl);
    console.log('[deleteImageFromStorage] User ID:', userId);
    
    let filePath: string;
    
    try {
      // Parse the URL to handle different formats (signed URLs, public URLs, or file paths)
      if (imageUrl.startsWith('http')) {
        const url = new URL(imageUrl);
        console.log('[deleteImageFromStorage] URL pathname:', url.pathname);
        
        // For Supabase storage URLs, the path typically looks like:
        // /storage/v1/object/sign/wardrobe-images/{userId}/{filename}
        // or /storage/v1/object/public/wardrobe-images/{userId}/{filename}
        const pathParts = url.pathname.split('/');
        console.log('[deleteImageFromStorage] Path parts:', pathParts);
        
        // Find 'wardrobe-images' in the path and get everything after it
        const bucketIndex = pathParts.findIndex(part => part === 'wardrobe-images');
        if (bucketIndex !== -1 && bucketIndex < pathParts.length - 1) {
          // Get the path after 'wardrobe-images' (should be userId/filename)
          const pathAfterBucket = pathParts.slice(bucketIndex + 1).join('/');
          filePath = pathAfterBucket;
          console.log('[deleteImageFromStorage] Extracted path from bucket structure:', filePath);
        } else {
          // Fallback: extract filename and combine with userId
          const filename = pathParts[pathParts.length - 1];
          filePath = `${userId}/${filename}`;
          console.log('[deleteImageFromStorage] Fallback: constructed path from filename:', filePath);
        }
      } else {
        // Assume it's already a file path
        filePath = imageUrl.startsWith(userId) ? imageUrl : `${userId}/${imageUrl}`;
        console.log('[deleteImageFromStorage] Treating as file path:', filePath);
      }
    } catch (parseError) {
      console.error('[deleteImageFromStorage] URL parsing failed:', parseError);
      // Ultimate fallback: extract filename from URL string
      const urlParts = imageUrl.split('/');
      const filename = urlParts[urlParts.length - 1].split('?')[0];
      filePath = `${userId}/${filename}`;
      console.log('[deleteImageFromStorage] Ultimate fallback path:', filePath);
    }
    
    console.log('[deleteImageFromStorage] Final file path to delete:', filePath);
    
    // First, let's check if the file exists in storage
    const { data: fileList, error: listError } = await supabase.storage
      .from('wardrobe-images')
      .list(userId);
    
    if (listError) {
      console.error('[deleteImageFromStorage] Error listing files:', listError);
    } else {
      console.log('[deleteImageFromStorage] Files in user folder:', fileList?.map(f => f.name));
    }
    
    // Extract the actual filename from the URL for matching
    const actualFilename = imageUrl.split('/').pop()?.split('?')[0]; // Remove query params
    console.log('[deleteImageFromStorage] Looking for filename:', actualFilename);
    
    // Find the actual file in storage by matching the filename
    let actualFilePath = filePath; // Default to our constructed path
    if (fileList && actualFilename) {
      const matchingFile = fileList.find(file => 
        file.name === actualFilename || 
        file.name.includes(actualFilename) ||
        actualFilename.includes(file.name)
      );
      
      if (matchingFile) {
        actualFilePath = `${userId}/${matchingFile.name}`;
        console.log('[deleteImageFromStorage] Found matching file in storage:', actualFilePath);
      } else {
        console.log('[deleteImageFromStorage] No matching file found in storage, using constructed path');
      }
    }
    
    // Attempt deletion with the verified path
    const { error } = await supabase.storage
      .from('wardrobe-images')
      .remove([actualFilePath]);
    
    if (error) {
      console.error('[deleteImageFromStorage] Error deleting image from storage:', error);
      console.error('[deleteImageFromStorage] Error details:', JSON.stringify(error, null, 2));
      
      // If the verified path fails, try all possible variations based on actual files in storage
      if (fileList && actualFilename) {
        console.log('[deleteImageFromStorage] Trying all files that might match...');
        
        for (const file of fileList) {
          if (file.name.includes(actualFilename) || actualFilename.includes(file.name)) {
            const attemptPath = `${userId}/${file.name}`;
            console.log('[deleteImageFromStorage] Attempting to delete:', attemptPath);
            
            const { error: attemptError } = await supabase.storage
              .from('wardrobe-images')
              .remove([attemptPath]);
            
            if (!attemptError) {
              console.log('[deleteImageFromStorage] Successfully deleted:', attemptPath);
              return;
            } else {
              console.log('[deleteImageFromStorage] Failed to delete:', attemptPath, attemptError.message);
            }
          }
        }
      }
      
      // Final fallback: try alternative path formats
      const filename = filePath.includes('/') ? filePath.split('/').pop() : filePath;
      const alternativePaths = [
        filename, // Just the filename
        filename ? `${userId}/${filename}` : null, // userId/filename
        filePath.replace(/^.*\//, ''), // Remove everything before the last slash
      ].filter((path, index, arr) => path && typeof path === 'string' && arr.indexOf(path) === index) as string[];
      
      console.log('[deleteImageFromStorage] Final fallback - trying alternative paths:', alternativePaths);
      
      for (const altPath of alternativePaths) {
        if (altPath !== actualFilePath) {
          const { error: altError } = await supabase.storage
            .from('wardrobe-images')
            .remove([altPath]);
          
          if (!altError) {
            console.log('[deleteImageFromStorage] Successfully deleted with alternative path:', altPath);
            return;
          } else {
            console.log('[deleteImageFromStorage] Alternative path failed:', altPath, altError.message);
          }
        }
      }
    } else {
      console.log('[deleteImageFromStorage] Supabase reported successful deletion');
      
      // Verify the deletion actually worked by re-listing files
      const { data: verifyFileList, error: verifyListError } = await supabase.storage
        .from('wardrobe-images')
        .list(userId);
      
      if (verifyListError) {
        console.error('[deleteImageFromStorage] Error verifying deletion:', verifyListError);
      } else {
        const remainingFiles = verifyFileList?.map(f => f.name) || [];
        console.log('[deleteImageFromStorage] Files remaining after deletion:', remainingFiles);
        
        // Check if the file we tried to delete is still there
        const deletedFilename = actualFilePath.split('/').pop();
        const fileStillExists = remainingFiles.some(filename => 
          filename === deletedFilename ||
          filename.includes(deletedFilename || '') ||
          (actualFilename && filename.includes(actualFilename))
        );
        
        if (fileStillExists) {
          console.error('[deleteImageFromStorage] WARNING: File still exists after "successful" deletion!');
          console.error('[deleteImageFromStorage] This may be a permissions or caching issue');
        } else {
          console.log('[deleteImageFromStorage] Verification confirmed: file successfully removed');
        }
      }
    }
  } catch (error) {
    console.error('[deleteImageFromStorage] Unexpected error in deleteImageFromStorage:', error);
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
    
    // Remove undefined values to avoid constraint violations
    const cleanItem = Object.fromEntries(
      Object.entries(snakeCaseItem).filter(([_, value]) => value !== undefined)
    );
    
    // Debug logging to check if sleeves/style/rise data is present
    console.log('[wardrobeItemsService] Item data being inserted:', {
      sleeves: cleanItem.sleeves,
      style: cleanItem.style,
      silhouette: cleanItem.silhouette,
      length: cleanItem.length,
      rise: cleanItem.rise
    });
    
    const { data, error } = await supabase
      .from('wardrobe_items')
      .insert(cleanItem)
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
    console.log('[deleteWardrobeItem] Starting deletion process for item:', itemId);
    
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      throw new Error('User not authenticated');
    }
    
    console.log('[deleteWardrobeItem] User authenticated:', authData.user.id);

    // Get the item first to check if it has an image
    const { data: itemData, error: fetchError } = await supabase
      .from('wardrobe_items')
      .select('image_url')
      .eq('id', itemId)
      .eq('user_id', authData.user.id)
      .single();
    
    if (fetchError) {
      console.error('[deleteWardrobeItem] Error fetching item data:', fetchError);
    }
    
    console.log('[deleteWardrobeItem] Item data retrieved:', itemData);

    // Delete the image from storage if it exists
    if (itemData?.image_url && typeof itemData.image_url === 'string') {
      console.log('[deleteWardrobeItem] Found image URL, calling deleteImageFromStorage');
      await deleteImageFromStorage(itemData.image_url, authData.user.id);
    } else {
      console.log('[deleteWardrobeItem] No image URL found or invalid format:', itemData?.image_url);
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
