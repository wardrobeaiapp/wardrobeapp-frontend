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
  console.log('[supabaseApi] fetchCapsules called');
  
  // Get the current user
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
  console.log('[supabaseApi] User session:', { hasUser: !!user, isGuest: !user });
  
  // Check if we're in guest mode
  const isGuestMode = !user && Boolean(localStorage.getItem('guestMode'));
  console.log('[supabaseApi] Guest mode:', isGuestMode);
  
  try {
    
    // Define the expected database capsule type with null values from the database
    interface DBCapsule {
      id: string;
      name: string;
      description: string | null;
      style: string | null;
      seasons: Season[] | null;
      scenarios: string[] | null;
      selected_items: string[] | null;
      main_item_id: string | null;
      date_created: string | null;
      created_at: string | null;
      user_id: string | null;
      [key: string]: any; // Allow for additional properties
    }

    // First, fetch all capsules for the current user
    console.log('[supabaseApi] Fetching capsules from database...');
    let query = supabase
      .from('capsules')
      .select('*')
      .order('date_created', { ascending: false });
    
    // If in guest mode, explicitly filter for guest user_id
    if (isGuestMode) {
      console.log('[supabaseApi] Filtering for guest user...');
      query = query.eq('user_id', 'guest');
    }

    const { data, error } = await query as { data: DBCapsule[] | null; error: any };

    console.log('[supabaseApi] Database query results:', { data, error });

    if (error) {
      console.error('[supabaseApi] Database query error:', error);
      throw error;
    }

    // If no capsules found, return empty array
    if (!data || data.length === 0) {
      console.log('[supabaseApi] No capsules found in database');
      return [];
    }

    // Get all capsule IDs to fetch their items in a single query
    const capsuleIds = data.map(capsule => capsule.id);
    
    // Fetch all capsule items in a single query
    const capsuleItemsMap: Record<string, string[]> = {};
    if (capsuleIds.length > 0) {
      const { data: capsuleItems, error: capsuleItemsError } = await supabase
        .from('capsule_items')
        .select('capsule_id, item_id')
        .in('capsule_id', capsuleIds);

      if (capsuleItems) {
        // Create a map of capsule_id to array of item_ids
        capsuleItems.forEach((item) => {
          const capsuleId = String(item.capsule_id);
          const itemId = String(item.item_id);
          if (!capsuleItemsMap[capsuleId]) {
            capsuleItemsMap[capsuleId] = [];
          }
          capsuleItemsMap[capsuleId].push(itemId);
        });
      } else if (capsuleItemsError) {
        console.error('[Supabase] Error fetching capsule items:', capsuleItemsError);
      }
    }
    
    // Map database capsules to our application's Capsule type with proper defaults
    const dbCapsules = data.map((capsule: DBCapsule) => {
      // Helper function to safely get string or empty string
      const getString = (value: string | null | undefined, defaultValue = ''): string => {
        return typeof value === 'string' ? value : defaultValue;
      };

      // Helper function to safely get array or empty array
      const getArray = <T>(value: T[] | null | undefined): T[] => {
        return Array.isArray(value) ? value : [];
      };

      // Map the database capsule to our application's Capsule type
      const mappedCapsule: Capsule = {
        id: getString(capsule.id, `capsule-${Date.now()}`),
        name: getString(capsule.name, 'Untitled Capsule'),
        description: getString(capsule.description),
        style: getString(capsule.style),
        seasons: getArray<Season>(capsule.seasons),
        scenarios: getArray<string>(capsule.scenarios),
        selectedItems: getArray<string>(capsuleItemsMap[capsule.id] || capsule.selected_items),
        mainItemId: getString(capsule.main_item_id) || undefined,
        dateCreated: getString(capsule.date_created || capsule.created_at, new Date().toISOString())
      };

      // Add database fields for backward compatibility if they exist
      const dbFields: Partial<Capsule> = {};
      
      if (capsule.date_created) dbFields.date_created = capsule.date_created;
      if (capsule.main_item_id) dbFields.main_item_id = capsule.main_item_id;
      if (capsule.selected_items) dbFields.selected_items = capsule.selected_items;
      if (capsule.user_id) dbFields.user_id = capsule.user_id;

      return { ...mappedCapsule, ...dbFields };
    });
    
    // If in guest mode, also get capsules from local storage and combine them
    if (isGuestMode) {
      const storedCapsules = localStorage.getItem('guestCapsules');
      if (storedCapsules) {
        const localCapsules: Capsule[] = JSON.parse(storedCapsules);
        // Combine and deduplicate by ID
        const allCapsules = [...dbCapsules];
        localCapsules.forEach(localCapsule => {
          if (!allCapsules.some(c => c.id === localCapsule.id)) {
            // Ensure all required fields are present with proper defaults
            const combinedCapsule: Capsule = {
              ...localCapsule,
              description: localCapsule.description || '',
              style: localCapsule.style || '',
              seasons: Array.isArray(localCapsule.seasons) ? localCapsule.seasons : [],
              scenarios: Array.isArray(localCapsule.scenarios) ? localCapsule.scenarios : [],
              selectedItems: Array.isArray(localCapsule.selectedItems) ? localCapsule.selectedItems : [],
              dateCreated: localCapsule.dateCreated || new Date().toISOString()
            };
            allCapsules.push(combinedCapsule);
          }
        });
        return allCapsules;
      }
    }
    
    return dbCapsules;
  } catch (error) {
    console.error('[Supabase] Error fetching capsules:', error);
    // Try to get capsules from local storage as fallback in guest mode
    if (isGuestMode) {
      try {
        const storedCapsules = localStorage.getItem('guestCapsules');
        if (storedCapsules) {
          const parsedCapsules: unknown = JSON.parse(storedCapsules);
          if (Array.isArray(parsedCapsules)) {
            // Ensure all required fields are present with proper defaults
            return parsedCapsules.map(capsule => ({
              id: capsule.id || '',
              name: capsule.name || 'Untitled Capsule',
              description: capsule.description || '',
              style: capsule.style || '',
              seasons: Array.isArray(capsule.seasons) ? capsule.seasons : [],
              scenarios: Array.isArray(capsule.scenarios) ? capsule.scenarios : [],
              selectedItems: Array.isArray(capsule.selectedItems) ? capsule.selectedItems : [],
              mainItemId: capsule.mainItemId,
              dateCreated: capsule.dateCreated || new Date().toISOString()
            }));
          }
        }
      } catch (parseError) {
        console.error('Error parsing stored capsules:', parseError);
      }
    }
    return [];
  }
};

export const createCapsule = async (capsule: Omit<Capsule, 'id' | 'dateCreated'>): Promise<Capsule> => {
  console.log('[supabaseApi] createCapsule called with data:', capsule);
  
  try {
    // Get the current user
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    console.log('[supabaseApi] User session for createCapsule:', { hasUser: !!user, userId: user?.id });
    
    // Check if user is authenticated or in guest mode
    const isGuestMode = !user && Boolean(localStorage.getItem('guestMode'));
    console.log('[supabaseApi] Guest mode for createCapsule:', isGuestMode);
    
    if (!user && !isGuestMode) {
      const error = new Error('User must be authenticated to create a capsule');
      console.error('[supabaseApi] Authentication error:', error);
      throw error;
    }
    
    // Prepare the capsule data for insertion with proper defaults
    const capsuleData = {
      name: capsule.name || 'Untitled Capsule',
      description: typeof capsule.description === 'string' ? capsule.description : '',
      style: typeof capsule.style === 'string' ? capsule.style : '',
      seasons: Array.isArray(capsule.seasons) ? capsule.seasons : [],
      scenarios: Array.isArray(capsule.scenarios) ? capsule.scenarios : [],
      main_item_id: capsule.mainItemId || null,
      selected_items: Array.isArray(capsule.selectedItems) ? capsule.selectedItems : [],
      user_id: user?.id || 'guest',
      date_created: new Date().toISOString()
    };
    
    console.log('[supabaseApi] Prepared capsule data for insertion:', capsuleData);
    
    // Insert the new capsule into the database
    console.log('[supabaseApi] Inserting capsule into database...');
    const { data, error } = await supabase
      .from('capsules')
      .insert([capsuleData])
      .select()
      .single();
      
    if (error) {
      console.error('[supabaseApi] Error creating capsule:', error);
      throw error;
    }
    
    console.log('[supabaseApi] Successfully created capsule:', data);
    
    // If there are selected items, add them to the capsule_items join table
    if (Array.isArray(capsule.selectedItems) && capsule.selectedItems.length > 0) {
      const records = capsule.selectedItems.map(itemId => ({
        capsule_id: data.id,
        item_id: itemId,
        user_id: user?.id || 'guest'
      }));
      
      // Insert into the join table
      const { error: joinError } = await supabase
        .from('capsule_items')
        .upsert(records, { onConflict: 'capsule_id,item_id' });
      
      if (joinError) {
        console.error('Error adding items to capsule:', joinError);
      }
    }
    
    // Define the expected database response type
    interface DBCapsuleResponse {
      id: string;
      name: string | null;
      description: string | null;
      style: string | null;
      seasons: Season[] | null;
      scenarios: string[] | null;
      selected_items: string[] | null;
      main_item_id: string | null;
      date_created: string;
      created_at?: string;
      user_id: string;
    }
    
    // Type assertion for the database response
    const dbResponse = data as unknown as DBCapsuleResponse;
    
    // Map the database response to our Capsule type with proper defaults
    const newCapsule: Capsule = {
      id: dbResponse.id,
      name: dbResponse.name || 'Untitled Capsule',
      description: typeof dbResponse.description === 'string' ? dbResponse.description : '',
      style: typeof dbResponse.style === 'string' ? dbResponse.style : '',
      seasons: Array.isArray(dbResponse.seasons) ? dbResponse.seasons : [],
      scenarios: Array.isArray(dbResponse.scenarios) ? dbResponse.scenarios : [],
      selectedItems: Array.isArray(dbResponse.selected_items) ? dbResponse.selected_items : [],
      mainItemId: dbResponse.main_item_id || undefined,
      dateCreated: dbResponse.date_created || dbResponse.created_at || new Date().toISOString()
    };
    
    return newCapsule;
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

export const updateCapsule = async (id: string, updates: Partial<Capsule>): Promise<Capsule | null> => {
  try {
    // Get the current user
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    
    // Check if user is authenticated or in guest mode
    const isGuestMode = !user && Boolean(localStorage.getItem('guestMode'));
    
    if (!user && !isGuestMode) {
      throw new Error('User must be authenticated to update a capsule');
    }
    
    // Extract items from the capsule object if present
    const { selectedItems, ...capsuleWithoutItems } = updates;
    
    // Prepare the update data with proper null handling
    const updateData: Record<string, any> = {};
    
    // Helper function to safely get string or undefined
    const getStringOrUndefined = (value: any): string | undefined => {
      return typeof value === 'string' ? value : undefined;
    };
    
    // Only include fields that are actually being updated
    if ('name' in capsuleWithoutItems) updateData.name = getStringOrUndefined(capsuleWithoutItems.name) || 'Untitled Capsule';
    if ('description' in capsuleWithoutItems) updateData.description = getStringOrUndefined(capsuleWithoutItems.description) || '';
    if ('style' in capsuleWithoutItems) updateData.style = getStringOrUndefined(capsuleWithoutItems.style) || '';
    if ('seasons' in capsuleWithoutItems) updateData.seasons = Array.isArray(capsuleWithoutItems.seasons) ? capsuleWithoutItems.seasons : [];
    if ('scenarios' in capsuleWithoutItems) updateData.scenarios = Array.isArray(capsuleWithoutItems.scenarios) ? capsuleWithoutItems.scenarios : [];
    if ('mainItemId' in capsuleWithoutItems) updateData.main_item_id = getStringOrUndefined(capsuleWithoutItems.mainItemId) || null;
    
    // Always update the updated_at timestamp
    updateData.updated_at = new Date().toISOString();
    
    // Update the capsule in the database
    const { data, error: updateError } = await supabase
      .from('capsules')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
      
    if (updateError) {
      console.error('Error updating capsule:', updateError);
      throw updateError;
    }
    
    // If selectedItems was provided, update the capsule_items join table
    if (selectedItems) {
      // First, delete all existing items for this capsule
      const { error: deleteError } = await supabase
        .from('capsule_items')
        .delete()
        .eq('capsule_id', id);
        
      if (deleteError) {
        console.error('Error removing existing items from capsule:', deleteError);
        throw deleteError;
      }
      
      // Then add the new items if there are any
      if (selectedItems.length > 0) {
        const records = selectedItems.map(itemId => ({
          capsule_id: id,
          item_id: itemId,
          user_id: user?.id || 'guest'
        }));
        
        const { error: insertError } = await supabase
          .from('capsule_items')
          .insert(records);
          
        if (insertError) {
          console.error('Error adding items to capsule:', insertError);
          throw insertError;
        }
      }
    }
    
    // Define the expected database response type
    interface DBCapsuleResponse {
      id: string;
      name: string | null;
      description: string | null;
      style: string | null;
      seasons: Season[] | null;
      scenarios: string[] | null;
      selected_items: string[] | null;
      main_item_id: string | null;
      date_created: string;
      created_at?: string;
      user_id: string;
    }
    
    // Type assertion for the database response
    const dbResponse = data as unknown as DBCapsuleResponse;
    
    // Map the database response to our Capsule type with proper defaults
    const updatedCapsule: Capsule = {
      id: dbResponse.id,
      name: dbResponse.name || 'Untitled Capsule',
      description: typeof dbResponse.description === 'string' ? dbResponse.description : '',
      style: typeof dbResponse.style === 'string' ? dbResponse.style : '',
      seasons: Array.isArray(dbResponse.seasons) ? dbResponse.seasons : [],
      scenarios: Array.isArray(dbResponse.scenarios) ? dbResponse.scenarios : [],
      selectedItems: Array.isArray(dbResponse.selected_items) ? dbResponse.selected_items : [],
      mainItemId: dbResponse.main_item_id || undefined,
      dateCreated: dbResponse.date_created || dbResponse.created_at || new Date().toISOString()
    };
    
    return updatedCapsule;
  } catch (error) {
    console.error('[Supabase] Error updating capsule:', error);
    
    // Fallback to local storage for guest users
    try {
      const storedCapsules = localStorage.getItem('guestCapsules');
      if (storedCapsules) {
        const capsules = JSON.parse(storedCapsules);
        const updatedCapsules = capsules.map((c: Capsule) => 
          c.id === id ? { ...c, ...updates, id } : c
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
