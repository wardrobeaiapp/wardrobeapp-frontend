import { ProfileData } from '../../types';
import { SaveResult } from '../../components/features/profile/types/StyleProfileTypes';
import { ProfileSection } from './userPreferencesService';
import { supabase } from '../core';
import { StylePreferencesData, WardrobeGoalsData, ClimateData, SubscriptionData } from '../../components/features/profile/sections/types';

/**
 * Service for saving specific sections of user profile data to Supabase
 */

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
  sectionData: StylePreferencesData | WardrobeGoalsData | ProfileData | any, 
  userId?: string, 
  section?: ProfileSection
): Promise<SaveResult> => {
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
      // Cast sectionData to WardrobeGoalsData for better type safety
      const goalsData = sectionData as WardrobeGoalsData;
      
      // Add wardrobe goals array
      sectionPayload.wardrobe_goals = Array.isArray(goalsData.wardrobeGoals) 
        ? goalsData.wardrobeGoals 
        : [];
        
      // Add wardrobe goals additional notes
      sectionPayload.wardrobe_goals_additional_notes = goalsData.otherWardrobeGoal || null;
    }
    else if (effectiveSection === 'climate') {
      // Cast sectionData to ClimateData for better type safety
      const climateData = sectionData as ClimateData;
      
      // Add local climate
      sectionPayload.local_climate = climateData.localClimate || null;
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
    
    // Add updated_at timestamp
    sectionPayload.updated_at = new Date().toISOString();
    
    const { error: upsertError } = await supabase
      .from('user_preferences')
      .upsert(sectionPayload, { onConflict: 'user_id' })
      .select();
      
    if (upsertError) {
      console.error('ERROR - saveSectionPreferences - Upsert failed:', upsertError);
      return { success: false, error: upsertError };
    }
    
    // Verify the save for stylePreferences section
    if (effectiveSection === 'stylePreferences') {
      const { error: verifyError } = await supabase
        .from('user_preferences')
        .select('preferred_styles, comfort_vs_style, classic_vs_trendy, basics_vs_statements, style_additional_notes')
        .eq('user_id', effectiveUserId)
        .single();
        
      if (verifyError) {
        console.error('Error verifying style preferences save:', verifyError);
      }
    }
    
    return { success: true };
  } catch (error) {
    console.error('ERROR - saveSectionPreferences - Unexpected error:', error);
    return { success: false, error };
  }
};