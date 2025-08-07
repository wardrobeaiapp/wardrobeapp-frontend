import { supabase } from './supabase';
import { WardrobeItem, Outfit, Capsule, ItemCategory, Season, WishlistStatus } from '../types';

// Wardrobe Item API calls
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

export const createWardrobeItem = async (item: Omit<WardrobeItem, 'id' | 'dateAdded' | 'timesWorn'>): Promise<WardrobeItem> => {
  try {
    // Add default values for new items
    const newItem = {
      ...item,
      dateAdded: new Date().toISOString(),
      timesWorn: 0
    };
    
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
      season: data.season as Season[],
      imageUrl: data.imageUrl as string | undefined,
      dateAdded: (data.dateAdded || data.date_added) as string,
      lastWorn: (data.lastWorn || data.last_worn) as string | undefined,
      timesWorn: (data.timesWorn || data.times_worn || 0) as number,
      tags: data.tags as string[] | undefined,
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

export const updateWardrobeItem = async (id: string, item: Partial<WardrobeItem>): Promise<void> => {
  try {
    const { error } = await supabase
      .from('wardrobe_items')
      .update(item)
      .eq('id', id);
    
    if (error) throw error;
  } catch (error) {
    console.error('[Supabase] Error updating wardrobe item:', error);
    
    // Fallback to local storage for guest users
    const storedItems = localStorage.getItem('guestItems');
    if (storedItems) {
      const items = JSON.parse(storedItems);
      const updatedItems = items.map((existingItem: WardrobeItem) => 
        existingItem.id === id ? { ...existingItem, ...item } : existingItem
      );
      localStorage.setItem('guestItems', JSON.stringify(updatedItems));
    }
  }
};

export const deleteWardrobeItem = async (id: string): Promise<void> => {
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

// Outfit API calls
export const fetchOutfits = async (): Promise<Outfit[]> => {
  try {
    const { data, error } = await supabase
      .from('outfits')
      .select('*')
      .order('dateCreated', { ascending: false });
    
    if (error) throw error;
    
    // Properly map the data to ensure it conforms to Outfit interface
    const typedOutfits = data?.map(item => ({
      id: item.id,
      name: item.name,
      items: item.items || [],
      occasion: item.occasion,
      scenarios: item.scenarios,
      season: item.season,
      favorite: item.favorite || false,
      dateCreated: item.dateCreated || item.date_created,
      lastWorn: item.lastWorn || item.last_worn
    })) as Outfit[];
    
    return typedOutfits || [];
  } catch (error) {
    console.error('[Supabase] Error fetching outfits:', error);
    // Try to get outfits from local storage as fallback
    const storedOutfits = localStorage.getItem('guestOutfits');
    if (storedOutfits) {
      return JSON.parse(storedOutfits);
    }
    return [];
  }
};

export const createOutfit = async (outfit: Omit<Outfit, 'id' | 'dateCreated'>): Promise<Outfit> => {
  try {
    // Extract items from the outfit object
    const { items, ...outfitWithoutItems } = outfit;
    
    // Create outfit without items
    const newOutfit = {
      ...outfitWithoutItems,
      dateCreated: new Date().toISOString()
    };
    
    // Insert the outfit without items
    const { data, error } = await supabase
      .from('outfits')
      .insert(newOutfit)
      .select()
      .single();
    
    if (error) throw error;
    
    // Add items to the join table if there are any
    if (items && items.length > 0 && data.id) {
      // Get the current user
      const { data: authData } = await supabase.auth.getUser();
      
      if (authData && authData.user) {
        // Create records for the join table
        const records = items.map(itemId => ({
          outfit_id: data.id,
          item_id: itemId,
          user_id: authData.user.id
        }));
        
        // Insert into the join table
        await supabase
          .from('outfit_items')
          .upsert(records, { onConflict: 'outfit_id,item_id' });
      }
    }
    
    // Return the outfit with items
    return {
      ...data,
      items: items || []
    } as Outfit;
  } catch (error) {
    console.error('[Supabase] Error creating outfit:', error);
    
    // Fallback to local storage for guest users
    const newOutfit: Outfit = {
      ...outfit,
      id: `outfit-${Date.now()}`,
      dateCreated: new Date().toISOString()
    };
    
    // Save to local storage
    const storedOutfits = localStorage.getItem('guestOutfits');
    const outfits = storedOutfits ? JSON.parse(storedOutfits) : [];
    const updatedOutfits = [newOutfit, ...outfits];
    localStorage.setItem('guestOutfits', JSON.stringify(updatedOutfits));
    
    return newOutfit;
  }
};

export const updateOutfit = async (id: string, outfit: Partial<Outfit>): Promise<void> => {
  try {
    // Extract items from the outfit object
    const { items, ...outfitWithoutItems } = outfit;
    
    // Update the outfit without items
    const { error } = await supabase
      .from('outfits')
      .update(outfitWithoutItems)
      .eq('id', id);
    
    if (error) throw error;
    
    // Update items in the join table if provided
    if (items !== undefined) {
      // Get the current user
      const { data: authData } = await supabase.auth.getUser();
      
      if (authData && authData.user) {
        // First remove all existing items for this outfit
        await supabase
          .from('outfit_items')
          .delete()
          .eq('outfit_id', id);
        
        // Then add the new items if there are any
        if (items && items.length > 0) {
          // Create records for the join table
          const records = items.map(itemId => ({
            outfit_id: id,
            item_id: itemId,
            user_id: authData.user.id
          }));
          
          // Insert into the join table
          await supabase
            .from('outfit_items')
            .upsert(records, { onConflict: 'outfit_id,item_id' });
        }
      }
    }
  } catch (error) {
    console.error('[Supabase] Error updating outfit:', error);
    
    // Fallback to local storage for guest users
    const storedOutfits = localStorage.getItem('guestOutfits');
    if (storedOutfits) {
      const outfits = JSON.parse(storedOutfits);
      const updatedOutfits = outfits.map((existingOutfit: Outfit) => 
        existingOutfit.id === id ? { ...existingOutfit, ...outfit } : existingOutfit
      );
      localStorage.setItem('guestOutfits', JSON.stringify(updatedOutfits));
    }
  }
};

export const deleteOutfit = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('outfits')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  } catch (error) {
    console.error('[Supabase] Error deleting outfit:', error);
    
    // Fallback to local storage for guest users
    const storedOutfits = localStorage.getItem('guestOutfits');
    if (storedOutfits) {
      const outfits = JSON.parse(storedOutfits);
      const updatedOutfits = outfits.filter((outfit: Outfit) => outfit.id !== id);
      localStorage.setItem('guestOutfits', JSON.stringify(updatedOutfits));
    }
  }
};

// Capsule API calls
export const fetchCapsules = async (): Promise<Capsule[]> => {
  try {
    // Get the current user
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    
    // Check if we're in guest mode
    const isGuestMode = !user && localStorage.getItem('guestMode');
    
    let query = supabase
      .from('capsules')
      .select('*')
      .order('date_created', { ascending: false });
    
    // If in guest mode, explicitly filter for guest user_id
    if (isGuestMode) {
      query = query.eq('user_id', 'guest');
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    // Get all capsule IDs to fetch their items
    const capsuleIds = (data || []).map(capsule => capsule.id);
    
    // Fetch all capsule items in a single query for better performance
    let capsuleItemsMap: Record<string, string[]> = {};
    
    if (capsuleIds.length > 0) {
      const { data: capsuleItemsData, error: capsuleItemsError } = await supabase
        .from('capsule_items')
        .select('capsule_id, item_id')
        .in('capsule_id', capsuleIds) as { data: { capsule_id: string, item_id: string }[] | null, error: any };
      
      if (!capsuleItemsError && capsuleItemsData) {
        // Group items by capsule_id
        capsuleItemsMap = capsuleItemsData.reduce((acc, item: { capsule_id: string, item_id: string }) => {
          if (!acc[item.capsule_id]) {
            acc[item.capsule_id] = [];
          }
          acc[item.capsule_id].push(item.item_id);
          return acc;
        }, {} as Record<string, string[]>);
      } else {
        console.error('[Supabase] Error fetching capsule items:', capsuleItemsError);
      }
    }
    
    // Map snake_case fields to camelCase for frontend
    const dbCapsules = (data || []).map(capsule => ({
      ...capsule,
      dateCreated: capsule.date_created,
      // Get items from the join table or fall back to the legacy selected_items array
      selectedItems: capsuleItemsMap[capsule.id as string] || capsule.selected_items || [],
      mainItemId: capsule.main_item_id,
      // Handle scenarios field (may be null if schema hasn't been updated)
      scenarios: capsule.scenarios || [],
      // Remove snake_case fields to avoid confusion
      date_created: undefined,
      selected_items: undefined,
      main_item_id: undefined
    } as Capsule));
    
    // If in guest mode, also get capsules from local storage and combine them
    if (isGuestMode) {
      const storedCapsules = localStorage.getItem('guestCapsules');
      if (storedCapsules) {
        const localCapsules = JSON.parse(storedCapsules);
        // Combine and deduplicate by ID
        const allCapsules = [...dbCapsules];
        localCapsules.forEach((localCapsule: Capsule) => {
          if (!allCapsules.some(c => c.id === localCapsule.id)) {
            allCapsules.push(localCapsule);
          }
        });
        return allCapsules;
      }
    }
    
    return dbCapsules;
  } catch (error) {
    console.error('[Supabase] Error fetching capsules:', error);
    // Try to get capsules from local storage as fallback
    const storedCapsules = localStorage.getItem('guestCapsules');
    if (storedCapsules) {
      return JSON.parse(storedCapsules);
    }
    return [];
  }
};

export const createCapsule = async (capsule: Omit<Capsule, 'id' | 'dateCreated'>): Promise<Capsule> => {
  try {
    // Removed excessive logging for performance
    
    // Get the current user
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    
    if (!user && !localStorage.getItem('guestMode')) {
      throw new Error('User must be authenticated to create a capsule');
    }
    
    // Extract items from the capsule object
    const { selectedItems, ...capsuleWithoutItems } = capsule;
    // Removed excessive logging for performance
    
    // Convert camelCase to snake_case for database
    const newCapsule: any = {
      // Convert all camelCase fields to snake_case
      name: capsuleWithoutItems.name,
      description: capsuleWithoutItems.description || '',
      scenario: capsuleWithoutItems.scenario || '',
      seasons: capsuleWithoutItems.seasons,
      style: capsuleWithoutItems.style || '',
      // Explicitly set date_created (not dateCreated)
      date_created: new Date().toISOString(),
      // Keep selected_items for backward compatibility
      selected_items: [],
      // Convert mainItemId to main_item_id
      main_item_id: capsule.mainItemId,
      // Set the user_id for RLS policies
      user_id: user?.id || 'guest'
    };
    
    // Removed excessive logging for performance
    
    // Make sure no camelCase fields are sent to the database
    delete newCapsule.selectedItems;
    delete newCapsule.mainItemId;
    delete newCapsule.dateCreated; // This shouldn't exist, but just in case
    
    // Temporarily remove scenarios field until DB schema is updated
    // Once the schema is updated, this can be removed
    if (newCapsule.scenarios) {
      // Removed excessive logging for performance
      delete newCapsule.scenarios;
    }
    
    // Removed excessive logging for performance
    
    const { data, error } = await supabase
      .from('capsules')
      .insert(newCapsule)
      .select()
      .single();
    
    if (error) {
      console.error('Supabase error creating capsule:', error);
      throw error;
    }
    
    // Removed excessive logging for performance
    
    // Prepare to add items to the join table
    const itemsToAdd = [...(selectedItems || [])];
    
    // Add the main item to the join table if it exists and isn't already in the selectedItems array
    if (capsule.mainItemId && !itemsToAdd.includes(capsule.mainItemId)) {
      // Removed excessive logging for performance
      itemsToAdd.push(capsule.mainItemId);
    }
    
    // Add items to the join table if there are any
    if (itemsToAdd.length > 0 && data.id) {
      // Removed excessive logging for performance
      
      // Create records for the join table
      const records = itemsToAdd.map(itemId => ({
        capsule_id: data.id,
        item_id: itemId,
        user_id: user?.id || 'guest'
      }));
      
      // Removed excessive logging for performance
      
      // Insert into the join table
      const { error: joinError } = await supabase
        .from('capsule_items')
        .upsert(records, { onConflict: 'capsule_id,item_id' });
      
      if (joinError) {
        console.error('Error adding items to capsule:', joinError);
      } else {
        // Removed excessive logging for performance
      }
    } else {
      // Removed excessive logging for performance
    }
    
    // Map snake_case back to camelCase for frontend
    return {
      ...data,
      dateCreated: data.date_created,
      selectedItems: data.selected_items || [],
      mainItemId: data.main_item_id,
      // Handle scenarios field (may be null if schema hasn't been updated)
      scenarios: data.scenarios || [],
      // Remove snake_case fields to avoid confusion
      date_created: undefined,
      selected_items: undefined,
      main_item_id: undefined
    } as Capsule;
  } catch (error) {
    console.error('[Supabase] Error creating capsule:', error);
    
    // Fallback to local storage for guest users
    const newCapsule: Capsule = {
      ...capsule,
      id: `capsule-${Date.now()}`,
      dateCreated: new Date().toISOString()
    };
    
    // Save to local storage
    const storedCapsules = localStorage.getItem('guestCapsules');
    const capsules = storedCapsules ? JSON.parse(storedCapsules) : [];
    const updatedCapsules = [newCapsule, ...capsules];
    localStorage.setItem('guestCapsules', JSON.stringify(updatedCapsules));
    
    return newCapsule;
  }
};

export const updateCapsule = async (id: string, capsule: Partial<Capsule>): Promise<Capsule | null> => {
  try {
    // Removed excessive logging for performance
    
    // Extract items from the capsule object if present
    const { selectedItems, ...capsuleWithoutItems } = capsule;
    
    // Convert camelCase to snake_case for database
    const dbCapsule: any = { ...capsuleWithoutItems };
    
    // Handle dateCreated -> date_created conversion
    if (capsule.dateCreated) {
      dbCapsule.date_created = capsule.dateCreated;
      delete dbCapsule.dateCreated;
    }
    
    // Keep selected_items empty for backward compatibility
    dbCapsule.selected_items = [];
    
    // Handle mainItemId -> main_item_id conversion
    if (capsule.mainItemId) {
      // Removed excessive logging for performance
      dbCapsule.main_item_id = capsule.mainItemId;
      delete dbCapsule.mainItemId;
    } else {
      // Removed excessive logging for performance
    }
    
    // Handle scenario field (singular) for backward compatibility
    if (capsule.scenario) {
      dbCapsule.scenario = capsule.scenario;
    }
    
    // Temporarily remove scenarios field until DB schema is updated
    // Once the schema is updated, this can be removed
    if (dbCapsule.scenarios) {
      // Removed excessive logging for performance
      delete dbCapsule.scenarios;
    }
    
    const { data, error } = await supabase
      .from('capsules')
      .update(dbCapsule)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    // Update items in the join table if provided
    if (selectedItems !== undefined) {
      // Get the current user
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData?.user?.id || 'guest';
      
      // First remove all existing items for this capsule
      await supabase
        .from('capsule_items')
        .delete()
        .eq('capsule_id', id);
      
      // Prepare items to add to the join table
      const itemsToAdd = [...(selectedItems || [])];
      
      // Add the main item to the join table if it exists and isn't already in the selectedItems array
      if (capsule.mainItemId && !itemsToAdd.includes(capsule.mainItemId)) {
        // Removed excessive logging for performance
        itemsToAdd.push(capsule.mainItemId);
      }
      
      // Then add the items if there are any
      if (itemsToAdd.length > 0) {
        // Removed excessive logging for performance
        
        // Create records for the join table
        const records = itemsToAdd.map(itemId => ({
          capsule_id: id,
          item_id: itemId,
          user_id: userId
        }));
        
        // Insert into the join table
        const { error: joinError } = await supabase
          .from('capsule_items')
          .upsert(records, { onConflict: 'capsule_id,item_id' });
        
        if (joinError) {
          console.error('Error updating capsule items:', joinError);
        } else {
          // Removed excessive logging for performance
        }
      } else {
        // Removed excessive logging for performance
      }
    }
    
    if (error) throw error;
    // Map snake_case back to camelCase for frontend
    return {
      ...data,
      dateCreated: data.date_created,
      selectedItems: data.selected_items || [],
      mainItemId: data.main_item_id,
      // Handle scenarios field (may be null if schema hasn't been updated)
      scenarios: data.scenarios || [],
      // Remove snake_case fields to avoid confusion
      date_created: undefined,
      selected_items: undefined,
      main_item_id: undefined
    } as Capsule;
  } catch (error) {
    console.error('[Supabase] Error updating capsule:', error);
    
    // Fallback to local storage for guest users
    try {
      const storedCapsules = localStorage.getItem('guestCapsules');
      if (storedCapsules) {
        const capsules = JSON.parse(storedCapsules);
        const updatedCapsules = capsules.map((c: Capsule) => 
          c.id === id ? { ...c, ...capsule } : c
        );
        localStorage.setItem('guestCapsules', JSON.stringify(updatedCapsules));
        
        // Return the updated capsule
        return updatedCapsules.find((c: Capsule) => c.id === id) || null;
      }
    } catch (localError) {
      console.error('[Local Storage] Error updating capsule:', localError);
    }
    return null;
  }
};

export const deleteCapsule = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('capsules')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  } catch (error) {
    console.error('[Supabase] Error deleting capsule:', error);
    
    // Fallback to local storage for guest users
    const storedCapsules = localStorage.getItem('guestCapsules');
    if (storedCapsules) {
      const capsules = JSON.parse(storedCapsules);
      const updatedCapsules = capsules.filter((c: Capsule) => c.id !== id);
      localStorage.setItem('guestCapsules', JSON.stringify(updatedCapsules));
    }
  }
};
