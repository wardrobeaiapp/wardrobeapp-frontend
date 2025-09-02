import { Capsule } from '../../../types';

// API base URL - using relative path to leverage proxy configuration
const API_URL = '/api';

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
 */
export const fetchCapsules = async (): Promise<Capsule[]> => {
  try {
    // Try to fetch from Supabase first
    const { fetchCapsules: fetchCapsulesFromSupabase } = await import('../../supabaseApi');
    const capsules = await fetchCapsulesFromSupabase();
    return capsules;
  } catch (error) {
    console.error('[capsuleService] Error fetching capsules from Supabase:', error);
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

/**
 * Create a new capsule
 */
export const createCapsule = async (capsule: Omit<Capsule, 'id' | 'dateCreated'>): Promise<Capsule> => {
  try {
    // Use Supabase for capsule creation
    const { createCapsule: createCapsuleInSupabase } = await import('../../supabaseApi');
    return await createCapsuleInSupabase(capsule);
  } catch (error) {
    console.error('[capsuleService] Error creating capsule in Supabase:', error);
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

/**
 * Update an existing capsule
 */
export const updateCapsule = async (id: string, capsule: Partial<Capsule>): Promise<Capsule | null> => {
  try {
    // Use Supabase for capsule updates
    const { updateCapsule: updateCapsuleInSupabase } = await import('../../supabaseApi');
    return await updateCapsuleInSupabase(id, capsule);
  } catch (error) {
    console.error('[capsuleService] Error updating capsule in Supabase:', error);
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

/**
 * Delete a capsule
 */
export const deleteCapsule = async (id: string): Promise<void> => {
  try {
    // Use Supabase for capsule deletion
    const { deleteCapsule: deleteCapsuleInSupabase } = await import('../../supabaseApi');
    await deleteCapsuleInSupabase(id);
  } catch (error) {
    console.error('[capsuleService] Error deleting capsule from Supabase:', error);
    // Fallback to legacy API
    const headers = getAuthHeaders();
    const options = {
      method: 'DELETE',
      headers
    };
    
    await apiRequest(`${API_URL}/capsules/${id}`, options);
  }
};
