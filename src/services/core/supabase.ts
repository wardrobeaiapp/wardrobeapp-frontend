import { createClient } from '@supabase/supabase-js';
import { WardrobeItem, Outfit, Capsule } from '../../types';

// Supabase configuration
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://gujpqecwdftbwkcnwiup.supabase.co';
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1anBxZWN3ZGZ0YndrY253aXVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MTU0NDksImV4cCI6MjA2ODA5MTQ0OX0.1_ViFuaH4PAiTk_QkSm7S9srp1rQa_Zv7D2a8pJx5So';

// For debugging auth issues
console.log('🔑 Supabase configuration:', { 
  urlDefined: !!process.env.REACT_APP_SUPABASE_URL,
  keyDefined: !!process.env.REACT_APP_SUPABASE_ANON_KEY
});

// Create Supabase client as a singleton to prevent multiple GoTrueClient instances
let supabaseInstance: ReturnType<typeof createClient> | null = null;

export const getSupabase = () => {
  if (!supabaseInstance) {
    // Removed logging for performance
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

// Type definitions for Supabase tables
export type Tables = {
  wardrobe_items: WardrobeItem;
  outfits: Outfit;
  capsules: Capsule;
  users: {
    id: string;
    email: string;
    created_at: string;
  };
};

// Authentication functions
export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  
  if (error) throw error;
  return data;
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user;
};

// Helper function to handle Supabase errors gracefully
export const handleSupabaseError = (error: any) => {
  console.error('Supabase error:', error);
  // You can add additional error handling logic here
  return null;
};
