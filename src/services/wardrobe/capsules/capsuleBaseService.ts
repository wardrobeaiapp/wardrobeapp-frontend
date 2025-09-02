/**
 * Base service for capsule operations
 * Contains shared utilities and constants used across capsule services
 */

import { supabase } from '../../core';

// API base URL - using relative path to leverage proxy configuration
export const API_URL = '/api';

// Table names for Supabase
export const CAPSULES_TABLE = 'capsules';
export const CAPSULE_ITEMS_TABLE = 'capsule_items';
export const CAPSULE_SCENARIOS_TABLE = 'capsule_scenarios';

// Cache for capsules data
export const cacheState = {
  capsulesCache: { data: null as any[] | null, timestamp: 0 },
  capsulesFetchInProgress: null as Promise<any[]> | null,
  lastQueryLogTime: 0
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
 * Helper function to safely get string or empty string
 */
export const getString = (value: string | null | undefined, defaultValue = ''): string => {
  return typeof value === 'string' ? value : defaultValue;
};

/**
 * Helper function to safely get array or empty array
 */
export const getArray = <T>(value: T[] | null | undefined): T[] => {
  return Array.isArray(value) ? value : [];
};

/**
 * Check if guest mode is enabled
 */
export const isGuestModeEnabled = (): boolean => {
  return Boolean(localStorage.getItem('guestMode'));
};

/**
 * Get current user from Supabase
 */
export const getCurrentUser = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user;
};
