import { Outfit } from '../types';
import { supabase } from './supabaseClient';

// Table name for outfits in Supabase
const OUTFITS_TABLE = 'outfits';

/**
 * Fetch all outfits for the current user
 */
export const fetchOutfits = async (): Promise<Outfit[]> => {
  try {
    // Removed excessive logging for performance
    
    // Get current user
    const { data: authData, error: authError } = await supabase.auth.getUser();
    
    if (authError || !authData.user) {
      // Removed excessive logging for performance
      throw new Error('User not authenticated');
    }
    
    const userId = authData.user.id;
    
    // Fetch outfits from Supabase
    const { data, error } = await supabase
      .from(OUTFITS_TABLE)
      .select('*')
      .eq('user_uuid', userId);
      
    if (error) {
      // Removed excessive logging for performance
      throw error;
    }
    
    // Removed excessive logging for performance
    
    // Convert Supabase data format to app's Outfit format
    const outfitsWithoutItems = data?.map(item => ({
      id: String(item.id),
      name: String(item.name),
      items: [] as string[], // Initialize with empty array, will be populated from join table
      scenarios: Array.isArray(item.scenarios) ? item.scenarios : [],
      season: Array.isArray(item.season) ? item.season : [],
      favorite: Boolean(item.favorite),
      dateCreated: String(item.date_created),
      lastWorn: item.last_worn ? String(item.last_worn) : undefined
    })) || [];
    
    // For each outfit, fetch its items from the join table
    const outfitsWithItems = await Promise.all(
      outfitsWithoutItems.map(async (outfit) => {
        try {
          // Get items for this outfit from the join table
          const { data: itemsData, error: itemsError } = await supabase
            .from('outfit_items')
            .select('item_id')
            .eq('outfit_id', outfit.id as string)
            .eq('user_id', userId); // Using user_id as defined in the migration file
          
          if (itemsError) {
            // Removed excessive logging for performance
            return outfit; // Return outfit with empty items array
          }
          
          // Extract item IDs
          const itemIds = itemsData.map(item => String(item.item_id));
          // Removed excessive logging for performance
          
          // Return outfit with items
          return {
            ...outfit,
            items: itemIds
          };
        } catch (itemError) {
          // Removed excessive logging for performance
          return outfit; // Return outfit with empty items array
        }
      })
    );
    
    // Explicitly cast the result to Outfit[] after ensuring all properties match the interface
    const outfits: Outfit[] = outfitsWithItems as Outfit[];
    
    return outfits;
  } catch (error) {
    // Removed excessive logging for performance
    // Return empty array on error
    return [];
  }
};

/**
 * Create a new outfit
 */
export const createOutfit = async (outfit: Omit<Outfit, 'id' | 'dateCreated'>): Promise<Outfit> => {
  try {
    // Removed excessive logging for performance
    
    // Get current user
    const { data: authData, error: authError } = await supabase.auth.getUser();
    
    if (authError || !authData.user) {
      // Removed excessive logging for performance
      throw new Error('User not authenticated');
    }
    
    const userId = authData.user.id;
    const dateCreated = new Date().toISOString();
    
    // Extract items from the outfit object
    const { items } = outfit;
    
    // Prepare outfit data for Supabase - without items array
    // Ensure season values are properly converted to strings for Supabase
    // This prevents TypeScript errors when Season enum values are used
    const outfitData = {
      name: outfit.name,
      scenarios: outfit.scenarios || [],
      season: outfit.season.map(s => String(s)), // Convert Season enum values to strings
      favorite: outfit.favorite,
      date_created: dateCreated,
      last_worn: outfit.lastWorn,
      user_uuid: userId
    };
    
    // Insert outfit into Supabase
    // Removed excessive logging for performance
    
    let createdData: any;
    
    try {
      const { data, error } = await supabase
        .from(OUTFITS_TABLE)
        .insert(outfitData)
        .select()
        .single();
        
      if (error) {
        // Removed excessive logging for performance
        throw error;
      }
      
      createdData = data;
      // Removed excessive logging for performance
    } catch (insertError) {
      // Removed excessive logging for performance
      throw insertError;
    }
    
    if (!createdData) {
      throw new Error('[outfitService] No data returned from Supabase after outfit creation');
    }
    
    // Add items to the join table if there are any
    if (items && items.length > 0) {
      // Removed excessive logging for performance
      
      try {
        // Create records for the join table
        const itemRecords = items.map(itemId => ({
          outfit_id: createdData.id,
          item_id: itemId,
          user_id: userId // Using user_id as defined in the migration file
        }));
        
        // Insert into the join table
        const { error: joinError } = await supabase
          .from('outfit_items')
          .upsert(itemRecords, { onConflict: 'outfit_id,item_id' });
          
        if (joinError) {
          // Removed excessive logging for performance
        } else {
          // Removed excessive logging for performance
        }
      } catch (joinError) {
        // Removed excessive logging for performance
        // Don't throw here, we want to return the outfit even if join table insert fails
      }
    }
    
    // Removed excessive logging for performance
    
    // Convert Supabase response to Outfit format
    // Include the original items array since Supabase doesn't return it
    const createdOutfit: Outfit = {
      id: createdData.id,
      name: createdData.name,
      items: items || [], // Use the original items array passed to this function
      scenarios: createdData.scenarios || [],
      season: createdData.season || [],
      favorite: createdData.favorite || false,
      dateCreated: createdData.date_created,
      lastWorn: createdData.last_worn || undefined
    };
    
    return createdOutfit;
  } catch (error) {
    // Removed excessive logging for performance
    throw error;
  }
};

/**
 * Update an existing outfit
 */
export const updateOutfit = async (id: string, outfit: Partial<Outfit>): Promise<void> => {
  try {
    // Removed excessive logging for performance
    
    // Get current user
    const { data: authData, error: authError } = await supabase.auth.getUser();
    
    if (authError || !authData.user) {
      // Removed excessive logging for performance
      throw new Error('User not authenticated');
    }
    
    const userId = authData.user.id;
    
    // Extract items from the outfit object
    const { items, ...outfitWithoutItems } = outfit;
    
    // Prepare outfit data for Supabase (convert camelCase to snake_case)
    const outfitData: any = {};
    
    if (outfitWithoutItems.name !== undefined) outfitData.name = outfitWithoutItems.name;
    if (outfitWithoutItems.scenarios !== undefined) outfitData.scenarios = outfitWithoutItems.scenarios;
    if (outfitWithoutItems.season !== undefined) outfitData.season = outfitWithoutItems.season;
    if (outfitWithoutItems.favorite !== undefined) outfitData.favorite = outfitWithoutItems.favorite;
    if (outfitWithoutItems.lastWorn !== undefined) outfitData.last_worn = outfitWithoutItems.lastWorn;
    
    // Update outfit in Supabase
    const { error } = await supabase
      .from(OUTFITS_TABLE)
      .update(outfitData)
      .eq('id', id)
      .eq('user_uuid', userId);
      
    if (error) {
      // Removed excessive logging for performance
      throw error;
    }
    
    // Update items in the join table if they were provided
    if (items !== undefined) {
      // Removed excessive logging for performance
      
      try {
        // First remove all existing items for this outfit
        const { error: deleteError } = await supabase
          .from('outfit_items')
          .delete()
          .eq('outfit_id', id);
          
        if (deleteError) {
          // Removed excessive logging for performance
        }
        
        // Then add the new items if there are any
        if (items && items.length > 0) {
          // Create records for the join table
          const itemRecords = items.map(itemId => ({
            outfit_id: id,
            item_id: itemId,
            user_id: userId // Using user_id as defined in the migration file
          }));
          
          // Insert into the join table
          const { error: insertError } = await supabase
            .from('outfit_items')
            .upsert(itemRecords, { onConflict: 'outfit_id,item_id' });
            
          if (insertError) {
            // Removed excessive logging for performance
          } else {
            // Removed excessive logging for performance
          }
        }
      } catch (joinError) {
        // Removed excessive logging for performance
        // Don't throw here, we want to return success for the outfit update even if join table update fails
      }
    }
    
    // Removed excessive logging for performance
  } catch (error) {
    // Removed excessive logging for performance
    throw error;
  }
};

/**
 * Delete an outfit
 */
export const deleteOutfit = async (id: string): Promise<void> => {
  try {
    // Removed excessive logging for performance
    
    // Get current user
    const { data: authData, error: authError } = await supabase.auth.getUser();
    
    if (authError || !authData.user) {
      // Removed excessive logging for performance
      throw new Error('User not authenticated');
    }
    
    const userId = authData.user.id;
    
    // Delete outfit from Supabase
    const { error } = await supabase
      .from(OUTFITS_TABLE)
      .delete()
      .eq('id', id)
      .eq('user_uuid', userId);
      
    if (error) {
      // Removed excessive logging for performance
      throw error;
    }
    
    // Removed excessive logging for performance
  } catch (error) {
    // Removed excessive logging for performance
    throw error;
  }
};

/**
 * Check if the outfits table exists
 */
export const checkOutfitsTableExists = async (): Promise<boolean> => {
  try {
    // Removed excessive logging for performance
    
    // First check if user is authenticated
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      // Removed excessive logging for performance
      return false;
    }
    
    // Removed excessive logging for performance
    
    // Try to query the table
    const { /* data not used */ error } = await supabase
      .from(OUTFITS_TABLE)
      .select('id')
      .limit(1);
      
    if (error) {
      // Removed excessive logging for performance
      return false;
    }
    
    // Removed excessive logging for performance
    return true;
  } catch (error) {
    // Removed excessive logging for performance
    return false;
  }
};

/**
 * Migrate outfits from API to Supabase
 * This should be called once to migrate existing outfits
 */
export const migrateOutfitsToSupabase = async (outfits: Outfit[]): Promise<void> => {
  try {
    // Removed excessive logging for performance
    
    // Get current user
    const { data: authData, error: authError } = await supabase.auth.getUser();
    
    if (authError || !authData.user) {
      // Removed excessive logging for performance
      throw new Error('User not authenticated');
    }
    
    const userId = authData.user.id;
    
    // Prepare outfits data for Supabase
    const outfitsData = outfits.map(outfit => ({
      id: outfit.id,
      name: outfit.name,
      items: outfit.items,
      scenarios: outfit.scenarios || [],
      season: outfit.season,
      favorite: outfit.favorite,
      date_created: outfit.dateCreated,
      last_worn: outfit.lastWorn,
      user_uuid: userId
    }));
    
    // Insert outfits into Supabase
    const { error } = await supabase
      .from(OUTFITS_TABLE)
      .upsert(outfitsData);
      
    if (error) {
      // Removed excessive logging for performance
      throw error;
    }
    
    // Removed excessive logging for performance
  } catch (error) {
    // Removed excessive logging for performance
    throw error;
  }
};
