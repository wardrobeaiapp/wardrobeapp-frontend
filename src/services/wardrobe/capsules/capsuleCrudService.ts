/**
 * Core CRUD operations for capsules
 */

import { Capsule } from '../../../types';
import { supabase } from '../../core';
import {
  CAPSULES_TABLE,
  CAPSULE_ITEMS_TABLE,
  CAPSULE_SCENARIOS_TABLE,
  cacheState,
  apiRequest,
  getAuthHeaders,
  isGuestModeEnabled,
  getCurrentUser,
  API_URL
} from './capsuleBaseService';
import { v4 as uuidv4 } from 'uuid';
import { fetchCapsulesFromDB } from './capsuleQueryService';

/**
 * Fetch all capsules for the current user
 */
export const fetchCapsules = async (): Promise<Capsule[]> => {
  // Check if we have cached data that's less than 5 minutes old
  const now = Date.now();
  const cacheAge = now - cacheState.capsulesCache.timestamp;
  const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds
  
  if (cacheState.capsulesCache.data && cacheAge < CACHE_TTL) {
    console.log('\ud83d\udd04 [CACHE HIT] Using cached capsules data - No database query made');
    return cacheState.capsulesCache.data as Capsule[];
  }
  
  // If there's already a fetch in progress, wait for it instead of starting a new one
  if (cacheState.capsulesFetchInProgress) {
    console.log('\u23f3 [PENDING] Another fetch already in progress - Waiting for it to complete');
    return cacheState.capsulesFetchInProgress as Promise<Capsule[]>;
  }
  
  // Create a new fetch promise and store it in the module-level variable
  console.log('\ud83d\udd0d [DATABASE] Cache miss - Fetching fresh data from database');
  cacheState.capsulesFetchInProgress = fetchCapsulesFromDB();
  
  try {
    // Wait for the fetch to complete
    const result = await cacheState.capsulesFetchInProgress;
    return result as Capsule[];
  } finally {
    // Clear the in-progress flag when done (success or error)
    cacheState.capsulesFetchInProgress = null;
  }
};

/**
 * Create a new capsule
 */
export const createCapsule = async (capsule: Omit<Capsule, 'id' | 'dateCreated'>): Promise<Capsule> => {
  // Track if we should be logging details (prevents log spam during rapid operations)
  const now = Date.now();
  const shouldLog = now - cacheState.lastQueryLogTime > 500;
  cacheState.lastQueryLogTime = now;
  
  if (shouldLog) {
    console.log('📝 [DATABASE] Creating new capsule:', { name: capsule.name });
  }
  
  try {
    // Get the current user
    const user = await getCurrentUser();
    
    if (shouldLog) {
      console.log('👤 [DATABASE] User authentication:', { authenticated: !!user });
    }
    
    // Create new capsule with UUID format
    const newCapsule: Capsule = {
      ...capsule,
      id: uuidv4(),
      dateCreated: new Date().toISOString()
    };
    
    // Determine if we're in guest mode
    const isGuestMode = !user && isGuestModeEnabled();
    
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
      const { error } = await supabase
        .from(CAPSULES_TABLE)
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
        try {
          // Insert each scenario individually to prevent RLS batch issues
          let insertedCount = 0;
          let hasErrors = false;
          
          for (const scenarioId of newCapsule.scenarios) {
            const scenarioInsert = {
              capsule_id: newCapsule.id,
              scenario_id: scenarioId,
              user_id: user?.id
            };
            
            if (shouldLog) {
              console.log('🔍 [DATABASE] Inserting scenario:', {
                table: CAPSULE_SCENARIOS_TABLE,
                capsule_id: newCapsule.id,
                scenario_id: scenarioId,
                user_id: isGuestMode ? 'guest' : user?.id || null
              });
            }
            
            // Insert one at a time to avoid batch RLS issues
            const { error: scenarioError } = await supabase
              .from(CAPSULE_SCENARIOS_TABLE)
              .insert(scenarioInsert);
            
            if (scenarioError) {
              console.warn('⚠️ [DATABASE] Warning: Could not insert scenario:', {
                scenarioId,
                error: scenarioError
              });
              hasErrors = true;
            } else {
              insertedCount++;
            }
          }
          
          // Summary logging
          if (hasErrors) {
            console.warn('⚠️ [DATABASE] Warning: Inserted ' + insertedCount + ' of ' + 
              newCapsule.scenarios.length + ' scenarios with some errors');
          } else if (shouldLog) {
            console.log('✅ [DATABASE] Successfully inserted all ' + insertedCount + ' scenarios');
          }
        } catch (error) {
          console.warn('⚠️ [DATABASE] Warning: Error inserting scenarios:', error);
          // Non-blocking error, continue execution
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
          .from(CAPSULE_ITEMS_TABLE)
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
    if (cacheState.capsulesCache.data) {
      if (shouldLog) {
        console.log('🔄 [CACHE] Updating cache after create');
      }
      
      cacheState.capsulesCache.data = [newCapsule, ...cacheState.capsulesCache.data];
      cacheState.capsulesCache.timestamp = Date.now();
      
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
 */
export const updateCapsule = async (id: string, capsule: Partial<Capsule>): Promise<Capsule | null> => {
  // Track if we should be logging details (prevents log spam during rapid operations)
  const now = Date.now();
  const shouldLog = now - cacheState.lastQueryLogTime > 500;
  cacheState.lastQueryLogTime = now;
  
  if (shouldLog) {
    console.log('📝 [DATABASE] Updating capsule:', { id, name: capsule.name });
  }
  
  try {
    // Get the current user
    const user = await getCurrentUser();
    
    if (shouldLog) {
      console.log('👤 [DATABASE] User authentication:', { authenticated: !!user });
    }
    
    // Determine if we're in guest mode
    const isGuestMode = !user && isGuestModeEnabled();
    
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
      const { error } = await supabase
        .from(CAPSULES_TABLE)
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
    }
      
    // Handle scenarios if they were provided
    if (capsule.scenarios !== undefined) {
      if (shouldLog) {
        console.log('🔄 [DATABASE] Updating scenarios for capsule:', { id, scenarios: capsule.scenarios });
      }
      
      // First, delete all existing scenarios for this capsule
      if (!isGuestMode) {
        try {
          const { error: deleteError } = await supabase
            .from(CAPSULE_SCENARIOS_TABLE)
            .delete()
            .eq('capsule_id', id);
            
          if (deleteError) {
            console.error('❌ [DATABASE] Error deleting existing scenarios:', deleteError);
          } else if (shouldLog) {
            console.log('✅ [DATABASE] Deleted existing scenarios for capsule:', id);
          }
        } catch (err) {
          console.warn('⚠️ [DATABASE] Failed to delete existing scenarios:', err);
        }
      }
      
      // Then insert the new scenarios if there are any
      if (capsule.scenarios.length > 0) {
        if (isGuestMode) {
          // In guest mode, update the local cache directly
          if (shouldLog) {
            console.log('👤 [GUEST] Updating scenarios in local cache');
          }
          // The capsule will be updated in the cache by the caller
        } else {
          try {
            // Insert each scenario individually to prevent RLS batch issues
            let insertedCount = 0;
            let hasErrors = false;
            
            for (const scenarioId of capsule.scenarios) {
              const scenarioInsert = {
                capsule_id: id,
                scenario_id: scenarioId,
                user_id: user?.id
              };
              
              if (shouldLog) {
                console.log('🔍 [DATABASE] Inserting scenario:', {
                  table: CAPSULE_SCENARIOS_TABLE,
                  capsule_id: id,
                  scenario_id: scenarioId,
                  user_id: isGuestMode ? 'guest' : user?.id || null
                });
              }
              
              // Insert one at a time to avoid batch RLS issues
              const { error: scenarioError } = await supabase
                .from(CAPSULE_SCENARIOS_TABLE)
                .insert(scenarioInsert);
              
              if (scenarioError) {
                console.warn('⚠️ [DATABASE] Warning: Could not insert scenario:', {
                  scenarioId,
                  error: scenarioError
                });
                hasErrors = true;
              } else {
                insertedCount++;
              }
            }
            
            // Summary logging
            if (hasErrors) {
              console.warn('⚠️ [DATABASE] Warning: Inserted ' + insertedCount + ' of ' + 
                capsule.scenarios.length + ' scenarios with some errors');
            } else if (shouldLog) {
              console.log('✅ [DATABASE] Successfully inserted all ' + insertedCount + ' scenarios');
            }
          } catch (err) {
            console.error('❌ [DATABASE] Error in scenario insertion:', err);
            throw err;
          }  
        }
      }
    }   // Handle item relationships
    if (capsule.selectedItems !== undefined) {
      // First, delete all existing item relationships for this capsule
      const { error: deleteError } = await supabase
        .from(CAPSULE_ITEMS_TABLE)
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
          .from(CAPSULE_ITEMS_TABLE)
          .insert(itemInserts);
        
        if (insertError) {
          console.warn('⚠️ [DATABASE] Warning: Could not insert updated items:', insertError);
          // Non-blocking error, continue execution
        } else if (shouldLog) {
          console.log('✅ [DATABASE] Added', itemInserts.length, 'updated items to capsule');
        }
      }
    }
    
    // Fetch the updated capsule to get the latest data including join tables
    const freshCapsules = await fetchCapsules();
    updatedCapsule = freshCapsules.find(c => c.id === id) || null;
    
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
              scenarios: capsule.scenarios || oldCapsule.scenarios || [],
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
    if (cacheState.capsulesCache.data && updatedCapsule) {
      if (shouldLog) {
        console.log('🔄 [CACHE] Updating cache after update');
      }
      
      const index = cacheState.capsulesCache.data.findIndex(c => c.id === id);
      if (index >= 0) {
        cacheState.capsulesCache.data[index] = updatedCapsule;
        cacheState.capsulesCache.timestamp = Date.now();
        
        if (shouldLog) {
          console.log('✅ [CACHE] Cache updated');
        }
      } else {
        // If not found in cache but we have an updated capsule, add it
        cacheState.capsulesCache.data.push(updatedCapsule);
        cacheState.capsulesCache.timestamp = Date.now();
        
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
 */
export const deleteCapsule = async (id: string): Promise<void> => {
  // Track if we should be logging details (prevents log spam during rapid operations)
  const now = Date.now();
  const shouldLog = now - cacheState.lastQueryLogTime > 500;
  cacheState.lastQueryLogTime = now;
  
  if (shouldLog) {
    console.log('📝 [DATABASE] Deleting capsule:', { id });
  }
  
  try {
    // Get the current user
    const user = await getCurrentUser();
    
    if (shouldLog) {
      console.log('👤 [DATABASE] User authentication:', { authenticated: !!user });
    }
    
    // Determine if we're in guest mode
    const isGuestMode = !user && isGuestModeEnabled();
    
    if (shouldLog) {
      console.log('🔑 [DATABASE] Guest mode:', isGuestMode);
    }
    
    // Delete related records first (cascade delete not automatic in Supabase)
      // First, delete from the capsule_scenarios join table
      const { error: scenariosError } = await supabase
        .from(CAPSULE_SCENARIOS_TABLE)
        .delete()
        .eq('capsule_id', id);
      
      if (scenariosError) {
        console.warn('⚠️ [DATABASE] Warning: Could not delete from capsule_scenarios:', scenariosError);
        // Non-blocking error, continue execution
      } else if (shouldLog) {
      console.log('✅ [DATABASE] Removed scenarios relationships');
    }
    
    // 2. Delete from capsule_items join table
    const { error: itemsError } = await supabase
      .from(CAPSULE_ITEMS_TABLE)
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
      .from(CAPSULES_TABLE)
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
    if (cacheState.capsulesCache.data) {
      if (shouldLog) {
        console.log('🔄 [CACHE] Updating cache after delete');
      }
      
      cacheState.capsulesCache.data = cacheState.capsulesCache.data.filter(c => c.id !== id);
      cacheState.capsulesCache.timestamp = Date.now();
      
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
