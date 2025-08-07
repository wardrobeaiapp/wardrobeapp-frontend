import { supabase } from './supabaseClient';
import { StylePreferencesData } from '../types';

/**
 * Service for managing style preferences data in the user_preferences table
 * This service is dedicated to StylePreferencesData only, with no mixing of ProfileData
 */

/**
 * Result interface for save operations
 */
export interface SaveResult {
  success: boolean;
  error?: any;
}

/**
 * Maps StylePreferencesData to the user_preferences table structure
 * @param stylePreferencesData The style preferences data to map
 * @returns Object with mapped data in snake_case format for the database
 */
const mapStylePreferencesToDbFormat = (stylePreferencesData: StylePreferencesData) => {
  return {
    // Preferred styles array
    preferred_styles: Array.isArray(stylePreferencesData.preferredStyles) 
      ? stylePreferencesData.preferredStyles 
      : [],
    
    // Style preferences sliders
    comfort_vs_style: typeof stylePreferencesData.stylePreferences?.comfortVsStyle === 'number' 
      ? stylePreferencesData.stylePreferences.comfortVsStyle 
      : 50,
    
    classic_vs_trendy: typeof stylePreferencesData.stylePreferences?.classicVsTrendy === 'number' 
      ? stylePreferencesData.stylePreferences.classicVsTrendy 
      : 50,
    
    basics_vs_statements: typeof stylePreferencesData.stylePreferences?.basicsVsStatements === 'number' 
      ? stylePreferencesData.stylePreferences.basicsVsStatements 
      : 50,
    
    // Additional notes
    style_additional_notes: typeof stylePreferencesData.stylePreferences?.additionalNotes === 'string' 
      ? stylePreferencesData.stylePreferences.additionalNotes 
      : null
  };
};

/**
 * Maps database format back to StylePreferencesData
 * @param dbData The database data to map
 * @returns StylePreferencesData object
 */
const mapDbToStylePreferences = (dbData: any): StylePreferencesData => {
  return {
    preferredStyles: Array.isArray(dbData.preferred_styles) 
      ? dbData.preferred_styles 
      : [],
    stylePreferences: {
      comfortVsStyle: typeof dbData.comfort_vs_style === 'number' 
        ? dbData.comfort_vs_style 
        : 50,
      classicVsTrendy: typeof dbData.classic_vs_trendy === 'number' 
        ? dbData.classic_vs_trendy 
        : 50,
      basicsVsStatements: typeof dbData.basics_vs_statements === 'number' 
        ? dbData.basics_vs_statements 
        : 50,
      additionalNotes: typeof dbData.style_additional_notes === 'string' 
        ? dbData.style_additional_notes 
        : ''
    }
  };
};

/**
 * Gets style preferences data for a user
 * @param userId The user ID to get style preferences for
 * @returns Promise with StylePreferencesData or null if not found
 */
export const getStylePreferences = async (userId: string): Promise<StylePreferencesData | null> => {
  console.log('DEBUG - getStylePreferences - ENTRY POINT with userId:', userId);
  
  if (!userId) {
    console.error('ERROR - getStylePreferences - Missing userId');
    throw new Error('Missing userId');
  }

  try {
    console.log('DEBUG - getStylePreferences - Fetching style preferences from Supabase');
    
    // Select only the style preferences columns
    const { data, error } = await supabase
      .from('user_preferences')
      .select('preferred_styles, comfort_vs_style, classic_vs_trendy, basics_vs_statements, style_additional_notes')
      .eq('user_id', userId)
      .single();

    console.log('DEBUG - getStylePreferences - Raw data from Supabase:', data);
    console.log('DEBUG - getStylePreferences - Error from Supabase:', error);

    if (error) {
      console.error('ERROR - getStylePreferences - Fetch error:', error);
      return null;
    }

    if (!data) {
      console.log('INFO - getStylePreferences - No style preferences found for user:', userId);
      return null;
    }

    // Log each field from the database to verify correct data collection
    console.log('DEBUG - getStylePreferences - Data fields from Supabase:', {
      preferred_styles: data.preferred_styles,
      comfort_vs_style: data.comfort_vs_style,
      classic_vs_trendy: data.classic_vs_trendy,
      basics_vs_statements: data.basics_vs_statements,
      style_additional_notes: data.style_additional_notes
    });

    // Map the database data to StylePreferencesData
    const mappedData = mapDbToStylePreferences(data);
    
    // Log the mapped data to verify correct mapping
    console.log('DEBUG - getStylePreferences - Mapped StylePreferencesData:', mappedData);
    
    return mappedData;
  } catch (error) {
    console.error('ERROR - getStylePreferences - Exception:', error);
    return null;
  }
};

/**
 * Saves style preferences data for a user
 * @param stylePreferencesData The style preferences data to save
 * @param userId The user ID to save style preferences for
 * @returns Promise with save result
 */
export const saveStylePreferences = async (
  stylePreferencesData: StylePreferencesData, 
  userId: string
): Promise<SaveResult> => {
  console.log('DEBUG - saveStylePreferences - ENTRY POINT with userId:', userId);
  console.log('DEBUG - saveStylePreferences - Input StylePreferencesData:', JSON.stringify(stylePreferencesData, null, 2));
  
  if (!userId) {
    console.error('ERROR - saveStylePreferences - Missing userId');
    throw new Error('Missing userId');
  }

  if (!stylePreferencesData) {
    console.error('ERROR - saveStylePreferences - Missing stylePreferencesData');
    throw new Error('Missing stylePreferencesData');
  }
  
  // Validate the data before saving
  if (!validateStylePreferences(stylePreferencesData)) {
    console.error('ERROR - saveStylePreferences - Invalid stylePreferencesData');
    return { success: false, error: 'Invalid style preferences data' };
  }

  console.log('DEBUG - saveStylePreferences - Saving style preferences for user:', userId);
  console.log('DEBUG - saveStylePreferences - Data validation passed');
  
  // Log each field from the input data for verification
  console.log('DEBUG - saveStylePreferences - Input data fields:', {
    preferredStyles: stylePreferencesData.preferredStyles,
    comfortVsStyle: stylePreferencesData.stylePreferences?.comfortVsStyle,
    classicVsTrendy: stylePreferencesData.stylePreferences?.classicVsTrendy,
    basicsVsStatements: stylePreferencesData.stylePreferences?.basicsVsStatements,
    additionalNotes: stylePreferencesData.stylePreferences?.additionalNotes
  });

  try {
    // Check if a record already exists for this user
    const { data: existingData, error: checkError } = await supabase
      .from('user_preferences')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (checkError) {
      console.error('ERROR - saveStylePreferences - Check error:', checkError);
      return { success: false, error: checkError };
    }

    // Map the style preferences data to database format
    const dbData = mapStylePreferencesToDbFormat(stylePreferencesData);
    
    // Add user_id and updated_at to the data
    const updatePayload = {
      ...dbData,
      user_id: userId,
      updated_at: new Date().toISOString()
    };

    console.log('DEBUG - saveStylePreferences - Update payload:', updatePayload);

    if (!existingData) {
      // If no record exists, create one
      console.log('DEBUG - saveStylePreferences - Creating new record');
      
      const { data: insertData, error: insertError } = await supabase
        .from('user_preferences')
        .insert(updatePayload)
        .select();

      if (insertError) {
        console.error('ERROR - saveStylePreferences - Insert error:', insertError);
        return { success: false, error: insertError };
      }

      console.log('DEBUG - saveStylePreferences - Insert success:', insertData);
      return { success: true };
    } else {
      // If a record exists, update it
      console.log('DEBUG - saveStylePreferences - Updating existing record');
      
      const { data: updateData, error: updateError } = await supabase
        .from('user_preferences')
        .update(updatePayload)
        .eq('user_id', userId)
        .select();

      if (updateError) {
        console.error('ERROR - saveStylePreferences - Update error:', updateError);
        return { success: false, error: updateError };
      }

      console.log('DEBUG - saveStylePreferences - Update success:', updateData);
      return { success: true };
    }
  } catch (error) {
    console.error('ERROR - saveStylePreferences - Exception:', error);
    return { success: false, error };
  }
};

/**
 * Validates style preferences data
 * @param stylePreferencesData The style preferences data to validate
 * @returns Boolean indicating if the data is valid
 */
export const validateStylePreferences = (stylePreferencesData: StylePreferencesData): boolean => {
  // Check if preferredStyles is an array
  if (!Array.isArray(stylePreferencesData.preferredStyles)) {
    console.error('ERROR - validateStylePreferences - preferredStyles is not an array');
    return false;
  }

  // Check if stylePreferences object exists
  if (!stylePreferencesData.stylePreferences) {
    console.error('ERROR - validateStylePreferences - stylePreferences object is missing');
    return false;
  }

  // Check if slider values are numbers between 0-100
  const { comfortVsStyle, classicVsTrendy, basicsVsStatements } = stylePreferencesData.stylePreferences;
  
  if (typeof comfortVsStyle !== 'number' || comfortVsStyle < 0 || comfortVsStyle > 100) {
    console.error('ERROR - validateStylePreferences - comfortVsStyle is invalid:', comfortVsStyle);
    return false;
  }

  if (typeof classicVsTrendy !== 'number' || classicVsTrendy < 0 || classicVsTrendy > 100) {
    console.error('ERROR - validateStylePreferences - classicVsTrendy is invalid:', classicVsTrendy);
    return false;
  }

  if (typeof basicsVsStatements !== 'number' || basicsVsStatements < 0 || basicsVsStatements > 100) {
    console.error('ERROR - validateStylePreferences - basicsVsStatements is invalid:', basicsVsStatements);
    return false;
  }

  return true;
};
