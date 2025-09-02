/**
 * Base service for outfit-related operations
 * Contains common utilities, constants, and types used by other outfit services
 */

import { Outfit } from '../../../types';
import { supabase } from '../../../services/core';

// Table names for Supabase
export const OUTFITS_TABLE = 'outfits';
export const OUTFIT_ITEMS_TABLE = 'outfit_items';
export const OUTFIT_SCENARIOS_TABLE = 'outfit_scenarios';

// API base URL - using relative path to leverage proxy configuration
export const API_URL = '/api';

/**
 * Get auth headers for fetch requests
 */
export const getAuthHeaders = (): HeadersInit => {
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
 * Helper function to handle API requests with graceful error handling
 */
export const apiRequest = async <T>(url: string, options: RequestInit = {}): Promise<T> => {
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

/**
 * Convert Supabase response to Outfit object
 */
export const convertToOutfit = (data: any): Outfit => {
  return {
    id: String(data.id),
    name: String(data.name),
    items: [], // Initialize with empty array, to be populated later
    scenarios: [], // Initialize with empty array, to be populated later
    scenarioNames: Array.isArray(data.scenario_names) ? data.scenario_names : [],
    season: Array.isArray(data.season) ? data.season : [],
    favorite: Boolean(data.favorite),
    dateCreated: String(data.date_created),
    lastWorn: data.last_worn ? String(data.last_worn) : undefined
  };
};

/**
 * Convert multiple Supabase responses to Outfit objects
 */
export const convertToOutfits = (data: any[]): Outfit[] => {
  return data.map(convertToOutfit);
};

/**
 * Handle errors in a consistent way
 */
export const handleError = (operation: string, error: any): never => {
  // Log the error
  console.error(`[outfitService] Error ${operation}:`, error);
  
  // Throw a formatted error
  throw error;
};

/**
 * Get current authenticated user ID
 */
export const getCurrentUserId = async (): Promise<string> => {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  
  if (authError || !authData.user) {
    throw new Error('User not authenticated');
  }
  
  return authData.user.id;
};
