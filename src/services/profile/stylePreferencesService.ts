import { supabase } from '../supabaseClient';
import { StylePreferencesData } from '../../types';

/**
 * Service for managing style preferences data in the user_preferences table
 * This service is dedicated to StylePreferencesData only, with no mixing of ProfileData
 */

/**
 * Database row structure for style preferences data
 */
interface StylePreferencesDbRow {
  preferred_styles?: string[];
  comfort_vs_style?: number;
  classic_vs_trendy?: number;
  basics_vs_statements?: number;
  style_additional_notes?: string | null;
  [key: string]: any; // Add index signature for compatibility with Record<string, unknown>
}

/**
 * Validates style preferences data
 * @param stylePreferencesData The style preferences data to validate
 * @returns Boolean indicating if the data is valid
 */
const validateStylePreferencesData = (stylePreferencesData: StylePreferencesData): boolean => {
  // Check if preferredStyles is an array
  if (!Array.isArray(stylePreferencesData.preferredStyles)) {
    console.error('ERROR - validateStylePreferencesData - preferredStyles is not an array');
    return false;
  }

  // Check if stylePreferences object exists
  if (!stylePreferencesData.stylePreferences) {
    console.error('ERROR - validateStylePreferencesData - stylePreferences object is missing');
    return false;
  }

  // Check if slider values are numbers between 0-100
  const { comfortVsStyle, classicVsTrendy, basicsVsStatements } = stylePreferencesData.stylePreferences;
  
  if (typeof comfortVsStyle === 'number' && (comfortVsStyle < 0 || comfortVsStyle > 100)) {
    console.error('ERROR - validateStylePreferencesData - comfortVsStyle is invalid:', comfortVsStyle);
    return false;
  }

  if (typeof classicVsTrendy === 'number' && (classicVsTrendy < 0 || classicVsTrendy > 100)) {
    console.error('ERROR - validateStylePreferencesData - classicVsTrendy is invalid:', classicVsTrendy);
    return false;
  }

  if (typeof basicsVsStatements === 'number' && (basicsVsStatements < 0 || basicsVsStatements > 100)) {
    console.error('ERROR - validateStylePreferencesData - basicsVsStatements is invalid:', basicsVsStatements);
    return false;
  }

  return true;
};

/**
 * Maps database row to StylePreferencesData
 * @param dbRow The database row to map
 * @returns StylePreferencesData
 */
const mapDbRowToStylePreferencesData = (dbRow: StylePreferencesDbRow): StylePreferencesData => {
  return {
    preferredStyles: Array.isArray(dbRow.preferred_styles) 
      ? dbRow.preferred_styles 
      : [],
    stylePreferences: {
      comfortVsStyle: typeof dbRow.comfort_vs_style === 'number' 
        ? dbRow.comfort_vs_style 
        : 50,
      classicVsTrendy: typeof dbRow.classic_vs_trendy === 'number' 
        ? dbRow.classic_vs_trendy 
        : 50,
      basicsVsStatements: typeof dbRow.basics_vs_statements === 'number' 
        ? dbRow.basics_vs_statements 
        : 50,
      additionalNotes: typeof dbRow.style_additional_notes === 'string' 
        ? dbRow.style_additional_notes 
        : ''
    }
  };
};

/**
 * Maps StylePreferencesData to database row
 * @param stylePreferencesData The style preferences data to map
 * @returns Object with mapped data in snake_case format for the database
 */
const mapStylePreferencesDataToDb = (stylePreferencesData: StylePreferencesData): StylePreferencesDbRow => {
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
 * Gets style preferences data for a user
 * @param userId The user ID to get style preferences for
 * @returns Promise with StylePreferencesData or null if not found
 */
export const getStylePreferencesData = async (userId: string): Promise<StylePreferencesData | null> => {
  if (!userId) throw new Error('Missing userId');

  console.log('DEBUG - getStylePreferencesData - Fetching for user:', userId);
  
  try {
    // Select only the style preferences columns
    const { data, error } = await supabase
      .from('user_preferences')
      .select('preferred_styles, comfort_vs_style, classic_vs_trendy, basics_vs_statements, style_additional_notes')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        console.log('INFO - getStylePreferencesData - No record found for user:', userId);
        return null;
      }
      throw error;
    }

    if (!data) return null;

    console.log('DEBUG - getStylePreferencesData - Raw data:', data);
    // Type cast data to StylePreferencesDbRow since we know the shape matches our interface
    const typedData: StylePreferencesDbRow = {
      preferred_styles: Array.isArray(data.preferred_styles) ? data.preferred_styles : [],
      comfort_vs_style: typeof data.comfort_vs_style === 'number' ? data.comfort_vs_style : undefined,
      classic_vs_trendy: typeof data.classic_vs_trendy === 'number' ? data.classic_vs_trendy : undefined,
      basics_vs_statements: typeof data.basics_vs_statements === 'number' ? data.basics_vs_statements : undefined,
      style_additional_notes: typeof data.style_additional_notes === 'string' ? data.style_additional_notes : null
    };
    const mappedData = mapDbRowToStylePreferencesData(typedData);
    console.log('DEBUG - getStylePreferencesData - Mapped data:', mappedData);
    
    return mappedData;
  } catch (error) {
    console.error('ERROR - getStylePreferencesData - Exception:', error);
    throw error;
  }
};

/**
 * Saves style preferences data for a user
 * @param userId The user ID to save style preferences for
 * @param stylePreferencesData The style preferences data to save
 */
export const saveStylePreferencesData = async (
  userId: string,
  stylePreferencesData: StylePreferencesData
): Promise<void> => {
  if (!userId) throw new Error('Missing userId');
  if (!stylePreferencesData) throw new Error('Missing stylePreferencesData');
  if (!validateStylePreferencesData(stylePreferencesData)) throw new Error('Invalid stylePreferencesData');

  console.log('DEBUG - saveStylePreferencesData - Saving for user:', userId);
  console.log('DEBUG - saveStylePreferencesData - Data:', stylePreferencesData);

  const dbPayload = mapStylePreferencesDataToDb(stylePreferencesData);
  console.log('DEBUG - saveStylePreferencesData - DB payload:', dbPayload);

  try {
    // Check if a record already exists for this user
    const { data: existingData, error: checkError } = await supabase
      .from('user_preferences')
      .select('user_id')
      .eq('user_id', userId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') throw checkError;

    if (existingData) {
      // Update existing record
      console.log('DEBUG - saveStylePreferencesData - Updating existing record');
      const { error: updateError } = await supabase
        .from('user_preferences')
        .update(dbPayload)
        .eq('user_id', userId)
        .select();

      if (updateError) throw updateError;
    } else {
      // Create new record
      console.log('DEBUG - saveStylePreferencesData - Creating new record');
      const { error: insertError } = await supabase
        .from('user_preferences')
        .insert({ user_id: userId, ...dbPayload })
        .select();

      if (insertError) throw insertError;
    }

    console.log('DEBUG - saveStylePreferencesData - Save successful');
  } catch (error) {
    console.error('ERROR - saveStylePreferencesData - Exception:', error);
    throw error;
  }
};
