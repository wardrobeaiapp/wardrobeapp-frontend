import { supabase } from '../core/supabase';
import { updateUserMetadata } from './userProfile';
import type { ProfileData, StyleProfileData, BudgetData } from '../../types/auth.types';

// Update user profile
export const updateProfile = async (profileData: ProfileData): Promise<any> => {
  try {
    // Get current user
    const { data: authData, error: authError } = await supabase.auth.getUser();
    
    if (authError || !authData.user) {
      throw new Error('User not authenticated');
    }
    
    // Update user profile
    const updatedProfile = await updateUserMetadata(authData.user.id, {
      ...profileData,
      profileCompleted: true
    });
    
    return updatedProfile;
  } catch (error: any) {
    console.error('Error updating profile:', error);
    throw new Error(error.message || 'Failed to update profile');
  }
};

// Update style profile
export const updateStyleProfile = async (styleProfile: StyleProfileData): Promise<any> => {
  try {
    // Get current user
    const { data: authData, error: authError } = await supabase.auth.getUser();
    
    if (authError || !authData.user) {
      throw new Error('User not authenticated');
    }
    
    // Skip updating user_profiles table since 'style_profile' column doesn't exist
    // and focus on saving to user_preferences table which is the source of truth
    
    // Save to user_preferences table
    try {
      // Debug logging for profile data being saved
      console.log('DEBUG - supabaseAuthService - updateStyleProfile - Before saving:', {
        localClimate: styleProfile.styleProfile.localClimate,
        styleProfileKeys: Object.keys(styleProfile.styleProfile),
        rawStyleProfile: JSON.stringify(styleProfile.styleProfile)
      });
      
      // Dynamically import to avoid circular dependencies
      const { saveUserPreferences } = await import('../profile/userPreferencesService');
      const result = await saveUserPreferences(styleProfile.styleProfile, authData.user.id);
      console.log('Successfully saved profile data to user_preferences table');
      return result;
    } catch (error) {
      const prefsError = error as Error;
      console.error('Error saving to user_preferences table:', prefsError);
      throw new Error('Failed to update style profile: ' + (prefsError.message || 'Database error'));
    }
  } catch (error: any) {
    console.error('Error updating style profile:', error);
    throw new Error(error.message || 'Failed to update style profile');
  }
};

// Update budget settings
export const updateBudget = async (budgetData: BudgetData): Promise<any> => {
  try {
    // Get current user
    const { data: authData, error: authError } = await supabase.auth.getUser();
    
    if (authError || !authData.user) {
      throw new Error('User not authenticated');
    }
    
    // Update user budget settings
    const updatedProfile = await updateUserMetadata(authData.user.id, {
      clothingBudget: budgetData.clothingBudget
    });
    
    return updatedProfile;
  } catch (error: any) {
    console.error('Error updating budget:', error);
    throw new Error(error.message || 'Failed to update budget');
  }
};
