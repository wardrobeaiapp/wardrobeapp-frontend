import { WardrobeItem, Outfit, Capsule } from '../types';
import {
  fetchOutfits as fetchOutfitsFromSupabase,
  createOutfit as createOutfitInSupabase,
  updateOutfit as updateOutfitInSupabase,
  deleteOutfit as deleteOutfitInSupabase,
  migrateOutfitsToSupabase,
  checkOutfitsTableExists
} from './wardrobe/outfits/outfitService';

// API base URL - using relative path to leverage proxy configuration
const API_URL = '/api';

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

// Wardrobe Item API calls
export const fetchWardrobeItems = async (): Promise<WardrobeItem[]> => {
  const headers = getAuthHeaders();
  return apiRequest<WardrobeItem[]>(`${API_URL}/wardrobe-items`, { headers });
};

export const createWardrobeItem = async (item: Omit<WardrobeItem, 'id' | 'dateAdded' | 'timesWorn'>): Promise<WardrobeItem> => {
  // Add debugging logs for wishlist property
  console.log('[API] createWardrobeItem - item with wishlist:', item);
  console.log('[API] createWardrobeItem - wishlist property:', item.wishlist);
  
  const headers = getAuthHeaders();
  const options = {
    method: 'POST',
    headers,
    body: JSON.stringify(item)
  };
  
  const newItem = await apiRequest<WardrobeItem>(`${API_URL}/wardrobe-items`, options);
  console.log('[API] createWardrobeItem - response from server:', newItem);
  console.log('[API] createWardrobeItem - wishlist in response:', newItem.wishlist);
  
  // If the server didn't return an imageUrl but we sent one, preserve it
  if (!newItem.imageUrl && item.imageUrl) {
    console.log('[API] Server did not return imageUrl, preserving original');
    newItem.imageUrl = item.imageUrl;
  }
  
  // If the server didn't return a wishlist property but we sent one, preserve it
  if (newItem.wishlist === undefined && item.wishlist !== undefined) {
    console.log('[API] Server did not return wishlist property, preserving original');
    newItem.wishlist = item.wishlist;
  }
  
  return newItem;
};

export const updateWardrobeItem = async (id: string, item: Partial<WardrobeItem>): Promise<void> => {
  const headers = getAuthHeaders();
  const options = {
    method: 'PUT',
    headers,
    body: JSON.stringify(item)
  };
  
  await apiRequest(`${API_URL}/wardrobe-items/${id}`, options);
};

export const deleteWardrobeItem = async (id: string): Promise<void> => {
  const headers = getAuthHeaders();
  const options = {
    method: 'DELETE',
    headers
  };
  
  await apiRequest(`${API_URL}/wardrobe-items/${id}`, options);
};

// Outfit API calls - now using Supabase

// Fetch outfits - now using Supabase with fallback to API
export const fetchOutfits = async (): Promise<Outfit[]> => {
  try {
    // Try to fetch from Supabase first
    const outfits = await fetchOutfitsFromSupabase();
    
    // If we got outfits from Supabase, return them
    if (outfits && outfits.length > 0) {
      return outfits;
    }
    
    // If no outfits in Supabase yet, check if we need to migrate from API
    const tableExists = await checkOutfitsTableExists();
    
    if (tableExists) {
      // Table exists but no outfits - user might not have any outfits yet
      return [];
    }
    
    // If table doesn't exist or no outfits found, try legacy API
    const authHeaders = getAuthHeaders();
    const legacyOutfits = await apiRequest<Outfit[]>(`${API_URL}/outfits`, { headers: authHeaders });
    
    // If we got outfits from legacy API, migrate them to Supabase
    if (legacyOutfits && legacyOutfits.length > 0) {
      await migrateOutfitsToSupabase(legacyOutfits);
      return legacyOutfits;
    }
    
    return [];
  } catch (error) {
    console.error('[api] Error fetching outfits:', error);
    // Fallback to legacy API if Supabase fails
    try {
        const authHeaders = getAuthHeaders();
      return await apiRequest<Outfit[]>(`${API_URL}/outfits`, { headers: authHeaders });
    } catch (apiError) {
      console.error('[api] Legacy API also failed:', apiError);
      return [];
    }
  }
};

// Create outfit - now using Supabase with fallback to API
export const createOutfit = async (outfit: Omit<Outfit, 'id' | 'dateCreated'>): Promise<Outfit> => {
  try {
    // Try to create outfit in Supabase first
    const createdOutfit = await createOutfitInSupabase(outfit);
    return createdOutfit;
  } catch (error) {
    console.error('[api] Error creating outfit in Supabase:', error);
    // Fallback to API
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(outfit)
    };
    
    const response = await apiRequest(`${API_URL}/outfits`, options);
    return response as Outfit;
  }
};

// Update outfit - now using Supabase with fallback to API
export const updateOutfit = async (id: string, outfit: Partial<Outfit>): Promise<void> => {
  try {
    // Try to update in Supabase first
    await updateOutfitInSupabase(id, outfit);
  } catch (error) {
    console.error('[api] Error updating outfit in Supabase:', error);
    // Fallback to legacy API
    const authHeaders = getAuthHeaders();
    const options = {
      method: 'PUT',
      headers: {
        ...authHeaders,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(outfit)
    };
    await apiRequest(`${API_URL}/outfits/${id}`, options);
  }
};

// Delete outfit - now using Supabase with fallback to API
export const deleteOutfit = async (id: string): Promise<void> => {
  try {
    // Try to delete from Supabase first
    await deleteOutfitInSupabase(id);
  } catch (error) {
    console.error('[api] Error deleting outfit from Supabase:', error);
    // Fallback to legacy API
    const authHeaders = getAuthHeaders();
    const options = {
      method: 'DELETE',
      headers: authHeaders
    };
    await apiRequest(`${API_URL}/outfits/${id}`, options);
  }
};

// Capsule API calls
export const fetchCapsules = async (): Promise<Capsule[]> => {
  try {
    // Try to fetch from Supabase first
    const { fetchCapsules: fetchCapsulesFromSupabase } = await import('./supabaseApi');
    const capsules = await fetchCapsulesFromSupabase();
    return capsules;
  } catch (error) {
    console.error('[api] Error fetching capsules from Supabase:', error);
    // Fallback to legacy API
    try {
      const headers = getAuthHeaders();
      return await apiRequest<Capsule[]>(`${API_URL}/capsules`, { headers });
    } catch (fallbackError) {
      // Log error but don't throw it if it's related to missing capsules
      if (fallbackError instanceof Error && 
          (fallbackError.message.includes('404') || fallbackError.message.includes('500'))) {
        console.log('No capsules found, returning empty array');
        return [];
      }
      throw fallbackError;
    }
  }
};

export const createCapsule = async (capsule: Omit<Capsule, 'id' | 'dateCreated'>): Promise<Capsule> => {
  try {
    // Use Supabase for capsule creation
    const { createCapsule: createCapsuleInSupabase } = await import('./supabaseApi');
    return await createCapsuleInSupabase(capsule);
  } catch (error) {
    console.error('[api] Error creating capsule in Supabase:', error);
    // Fallback to legacy API
    const headers = getAuthHeaders();
    const options = {
      method: 'POST',
      headers,
      body: JSON.stringify(capsule)
    };
    
    return apiRequest<Capsule>(`${API_URL}/capsules`, options);
  }
};

export const updateCapsule = async (id: string, capsule: Partial<Capsule>): Promise<Capsule | null> => {
  try {
    // Use Supabase for capsule updates
    const { updateCapsule: updateCapsuleInSupabase } = await import('./supabaseApi');
    return await updateCapsuleInSupabase(id, capsule);
  } catch (error) {
    console.error('[api] Error updating capsule in Supabase:', error);
    // Fallback to legacy API
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
  }
};

export const deleteCapsule = async (id: string): Promise<void> => {
  try {
    // Use Supabase for capsule deletion
    const { deleteCapsule: deleteCapsuleInSupabase } = await import('./supabaseApi');
    await deleteCapsuleInSupabase(id);
  } catch (error) {
    console.error('[api] Error deleting capsule from Supabase:', error);
    // Fallback to legacy API
    const headers = getAuthHeaders();
    const options = {
      method: 'DELETE',
      headers
    };
    
    await apiRequest(`${API_URL}/capsules/${id}`, options);
  }
};

// Scenario API calls
export interface Scenario {
  id: string;
  user_id: string;
  name: string;
  type: string;
  description?: string;
  frequency?: string;
  created_at?: string;
  updated_at?: string;
}

// Cache for scenarios data
let scenariosCache: { data: Scenario[] | null; timestamp: number } = {
  data: null,
  timestamp: 0
};

export const fetchScenarios = async (): Promise<Scenario[]> => {
  // Check if we have cached data that's less than 5 minutes old
  const now = Date.now();
  const cacheAge = now - scenariosCache.timestamp;
  const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds
  
  if (scenariosCache.data && cacheAge < CACHE_TTL) {
    return scenariosCache.data;
  }

  try {
    // Import supabase client
    const { supabase } = await import('./core');
    
    // Get current user
    const { data: authData, error: authError } = await supabase.auth.getUser();
    
    if (authError || !authData.user) {
      throw new Error('User not authenticated');
    }
    
    // Fetch scenarios directly from the scenarios table
    const { data: scenariosData, error: scenariosError } = await supabase
      .from('scenarios')
      .select('*')
      .eq('user_id', authData.user.id);
    
    // Handle query error
    if (scenariosError) {
      console.error('Error fetching scenarios:', scenariosError);
      // Update cache with empty array
      scenariosCache = { data: [], timestamp: now };
      return [];
    }
    
    // Transform database scenarios to the Scenario interface format
    const scenarios: Scenario[] = scenariosData.map(dbScenario => ({
      id: String(dbScenario.id),
      user_id: String(dbScenario.user_id),
      name: String(dbScenario.name),
      type: dbScenario.type ? String(dbScenario.type) : 'unknown',
      description: dbScenario.description ? String(dbScenario.description) : '',
      frequency: dbScenario.frequency ? String(dbScenario.frequency) : 'weekly',
      created_at: dbScenario.created_at ? String(dbScenario.created_at) : undefined,
      updated_at: dbScenario.updated_at ? String(dbScenario.updated_at) : undefined
    }));
    
    // Update cache with fresh data
    scenariosCache = { data: scenarios, timestamp: now };
    
    return scenarios;
  } catch (error) {
    // For any errors, log and return empty array to prevent UI from hanging
    console.error('Error fetching scenarios:', error);
    return [];
  }
};

// Cache for tracking in-progress scenario updates to prevent duplicate calls
let scenarioUpdateInProgress = false;

export const updateScenarios = async (scenarios: Scenario[]): Promise<Scenario[]> => {
  // Validate scenarios
  if (!Array.isArray(scenarios)) {
    throw new Error('Invalid scenarios format');
  }
  
  // Validate each scenario has required fields
  const validScenarios = scenarios.filter(s => {
    const isValid = s && typeof s === 'object' && s.name; // ID can be generated by Supabase
    return isValid;
  });
  
  // If all scenarios are invalid, throw an error
  if (validScenarios.length === 0 && scenarios.length > 0) {
    throw new Error('All scenarios are invalid');
  }
  
  // Check if an update is already in progress
  if (scenarioUpdateInProgress) {
    // Wait for the current update to complete
    await new Promise(resolve => setTimeout(resolve, 1000));
    return updateScenarios(scenarios); // Try again
  }
  
  // Set the flag to indicate an update is in progress
  scenarioUpdateInProgress = true;
  
  try {
    // Import Supabase client
    const { supabase } = await import('./core');
    
    // Get current user
    const { data: authData, error: authError } = await supabase.auth.getUser();
    
    if (authError || !authData.user) {
      throw new Error('User not authenticated');
    }
    
    const userId = authData.user.id;
    
    // First, delete any existing scenarios for this user
    // This ensures we don't have duplicates when re-saving scenarios
    const { error: deleteError } = await supabase
      .from('scenarios')
      .delete()
      .eq('user_id', userId);
      
    if (deleteError) {
      console.error('Error deleting existing scenarios:', deleteError);
      // Continue anyway - we'll try to insert new scenarios
    }
    
    // Prepare scenarios for insertion
    const scenariosToInsert = validScenarios.map(scenario => ({
      user_id: userId,
      name: scenario.name,
      type: scenario.type || 'unknown',
      description: scenario.description || '',
      frequency: scenario.frequency || 'weekly'
      // Other fields will be handled by Supabase defaults
    }));
    
    // Insert scenarios into the scenarios table
    const { data: insertedScenarios, error: insertError } = await supabase
      .from('scenarios')
      .insert(scenariosToInsert)
      .select();
      
    if (insertError) {
      throw new Error(`Failed to insert scenarios: ${insertError.message}`);
    }
    
    // Also update scenarios in localStorage as a backup
    try {
      // Get existing user data from localStorage
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      
      // Update or create preferences object
      if (!userData.preferences) {
        userData.preferences = {};
      }
      
      // Set scenarios in preferences
      userData.preferences.scenarios = validScenarios;
      
      // Save back to localStorage
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (localStorageError) {
      // This is just a backup, so log but don't throw
      console.error('Error updating localStorage:', localStorageError);
    }
    
    // Convert the returned data to the proper Scenario type
    const typedScenarios = insertedScenarios ? (insertedScenarios as unknown as Scenario[]) : [];
    
    // Update cache
    scenariosCache = { data: typedScenarios, timestamp: Date.now() };
    
    return typedScenarios;
  } catch (error) {
    console.error('[updateScenarios] Error updating scenarios:', error);
    
    // Try localStorage as fallback if all else fails
    try {
      // Get existing user data from localStorage
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      
      // Update or create preferences object
      if (!userData.preferences) {
        userData.preferences = {};
      }
      
      // Set scenarios in preferences
      userData.preferences.scenarios = validScenarios;
      
      // Save back to localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Also update scenarios cache
      scenariosCache = { data: validScenarios, timestamp: Date.now() };
      
      return validScenarios;
    } catch (localStorageError) {
      throw error; // Throw the original error
    }
  } finally {
    // Always reset the in-progress flag, even if there's an error
    scenarioUpdateInProgress = false;
  }
};
