import { supabase } from './supabaseClient';
import { ProfileData } from '../types';
import { SaveResult } from '../components/profile/context/StyleProfileContext';

/**
 * Service for managing user preferences in the dedicated user_preferences table
 */

/**
 * Maps ProfileData to the user_preferences table structure
 */
const mapProfileDataToUserPreferences = (profileData: ProfileData, userId: string) => {
  
  // Extract nested objects
  const { 
    stylePreferences, 
    outdoorFrequency, 
    socialFrequency, 
    formalEventsFrequency
    // 🎯 BUDGET FIELDS REMOVED - shoppingLimit and clothingBudget now handled by unified budget service
  } = profileData;

  // Get the officeDressCode value, ensuring it's a valid string
  // If the user selected 'office' but didn't select a dress code, set a default value
  let officeDressCode = '';
  
  // IMPORTANT: Log the incoming value to debug
  
  // Always prioritize the user's explicit selection if it exists
  if (typeof profileData.officeDressCode === 'string' && profileData.officeDressCode) {
    // Use the provided value if it exists
    officeDressCode = profileData.officeDressCode;
  } else if (Array.isArray(profileData.dailyActivities) && profileData.dailyActivities.includes('office')) {
    // Only set default if 'office' is selected but no dress code was explicitly set
    officeDressCode = 'business-casual';
  }

  // Return mapped data in snake_case format for the database
  // Process leisure activities to include 'other' if needed
  let leisureActivities = Array.isArray(profileData.leisureActivities) ? [...profileData.leisureActivities] : [];
  
  // If 'other' is selected and there's an otherLeisureActivity value, replace 'other' with the custom text
  if (leisureActivities.includes('other') && profileData.otherLeisureActivity) {
    // Replace 'other' with the custom text value
    const otherIndex = leisureActivities.indexOf('other');
    
    if (otherIndex !== -1) {
      leisureActivities[otherIndex] = typeof profileData.otherLeisureActivity === 'string' 
        ? profileData.otherLeisureActivity 
        : profileData.otherLeisureActivity.text;
    }
  }
  
  // Process wardrobe goals to include 'other' if needed
  console.log('DEBUG - userPreferencesService - Processing wardrobe goals - Input:', {
    wardrobeGoals: profileData.wardrobeGoals,
    isArray: Array.isArray(profileData.wardrobeGoals),
    type: typeof profileData.wardrobeGoals,
    length: profileData.wardrobeGoals?.length || 0,
    otherWardrobeGoal: profileData.otherWardrobeGoal
  });
  
  let wardrobeGoals = Array.isArray(profileData.wardrobeGoals) ? [...profileData.wardrobeGoals] : [];
  
  // Use a Set to ensure uniqueness
  const uniqueGoalsSet = new Set(wardrobeGoals);
  
  // Convert back to array
  wardrobeGoals = Array.from(uniqueGoalsSet);
  
  console.log('DEBUG - userPreferencesService - After deduplication:', {
    wardrobeGoals,
    length: wardrobeGoals.length
  });
  
  // Only add the custom goal if 'other' is selected and there's an otherWardrobeGoal value
  if (wardrobeGoals.includes('other') && profileData.otherWardrobeGoal && profileData.otherWardrobeGoal.trim()) {
    // Replace 'other' with the custom text value
    const otherIndex = wardrobeGoals.indexOf('other');
    if (otherIndex !== -1) {
      const customGoal = profileData.otherWardrobeGoal.trim();
      wardrobeGoals[otherIndex] = customGoal;
      console.log('DEBUG - userPreferencesService - Replaced "other" with custom goal:', customGoal);
    }
  } else {
    // If 'other' is not checked or there's no custom goal text, make sure we don't add any custom goals
    console.log('DEBUG - userPreferencesService - "Other" not selected or no custom goal text, keeping standard goals only');
  }
  
  // Final deduplication check
  wardrobeGoals = Array.from(new Set(wardrobeGoals));
  
  console.log('DEBUG - userPreferencesService - Final wardrobe goals after processing:', wardrobeGoals);
  


  // Process daily activities to include 'other' if needed
  let dailyActivities = Array.isArray(profileData.dailyActivities) ? [...profileData.dailyActivities] : [];
  
  // If 'other' is selected and there's an otherActivityDescription value, replace 'other' with the custom text
  if (dailyActivities.includes('other') && profileData.otherActivityDescription) {
    // Replace 'other' with the custom text value
    const otherIndex = dailyActivities.indexOf('other');
    // Removed excessive logging for performance
    
    if (otherIndex !== -1) {
      // Removed excessive logging for performance
      dailyActivities[otherIndex] = profileData.otherActivityDescription;
    }
  } else {
    // Removed excessive logging for performance
  }
  
  // Also handle any legacy 'other: text' entries
  dailyActivities = dailyActivities.map(activity => {
    if (activity.startsWith('other:')) {
      // Extract the text after 'other:' and return just that text
      return activity.substring(6).trim();
    }
    return activity;
  });
  
  // Removed excessive logging for performance

  // Create the mapped object with proper null handling for Supabase
  const mappedData = {
    user_id: userId,
    
    // Daily activities - use our processed array
    daily_activities: dailyActivities,
    // Temporarily comment out other_activity_description until DB schema is updated
    // other_activity_description: profileData.otherActivityDescription || null,
    
    // Use our processed officeDressCode variable which ensures we have a valid string
    // Supabase may require non-empty strings for text fields
    office_dress_code: officeDressCode || null,
    
    // Subscription information - removed from user_preferences (these are in user_profiles)
    // subscription_plan: profileData.subscriptionPlan || 'free', // Removed - not in user_preferences table
    // subscription_renewal_date: profileData.subscriptionRenewalDate || null, // Removed - not in user_preferences table
    
    // Add the leisure activities array
    leisure_activities: leisureActivities,
    
    // Add the wardrobe goals array
    wardrobe_goals: wardrobeGoals,
    
    // Log wardrobe goals being saved to DB
    ...(function() {
      console.log('DEBUG - userPreferencesService - Saving wardrobe_goals to DB:', {
        wardrobeGoals,
        length: wardrobeGoals.length,
        isArray: Array.isArray(wardrobeGoals),
        type: typeof wardrobeGoals
      });
      return {};
    })(),
    // Save the original other wardrobe goal text
    other_wardrobe_goal: profileData.otherWardrobeGoal || null,
    
    // Work-related fields - use null instead of empty strings for optional fields
    remote_work_priority: profileData.remoteWorkPriority || null,
    creative_mobility: profileData.creativeMobility || null,
    
    // Uniform preferences - use null instead of empty strings
    uniform_preference: (profileData as any).uniformPreference || null,
    student_uniform: (profileData as any).studentDressCode || null,
    // Temporarily commented out until database schema is updated
    // study_environment: profileData.studyEnvironment || null,
    
    // Style preferences - ensure numeric values are actual numbers, not strings
    preferred_styles: Array.isArray(profileData.preferredStyles) ? profileData.preferredStyles : [],
    comfort_vs_style: typeof stylePreferences?.comfortVsStyle === 'number' ? stylePreferences.comfortVsStyle : null,
    classic_vs_trendy: typeof stylePreferences?.classicVsTrendy === 'number' ? stylePreferences.classicVsTrendy : null,
    basics_vs_statements: typeof stylePreferences?.basicsVsStatements === 'number' ? stylePreferences.basicsVsStatements : null,
    style_additional_notes: stylePreferences?.additionalNotes || null,
    // Debug logging for style preferences
    ...(function() {
      console.log('DEBUG - userPreferencesService - Saving style preferences to DB:', {
        preferredStyles: profileData.preferredStyles,
        comfortVsStyle: stylePreferences?.comfortVsStyle,
        classicVsTrendy: stylePreferences?.classicVsTrendy,
        basicsVsStatements: stylePreferences?.basicsVsStatements,
        additionalNotes: stylePreferences?.additionalNotes,
        mappedComfortVsStyle: typeof stylePreferences?.comfortVsStyle === 'number' ? stylePreferences.comfortVsStyle : null,
        mappedClassicVsTrendy: typeof stylePreferences?.classicVsTrendy === 'number' ? stylePreferences.classicVsTrendy : null,
        mappedBasicsVsStatements: typeof stylePreferences?.basicsVsStatements === 'number' ? stylePreferences.basicsVsStatements : null,
        mappedAdditionalNotes: stylePreferences?.additionalNotes || null
      });
      return {};
    })(),
    
    // Climate preference
    local_climate: profileData.localClimate || null,
    // Log climate value for debugging
    ...(function() {
      console.log('DEBUG - userPreferencesService - Saving local_climate:', {
        localClimate: profileData.localClimate,
        mappedValue: profileData.localClimate || null,
        profileDataKeys: Object.keys(profileData),
        rawProfileData: JSON.stringify(profileData)
      });
      return {};
    })(),
    
    // Leisure activities already added above
    // REMOVED: other_leisure_activity field doesn't exist in schema
    // other_leisure_activity: profileData.otherLeisureActivity || null,
    
    // Frequency values - ensure numeric values are actual numbers
    outdoor_frequency_value: typeof outdoorFrequency?.frequency === 'number' ? outdoorFrequency.frequency : null,
    outdoor_frequency_period: outdoorFrequency?.period || null,
    // Debug logging for outdoor frequency period
    ...(function() {
      console.log('DEBUG - userPreferencesService - Saving outdoor frequency period:', {
        period: outdoorFrequency?.period,
        outdoorFrequency: outdoorFrequency
      });
      return {};
    })(),
    social_frequency_value: typeof socialFrequency?.frequency === 'number' ? socialFrequency.frequency : null,
    social_frequency_period: socialFrequency?.period || null,
    formal_events_frequency_value: typeof formalEventsFrequency?.frequency === 'number' ? formalEventsFrequency.frequency : null,
    formal_events_frequency_period: formalEventsFrequency?.period || null,
    travel_frequency: profileData.travelFrequency || null,
    
    // Wardrobe goals already added above
    
    // Shopping limits and budget - ensure numeric values are actual numbers
    // 🎯 BUDGET DATA REMOVED - shopping limit and clothing budget mapping removed
    // Budget fields are now handled exclusively by unified budget service (user_progress table)
    // No longer stored in user_preferences table
    
    // Debug logging removed for performance
    ...(function() {
      // Just return an empty object instead of logging
      return {};
    })(),
    
    
    // Home activities
    home_activities: Array.isArray((profileData as any).homeActivities) ? (profileData as any).homeActivities : [],
    
    // Update timestamp
    updated_at: new Date().toISOString()
  };
  
  // Log the final mapped data
  console.log('DEBUG - mapProfileDataToUserPreferences - Final mapped data:', JSON.stringify(mappedData, null, 2));
  // Temporarily comment out other_activity_description logging until DB schema is updated
  // console.log('DEBUG - mapProfileDataToUserPreferences - other_activity_description:', mappedData.other_activity_description);
  
  return mappedData;
};

/**
 * Profile section types for section-specific saving
 */
export type ProfileSection = 
  | 'all'               // Save all sections (default)
  | 'wardrobeGoals'     // Wardrobe goals section
  | 'stylePreferences'  // Style preferences section
  | 'dailyActivities'   // Daily activities section
  | 'leisureActivities' // Leisure activities section
  | 'climate'           // Climate section
  // 🎯 'shoppingLimit' REMOVED - now handled by unified budget service
  | 'subscription';     // Subscription section

/**
 * Saves user preferences to the user_preferences table
 * @param userId User ID
 * @param profileData Profile data to save
 * @param section Optional section to save (defaults to 'all')
 */
/**
 * Saves subscription data directly to the user_profiles table
 * @param profileData Profile data containing subscription information
 * @param userId User ID
 * @returns Promise with save result
 */
export const saveSubscriptionToUserProfile = async (profileData: ProfileData, userId: string): Promise<SaveResult> => {
  console.log('DEBUG - saveSubscriptionToUserProfile - ENTRY POINT with userId:', userId);
  
  // Validate userId
  if (!userId) {
    console.error('ERROR - saveSubscriptionToUserProfile - Missing userId');
    throw new Error('Missing userId');
  }
  
  // Validate profileData
  if (!profileData) {
    console.error('ERROR - saveSubscriptionToUserProfile - Missing profileData');
    throw new Error('Missing profileData');
  }
  
  try {
    // Extract subscription data from profileData
    const subscriptionPlan = profileData.subscriptionPlan || 'free';
    const subscriptionRenewalDate = profileData.subscriptionRenewalDate || null;
    
    console.log('DEBUG - saveSubscriptionToUserProfile - Saving subscription data:', {
      subscriptionPlan,
      subscriptionRenewalDate
    });
    
    // Update the user_profiles table
    // First try with user_uuid field
    console.log('DEBUG - saveSubscriptionToUserProfile - Attempting to update with user_uuid:', userId);
    let result = await supabase
      .from('user_profiles')
      .update({
        subscription_plan: subscriptionPlan,
        subscription_renewal_date: subscriptionRenewalDate
      })
      .eq('user_uuid', userId);
    
    // If there's an error or no rows affected, try with id field
    if (result.error || result.count === 0) {
      console.log('DEBUG - saveSubscriptionToUserProfile - Falling back to id field:', userId);
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

export const saveUserPreferences = async (profileData: ProfileData, userId: string, section: ProfileSection = 'all'): Promise<SaveResult> => {
  console.log(`DEBUG - saveUserPreferences - ENTRY POINT with userId: ${userId}, section: ${section}`);
  
  // Validate userId
  if (!userId) {
    console.error('ERROR - saveUserPreferences - Missing userId');
    throw new Error('Missing userId');
  }
  
  // Validate profileData
  if (!profileData) {
    console.error('ERROR - saveUserPreferences - Missing profileData');
    throw new Error('Missing profileData');
  }
  
  try {
    // Check if a record already exists for this user
    const { data: existingData, error: checkError } = await supabase
      .from('user_preferences')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking for existing user preferences:', checkError);
      return { success: false, error: checkError };
    }

    if (!existingData) {
      // If no record exists, we need to create one with minimal data
      // regardless of which section we're saving
      console.log('DEBUG - saveUserPreferences - No existing record found, creating new record');
      
      // Create a minimal record with just the required fields
      const minimalData = {
        user_id: userId,
        updated_at: new Date().toISOString()
      };
      
      const { data: insertData, error: insertError } = await supabase
        .from('user_preferences')
        .insert(minimalData)
        .select();
      
      if (insertError) {
        console.error('Error creating user preferences record:', insertError);
        return { success: false, error: insertError };
      }
      
      console.log('DEBUG - saveUserPreferences - Created new record:', insertData);
    }
    
    // Now we can update the record with just the fields for the specific section
    // Base update payload with just user_id and updated_at
    let updatePayload: Record<string, any> = {
      user_id: userId,
      updated_at: new Date().toISOString()
    };
    
    // For all sections, use the full mapped data
    if (section === 'all') {
      console.log('DEBUG - saveUserPreferences - Saving ALL sections');
      // Map the entire profile data
      updatePayload = {
        ...mapProfileDataToUserPreferences(profileData, userId)
      };
    }
    // Handle section-specific updates
    else if (section === 'stylePreferences') {
      console.log('DEBUG - saveUserPreferences - Saving ONLY stylePreferences section');
      
      // Only extract and process stylePreferences fields
      // Preferred styles array
      updatePayload.preferred_styles = Array.isArray(profileData.preferredStyles) ? 
        profileData.preferredStyles : [];
      
      // Style preferences object fields
      if (profileData.stylePreferences) {
        // Ensure slider values are numbers between 0-100
        updatePayload.comfort_vs_style = typeof profileData.stylePreferences.comfortVsStyle === 'number' ? 
          profileData.stylePreferences.comfortVsStyle : 50;
        
        updatePayload.classic_vs_trendy = typeof profileData.stylePreferences.classicVsTrendy === 'number' ? 
          profileData.stylePreferences.classicVsTrendy : 50;
        
        updatePayload.basics_vs_statements = typeof profileData.stylePreferences.basicsVsStatements === 'number' ? 
          profileData.stylePreferences.basicsVsStatements : 50;
        
        // Ensure additional notes is a string or null
        updatePayload.style_additional_notes = typeof profileData.stylePreferences.additionalNotes === 'string' ? 
          profileData.stylePreferences.additionalNotes : null;
      } else {
        // Set defaults if stylePreferences object doesn't exist
        updatePayload.comfort_vs_style = 50;
        updatePayload.classic_vs_trendy = 50;
        updatePayload.basics_vs_statements = 50;
        updatePayload.style_additional_notes = null;
      }
      
      // Log only the stylePreferences fields being saved
      console.log('DEBUG - saveUserPreferences - stylePreferences update payload:', {
        preferred_styles: updatePayload.preferred_styles,
        comfort_vs_style: updatePayload.comfort_vs_style,
        classic_vs_trendy: updatePayload.classic_vs_trendy,
        basics_vs_statements: updatePayload.basics_vs_statements,
        style_additional_notes: updatePayload.style_additional_notes
      });
    }
    // Add handlers for other sections as needed
    else if (section === 'wardrobeGoals') {
      console.log('DEBUG - saveUserPreferences - Saving ONLY wardrobeGoals section');
      
      // Only extract and process wardrobeGoals fields
      updatePayload.wardrobe_goals = Array.isArray(profileData.wardrobeGoals) ? 
        profileData.wardrobeGoals : [];
      updatePayload.other_wardrobe_goal = typeof profileData.otherWardrobeGoal === 'string' ? 
        profileData.otherWardrobeGoal : null;
        
      console.log('DEBUG - saveUserPreferences - wardrobeGoals update payload:', {
        wardrobe_goals: updatePayload.wardrobe_goals,
        other_wardrobe_goal: updatePayload.other_wardrobe_goal
      });
    }
    else if (section === 'dailyActivities') {
      console.log('DEBUG - saveUserPreferences - Saving ONLY dailyActivities section');
      
      // Only extract and process dailyActivities fields
      updatePayload.daily_activities = Array.isArray(profileData.dailyActivities) ? 
        profileData.dailyActivities : [];
      updatePayload.other_activity_description = typeof profileData.otherActivityDescription === 'string' ? 
        profileData.otherActivityDescription : null;
      updatePayload.office_dress_code = typeof profileData.officeDressCode === 'string' ? 
        profileData.officeDressCode : '';
      updatePayload.remote_work_priority = typeof profileData.remoteWorkPriority === 'number' ? 
        profileData.remoteWorkPriority : 0;
      updatePayload.creative_mobility = typeof profileData.creativeMobility === 'number' ? 
        profileData.creativeMobility : 0;
        
      console.log('DEBUG - saveUserPreferences - dailyActivities update payload:', {
        daily_activities: updatePayload.daily_activities,
        other_activity_description: updatePayload.other_activity_description,
        office_dress_code: updatePayload.office_dress_code,
        remote_work_priority: updatePayload.remote_work_priority,
        creative_mobility: updatePayload.creative_mobility
      });
    }
    else if (section === 'leisureActivities') {
      console.log('DEBUG - saveUserPreferences - Saving ONLY leisureActivities section');
      
      // Only extract and process leisureActivities fields
      updatePayload.leisure_activities = Array.isArray(profileData.leisureActivities) ? 
        profileData.leisureActivities : [];
      updatePayload.other_leisure_activity = typeof profileData.otherLeisureActivity === 'string' ? 
        profileData.otherLeisureActivity : null;
        
      console.log('DEBUG - saveUserPreferences - leisureActivities update payload:', {
        leisure_activities: updatePayload.leisure_activities,
        other_leisure_activity: updatePayload.other_leisure_activity
      });
    }
    else if (section === 'climate') {
      console.log('DEBUG - saveUserPreferences - Saving ONLY climate section');
      
      // Only extract and process climate fields
      updatePayload.local_climate = profileData.localClimate || null;
        
      console.log('DEBUG - saveUserPreferences - climate update payload:', {
        local_climate: updatePayload.local_climate
      });
    }
    // 🎯 shoppingLimit section logic REMOVED - now handled by unified budget service

    console.log(`DEBUG - saveUserPreferences - Saving ONLY ${section} section with fields:`, Object.keys(updatePayload));

    console.log('DEBUG - saveUserPreferences - BEFORE UPDATE API CALL');
    console.log('DEBUG - saveUserPreferences - UPDATE user_id:', userId);
    console.log('DEBUG - saveUserPreferences - UPDATE payload:', JSON.stringify(updatePayload, null, 2));

    try {
      // For section-specific saves, we'll create a completely new targeted payload
      // instead of trying to filter an existing full payload
      if (section !== 'all') {
        console.log(`DEBUG - saveUserPreferences - Creating TARGETED payload for ${section} section`);
        
        // Create a brand new payload with just user_id
        const targetedPayload: any = {
          user_id: userId
        };
        
        // Add only the fields specific to this section
        if (section === 'stylePreferences') {
          // Handle stylePreferences section
          targetedPayload.preferred_styles = Array.isArray(profileData.preferredStyles) ? 
            profileData.preferredStyles : [];
            
          // Ensure slider values are numbers between 0-100
          if (profileData.stylePreferences) {
            targetedPayload.comfort_vs_style = typeof profileData.stylePreferences.comfortVsStyle === 'number' ? 
              profileData.stylePreferences.comfortVsStyle : 50;
            
            targetedPayload.classic_vs_trendy = typeof profileData.stylePreferences.classicVsTrendy === 'number' ? 
              profileData.stylePreferences.classicVsTrendy : 50;
            
            targetedPayload.basics_vs_statements = typeof profileData.stylePreferences.basicsVsStatements === 'number' ? 
              profileData.stylePreferences.basicsVsStatements : 50;
            
            // Ensure additional notes is a string or null
            targetedPayload.style_additional_notes = typeof profileData.stylePreferences.additionalNotes === 'string' ? 
              profileData.stylePreferences.additionalNotes : null;
          } else {
            // Set defaults if stylePreferences object doesn't exist
            targetedPayload.comfort_vs_style = 50;
            targetedPayload.classic_vs_trendy = 50;
            targetedPayload.basics_vs_statements = 50;
            targetedPayload.style_additional_notes = null;
          }
        } 
        else if (section === 'wardrobeGoals') {
          // Handle wardrobeGoals section
          targetedPayload.wardrobe_goals = Array.isArray(profileData.wardrobeGoals) ? 
            profileData.wardrobeGoals : [];
          targetedPayload.other_wardrobe_goal = typeof profileData.otherWardrobeGoal === 'string' ? 
            profileData.otherWardrobeGoal : null;
        }
        else if (section === 'dailyActivities') {
          // Handle dailyActivities section
          targetedPayload.daily_activities = Array.isArray(profileData.dailyActivities) ? 
            profileData.dailyActivities : [];
          targetedPayload.other_activity_description = typeof profileData.otherActivityDescription === 'string' ? 
            profileData.otherActivityDescription : null;
          targetedPayload.office_dress_code = typeof profileData.officeDressCode === 'string' ? 
            profileData.officeDressCode : null;
          targetedPayload.remote_work_priority = typeof profileData.remoteWorkPriority === 'string' ? 
            profileData.remoteWorkPriority : null;
          targetedPayload.creative_mobility = typeof profileData.creativeMobility === 'string' ? 
            profileData.creativeMobility : null;
        }
        else if (section === 'leisureActivities') {
          // Handle leisureActivities section
          targetedPayload.leisure_activities = Array.isArray(profileData.leisureActivities) ? 
            profileData.leisureActivities : [];
          targetedPayload.other_leisure_activity = typeof profileData.otherLeisureActivity === 'string' ? 
            profileData.otherLeisureActivity : null;
        }
        else if (section === 'climate') {
          // Handle climate section
          targetedPayload.local_climate = typeof profileData.localClimate === 'string' ? 
            profileData.localClimate : null;
        }
        // 🎯 shoppingLimit targeted payload logic REMOVED - now handled by unified budget service
        
        // Replace the entire updatePayload with our targeted payload
        updatePayload = targetedPayload;
        
        console.log(`DEBUG - saveUserPreferences - TARGETED UPDATE PAYLOAD for ${section} section:`, 
          JSON.stringify(updatePayload, null, 2));
      }
      
      // Log the final update payload right before the API call
      console.log('DEBUG - saveUserPreferences - FINAL UPDATE PAYLOAD:', JSON.stringify(updatePayload, null, 2));

      // For style preferences section, double check the payload structure
      if (section === 'stylePreferences') {
        console.log('DEBUG - saveUserPreferences - STYLE PREFERENCES UPDATE PAYLOAD CHECK - CRITICAL:', {
          fullPayload: updatePayload,
          hasPreferredStyles: 'preferred_styles' in updatePayload,
          preferredStylesValue: updatePayload.preferred_styles,
          preferredStylesType: typeof updatePayload.preferred_styles,
          isPreferredStylesArray: Array.isArray(updatePayload.preferred_styles),
          preferredStylesLength: Array.isArray(updatePayload.preferred_styles) ? updatePayload.preferred_styles.length : 'N/A',
          hasComfortVsStyle: 'comfort_vs_style' in updatePayload,
          comfortVsStyleValue: updatePayload.comfort_vs_style,
          hasClassicVsTrendy: 'classic_vs_trendy' in updatePayload,
          classicVsTrendyValue: updatePayload.classic_vs_trendy,
          hasBasicsVsStatements: 'basics_vs_statements' in updatePayload,
          basicsVsStatementsValue: updatePayload.basics_vs_statements,
          hasStyleAdditionalNotes: 'style_additional_notes' in updatePayload,
          styleAdditionalNotesValue: updatePayload.style_additional_notes
        });
      }

      // Make the API call with the update payload
      const { data: updateResponseData, error: updateError } = await supabase
        .from('user_preferences')
        .update(updatePayload)
        .eq('user_id', userId)
        .select();

      console.log('DEBUG - saveUserPreferences - AFTER UPDATE API CALL');
      console.log('DEBUG - saveUserPreferences - UPDATE RESPONSE data:', updateResponseData);
      console.log('DEBUG - saveUserPreferences - UPDATE RESPONSE error:', updateError);

      // For style preferences section, verify the response
      if (section === 'stylePreferences' && !updateError) {
        console.log('DEBUG - saveUserPreferences - VERIFYING STYLE PREFERENCES UPDATE:');

        // Fetch the updated record to verify the changes were saved
        const { data: verifyData, error: verifyError } = await supabase
          .from('user_preferences')
          .select('preferred_styles, comfort_vs_style, classic_vs_trendy, basics_vs_statements, style_additional_notes')
          .eq('user_id', userId)
          .single();

        if (verifyError) {
          console.error('DEBUG - saveUserPreferences - VERIFICATION ERROR:', verifyError);
        } else {
          console.log('DEBUG - saveUserPreferences - VERIFICATION DATA:', {
            preferredStyles: verifyData.preferred_styles,
            comfortVsStyle: verifyData.comfort_vs_style,
            classicVsTrendy: verifyData.classic_vs_trendy,
            basicsVsStatements: verifyData.basics_vs_statements,
            styleAdditionalNotes: verifyData.style_additional_notes,
            matchesPayload: {
              preferredStyles: JSON.stringify(verifyData.preferred_styles) === JSON.stringify(updatePayload.preferred_styles),
              comfortVsStyle: verifyData.comfort_vs_style === updatePayload.comfort_vs_style,
              classicVsTrendy: verifyData.classic_vs_trendy === updatePayload.classic_vs_trendy,
              basicsVsStatements: verifyData.basics_vs_statements === updatePayload.basics_vs_statements,
              styleAdditionalNotes: verifyData.style_additional_notes === updatePayload.style_additional_notes
            }
          });
        }
      }

      // Check for specific error conditions
      if (updateError) {
        console.error('ERROR - saveUserPreferences - UPDATE failed with error code:', updateError.code);
        console.error('ERROR - saveUserPreferences - UPDATE error details:', updateError.details);
        console.error('ERROR - saveUserPreferences - UPDATE error hint:', updateError.hint);
        console.error('ERROR - saveUserPreferences - UPDATE error message:', updateError.message);
        return { success: false, error: updateError };
      }

      return { success: true };
    } catch (apiError) {
      console.error('ERROR - saveUserPreferences - UPDATE API call exception:', apiError);
      return { success: false, error: apiError };
    }
  } catch (error) {
    console.error('Error saving user preferences:', error);
    return { success: false, error: error as Error };
  }
};

/**
 * Gets user preferences from the user_preferences table
 */
export const getUserPreferences = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) {
      console.error('Error getting user preferences:', error);
      throw error;
    }
    
    // Process the data before returning it
    if (data) {
      // Handle otherLeisureActivity field - ensure it's in the correct format
      // If it's stored as a string that looks like an object, parse it
      if (data.other_leisure_activity && typeof data.other_leisure_activity === 'string') {
        try {
          // Check if it's a JSON string that represents an object
          if (data.other_leisure_activity.startsWith('{') && data.other_leisure_activity.endsWith('}')) {
            const parsedValue = JSON.parse(data.other_leisure_activity);
            if (parsedValue && typeof parsedValue === 'object') {
              data.other_leisure_activity = parsedValue;
            }
          }
        } catch (e) {
          // If parsing fails, keep it as a string
          console.log('Failed to parse other_leisure_activity, keeping as string:', e);
        }
      }
    }
    
    return data;
  } catch (error) {
    console.error('Error getting user preferences:', error);
    throw error;
  }
};
