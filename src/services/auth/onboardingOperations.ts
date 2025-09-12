import { supabase } from '../core/supabase';
import { updateUserMetadata } from './userProfile';
import { saveClothingBudgetData, saveShoppingLimitData } from '../profile/userBudgetsService';
import type { OnboardingData } from '../../types/auth.types';

// Complete onboarding
export const completeOnboarding = async (data: OnboardingData): Promise<any> => {
  console.log('DEBUG - completeOnboarding - ENTRY POINT with data:', JSON.stringify(data, null, 2));
  
  // Validate input data
  if (!data) {
    console.error('ERROR - completeOnboarding - Missing data');
    throw new Error('Missing onboarding data');
  }
  
  // Ensure preferences object exists
  if (!data.preferences) {
    console.error('ERROR - completeOnboarding - Missing preferences');
    // Initialize with required properties to satisfy TypeScript
    data.preferences = {
      preferredStyles: [],
      dailyActivities: [],
      leisureActivities: []
    };
  }
  
  // Handle the case where preferences might be nested inside preferences
  // This happens when AuthContext or SupabaseAuthContext calls completeOnboarding({ preferences })
  if (data.preferences && typeof data.preferences === 'object') {
    if ((data.preferences as any).preferences) {
      console.log('DEBUG - completeOnboarding - Found nested preferences structure');
      
      // Create a new data object with the nested preferences flattened
      const flattenedData = {
        ...data,
        // Extract workStyle from the nested preferences if it exists there
        workStyle: data.workStyle || (data.preferences as any).workStyle,
        // Extract clothingBudget from the nested preferences if it exists there
        clothingBudget: data.clothingBudget || (data.preferences as any).clothingBudget,
        // Replace the preferences with the nested ones
        preferences: (data.preferences as any).preferences
      };
      
      // Use the flattened data for the rest of the function
      data = flattenedData as OnboardingData;
      console.log('DEBUG - completeOnboarding - Flattened data structure:', JSON.stringify(data, null, 2));
    }
  }
  try {
    // Log the entire data object to see its structure
    console.log('DEBUG - COMPLETE DATA OBJECT:', JSON.stringify(data, null, 2));
    console.log('DEBUG - DATA Office Dress Code:', data);
    // Access the raw data directly to ensure we're getting the correct values
    let officeDressCodeValue = '';
    
    // Check if workStyle exists and has officeDressCode (new structure)
    if (data.workStyle && typeof data.workStyle === 'object' && 'officeDressCode' in data.workStyle) {
      officeDressCodeValue = data.workStyle.officeDressCode ?? '';
      console.log('DEBUG - Found officeDressCode in workStyle:', officeDressCodeValue);
    }
    
    // If not found in workStyle, check preferences (for backward compatibility)
    if (!officeDressCodeValue && data.preferences && typeof data.preferences === 'object' && 'officeDressCode' in data.preferences) {
      // Use type assertion to handle the dynamic property access
      officeDressCodeValue = (data.preferences as any).officeDressCode?.toString() ?? '';
      console.log('DEBUG - Found officeDressCode in preferences:', officeDressCodeValue);
    }
    
    console.log('DEBUG - Final officeDressCodeValue:', officeDressCodeValue);
    
    // If still not found but office is in dailyActivities, use default
    if (!officeDressCodeValue && 
        data.preferences?.dailyActivities && 
        Array.isArray(data.preferences.dailyActivities) && 
        data.preferences.dailyActivities.includes('office')) {
      officeDressCodeValue = 'business-casual';
      console.log('DEBUG - Using default officeDressCode:', officeDressCodeValue);
    }
    
    console.log('DEBUG - Final officeDressCode value to be used:', officeDressCodeValue);
    
    // Get current user
    const { data: authData, error: authError } = await supabase.auth.getUser();
    
    if (authError || !authData.user) {
      console.error('User not authenticated during onboarding completion');
      throw new Error('User not authenticated');
    }
    
    console.log(`Updating profile for user ${authData.user.id} with onboarding data`);
    
    // Update user profile with onboarding data in user_profiles table
    // Extract daily activities from preferences for logging
    const dailyActivities = data.preferences?.dailyActivities || [];
    console.log('DEBUG - dailyActivities to save:', dailyActivities);
    
    // We no longer need to create a consolidated preferences object since the preferences column has been removed
    // The individual components (scenarios, preferences) are saved to their respective tables
    
    // No longer save to preferences column as it's been removed
    // Just mark onboarding as completed
    const updatedProfile = await updateUserMetadata(authData.user.id, {
      onboardingCompleted: true
    });
    
    // Also save to user_preferences table
    try {
      console.log('DEBUG - completeOnboarding - BEFORE saving to user_preferences');
      console.log('DEBUG - completeOnboarding - data structure:', JSON.stringify(data, null, 2));
      
      // Dynamically import to avoid circular dependencies
      const { saveUserPreferences } = await import('../profile/userPreferencesService');
      
      // Start with all existing preferences
      const { outdoorFrequency, socialFrequency, formalEventsFrequency, ...otherPrefs } = data.preferences || {};
      
      console.log('DEBUG - completeOnboarding - extracted preferences:', JSON.stringify({ outdoorFrequency, socialFrequency, formalEventsFrequency, otherPrefs }, null, 2));
      
      // Ensure all required fields in ProfileData are provided with default values
      const profileData = {
        // Include other fields from preferences (except those we'll handle specially)
        ...otherPrefs,
        
        // Required fields with default empty arrays if undefined - these will override any properties from otherPrefs
        dailyActivities: Array.isArray(data.preferences.dailyActivities) ? data.preferences.dailyActivities : [],
        preferredStyles: Array.isArray(data.preferences.preferredStyles) ? data.preferences.preferredStyles : [],
        localClimate: typeof data.preferences.localClimate === 'string' ? data.preferences.localClimate : '',
        leisureActivities: Array.isArray(data.preferences.leisureActivities) ? data.preferences.leisureActivities : [],
        wardrobeGoals: Array.isArray(data.preferences.wardrobeGoals) ? data.preferences.wardrobeGoals : [],
        // Explicitly include homeActivities with type assertion to handle TypeScript errors
        homeActivities: Array.isArray((data.preferences as any).homeActivities) ? (data.preferences as any).homeActivities : [],
        
        // Include otherActivityDescription for daily activities
        otherActivityDescription: typeof (data.preferences as any).otherActivityDescription === 'string' ? (data.preferences as any).otherActivityDescription : '',
        
        // Add workStyle data
        ...(data.workStyle || {}),
        
        // Add clothing budget data - handle both nested and flattened structure
        clothingBudgetAmount: data.clothingBudgetAmount || data.clothingBudget?.amount || null,
        clothingBudgetCurrency: data.clothingBudgetCurrency || data.clothingBudget?.currency || null,
        clothingBudgetFrequency: data.clothingBudgetFrequency || data.clothingBudget?.frequency || null,
        
        // Add shopping limit data from preferences
        shoppingLimit: data.preferences?.shoppingLimit || null
      };
      
      // Remove budget data from profileData before saving to user_preferences
      const { shoppingLimit, clothingBudgetAmount, clothingBudgetCurrency, clothingBudgetFrequency, ...preferencesOnlyData } = profileData;
      
      try {
        // Extract clothing budget data
        const clothingBudgetData = {
          amount: data.clothingBudgetAmount || data.clothingBudget?.amount || 0,
          currency: data.clothingBudgetCurrency || data.clothingBudget?.currency || 'USD', 
          frequency: data.clothingBudgetFrequency || data.clothingBudget?.frequency || 'monthly',
          currentSpent: 0,
          periodStartDate: undefined,
          periodEndDate: undefined
        };

        // Extract shopping limit data
        const shoppingLimitData = profileData.shoppingLimit ? {
          shoppingLimitAmount: profileData.shoppingLimit.limitAmount || 0,
          // Cast frequency to the correct type to satisfy TypeScript
          shoppingLimitFrequency: (profileData.shoppingLimit.limitFrequency || 'monthly') as 'monthly' | 'quarterly' | 'yearly',
          shoppingLimitUsed: 0, // Initialize as 0 for new users
          periodStartDate: undefined,
          periodEndDate: undefined
        } : null;

        console.log('DEBUG - completeOnboarding - Budget data extracted:', {
          clothingBudget: clothingBudgetData,
          shoppingLimit: shoppingLimitData
        });

        // Save clothing budget to user_progress table (if amount > 0)
        if (clothingBudgetData.amount > 0) {
          console.log('DEBUG - completeOnboarding - Saving clothing budget to user_progress');
          await saveClothingBudgetData(authData.user.id, clothingBudgetData);
          console.log('DEBUG - completeOnboarding - Clothing budget saved successfully');
        }

        // Save shopping limit to user_progress table (if exists)
        if (shoppingLimitData && shoppingLimitData.shoppingLimitAmount > 0) {
          console.log('DEBUG - completeOnboarding - Saving shopping limit to user_progress');
          await saveShoppingLimitData(authData.user.id, shoppingLimitData);
          console.log('DEBUG - completeOnboarding - Shopping limit saved successfully');
        }

        // Activate impulse buy tracker after onboarding completion
        console.log('DEBUG - completeOnboarding - Activating impulse buy tracker');
        try {
          const { activateImpulseBuyTracker } = await import('../profile/impulseBuyTrackerService');
          await activateImpulseBuyTracker(authData.user.id);
          console.log('DEBUG - completeOnboarding - Impulse buy tracker activated successfully');
        } catch (trackerError) {
          console.error('ERROR - completeOnboarding - Failed to activate impulse buy tracker:', trackerError);
          // Continue with onboarding even if tracker activation fails
        }

        console.log('DEBUG - completeOnboarding - BEFORE calling saveUserPreferences with preferencesOnlyData (budget data removed):', JSON.stringify(preferencesOnlyData, null, 2));
        
      } catch (budgetSaveError) {
        console.error('ERROR - completeOnboarding - Failed to save budget data to user_progress:', budgetSaveError);
        // Continue with regular preferences save even if budget save fails
      }
      
      try {
        // Call saveUserPreferences with preferences data only (budget data removed)
        const result = await saveUserPreferences(preferencesOnlyData || profileData, authData.user.id);
        
        console.log('DEBUG - completeOnboarding - AFTER calling saveUserPreferences, result:', result);
        console.log('Successfully synced onboarding data to user_preferences table');
        return updatedProfile;
      } catch (saveError) {
        console.error('ERROR - completeOnboarding - Failed to save user preferences:', saveError);
        // Still return the updated profile even if saving preferences failed
        // This ensures onboarding is marked as complete in the user metadata
        return updatedProfile;
      }
    } catch (prefsError) {
      console.error('Error syncing onboarding data to user_preferences table:', prefsError);
      // Continue even if user_preferences sync fails
    }
    
    console.log('Onboarding completed successfully. Updated profile:', updatedProfile);
    
    return updatedProfile;
  } catch (error: any) {
    console.error('Error completing onboarding:', error);
    throw new Error(error.message || 'Failed to complete onboarding');
  }
};
