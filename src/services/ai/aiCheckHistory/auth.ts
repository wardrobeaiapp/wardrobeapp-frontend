import { supabase } from '../../core/supabase';

export async function getAuthHeaders(): Promise<HeadersInit> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  };

  try {
    const { data: sessionData } = await supabase.auth.getSession();

    if (sessionData?.session?.access_token) {
      headers['x-auth-token'] = sessionData.session.access_token;
      console.log('🔑 Using Supabase session token for ai-check-history');
      return headers;
    }
  } catch (error) {
    console.warn('🔑 Supabase session not available, falling back to localStorage token');
  }

  const token = localStorage.getItem('token');
  if (token) {
    headers['x-auth-token'] = token;
    console.log('🔑 Using localStorage token for ai-check-history');
  } else {
    console.warn('🔑 No authentication token available');
  }

  return headers;
}
