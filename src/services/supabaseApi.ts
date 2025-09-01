import { supabase } from './core';
import { WardrobeItem, Outfit, Capsule, ItemCategory, Season, WishlistStatus } from '../types';

// Add TypeScript declaration for the window.__loggedQueries property
declare global {
  interface Window {
    __loggedQueries?: string[];
  }
}

// Cache for capsules data
let capsulesCache: { data: Capsule[] | null; timestamp: number } = {
  data: null,
  timestamp: 0
};

// Request lock to prevent duplicate in-flight requests
let capsulesFetchInProgress: Promise<Capsule[]> | null = null;

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

export const updateWardrobeItem = async (id: string, item: Partial<WardrobeItem>): Promise<void> => {
  try {
    // Create a copy of the item to avoid mutating the original
    const updateData = { ...item };
    
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
  
  // Check if we have cached data that's less than 5 minutes old
  const now = Date.now();
  const cacheAge = now - capsulesCache.timestamp;
  const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds
  
  if (capsulesCache.data && cacheAge < CACHE_TTL) {
    console.log('🔄 [CACHE HIT] Using cached capsules data - No database query made');
    return capsulesCache.data;
  }
  
  // If there's already a fetch in progress, wait for it instead of starting a new one
  if (capsulesFetchInProgress) {
    console.log('⏳ [PENDING] Another fetch already in progress - Waiting for it to complete');
    return capsulesFetchInProgress;
  }
  
  // Create a new fetch promise and store it in the module-level variable
  console.log('🔍 [DATABASE] Cache miss - Fetching fresh data from database');
  capsulesFetchInProgress = fetchCapsulesFromDB();
  
  try {
    // Wait for the fetch to complete
    const result = await capsulesFetchInProgress;
    return result;
  } finally {
    // Clear the in-progress flag when done (success or error)
    capsulesFetchInProgress = null;
  }
};

// Separate function to actually fetch capsules from the database
// Track last database query timestamp to avoid duplicate logs
let lastQueryLogTime = 0;

// Separate function to actually fetch capsules from the database
async function fetchCapsulesFromDB(): Promise<Capsule[]> {
  // Only log if we haven't logged in the last 500ms (handles React StrictMode double renders)
  const now = Date.now();
  const shouldLog = now - lastQueryLogTime > 500;
  
  if (shouldLog) {
    console.log('🔍 [DATABASE] Fetching fresh capsules data from database');
    lastQueryLogTime = now;
  }
  
  try {
    // Get the current user
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    
    if (shouldLog) {
      console.log('👤 [DATABASE] User authentication:', { authenticated: !!user });
    }
    
    // Check if we're in guest mode
    const isGuestMode = !user && Boolean(localStorage.getItem('guestMode'));
    
    if (shouldLog) {
      console.log('🔑 [DATABASE] Guest mode:', isGuestMode);
    }

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
    let query = supabase
      .from('capsules')
      .select('*')
      .order('date_created', { ascending: false });
    
    // If in guest mode, explicitly filter for guest user_id
    if (isGuestMode) {
      if (shouldLog) {
        console.log('👤 [DATABASE] Filtering for guest user');
      }
      query = query.eq('user_id', 'guest');
    }

    const { data, error } = await query as { data: DBCapsule[] | null; error: any };

    // Log query results if we should be logging
    if (shouldLog) {
      console.log('📂 [DATABASE] Query results:', { 
        resultCount: data?.length || 0, 
        hasError: !!error 
      });
    }

    if (error) {
      // Always log errors, even if shouldLog is false
      console.error('❌ [DATABASE] Query error:', error);
      throw error;
    }

    // If no capsules found, return empty array
    if (!data || data.length === 0) {
      if (shouldLog) {
        console.log('🔍 [DATABASE] No capsules found in database');
      }
      return [];
    }

    // Get all capsule IDs to fetch their items and scenarios in a single query
    const capsuleIds = data.map(capsule => capsule.id);
    
    // Fetch all capsule items in a single query
    const capsuleItemsMap: Record<string, string[]> = {};
    // Create a map to store scenarios for each capsule
    const capsuleScenariosMap: Record<string, string[]> = {};
    
    if (capsuleIds.length > 0) {
      // Fetch all capsule items
      const { data: capsuleItems, error: capsuleItemsError } = await supabase
        .from('capsule_items')
        .select('capsule_id, item_id')
        .in('capsule_id', capsuleIds);
        
      // Fetch all capsule scenarios from the join table
      const { data: capsuleScenarios, error: capsuleScenariosError } = await supabase
        .from('capsule_scenarios')
        .select('capsule_id, scenario_id')
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
        // Always log errors
        console.error('❌ [DATABASE] Error fetching capsule items:', capsuleItemsError);
      }
      
      // Process scenarios from join table
      if (capsuleScenarios) {
        // Create a map of capsule_id to array of scenario_ids
        capsuleScenarios.forEach((scenarioItem) => {
          const capsuleId = String(scenarioItem.capsule_id);
          const scenarioId = String(scenarioItem.scenario_id);
          if (!capsuleScenariosMap[capsuleId]) {
            capsuleScenariosMap[capsuleId] = [];
          }
          capsuleScenariosMap[capsuleId].push(scenarioId);
        });
        
        if (shouldLog) {
          console.log('🔎 [DATABASE] Fetched scenarios from join table:', { 
            scenariosCount: capsuleScenarios.length,
            capsulesWithScenarios: Object.keys(capsuleScenariosMap).length
          });
        }
      } else if (capsuleScenariosError) {
        // Always log errors
        console.error('❌ [DATABASE] Error fetching capsule scenarios:', capsuleScenariosError);
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
        // Use scenarios from the join table map, falling back to the old array column during migration period
        scenarios: getArray<string>(capsuleScenariosMap[capsule.id] || capsule.scenarios),
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
    
    // Update cache with fresh data
    capsulesCache = { data: dbCapsules, timestamp: Date.now() };
    
    if (shouldLog) {
      console.log('🔄 [CACHE] Updated cache with fresh data, items:', dbCapsules.length);
    }
    
    return dbCapsules;
  } catch (error) {
    // Always log errors
    console.error('❌ [DATABASE] Error fetching capsules:', error);
    
    // Try to get capsules from local storage as fallback in guest mode
    const guestModeEnabled = Boolean(localStorage.getItem('guestMode'));
    if (guestModeEnabled && shouldLog) {
      console.log('💾 [FALLBACK] Attempting to load capsules from local storage');
    }
    
    if (guestModeEnabled) {
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
        // Always log parse errors
        console.error('❌ [FALLBACK] Error parsing stored capsules:', parseError);
      }
    } // Close guestModeEnabled if block
    
    // Update cache with empty array
    capsulesCache = { data: [], timestamp: Date.now() };
    
    if (shouldLog) {
      console.log('💾 [CACHE] Updated cache with empty array due to error');
    }
    
    return [];
  }
};

// Last log time for createCapsule to prevent duplicate logs
let lastCreateCapsuleLogTime = 0;

export const createCapsule = async (capsule: Omit<Capsule, 'id' | 'dateCreated'>): Promise<Capsule> => {
  // Only log if we haven't logged in the last 500ms
  const now = Date.now();
  const shouldLog = now - lastCreateCapsuleLogTime > 500;
  
  if (shouldLog) {
    console.log('📝 [CREATE] Creating new capsule');
    lastCreateCapsuleLogTime = now;
  }
  
  try {
    // Get the current user
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    
    if (shouldLog) {
      console.log('👤 [CREATE] User authentication:', { authenticated: !!user, userId: user?.id });
    }
    
    // Check if user is authenticated or in guest mode
    const isGuestMode = !user && Boolean(localStorage.getItem('guestMode'));
    
    if (shouldLog) {
      console.log('🔑 [CREATE] Guest mode:', isGuestMode);
    }
    
    if (!user && !isGuestMode) {
      const error = new Error('User must be authenticated to create a capsule');
      // Always log authentication errors
      console.error('❌ [AUTH] Authentication error:', error);
      throw error;
    }
    
    // Prepare the capsule data for insertion with proper defaults
    const capsuleData = {
      name: capsule.name || 'Untitled Capsule',
      description: typeof capsule.description === 'string' ? capsule.description : '',
      style: typeof capsule.style === 'string' ? capsule.style : '',
      seasons: Array.isArray(capsule.seasons) ? capsule.seasons : [],
      // scenarios field removed as we'll use the join table
      main_item_id: capsule.mainItemId || null,
      selected_items: Array.isArray(capsule.selectedItems) ? capsule.selectedItems : [],
      user_id: user?.id || 'guest',
      date_created: new Date().toISOString()
    };
    
    // Extract scenarios from capsule for later use in join table
    const scenarios = Array.isArray(capsule.scenarios) ? capsule.scenarios : [];
    
    if (shouldLog) {
      console.log('💾 [CREATE] Prepared capsule data for insertion');
    }
    
    // Reset the cache to force a refresh on next fetch
    capsulesCache = { data: null, timestamp: 0 };
    
    if (shouldLog) {
      console.log('🗑 [CACHE] Invalidated after capsule creation');
    }
    
    // Insert the new capsule into the database
    if (shouldLog) {
      console.log('🔎 [DATABASE] Inserting capsule into database');
    }
    const { data, error } = await supabase
      .from('capsules')
      .insert([capsuleData])
      .select()
      .single();
      
    if (error) {
      // Always log database errors
      console.error('❌ [DATABASE] Error creating capsule:', error);
      throw error;
    }
    
    if (shouldLog) {
      console.log('✅ [DATABASE] Capsule created successfully:', { id: data?.id });
    }
    
    // If there are scenarios, add them to the capsule_scenarios join table
    if (scenarios.length > 0) {
      if (shouldLog) {
        console.log('🔗 [CREATE] Adding scenarios to capsule:', { scenarioCount: scenarios.length });
      }
      
      const scenarioRecords = scenarios.map(scenarioId => ({
        capsule_id: data.id,
        scenario_id: scenarioId,
        user_id: user?.id || 'guest'
      }));
      
      // Insert into the join table
      const { error: scenarioJoinError } = await supabase
        .from('capsule_scenarios')
        .upsert(scenarioRecords, { onConflict: 'capsule_id,scenario_id' });
      
      if (scenarioJoinError) {
        console.error('❌ [DATABASE] Error linking scenarios to capsule:', scenarioJoinError);
      } else if (shouldLog) {
        console.log('✅ [DATABASE] Successfully linked scenarios to capsule:', { count: scenarioRecords.length, capsuleId: data.id });
      }
    }
    
    // If there are selected items, add them to the capsule_items join table
    if (Array.isArray(capsule.selectedItems) && capsule.selectedItems.length > 0) {
      if (shouldLog) {
        console.log('🔗 [CREATE] Adding items to capsule:', { itemCount: capsule.selectedItems.length });
      }
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
        console.error('❌ [DATABASE] Error linking items to capsule:', joinError);
      } else if (shouldLog) {
        console.log('✅ [DATABASE] Successfully linked items to capsule:', { count: records.length, capsuleId: data.id });
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
      scenarios: scenarios, // Use the scenarios from input instead of from the database
      selectedItems: Array.isArray(dbResponse.selected_items) ? dbResponse.selected_items : [],
      mainItemId: dbResponse.main_item_id || undefined,
      dateCreated: dbResponse.date_created || dbResponse.created_at || new Date().toISOString()
    };
    
    // Update cache to include the new capsule
    if (capsulesCache.data) {
      capsulesCache.data = [newCapsule, ...capsulesCache.data];
    } else {
      capsulesCache = { data: [newCapsule], timestamp: Date.now() };
    }
    
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

// Last log time for updateCapsule to prevent duplicate logs
let lastUpdateCapsuleLogTime = 0;

export const updateCapsule = async (id: string, updates: Partial<Capsule>): Promise<Capsule | null> => {
  // Only log if we haven't logged in the last 500ms
  const now = Date.now();
  const shouldLog = now - lastUpdateCapsuleLogTime > 500;
  
  if (shouldLog) {
    console.log('🔄 [UPDATE] Updating capsule:', { id });
    lastUpdateCapsuleLogTime = now;
  }
  
  try {
    // Get the current user
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    
    if (shouldLog) {
      console.log('👤 [UPDATE] User authentication:', { authenticated: !!user });
    }
    
    // Check if user is authenticated or in guest mode
    const isGuestMode = !user && Boolean(localStorage.getItem('guestMode'));
    
    if (shouldLog) {
      console.log('🔑 [UPDATE] Guest mode:', isGuestMode);
    }
    
    if (!user && !isGuestMode) {
      const error = new Error('User must be authenticated to update a capsule');
      // Always log authentication errors
      console.error('❌ [AUTH] Authentication error:', error);
    }
    
    // Extract items and scenarios from the capsule object if present
    const { selectedItems, scenarios, ...capsuleWithoutItems } = updates;
    
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
    // Removed scenarios field as we'll use the join table instead
    if ('mainItemId' in capsuleWithoutItems) updateData.main_item_id = getStringOrUndefined(capsuleWithoutItems.mainItemId) || null;
    
    // Always update the updated_at timestamp
    updateData.updated_at = new Date().toISOString();
    
    // Reset the cache to force a refresh on next fetch
    capsulesCache = { data: null, timestamp: 0 };
    
    if (shouldLog) {
      console.log('🗑 [CACHE] Invalidated for update operation');
      console.log('🔎 [DATABASE] Updating capsule in database');
    }
    
    // Update the capsule in the database
    const { data, error: updateError } = await supabase
      .from('capsules')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
      
    if (updateError) {
      // Always log database errors
      console.error('❌ [DATABASE] Error updating capsule:', updateError);
      throw updateError;
    }
    
    if (shouldLog) {
      console.log('✅ [DATABASE] Capsule updated successfully:', { id });
    }
    
    // If scenarios were provided, update the capsule_scenarios join table
    if (scenarios) {
      if (shouldLog) {
        console.log('🔗 [UPDATE] Updating capsule scenarios', { scenarioCount: scenarios.length });
      }
      
      // First, delete all existing scenarios for this capsule
      if (shouldLog) {
        console.log('🔎 [DATABASE] Removing existing scenarios from capsule');
      }
      
      const { error: deleteScenarioError } = await supabase
        .from('capsule_scenarios')
        .delete()
        .eq('capsule_id', id);
        
      if (deleteScenarioError) {
        // Always log database errors
        console.error('❌ [DATABASE] Error removing existing scenarios from capsule:', deleteScenarioError);
        throw deleteScenarioError;
      }
      
      if (shouldLog) {
        console.log('✅ [DATABASE] Successfully removed existing scenarios');
      }
      
      // Then add the new scenarios if there are any
      if (scenarios.length > 0) {
        const scenarioRecords = scenarios.map(scenarioId => ({
          capsule_id: id,
          scenario_id: scenarioId,
          user_id: user?.id || 'guest'
        }));
        
        if (shouldLog) {
          console.log('🔎 [DATABASE] Adding scenarios to capsule:', { count: scenarioRecords.length });
        }
        
        const { error: insertScenarioError } = await supabase
          .from('capsule_scenarios')
          .insert(scenarioRecords);
          
        if (insertScenarioError) {
          // Always log database errors
          console.error('❌ [DATABASE] Error adding scenarios to capsule:', insertScenarioError);
          throw insertScenarioError;
        }
        
        if (shouldLog) {
          console.log('✅ [DATABASE] Successfully added scenarios to capsule');
        }
      }
    }
    
    // If selectedItems was provided, update the capsule_items join table
    if (selectedItems) {
      if (shouldLog) {
        console.log('🔗 [UPDATE] Updating capsule items', { itemCount: selectedItems.length });
      }
      
      // First, delete all existing items for this capsule
      if (shouldLog) {
        console.log('🔎 [DATABASE] Removing existing items from capsule');
      }
      
      const { error: deleteError } = await supabase
        .from('capsule_items')
        .delete()
        .eq('capsule_id', id);
        
      if (deleteError) {
        // Always log database errors
        console.error('❌ [DATABASE] Error removing existing items from capsule:', deleteError);
        throw deleteError;
      }
      
      if (shouldLog) {
        console.log('✅ [DATABASE] Successfully removed existing items');
      }
      
      // Then add the new items if there are any
      if (selectedItems.length > 0) {
        const records = selectedItems.map(itemId => ({
          capsule_id: id,
          item_id: itemId,
          user_id: user?.id || 'guest'
        }));
        
        if (shouldLog) {
          console.log('🔎 [DATABASE] Adding items to capsule:', { count: records.length });
        }
        
        const { error: insertError } = await supabase
          .from('capsule_items')
          .insert(records);
          
        if (insertError) {
          // Always log database errors
          console.error('❌ [DATABASE] Error adding items to capsule:', insertError);
          throw insertError;
        }
        
        if (shouldLog) {
          console.log('✅ [DATABASE] Successfully added items to capsule');
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
      // If scenarios were provided in the update, use those; otherwise keep existing ones
      scenarios: scenarios || (Array.isArray(dbResponse.scenarios) ? dbResponse.scenarios : []),
      selectedItems: Array.isArray(dbResponse.selected_items) ? dbResponse.selected_items : [],
      mainItemId: dbResponse.main_item_id || undefined,
      dateCreated: dbResponse.date_created || dbResponse.created_at || new Date().toISOString()
    };
    
    // Update the capsule in the cache
    if (capsulesCache.data) {
      capsulesCache.data = capsulesCache.data.map(c => 
        c.id === id ? updatedCapsule : c
      );
      capsulesCache.timestamp = Date.now();
    }
    
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

// Last log time for deleteCapsule to prevent duplicate logs
let lastDeleteCapsuleLogTime = 0;

export const deleteCapsule = async (id: string): Promise<void> => {
  // Only log if we haven't logged in the last 500ms
  const now = Date.now();
  const shouldLog = now - lastDeleteCapsuleLogTime > 500;
  
  if (shouldLog) {
    console.log('🗑 [DELETE] Deleting capsule:', { id });
    lastDeleteCapsuleLogTime = now;
  }
  
  try {
    if (shouldLog) {
      console.log('🔎 [DATABASE] Deleting capsule from database');
    }
    
    const { error } = await supabase
      .from('capsules')
      .delete()
      .eq('id', id);
    
    if (error) {
      // Always log database errors
      console.error('❌ [DATABASE] Error deleting capsule:', error);
      throw error;
    }
    
    if (shouldLog) {
      console.log('✅ [DATABASE] Capsule deleted successfully');
    }
    
    // Remove the deleted capsule from cache
    if (capsulesCache.data) {
      if (shouldLog) {
        console.log('🗑 [CACHE] Updating cache after delete');
      }
      
      capsulesCache.data = capsulesCache.data.filter(c => c.id !== id);
      capsulesCache.timestamp = Date.now();
      
      if (shouldLog) {
        console.log('✅ [CACHE] Cache updated');
      }
    }
  } catch (error) {
    // Always log errors
    console.error('❌ [DELETE] Error deleting capsule:', error);
    
    // Fallback to local storage for guest users
    if (shouldLog) {
      console.log('📂 [LOCAL] Attempting local storage fallback for guest mode');
    }
    
    const storedCapsules = localStorage.getItem('guestCapsules');
    if (storedCapsules) {
      if (shouldLog) {
        console.log('🔎 [LOCAL] Found stored capsules, filtering out deleted capsule');
      }
      
      const capsules = JSON.parse(storedCapsules);
      const updatedCapsules = capsules.filter((c: Capsule) => c.id !== id);
      localStorage.setItem('guestCapsules', JSON.stringify(updatedCapsules));
      
      if (shouldLog) {
        console.log('✅ [LOCAL] Successfully updated local storage');
      }
    }
  }
};
