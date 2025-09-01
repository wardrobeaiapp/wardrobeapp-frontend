/**
 * @deprecated This file has been moved to services/profile/sectionPreferencesService.ts
 * Please import from there instead. This file will be removed in a future release.
 */

import { supabase } from './supabaseClient';
import { SaveResult } from '../components/features/profile/types/StyleProfileTypes';
import { ProfileSection, ClothingBudget, ShoppingLimit, StylePreferencesData, WardrobeGoalsData, DailyActivitiesData, LeisureActivitiesData, ClimateData, SubscriptionData } from '../components/features/profile/sections/types';

/**
 * Get the current user ID from storage
 * @returns The user ID or null if not found
 */
export const getCurrentUserId = (): string | null => {
  // Try to get from localStorage first
  let userId = localStorage.getItem('userId');
  
  // If not in localStorage, try to get from sessionStorage
  if (!userId) {
    userId = sessionStorage.getItem('userId');
  }
  
  return userId;
};

// Using ProfileSection type from the codebase for consistency
// This ensures compatibility with the existing type system

/**
 * Save a specific section of user preferences to Supabase
 * This function is designed to be a clean, dedicated approach for section-specific saves
 * that avoids the complexity of the full profile save logic
 * 
 * @param sectionData The section-specific data to save (StylePreferencesData, WardrobeGoalsData, etc.)
 * @param userId The user ID (optional - will try to get from context or storage if not provided)
 * @param section The specific section to save
 * @returns Promise with save result
 */
export const saveSectionPreferences = async (
  sectionData: StylePreferencesData | WardrobeGoalsData | any, 
  userId?: string, 
  section?: ProfileSection
): Promise<SaveResult> => {
  console.log(`DEBUG - saveSectionPreferences - Saving ONLY ${section} section for user ${userId}`);
  
  // Validate inputs
  if (!sectionData) {
    console.error('ERROR - saveSectionPreferences - Missing sectionData');
    return { success: false, error: new Error('Missing section data') };
  }
  
  // If userId is not provided, try to get it from storage
  const effectiveUserId = userId || getCurrentUserId();
  if (!effectiveUserId) {
    console.error('ERROR - saveSectionPreferences - Could not determine userId');
    return { 
      success: false, 
      error: new Error('User ID not found. Please ensure you are logged in and try again.') 
    };
  }
  
  // Default to stylePreferences section if not specified
  const effectiveSection = section || 'stylePreferences';
  
  // Don't allow 'all' section - this function is for section-specific saves only
  if (effectiveSection === 'all') {
    console.error('ERROR - saveSectionPreferences - Invalid section, must specify a specific section');
    return { success: false, error: new Error('Invalid section, must specify a specific section') };
  }
  
  try {
    // Create a payload with only user_id and the fields for this specific section
    const sectionPayload: any = {
      user_id: effectiveUserId
    };
    
    // Add only the fields for the specified section
    if (effectiveSection === 'stylePreferences') {
      // Style preferences section
      console.log('DEBUG - saveSectionPreferences - Building payload for stylePreferences section');
      console.log('DEBUG - saveSectionPreferences - INCOMING stylePreferences DATA:', JSON.stringify(sectionData, null, 2));
      
      // Cast sectionData to StylePreferencesData for better type safety
      const styleData = sectionData as StylePreferencesData;
      
      // CRITICAL FIX: Detailed type checking and validation for incoming data
      console.log('DEBUG - saveSectionPreferences - Type checks:', {
        preferredStyles: {
          value: styleData.preferredStyles,
          isArray: Array.isArray(styleData.preferredStyles),
          length: Array.isArray(styleData.preferredStyles) ? styleData.preferredStyles.length : 0
        },
        stylePreferences: {
          exists: !!styleData.stylePreferences,
          type: typeof styleData.stylePreferences
        },
        comfortVsStyle: {
          value: styleData.stylePreferences?.comfortVsStyle,
          type: typeof styleData.stylePreferences?.comfortVsStyle,
          isNumber: typeof styleData.stylePreferences?.comfortVsStyle === 'number'
        },
        classicVsTrendy: {
          value: styleData.stylePreferences?.classicVsTrendy,
          type: typeof styleData.stylePreferences?.classicVsTrendy,
          isNumber: typeof styleData.stylePreferences?.classicVsTrendy === 'number'
        },
        basicsVsStatements: {
          value: styleData.stylePreferences?.basicsVsStatements,
          type: typeof styleData.stylePreferences?.basicsVsStatements,
          isNumber: typeof styleData.stylePreferences?.basicsVsStatements === 'number'
        }
      });
      
      // Add preferred styles array
      sectionPayload.preferred_styles = Array.isArray(styleData.preferredStyles) ? 
        styleData.preferredStyles : [];
      
      // Add style preferences sliders
      if (styleData.stylePreferences) {
        // Comfort vs style slider - ensure numeric values with explicit conversion
        const comfortVsStyle = Number(styleData.stylePreferences.comfortVsStyle);
        const classicVsTrendy = Number(styleData.stylePreferences.classicVsTrendy);
        const basicsVsStatements = Number(styleData.stylePreferences.basicsVsStatements);
        
        // Apply the values with fallbacks to default if not numeric
        sectionPayload.comfort_vs_style = isNaN(comfortVsStyle) ? 50 : comfortVsStyle;
        sectionPayload.classic_vs_trendy = isNaN(classicVsTrendy) ? 50 : classicVsTrendy;
        sectionPayload.basics_vs_statements = isNaN(basicsVsStatements) ? 50 : basicsVsStatements;
        sectionPayload.style_additional_notes = styleData.stylePreferences.additionalNotes || null;
          
        // Log the final values that will be saved
        console.log('DEBUG - saveSectionPreferences - Final slider values to be saved:', {
          comfort_vs_style: sectionPayload.comfort_vs_style,
          classic_vs_trendy: sectionPayload.classic_vs_trendy,
          basics_vs_statements: sectionPayload.basics_vs_statements
        });
        
        // Extra validation to ensure we're not losing values
        if (sectionPayload.comfort_vs_style === 50 && styleData.stylePreferences.comfortVsStyle !== 50) {
          console.error('ERROR - saveSectionPreferences - Value mismatch for comfortVsStyle:', 
            styleData.stylePreferences.comfortVsStyle, 'vs', sectionPayload.comfort_vs_style);
        }
        if (sectionPayload.classic_vs_trendy === 50 && styleData.stylePreferences.classicVsTrendy !== 50) {
          console.error('ERROR - saveSectionPreferences - Value mismatch for classicVsTrendy:', 
            styleData.stylePreferences.classicVsTrendy, 'vs', sectionPayload.classic_vs_trendy);
        }
        if (sectionPayload.basics_vs_statements === 50 && styleData.stylePreferences.basicsVsStatements !== 50) {
          console.error('ERROR - saveSectionPreferences - Value mismatch for basicsVsStatements:', 
            styleData.stylePreferences.basicsVsStatements, 'vs', sectionPayload.basics_vs_statements);
        }
      } else {
        // Set defaults if stylePreferences object doesn't exist
        sectionPayload.comfort_vs_style = 50;
        sectionPayload.classic_vs_trendy = 50;
        sectionPayload.basics_vs_statements = 50;
        sectionPayload.style_additional_notes = null;
      }
    } 
    else if (effectiveSection === 'wardrobeGoals') {
      // Wardrobe goals section
      console.log('DEBUG - saveSectionPreferences - Building payload for wardrobeGoals section');
      
      // Cast sectionData to WardrobeGoalsData for better type safety
      const goalsData = sectionData as WardrobeGoalsData;
      
      // Add wardrobe goals array
      sectionPayload.wardrobe_goals = Array.isArray(goalsData.wardrobeGoals) 
        ? goalsData.wardrobeGoals 
        : [];
        
      // Add wardrobe goals additional notes
      sectionPayload.wardrobe_goals_additional_notes = goalsData.otherWardrobeGoal || null;
      
      console.log('DEBUG - saveSectionPreferences - wardrobeGoals payload:', {
        wardrobe_goals: sectionPayload.wardrobe_goals,
        wardrobe_goals_additional_notes: sectionPayload.wardrobe_goals_additional_notes
      });
    }
    else if (effectiveSection === 'dailyActivities') {
      // Daily activities section
      console.log('DEBUG - saveSectionPreferences - Building payload for dailyActivities section');
      
      // Cast sectionData to DailyActivitiesData for better type safety
      const activitiesData = sectionData as DailyActivitiesData;
      
      // Add daily activities array
      sectionPayload.daily_activities = Array.isArray(activitiesData.dailyActivities) 
        ? activitiesData.dailyActivities 
        : [];
      
      // Add daily activities additional notes
      sectionPayload.other_activity_description = activitiesData.otherActivityDescription || null;
      
      // Add office dress code
      sectionPayload.office_dress_code = activitiesData.officeDressCode || null;
      
      // Add remote work priority
      sectionPayload.remote_work_priority = activitiesData.remoteWorkPriority || null;
      
      // Add creative mobility
      sectionPayload.creative_mobility = activitiesData.creativeMobility || null;
      
      console.log('DEBUG - saveSectionPreferences - dailyActivities payload:', {
        daily_activities: sectionPayload.daily_activities,
        other_activity_description: sectionPayload.other_activity_description,
        office_dress_code: sectionPayload.office_dress_code,
        remote_work_priority: sectionPayload.remote_work_priority,
        creative_mobility: sectionPayload.creative_mobility
      });
    }
    else if (effectiveSection === 'leisureActivities') {
      // Leisure activities section
      console.log('DEBUG - saveSectionPreferences - Building payload for leisureActivities section');
      
      // Cast sectionData to LeisureActivitiesData for better type safety
      const leisureData = sectionData as LeisureActivitiesData;
      
      // Add leisure activities array
      sectionPayload.leisure_activities = Array.isArray(leisureData.leisureActivities) 
        ? leisureData.leisureActivities 
        : [];
        
      // Add other leisure activity if present
      if (leisureData.otherLeisureActivity) {
        if (typeof leisureData.otherLeisureActivity === 'string') {
          sectionPayload.other_leisure_activity = leisureData.otherLeisureActivity;
        } else if (typeof leisureData.otherLeisureActivity === 'object' && leisureData.otherLeisureActivity.text) {
          sectionPayload.other_leisure_activity = leisureData.otherLeisureActivity.text;
        }
      } else {
        sectionPayload.other_leisure_activity = null;
      }
      
      // Add frequency data if present
      if (leisureData.outdoorFrequency) {
        sectionPayload.outdoor_frequency = leisureData.outdoorFrequency.frequency || null;
        sectionPayload.outdoor_period = leisureData.outdoorFrequency.period || null;
      }
      
      if (leisureData.socialFrequency) {
        sectionPayload.social_frequency = leisureData.socialFrequency.frequency || null;
        sectionPayload.social_period = leisureData.socialFrequency.period || null;
      }
      
      if (leisureData.formalEventsFrequency) {
        sectionPayload.formal_events_frequency = leisureData.formalEventsFrequency.frequency || null;
        sectionPayload.formal_events_period = leisureData.formalEventsFrequency.period || null;
      }
      
      // Add travel frequency if present
      sectionPayload.travel_frequency = leisureData.travelFrequency || null;
      
      console.log('DEBUG - saveSectionPreferences - leisureActivities payload:', {
        leisure_activities: sectionPayload.leisure_activities,
        other_leisure_activity: sectionPayload.other_leisure_activity,
        outdoor_frequency: sectionPayload.outdoor_frequency,
        outdoor_period: sectionPayload.outdoor_period,
        social_frequency: sectionPayload.social_frequency,
        social_period: sectionPayload.social_period,
        formal_events_frequency: sectionPayload.formal_events_frequency,
        formal_events_period: sectionPayload.formal_events_period,
        travel_frequency: sectionPayload.travel_frequency
      });
    }
    else if (effectiveSection === 'climate') {
      // Climate section
      console.log('DEBUG - saveSectionPreferences - Building payload for climate section');
      
      // Cast sectionData to ClimateData for better type safety
      const climateData = sectionData as ClimateData;
      
      // Add local climate
      sectionPayload.local_climate = climateData.localClimate || null;
      
      console.log('DEBUG - saveSectionPreferences - climate payload:', {
        local_climate: sectionPayload.local_climate
      });
    }
    else if (effectiveSection === 'shoppingLimit') {
      // Shopping limit section
      console.log('DEBUG - saveSectionPreferences - Building payload for shoppingLimit section');
      
      // Cast sectionData to the correct type for better type safety
      const shoppingData = sectionData as { shoppingLimit: ShoppingLimit };
      
      // Add shopping limit fields
      sectionPayload.shopping_limit_amount = shoppingData.shoppingLimit?.amount || null;
      sectionPayload.shopping_limit_frequency = shoppingData.shoppingLimit?.frequency || null;
      
      console.log('DEBUG - saveSectionPreferences - shoppingLimit payload:', {
        shopping_limit_amount: sectionPayload.shopping_limit_amount,
        shopping_limit_frequency: sectionPayload.shopping_limit_frequency
      });
    }
    else if (effectiveSection === 'clothingBudget') {
      // Clothing budget section
      console.log('DEBUG - saveSectionPreferences - Building payload for clothingBudget section');
      
      // Cast sectionData to appropriate type for better type safety
      const budgetData = sectionData as { clothingBudget: ClothingBudget };
      
      if (budgetData.clothingBudget) {
        sectionPayload.clothing_budget_amount = typeof budgetData.clothingBudget.amount === 'number'
          ? budgetData.clothingBudget.amount
          : null;
          
        sectionPayload.clothing_budget_currency = typeof budgetData.clothingBudget.currency === 'string'
          ? budgetData.clothingBudget.currency
          : null;
          
        sectionPayload.clothing_budget_frequency = typeof budgetData.clothingBudget.frequency === 'string'
          ? budgetData.clothingBudget.frequency
          : null;
      } else {
        sectionPayload.clothing_budget_amount = null;
        sectionPayload.clothing_budget_currency = null;
        sectionPayload.clothing_budget_frequency = null;
      }
      
      console.log('DEBUG - saveSectionPreferences - clothingBudget payload:', {
        clothing_budget_amount: sectionPayload.clothing_budget_amount,
        clothing_budget_currency: sectionPayload.clothing_budget_currency,
        clothing_budget_frequency: sectionPayload.clothing_budget_frequency
      });
    }
    else if (effectiveSection === 'subscription') {
      // Cast sectionData to SubscriptionData for better type safety
      const subscriptionData = sectionData as SubscriptionData;
      
      // Subscription section is handled separately in user_profiles table
      console.error('ERROR - saveSectionPreferences - Subscription section should be saved using saveSubscriptionToUserProfile', subscriptionData);
      return { 
        success: false, 
        error: new Error('Subscription section should be saved using saveSubscriptionToUserProfile') 
      };
    }
    
    // Log the final payload for debugging
    console.log('DEBUG - saveSectionPreferences - FINAL SECTION PAYLOAD:', JSON.stringify(sectionPayload, null, 2));
    
    // Skip checking for existing records and use upsert instead
    console.log(`DEBUG - saveSectionPreferences - Using upsert for user: ${effectiveUserId}`);
    console.log('DEBUG - saveSectionPreferences - This will create a new record if none exists, or update existing record');
    
    // Add updated_at timestamp
    sectionPayload.updated_at = new Date().toISOString();
    
    // Use upsert to handle both insert and update cases
    console.log('DEBUG - saveSectionPreferences - Using upsert operation for user:', effectiveUserId);
    
    const { data: upsertData, error: upsertError } = await supabase
      .from('user_preferences')
      .upsert(sectionPayload, { onConflict: 'user_id' })
      .select();
      
    if (upsertError) {
      console.error('ERROR - saveSectionPreferences - Upsert failed:', upsertError);
      return { success: false, error: upsertError };
    }
    
    console.log('DEBUG - saveSectionPreferences - Upsert successful:', upsertData);
    
    const result = { success: true };
    
    // Verify the save for stylePreferences section
    if (effectiveSection === 'stylePreferences') {
      console.log('DEBUG - saveSectionPreferences - Verifying stylePreferences save');
      
      const { data: verifyData, error: verifyError } = await supabase
        .from('user_preferences')
        .select('preferred_styles, comfort_vs_style, classic_vs_trendy, basics_vs_statements, style_additional_notes')
        .eq('user_id', effectiveUserId)
        .single();
        
      if (verifyError) {
        console.error('DEBUG - saveSectionPreferences - Verification error:', verifyError);
      } else {
        console.log('DEBUG - saveSectionPreferences - Verification data:', {
          preferredStyles: verifyData.preferred_styles,
          comfortVsStyle: verifyData.comfort_vs_style,
          classicVsTrendy: verifyData.classic_vs_trendy,
          basicsVsStatements: verifyData.basics_vs_statements,
          styleAdditionalNotes: verifyData.style_additional_notes
        });
      }
    }
    
    return result;
  } catch (error) {
    console.error('ERROR - saveSectionPreferences - Unexpected error:', error);
    return { success: false, error };
  }
};
