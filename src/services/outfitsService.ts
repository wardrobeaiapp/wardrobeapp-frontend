import { supabase } from './core';
import { Outfit } from '../types';
import { camelToSnakeCase, snakeToCamelCase } from '../utils/caseConversionExport';
import * as outfitItemsService from './outfitItemsService';

// Get all outfits for the current user
export const getOutfits = async (): Promise<Outfit[]> => {
  try {
    // Check if user is authenticated
    const { data: authData, error: authError } = await supabase.auth.getUser();
    
    // If not authenticated, return empty array instead of throwing error
    // This allows the app to work in guest mode
    if (authError) {
      console.log('Auth error, working in guest mode:', authError.message);
      return [];
    }

    if (!authData.user) {
      console.log('No user found, working in guest mode');
      return [];
    }

    // Query the outfits table
    const { data, error } = await supabase
      .from('outfits')
      .select('*')
      .eq('user_uuid', authData.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase query error:', error);
      // Return empty array instead of throwing
      return [];
    }

    // If no data or empty array, return empty array
    if (!data || data.length === 0) {
      console.log('No outfits found for user');
      return [];
    }

    // Convert snake_case to camelCase for frontend use
    const outfits = data.map(item => snakeToCamelCase(item)) as Outfit[];
    
    // For each outfit, fetch its items from the join table
    const outfitsWithItems = await Promise.all(
      outfits.map(async (outfit) => {
        // Get item IDs for this outfit from the join table
        const itemIds = await outfitItemsService.getOutfitItems(outfit.id);
        return {
          ...outfit,
          items: itemIds
        };
      })
    );

    return outfitsWithItems;
  } catch (error: any) {
    console.error('Error fetching outfits:', error.message || error);
    // Return empty array for any errors
    return [];
  }
};

// Add a new outfit
export const addOutfit = async (outfit: Omit<Outfit, 'id' | 'dateCreated'>): Promise<Outfit | null> => {
  try {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      throw new Error('User not authenticated');
    }

    // Store the items array separately
    const { items, ...outfitWithoutItems } = outfit;

    // Convert camelCase to snake_case for database storage
    const snakeCaseOutfit = camelToSnakeCase({
      ...outfitWithoutItems,
      user_uuid: authData.user.id,
      date_created: new Date().toISOString()
    });

    // Insert the outfit without items
    const { data, error } = await supabase
      .from('outfits')
      .insert(snakeCaseOutfit)
      .select()
      .single();

    if (error) {
      throw error;
    }

    const newOutfit = snakeToCamelCase(data) as Outfit;

    // Now add the items to the join table
    if (items && items.length > 0) {
      await outfitItemsService.addItemsToOutfit(newOutfit.id, items);
    }

    // Return the complete outfit with items
    return {
      ...newOutfit,
      items: items || []
    };
  } catch (error) {
    console.error('Error adding outfit:', error);
    return null;
  }
};

// Update an existing outfit
export const updateOutfit = async (outfit: Outfit): Promise<Outfit | null> => {
  try {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      throw new Error('User not authenticated');
    }

    // Store the items array separately
    const { items, ...outfitWithoutItems } = outfit;

    // Convert camelCase to snake_case for database storage
    const snakeCaseOutfit = camelToSnakeCase({
      ...outfitWithoutItems,
      updated_at: new Date().toISOString()
    });

    // Update the outfit without items
    const { data, error } = await supabase
      .from('outfits')
      .update(snakeCaseOutfit)
      .eq('id', outfit.id)
      .eq('user_uuid', authData.user.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Update the items in the join table
    // First remove all existing items for this outfit
    await outfitItemsService.removeAllItemsFromOutfit(outfit.id);
    
    // Then add the new items
    if (items && items.length > 0) {
      await outfitItemsService.addItemsToOutfit(outfit.id, items);
    }

    // Convert snake_case back to camelCase for frontend use
    const updatedOutfit = snakeToCamelCase(data) as Outfit;
    
    // Return the complete outfit with items
    return {
      ...updatedOutfit,
      items: items || []
    };
  } catch (error) {
    console.error('Error updating outfit:', error);
    return null;
  }
};

// Delete an outfit
export const deleteOutfit = async (outfitId: string): Promise<boolean> => {
  try {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      throw new Error('User not authenticated');
    }

    // With CASCADE delete in the database, deleting the outfit will automatically
    // delete all related outfit_items entries. However, we'll explicitly clean up
    // the join table first just to be safe.
    await outfitItemsService.removeAllItemsFromOutfit(outfitId);

    // Now delete the outfit
    const { error } = await supabase
      .from('outfits')
      .delete()
      .eq('id', outfitId)
      .eq('user_uuid', authData.user.id);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error deleting outfit:', error);
    return false;
  }
};

// Migrate outfits from localStorage to Supabase
export const migrateLocalStorageOutfitsToSupabase = async (): Promise<boolean> => {
  try {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      throw new Error('User not authenticated');
    }

    // Get outfits from localStorage
    const localStorageOutfits = JSON.parse(localStorage.getItem('guestOutfits') || '[]');
    if (localStorageOutfits.length === 0) {
      return true; // Nothing to migrate
    }

    // Prepare outfits for database insertion
    const outfitsToInsert = localStorageOutfits.map((outfit: Outfit) => {
      return camelToSnakeCase({
        ...outfit,
        id: undefined, // Remove id to let the database generate a new one
        user_id: authData.user.id,
        date_created: outfit.dateCreated || new Date().toISOString()
      });
    });

    // Insert all outfits
    const { error } = await supabase
      .from('outfits')
      .insert(outfitsToInsert);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error migrating outfits from localStorage to Supabase:', error);
    return false;
  }
};
