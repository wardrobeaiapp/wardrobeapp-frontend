import { supabase } from '../../services/core';

/**
 * Get authentication headers for API requests
 * @returns {Promise<any>} Headers object with authentication token
 */
export const getAuthHeaders = async () => {
  const headers: any = {
    'Content-Type': 'application/json'
  };

  try {
    // Use shared Supabase client to prevent multiple GoTrueClient instances
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData?.session?.access_token) {
      headers['x-auth-token'] = sessionData.session.access_token;
      console.log('🔑 Using Supabase session token for AI analysis');
      return headers;
    }
  } catch (error) {
    console.warn('🔑 Supabase session not available, falling back to localStorage token');
  }
  
  // Fallback to localStorage token
  const token = localStorage.getItem('token');
  if (token) {
    headers['x-auth-token'] = token;
    console.log('🔑 Using localStorage token for AI analysis');
  } else {
    console.warn('🔑 No authentication token available for AI analysis');
  }
  
  return headers;
};
