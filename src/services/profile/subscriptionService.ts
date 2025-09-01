import { supabase } from '../core';
import { ProfileData } from '../../types';
import { SaveResult } from '../../components/features/profile/types/StyleProfileTypes';

/**
 * Service for managing user subscription data in the user_profiles table
 */

/**
 * Saves subscription data directly to the user_profiles table
 * @param profileData Profile data containing subscription information
 * @param userId User ID
 * @returns Promise with save result
 */
export const saveSubscriptionToUserProfile = async (profileData: ProfileData, userId: string): Promise<SaveResult> => {
  console.log('DEBUG - subscriptionService - saveSubscriptionToUserProfile - ENTRY POINT with userId:', userId);
  
  // Validate userId
  if (!userId) {
    console.error('ERROR - subscriptionService - saveSubscriptionToUserProfile - Missing userId');
    throw new Error('Missing userId');
  }
  
  // Validate profileData
  if (!profileData) {
    console.error('ERROR - subscriptionService - saveSubscriptionToUserProfile - Missing profileData');
    throw new Error('Missing profileData');
  }
  
  try {
    // Extract subscription data from profileData
    const subscriptionPlan = profileData.subscriptionPlan || 'free';
    const subscriptionRenewalDate = profileData.subscriptionRenewalDate || null;
    
    console.log('DEBUG - subscriptionService - saveSubscriptionToUserProfile - Saving subscription data:', {
      subscriptionPlan,
      subscriptionRenewalDate
    });
    
    // Update the user_profiles table
    // First try with user_uuid field
    console.log('DEBUG - subscriptionService - saveSubscriptionToUserProfile - Attempting to update with user_uuid:', userId);
    let result = await supabase
      .from('user_profiles')
      .update({
        subscription_plan: subscriptionPlan,
        subscription_renewal_date: subscriptionRenewalDate
      })
      .eq('user_uuid', userId);
    
    // If there's an error or no rows affected, try with id field
    if (result.error || result.count === 0) {
      console.log('DEBUG - subscriptionService - saveSubscriptionToUserProfile - Falling back to id field:', userId);
      result = await supabase
        .from('user_profiles')
        .update({
          subscription_plan: subscriptionPlan,
          subscription_renewal_date: subscriptionRenewalDate
        })
        .eq('id', userId);
    }
    
    const { error } = result;
    
    if (error) {
      console.error('Error saving subscription data to user_profiles:', error);
      return { success: false, error };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error in saveSubscriptionToUserProfile:', error);
    return { success: false, error };
  }
};

/**
 * Fetches subscription data for a user from the user_profiles table
 * @param userId User ID
 * @returns Object containing subscription data or error
 */
export const fetchUserSubscription = async (userId: string) => {
  console.log('DEBUG - subscriptionService - fetchUserSubscription - ENTRY POINT with userId:', userId);
  
  if (!userId) {
    console.error('ERROR - subscriptionService - fetchUserSubscription - Missing userId');
    throw new Error('Missing userId');
  }
  
  try {
    // First try with user_uuid field
    let { data, error } = await supabase
      .from('user_profiles')
      .select('subscription_plan, subscription_renewal_date')
      .eq('user_uuid', userId)
      .maybeSingle();
    
    // If there's an error or no data, try with id field
    if (error || !data) {
      console.log('DEBUG - subscriptionService - fetchUserSubscription - Falling back to id field:', userId);
      const result = await supabase
        .from('user_profiles')
        .select('subscription_plan, subscription_renewal_date')
        .eq('id', userId)
        .maybeSingle();
      
      data = result.data;
      error = result.error;
    }
    
    if (error) {
      console.error('Error fetching subscription data from user_profiles:', error);
      return { data: null, error };
    }
    
    console.log('DEBUG - subscriptionService - fetchUserSubscription - Successfully fetched subscription data:', data);
    
    return { 
      data: {
        subscriptionPlan: data?.subscription_plan || 'free',
        subscriptionRenewalDate: data?.subscription_renewal_date || null
      }, 
      error: null 
    };
  } catch (error) {
    console.error('Error in fetchUserSubscription:', error);
    return { data: null, error };
  }
};
