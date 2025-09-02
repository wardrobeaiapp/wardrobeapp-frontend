/**
 * @deprecated This file is deprecated and will be removed in a future release.
 * Please import the functions from the modular files instead:
 * - Import CRUD operations from './capsuleCrudService'
 * - Import utility functions from './capsuleBaseService'
 * - Import query functions from './capsuleQueryService'
 * - Import migration functions from './capsuleMigrationService'
 * - Import relation functions from './capsuleRelationsService'
 * 
 * Or use the barrel imports from './index.ts'
 */

import { Capsule, Season } from '../../../types';
import { supabase } from '../../core';

// API base URL - using relative path to leverage proxy configuration
const API_URL = '/api';

// Cache for capsules data
let capsulesCache: { data: Capsule[] | null; timestamp: number } = {
  data: null,
  timestamp: 0
};

// Request lock to prevent duplicate in-flight requests
let capsulesFetchInProgress: Promise<Capsule[]> | null = null;

// Helper function to handle API requests with graceful error handling
const apiRequest = async <T>(url: string, options: RequestInit = {}): Promise<T> => {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return response.json();
  } catch (error) {
    // Detect network connection errors and provide a more specific error
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.warn(`Network request failed for ${url} - using fallback data`);
      throw new Error('Network connection error');
    }
    throw error;
  }
};

// Get auth headers for fetch requests
const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers['x-auth-token'] = token;
  }
  
  return headers;
};

/**
 * Fetch all capsules for the current user
 * @deprecated Use fetchCapsules from './capsuleCrudService' instead
 */
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

// Track last database query timestamp to avoid duplicate logs
let lastQueryLogTime = 0;

// Separate function to actually fetch capsules from the database
/**
 * @deprecated Use fetchCapsulesFromDB from './capsuleQueryService' instead
 */
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
      // Define types for join table records
      interface CapsuleItemRecord {
        capsule_id: string;
        item_id: string;
      }
      
      interface CapsuleScenarioRecord {
        capsule_id: string;
        scenario_id: string;
      }
      
      // Fetch all capsule items
      const { data: capsuleItems } = await supabase
        .from('capsule_items')
        .select('capsule_id, item_id')
        .in('capsule_id', capsuleIds);
        
      // Fetch all capsule scenarios from the join table
      const { data: capsuleScenarios } = await supabase
        .from('capsule_scenarios')
        .select('capsule_id, scenario_id')
        .in('capsule_id', capsuleIds);
      
      // Process capsule items
      if (capsuleItems) {
        // Group items by capsule_id
        (capsuleItems as CapsuleItemRecord[]).forEach(item => {
          if (!capsuleItemsMap[item.capsule_id]) {
            capsuleItemsMap[item.capsule_id] = [];
          }
          capsuleItemsMap[item.capsule_id].push(item.item_id);
        });
      }
      
      // Process capsule scenarios
      if (capsuleScenarios) {
        // Group scenarios by capsule_id
        (capsuleScenarios as CapsuleScenarioRecord[]).forEach(scenario => {
          if (!capsuleScenariosMap[scenario.capsule_id]) {
            capsuleScenariosMap[scenario.capsule_id] = [];
          }
          capsuleScenariosMap[scenario.capsule_id].push(scenario.scenario_id);
        });
      }
    }
    
    // Use the legacy API as a fallback if in guest mode and there are no results
    try {
      if (isGuestMode && shouldLog) {
        const headers = getAuthHeaders();
        const legacyData = await apiRequest<Capsule[]>(`${API_URL}/capsules`, { headers });
        if (legacyData.length > 0) {
          console.log('📂 [LEGACY] Found capsules in legacy API:', { count: legacyData.length });
          return legacyData;
        }
      }
    } catch (legacyError) {
      // Ignore legacy API errors in this context
      if (shouldLog) {
        console.log('🔄 [LEGACY] No capsules found in legacy API, continuing with Supabase data');
      }
    }
    
    // Map the database capsules to our application's Capsule type
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
        // Only use scenarios from the join table map as the scenarios column has been removed
        scenarios: getArray<string>(capsuleScenariosMap[capsule.id] || []),
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
    
    // Try the legacy API as a last fallback
    try {
      const headers = getAuthHeaders();
      const legacyData = await apiRequest<Capsule[]>(`${API_URL}/capsules`, { headers });
      if (legacyData.length > 0) {
        console.log('📂 [LEGACY] Found capsules in legacy API:', { count: legacyData.length });
        return legacyData;
      }
    } catch (legacyError) {
      // Ignore legacy API errors in this context
    }
    
    return [];
  }
}

/**
 * Create a new capsule
 * @deprecated Use createCapsule from './capsuleCrudService' instead
 */
export const createCapsule = async (capsule: Omit<Capsule, 'id' | 'dateCreated'>): Promise<Capsule> => {
  // Track if we should be logging details (prevents log spam during rapid operations)
  const now = Date.now();
  const shouldLog = now - lastQueryLogTime > 500;
  lastQueryLogTime = now;
  
  if (shouldLog) {
    console.log('📝 [DATABASE] Creating new capsule:', { name: capsule.name });
  }
  
  try {
    // Get the current user
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    
    if (shouldLog) {
      console.log('👤 [DATABASE] User authentication:', { authenticated: !!user });
    }
    
    // New capsule with current timestamp and random ID
    const newCapsule: Capsule = {
      ...capsule,
      id: `capsule-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      dateCreated: new Date().toISOString()
    };
    
    // Determine if we're in guest mode
    const isGuestMode = !user && Boolean(localStorage.getItem('guestMode'));
    
    if (shouldLog) {
      console.log('🔑 [DATABASE] Guest mode:', isGuestMode);
    }
    
    // Prepare the database record
    const dbCapsule = {
      id: newCapsule.id,
      name: newCapsule.name,
      description: newCapsule.description || null,
      style: newCapsule.style || null,
      seasons: Array.isArray(newCapsule.seasons) ? newCapsule.seasons : null,
      // Note: scenarios column has been removed, now using capsule_scenarios table only
      selected_items: Array.isArray(newCapsule.selectedItems) ? newCapsule.selectedItems : null,
      main_item_id: newCapsule.mainItemId || null,
      date_created: newCapsule.dateCreated,
      user_id: isGuestMode ? 'guest' : user?.id || null
    };
    
    // If a real user is logged in, or we're in guest mode, save to the database
    if (user || isGuestMode) {
      // First, insert the main capsule record
      const { data, error } = await supabase
        .from('capsules')
        .insert(dbCapsule)
        .select();
      
      if (error) {
        console.error('❌ [DATABASE] Error creating capsule:', error);
        throw error;
      }
      
      if (shouldLog) {
        console.log('✅ [DATABASE] Capsule created successfully');
      }
      
      // Handle join tables for scenarios
      if (newCapsule.scenarios && newCapsule.scenarios.length > 0) {
        // Prepare bulk insert data for scenarios join table
        const scenarioInserts = newCapsule.scenarios.map(scenario => ({
          capsule_id: newCapsule.id,
          scenario_id: scenario
        }));
        
        // Insert all scenario relationships
        const { error: scenariosError } = await supabase
          .from('capsule_scenarios')
          .insert(scenarioInserts);
        
        if (scenariosError) {
          console.warn('⚠️ [DATABASE] Warning: Could not insert scenarios:', scenariosError);
          // Non-blocking error, continue execution
        } else if (shouldLog) {
          console.log('✅ [DATABASE] Added', scenarioInserts.length, 'scenarios to capsule');
        }
      }
      
      // Handle join tables for items
      if (newCapsule.selectedItems && newCapsule.selectedItems.length > 0) {
        // Prepare bulk insert data for items join table
        const itemInserts = newCapsule.selectedItems.map(itemId => ({
          capsule_id: newCapsule.id,
          item_id: itemId
        }));
        
        // Insert all item relationships
        const { error: itemsError } = await supabase
          .from('capsule_items')
          .insert(itemInserts);
        
        if (itemsError) {
          console.warn('⚠️ [DATABASE] Warning: Could not insert items:', itemsError);
          // Non-blocking error, continue execution
        } else if (shouldLog) {
          console.log('✅ [DATABASE] Added', itemInserts.length, 'items to capsule');
        }
      }
    }
    
    // If in guest mode, also store in local storage
    if (isGuestMode) {
      if (shouldLog) {
        console.log('💾 [LOCAL] Storing capsule in local storage for guest mode');
      }
      
      // Get current capsules from local storage
      const storedCapsules = localStorage.getItem('guestCapsules');
      let capsules: Capsule[] = [];
      
      if (storedCapsules) {
        try {
          capsules = JSON.parse(storedCapsules);
          if (!Array.isArray(capsules)) {
            capsules = [];
          }
        } catch (e) {
          console.error('❌ [LOCAL] Error parsing stored capsules:', e);
          capsules = [];
        }
      }
      
      // Add the new capsule
      capsules.push(newCapsule);
      
      // Store back in local storage
      localStorage.setItem('guestCapsules', JSON.stringify(capsules));
      
      if (shouldLog) {
        console.log('✅ [LOCAL] Successfully stored in local storage');
      }
    }
    
    // Update cache with new capsule
    if (capsulesCache.data) {
      if (shouldLog) {
        console.log('🔄 [CACHE] Updating cache after create');
      }
      
      capsulesCache.data = [newCapsule, ...capsulesCache.data];
      capsulesCache.timestamp = Date.now();
      
      if (shouldLog) {
        console.log('✅ [CACHE] Cache updated');
      }
    }
    
    return newCapsule;
  } catch (error) {
    console.error('❌ [CREATE] Error creating capsule:', error);
    
    // Try legacy API as fallback
    try {
      const headers = getAuthHeaders();
      const options = {
        method: 'POST',
        headers,
        body: JSON.stringify(capsule)
      };
      
      return apiRequest<Capsule>(`${API_URL}/capsules`, options);
    } catch (legacyError) {
      // If all else fails, create a client-side-only capsule
      console.error('❌ [LEGACY] Error in legacy API fallback:', legacyError);
      
      const clientCapsule: Capsule = {
        ...capsule,
        id: `local-capsule-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        dateCreated: new Date().toISOString()
      };
      
      return clientCapsule;
    }
  }
};

/**
 * Update an existing capsule
 * @deprecated Use updateCapsule from './capsuleCrudService' instead
 */
export const updateCapsule = async (id: string, capsule: Partial<Capsule>): Promise<Capsule | null> => {
  // Track if we should be logging details (prevents log spam during rapid operations)
  const now = Date.now();
  const shouldLog = now - lastQueryLogTime > 500;
  lastQueryLogTime = now;
  
  if (shouldLog) {
    console.log('📝 [DATABASE] Updating capsule:', { id, name: capsule.name });
  }
  
  try {
    // Get the current user
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    
    if (shouldLog) {
      console.log('👤 [DATABASE] User authentication:', { authenticated: !!user });
    }
    
    // Determine if we're in guest mode
    const isGuestMode = !user && Boolean(localStorage.getItem('guestMode'));
    
    if (shouldLog) {
      console.log('🔑 [DATABASE] Guest mode:', isGuestMode);
    }
    
    // Prepare the database record with only the fields that are being updated
    const dbCapsule: Record<string, any> = {};
    
    if (capsule.name !== undefined) dbCapsule.name = capsule.name;
    if (capsule.description !== undefined) dbCapsule.description = capsule.description || null;
    if (capsule.style !== undefined) dbCapsule.style = capsule.style || null;
    if (capsule.seasons !== undefined) dbCapsule.seasons = Array.isArray(capsule.seasons) ? capsule.seasons : null;
    if (capsule.mainItemId !== undefined) dbCapsule.main_item_id = capsule.mainItemId || null;
    
    // Note: scenarios column has been removed, now using capsule_scenarios table only
    if (capsule.selectedItems !== undefined) dbCapsule.selected_items = Array.isArray(capsule.selectedItems) ? capsule.selectedItems : null;
    
    let updatedCapsule: Capsule | null = null;
    
    // Update the database if there are fields to update
    if (Object.keys(dbCapsule).length > 0) {
      // Update the capsule record
      const { data, error } = await supabase
        .from('capsules')
        .update(dbCapsule)
        .eq('id', id)
        .select();
      
      if (error) {
        console.error('❌ [DATABASE] Error updating capsule:', error);
        throw error;
      }
      
      if (shouldLog) {
        console.log('✅ [DATABASE] Capsule updated successfully');
      }
      
      // Fetch the updated capsule to get the latest data including join tables
      const freshCapsules = await fetchCapsules();
      updatedCapsule = freshCapsules.find(c => c.id === id) || null;
    }
    
    // Handle scenarios - if scenarios are updated, completely replace them
    if (capsule.scenarios !== undefined) {
      // First, delete all existing scenario relationships for this capsule
      const { error: deleteError } = await supabase
        .from('capsule_scenarios')
        .delete()
        .eq('capsule_id', id);
      
      if (deleteError) {
        console.warn('⚠️ [DATABASE] Warning: Could not delete existing scenarios:', deleteError);
        // Non-blocking error, continue execution
      } else if (shouldLog) {
        console.log('✅ [DATABASE] Removed existing scenarios from capsule');
      }
      
      // If there are new scenarios to add, insert them
      if (Array.isArray(capsule.scenarios) && capsule.scenarios.length > 0) {
        // Prepare bulk insert data for scenarios join table
        const scenarioInserts = capsule.scenarios.map(scenario => ({
          capsule_id: id,
          scenario_id: scenario
        }));
        
        // Insert all scenario relationships
        const { error: insertError } = await supabase
          .from('capsule_scenarios')
          .insert(scenarioInserts);
        
        if (insertError) {
          console.warn('⚠️ [DATABASE] Warning: Could not insert updated scenarios:', insertError);
          // Non-blocking error, continue execution
        } else if (shouldLog) {
          console.log('✅ [DATABASE] Added', scenarioInserts.length, 'updated scenarios to capsule');
        }
      }
    }
    
    // Handle items - if selectedItems are updated, completely replace them
    if (capsule.selectedItems !== undefined) {
      // First, delete all existing item relationships for this capsule
      const { error: deleteError } = await supabase
        .from('capsule_items')
        .delete()
        .eq('capsule_id', id);
      
      if (deleteError) {
        console.warn('⚠️ [DATABASE] Warning: Could not delete existing items:', deleteError);
        // Non-blocking error, continue execution
      } else if (shouldLog) {
        console.log('✅ [DATABASE] Removed existing items from capsule');
      }
      
      // If there are new items to add, insert them
      if (Array.isArray(capsule.selectedItems) && capsule.selectedItems.length > 0) {
        // Prepare bulk insert data for items join table
        const itemInserts = capsule.selectedItems.map(itemId => ({
          capsule_id: id,
          item_id: itemId
        }));
        
        // Insert all item relationships
        const { error: insertError } = await supabase
          .from('capsule_items')
          .insert(itemInserts);
        
        if (insertError) {
          console.warn('⚠️ [DATABASE] Warning: Could not insert updated items:', insertError);
          // Non-blocking error, continue execution
        } else if (shouldLog) {
          console.log('✅ [DATABASE] Added', itemInserts.length, 'updated items to capsule');
        }
      }
    }
    
    // If in guest mode, also update in local storage
    if (isGuestMode) {
      if (shouldLog) {
        console.log('💾 [LOCAL] Updating capsule in local storage for guest mode');
      }
      
      // Get current capsules from local storage
      const storedCapsules = localStorage.getItem('guestCapsules');
      if (storedCapsules) {
        try {
          let capsules: Capsule[] = JSON.parse(storedCapsules);
          if (!Array.isArray(capsules)) {
            capsules = [];
          }
          
          // Find the capsule to update
          const index = capsules.findIndex(c => c.id === id);
          if (index >= 0) {
            // Create updated capsule by merging the old one with the updates
            const oldCapsule = capsules[index];
            const mergedCapsule = {
              ...oldCapsule,
              ...capsule,
              // Ensure arrays are properly handled
              seasons: capsule.seasons || oldCapsule.seasons,
              // Scenarios are handled via join table, not in the main capsule record
              scenarios: capsule.scenarios || [],
              selectedItems: capsule.selectedItems || oldCapsule.selectedItems
            };
            
            // Replace the old capsule with the updated one
            capsules[index] = mergedCapsule;
            
            // Store back in local storage
            localStorage.setItem('guestCapsules', JSON.stringify(capsules));
            
            if (shouldLog) {
              console.log('✅ [LOCAL] Successfully updated in local storage');
            }
            
            // If we don't have an updatedCapsule from the database, use the local one
            if (!updatedCapsule) {
              updatedCapsule = mergedCapsule;
            }
          } else {
            console.warn('⚠️ [LOCAL] Capsule not found in local storage:', id);
          }
        } catch (e) {
          console.error('❌ [LOCAL] Error parsing stored capsules:', e);
        }
      }
    }
    
    // Update cache if we have it
    if (capsulesCache.data && updatedCapsule) {
      if (shouldLog) {
        console.log('🔄 [CACHE] Updating cache after update');
      }
      
      const index = capsulesCache.data.findIndex(c => c.id === id);
      if (index >= 0) {
        capsulesCache.data[index] = updatedCapsule;
        capsulesCache.timestamp = Date.now();
        
        if (shouldLog) {
          console.log('✅ [CACHE] Cache updated');
        }
      } else {
        // If not found in cache but we have an updated capsule, add it
        capsulesCache.data.push(updatedCapsule);
        capsulesCache.timestamp = Date.now();
        
        if (shouldLog) {
          console.log('✅ [CACHE] Added new capsule to cache');
        }
      }
    }
    
    return updatedCapsule;
  } catch (error) {
    console.error('❌ [UPDATE] Error updating capsule:', error);
    
    // Try legacy API as fallback
    try {
      const headers = getAuthHeaders();
      const options = {
        method: 'PUT',
        headers,
        body: JSON.stringify(capsule)
      };
      
      await apiRequest(`${API_URL}/capsules/${id}`, options);
      // Fetch the updated capsule to return it
      const updatedCapsule = await apiRequest<Capsule>(`${API_URL}/capsules/${id}`, { headers });
      return updatedCapsule;
    } catch (legacyError) {
      console.error('❌ [LEGACY] Error in legacy API fallback for update:', legacyError);
      return null;
    }
  }
};

/**
 * Delete a capsule
 * @deprecated Use deleteCapsule from './capsuleCrudService' instead
 */
export const deleteCapsule = async (id: string): Promise<void> => {
  // Track if we should be logging details (prevents log spam during rapid operations)
  const now = Date.now();
  const shouldLog = now - lastQueryLogTime > 500;
  lastQueryLogTime = now;
  
  if (shouldLog) {
    console.log('📝 [DATABASE] Deleting capsule:', { id });
  }
  
  try {
    // Get the current user
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    
    if (shouldLog) {
      console.log('👤 [DATABASE] User authentication:', { authenticated: !!user });
    }
    
    // Determine if we're in guest mode
    const isGuestMode = !user && Boolean(localStorage.getItem('guestMode'));
    
    if (shouldLog) {
      console.log('🔑 [DATABASE] Guest mode:', isGuestMode);
    }
    
    // Delete related records first (cascade delete not automatic in Supabase)
    // 1. Delete from capsule_scenarios join table
    const { error: scenariosError } = await supabase
      .from('capsule_scenarios')
      .delete()
      .eq('capsule_id', id);
    
    if (scenariosError) {
      console.warn('⚠️ [DATABASE] Warning: Could not delete scenarios:', scenariosError);
      // Non-blocking error, continue execution
    } else if (shouldLog) {
      console.log('✅ [DATABASE] Removed scenarios relationships');
    }
    
    // 2. Delete from capsule_items join table
    const { error: itemsError } = await supabase
      .from('capsule_items')
      .delete()
      .eq('capsule_id', id);
    
    if (itemsError) {
      console.warn('⚠️ [DATABASE] Warning: Could not delete items:', itemsError);
      // Non-blocking error, continue execution
    } else if (shouldLog) {
      console.log('✅ [DATABASE] Removed item relationships');
    }
    
    // Finally, delete the capsule itself
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
    
    // Try legacy API as fallback
    try {
      const headers = getAuthHeaders();
      const options = {
        method: 'DELETE',
        headers
      };
      
      await apiRequest(`${API_URL}/capsules/${id}`, options);
      console.log('✅ [LEGACY] Successfully deleted via legacy API');
    } catch (legacyError) {
      console.error('❌ [LEGACY] Error in legacy API fallback for delete:', legacyError);
    }
  }
};
