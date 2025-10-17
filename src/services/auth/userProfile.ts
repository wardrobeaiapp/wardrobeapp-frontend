import { supabase } from '../core/supabase';
import { camelToSnakeCase, debugLog } from './utils/authUtils';

// Helper function to store user metadata in Supabase
export const updateUserMetadata = async (userId: string, metadata: any): Promise<any> => {
  try {
    // Convert camelCase properties to snake_case for Supabase
    const snakeCaseMetadata = camelToSnakeCase(metadata);
    
    // Remove preferences field if it exists since the column has been dropped
    if (snakeCaseMetadata.preferences) {
      console.log('WARNING: Attempted to save to removed preferences column. This field will be ignored.');
      delete snakeCaseMetadata.preferences;
    }
    
    // 🎯 Enhanced duplicate prevention - check by both user_uuid AND email
    // First, check if a profile already exists for this user by user_uuid
    const { data: existingProfile, error: fetchError } = await supabase
      .from('user_profiles')
      .select('id, email, user_uuid')
      .eq('user_uuid', userId)
      .order('id', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (fetchError) {
      console.error('Error checking existing user profile by user_uuid:', fetchError);
      throw fetchError;
    }
    
    // Also check for existing profile by email to prevent email duplicates
    if (snakeCaseMetadata.email && !existingProfile) {
      const { data: emailProfile, error: emailError } = await supabase
        .from('user_profiles')
        .select('id, email, user_uuid')
        .eq('email', snakeCaseMetadata.email)
        .order('id', { ascending: false })
        .limit(1)
        .maybeSingle();
        
      if (emailError) {
        console.warn('Error checking existing user profile by email:', emailError);
        // Don't throw here, continue with user_uuid check
      } else if (emailProfile) {
        console.log(`📧 Found existing profile with same email for different user. Email: ${snakeCaseMetadata.email}, Existing user_uuid: ${emailProfile.user_uuid}, Current user_uuid: ${userId}`);
        
        // If email belongs to different user, this might be a duplicate account situation
        if (emailProfile.user_uuid !== userId) {
          console.warn(`⚠️ Potential duplicate account detected - email ${snakeCaseMetadata.email} already exists for user ${emailProfile.user_uuid}`);
          // Still allow the creation but log it for investigation
        }
      }
    }
    
    let data, error;
    
    if (existingProfile) {
      // Update existing record by ID to preserve position and prevent duplicates
      console.log(`👤 updateUserMetadata - Updating existing profile ID ${existingProfile.id} for user ${userId}`);
      const updateResult = await supabase
        .from('user_profiles')
        .update({
          ...snakeCaseMetadata,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingProfile.id as number)
        .select()
        .single();
      
      data = updateResult.data;
      error = updateResult.error;
    } else {
      // Insert new record only if none exists
      console.log(`👤 updateUserMetadata - Creating new profile for user ${userId}`);
      const insertResult = await supabase
        .from('user_profiles')
        .insert({
          user_uuid: userId,
          ...snakeCaseMetadata,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      data = insertResult.data;
      error = insertResult.error;
    }
      
    if (error) {
      // Always log errors even in non-debug mode
      console.error('Error updating user metadata:', error);
      throw error;
    }
    
    debugLog('User metadata updated successfully', data);
    return data;
  } catch (error) {
    // Always log errors even in non-debug mode
    console.error('Error updating user metadata:', error);
    throw error;
  }
};

// Helper function to get user metadata from Supabase
export const getUserProfileByUserId = async (userId: string) => {
  try {
    debugLog('Getting user profile for user ID:', userId);
    
    // Import the workaround helper
    const { getUserProfileByUuid, getUserProfileById } = await import('../profile/userProfilesWorkaround');
    
    // Try with user_uuid field first (newer approach)
    const { data: uuidData, error: uuidError } = await getUserProfileByUuid(userId);
      
    if (!uuidError && uuidData) {
      debugLog('Found user profile by UUID');
      return uuidData;
    }
    
    // Fall back to legacy id field if needed
    const { data: idData, error: idError } = await getUserProfileById(userId);
    
    if (!idError && idData) {
      debugLog('Found user profile by ID');
      return idData;
    }
    
    if (uuidError) {
      // Only log in debug mode unless it's the final error
      if (!idError) {
        console.error('Error getting user profile by UUID:', uuidError);
      } else {
        debugLog('Error getting user profile by UUID:', uuidError);
      }
    }
    
    if (idError) {
      console.error('Error getting user profile by ID:', idError);
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};
