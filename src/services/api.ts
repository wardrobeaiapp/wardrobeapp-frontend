import { WardrobeItem, Outfit, Capsule } from '../types';
import {
  fetchOutfits as fetchOutfitsFromSupabase,
  createOutfit as createOutfitInSupabase,
  updateOutfit as updateOutfitInSupabase,
  deleteOutfit as deleteOutfitInSupabase,
  migrateOutfitsToSupabase,
  checkOutfitsTableExists
} from './wardrobe/outfits/outfitService';

// Import scenario-related functions from scenarios service
import {
  getScenariosForUser as fetchScenarios,
  updateScenarios,
  createScenario,
  updateScenario,
  deleteScenario
} from './scenarios/scenariosService';

export { fetchScenarios, updateScenarios, createScenario, updateScenario, deleteScenario };

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
      const legacyOutfits = await apiRequest<Outfit[]>(`${API_URL}/outfits`, { headers: authHeaders });
      
      // Ensure scenarioNames is properly set for legacy outfits
      return legacyOutfits.map(outfit => ({
        ...outfit,
        scenarioNames: outfit.scenarioNames || []
      }));
    } catch (apiError) {
      console.error('[api] Legacy API also failed:', apiError);
      return [];
    }
  }
};

// Create outfit - now using Supabase with fallback to API
export const createOutfit = async (outfit: Omit<Outfit, 'id' | 'dateCreated'>): Promise<Outfit> => {
  try {
    // Ensure scenarioNames is properly set
    const outfitWithScenarios = {
      ...outfit,
      scenarioNames: outfit.scenarioNames || []
    };
    
    // Try to create in Supabase first
    const newOutfit = await createOutfitInSupabase(outfitWithScenarios);
    return newOutfit;
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
    // Ensure scenarioNames is properly set if it exists in the update
    const updateData = {
      ...outfit,
      ...(outfit.scenarioNames !== undefined && { scenarioNames: outfit.scenarioNames || [] })
    };
    
    // Try to update in Supabase first
    await updateOutfitInSupabase(id, updateData);
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
    
    const response = await fetch(`${API_URL}/capsules/${id}`, options);
    if (!response.ok) {
      throw new Error(`Failed to delete capsule: ${response.statusText}`);
    }
  }
};
