import { supabase } from '../core/supabase';

/**
 * Collection of extracted authentication functions from supabase.ts
 * Moved here as part of the auth service reorganization
 */

// Basic sign up function
export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  
  if (error) throw error;
  return data;
};

// Sign in with email and password
export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) throw error;
  return data;
};

// Sign out the current user
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

// Get the current authenticated user
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
