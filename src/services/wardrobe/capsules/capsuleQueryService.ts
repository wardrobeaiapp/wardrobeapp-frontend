/**
 * Specialized query operations for capsules
 */

import { Capsule, Season } from '../../../types';
import { supabase } from '../../core';
import {
  CAPSULES_TABLE,
  CAPSULE_ITEMS_TABLE,
  CAPSULE_SCENARIOS_TABLE,
  cacheState,
  getString,
  getArray,
  isGuestModeEnabled,
  getCurrentUser,
} from './capsuleBaseService';

/**
 * Fetch all capsules from the database
 */
export async function fetchCapsulesFromDB(): Promise<Capsule[]> {
  // Only log if we haven't logged in the last 500ms (handles React StrictMode double renders)
  const now = Date.now();
  const shouldLog = now - cacheState.lastQueryLogTime > 500;
  
  if (shouldLog) {
    console.log('ud83dudd0d [DATABASE] Fetching fresh capsules data from database');
    cacheState.lastQueryLogTime = now;
  }
  
  try {
    // Get the current user
    const user = await getCurrentUser();
    
    if (shouldLog) {
      console.log('ud83dudc64 [DATABASE] User authentication:', { authenticated: !!user });
    }
    
    // Check if we're in guest mode
    const isGuestMode = !user && isGuestModeEnabled();
    
    if (shouldLog) {
      console.log('ud83dudd11 [DATABASE] Guest mode:', isGuestMode);
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
      .from(CAPSULES_TABLE)
      .select('*')
      .order('date_created', { ascending: false });
    
    // If in guest mode, explicitly filter for guest user_id
    if (isGuestMode) {
      if (shouldLog) {
        console.log('ud83dudc64 [DATABASE] Filtering for guest user');
      }
      query = query.eq('user_id', 'guest');
    }

    const { data, error } = await query as { data: DBCapsule[] | null; error: any };

    // Log query results if we should be logging
    if (shouldLog) {
      console.log('ud83dudcc2 [DATABASE] Query results:', { 
        resultCount: data?.length || 0, 
        hasError: !!error 
      });
    }

    if (error) {
      // Always log errors, even if shouldLog is false
      console.error('u274c [DATABASE] Query error:', error);
      throw error;
    }

    // If no capsules found, return empty array
    if (!data || data.length === 0) {
      if (shouldLog) {
        console.log('ud83dudd0d [DATABASE] No capsules found in database');
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
        .from(CAPSULE_ITEMS_TABLE)
        .select('capsule_id, item_id')
        .in('capsule_id', capsuleIds);
        
      // Fetch all capsule scenarios from the join table
      const { data: capsuleScenarios } = await supabase
        .from(CAPSULE_SCENARIOS_TABLE)
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
    
    // Map the database capsules to our application's Capsule type
    const dbCapsules = data.map((capsule: DBCapsule) => {
      // Map the database capsule to our application's Capsule type
      const mappedCapsule: Capsule = {
        id: getString(capsule.id, `capsule-${Date.now()}}`),
        name: getString(capsule.name, 'Untitled Capsule'),
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
    cacheState.capsulesCache.data = dbCapsules;
    cacheState.capsulesCache.timestamp = Date.now();
    
    if (shouldLog) {
      console.log('ud83dudd04 [CACHE] Updated cache with fresh data, items:', dbCapsules.length);
    }
    
    return dbCapsules;
  } catch (error) {
    // Always log errors
    console.error('u274c [DATABASE] Error fetching capsules:', error);
    
    // Try to get capsules from local storage as fallback in guest mode
    const guestModeEnabled = isGuestModeEnabled();
    if (guestModeEnabled && shouldLog) {
      console.log('ud83dudcbe [FALLBACK] Attempting to load capsules from local storage');
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
        console.error('u274c [FALLBACK] Error parsing stored capsules:', parseError);
      }
    }
    
    // Update cache with empty array
    cacheState.capsulesCache.data = [];
    cacheState.capsulesCache.timestamp = Date.now();
    
    if (shouldLog) {
      console.log('ud83dudcbe [CACHE] Updated cache with empty array due to error');
    }
    
    return [];
  }
}

/**
 * Check if capsule tables exist in the database
 */
export const checkCapsuleTablesExist = async (): Promise<boolean> => {
  try {
    // First check if user is authenticated
    const user = await getCurrentUser();
    if (!user && !isGuestModeEnabled()) {
      return false;
    }
    
    // Try to query the table
    const { error } = await supabase
      .from(CAPSULES_TABLE)
      .select('id')
      .limit(1);
      
    if (error) {
      return false;
    }
    
    return true;
  } catch (error) {
    return false;
  }
};
