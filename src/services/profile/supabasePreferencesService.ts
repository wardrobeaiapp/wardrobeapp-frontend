import { supabase } from '../core';
import { PostgrestError } from '@supabase/supabase-js';

/**
 * Service for interacting with the user_preferences table in Supabase
 * Handles low-level database operations for user preferences
 */

/**
 * Fetches user preferences from the database
 * @param userId The user ID to fetch preferences for
 * @returns Object containing the data or error
 */
export const fetchUserPreferences = async (userId: string) => {
  try {
    // Log the request for debugging
    console.log('DEBUG - supabasePreferencesService - Fetching preferences for user:', userId);
    
    if (!userId) {
      throw new Error('Missing userId');
    }
    
    // Fetch user preferences from Supabase
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching user preferences:', error);
      return { data: null, error };
    }
    
    // Log successful fetch
    console.log('DEBUG - supabasePreferencesService - Successfully fetched preferences:', data?.id || 'no data');
    
    return { data, error: null };
  } catch (error) {
    console.error('Error in fetchUserPreferences:', error);
    return { data: null, error: error as PostgrestError };
  }
};

/**
 * Creates a new user preferences record
 * @param userId The user ID to create preferences for
 * @param data The data to create
 * @returns Object containing the data or error
 */
export const createUserPreferences = async (userId: string, data: any) => {
  try {
    // Log the request for debugging
    console.log('DEBUG - supabasePreferencesService - Creating preferences for user:', userId);
    
    if (!userId) {
      throw new Error('Missing userId');
    }
    
    // Add user_id to the data
    const dataWithUserId = {
      ...data,
      user_id: userId,
    };
    
    // Create user preferences in Supabase
    const { data: createdData, error } = await supabase
      .from('user_preferences')
      .insert([dataWithUserId])
      .select();
    
    if (error) {
      console.error('Error creating user preferences:', error);
      return { data: null, error };
    }
    
    // Log successful create
    console.log('DEBUG - supabasePreferencesService - Successfully created preferences:', createdData?.[0]?.id || 'no data');
    
    return { data: createdData?.[0] || null, error: null };
  } catch (error) {
    console.error('Error in createUserPreferences:', error);
    return { data: null, error: error as PostgrestError };
  }
};

/**
 * Updates an existing user preferences record
 * @param userId The user ID to update preferences for
 * @param data The data to update
 * @returns Object containing the data or error
 */
export const updateUserPreferences = async (userId: string, data: any) => {
  try {
    // Log the request for debugging
    console.log('DEBUG - supabasePreferencesService - Updating preferences for user:', userId);
    
    if (!userId) {
      throw new Error('Missing userId');
    }
    
    // Update user preferences in Supabase
    const { data: updatedData, error } = await supabase
      .from('user_preferences')
      .update(data)
      .eq('user_id', userId)
      .select();
    
    if (error) {
      console.error('Error updating user preferences:', error);
      return { data: null, error };
    }
    
    // Log successful update
    console.log('DEBUG - supabasePreferencesService - Successfully updated preferences:', updatedData?.[0]?.id || 'no data');
    
    return { data: updatedData?.[0] || null, error: null };
  } catch (error) {
    console.error('Error in updateUserPreferences:', error);
    return { data: null, error: error as PostgrestError };
  }
};

/**
 * Creates or updates user preferences (upsert operation)
 * @param userId The user ID to upsert preferences for
 * @param data The data to upsert
 * @returns Object containing the data or error
 */
export const upsertUserPreferences = async (userId: string, data: any) => {
  try {
    // Log the request for debugging
    console.log('DEBUG - supabasePreferencesService - Upserting preferences for user:', userId);
    
    if (!userId) {
      throw new Error('Missing userId');
    }
    
    // Check if a record already exists
    const { data: existingData } = await fetchUserPreferences(userId);
    
    if (existingData) {
      // Update existing record
      return await updateUserPreferences(userId, data);
    } else {
      // Create new record
      return await createUserPreferences(userId, data);
    }
  } catch (error) {
    console.error('Error in upsertUserPreferences:', error);
    return { data: null, error: error as PostgrestError };
  }
};

/**
 * Deletes a user preferences record
 * @param userId The user ID to delete preferences for
 * @returns Object containing success status or error
 */
export const deleteUserPreferences = async (userId: string) => {
  try {
    // Log the request for debugging
    console.log('DEBUG - supabasePreferencesService - Deleting preferences for user:', userId);
    
    if (!userId) {
      throw new Error('Missing userId');
    }
    
    // Delete user preferences from Supabase
    const { error } = await supabase
      .from('user_preferences')
      .delete()
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error deleting user preferences:', error);
      return { success: false, error };
    }
    
    // Log successful delete
    console.log('DEBUG - supabasePreferencesService - Successfully deleted preferences for user:', userId);
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error in deleteUserPreferences:', error);
    return { success: false, error: error as PostgrestError };
  }
};
