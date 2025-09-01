// Import from the consolidated client to prevent multiple instances
import { supabase } from '../supabaseClientMigration';

/**
 * Workaround functions for user_profiles table to avoid 406 errors
 * These functions use a different approach to query the user_profiles table
 */

/**
 * Get user profile by user UUID using a workaround to avoid 406 errors
 * This function uses a more efficient approach with filter
 */
export const getUserProfileByUuid = async (userUuid: string) => {
  try {
    // Use a direct query with eq filter but don't use maybeSingle
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_uuid', userUuid);
      
    if (error) {
      console.error('[userProfilesWorkaround] Error fetching profile by UUID:', error);
      return { data: null, error };
    }
    
    // Find the first matching profile if there are multiple results
    const matchingProfile = data && data.length > 0 ? data[0] : null;
    
    // Return the profile if found
    return { 
      data: matchingProfile, 
      error: null // Don't return an error for missing profiles
    };
  } catch (error: any) {
    console.error('[userProfilesWorkaround] Exception:', error);
    return { data: null, error };
  }
};

/**
 * Get user profile by ID using a workaround to avoid 406 errors
 * This function uses a more efficient approach with filter
 */
export const getUserProfileById = async (id: string) => {
  try {
    // Use a direct query with eq filter but don't use maybeSingle
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', id);
      
    if (error) {
      console.error('[userProfilesWorkaround] Error fetching profile by ID:', error);
      return { data: null, error };
    }
    
    // Find the first matching profile if there are multiple results
    const matchingProfile = data && data.length > 0 ? data[0] : null;
    
    // Return the profile if found
    return { 
      data: matchingProfile, 
      error: null // Don't return an error for missing profiles
    };
  } catch (error: any) {
    console.error('[userProfilesWorkaround] Exception:', error);
    return { data: null, error };
  }
};

/**
 * Update user profile using a workaround to avoid 406 errors
 */
export const updateUserProfile = async (userUuid: string, updates: any) => {
  try {
    // First get the profile to make sure it exists
    const { data: existingProfile } = await getUserProfileByUuid(userUuid);
    
    if (!existingProfile) {
      return { 
        data: null, 
        error: new Error('Profile not found for update') 
      };
    }
    
    // Then update it
    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('user_uuid', userUuid)
      .select();
      
    return { data: data?.[0] || null, error };
  } catch (error: any) {
    console.error('[userProfilesWorkaround] Exception during update:', error);
    return { data: null, error };
  }
};
