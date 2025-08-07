import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
// Temporarily hardcoding values to test if environment variables are the issue
const supabaseUrl = 'https://gujpqecwdftbwkcnwiup.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1anBxZWN3ZGZ0YndrY253aXVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MTU0NDksImV4cCI6MjA2ODA5MTQ0OX0.1_ViFuaH4PAiTk_QkSm7S9srp1rQa_Zv7D2a8pJx5So';

// For production, use environment variables instead:
// const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
// const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

// Create Supabase client as a singleton to prevent multiple GoTrueClient instances
let supabaseInstance: ReturnType<typeof createClient> | null = null;

export const getSupabase = () => {
  if (!supabaseInstance) {
    console.log('Creating new Supabase client instance from supabaseClient.ts');
    // Configure with persistent storage options to maintain session across page reloads
    supabaseInstance = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        storage: localStorage,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
  }
  return supabaseInstance;
};

// For backward compatibility with existing code
export const supabase = getSupabase();
