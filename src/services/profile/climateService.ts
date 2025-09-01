import { supabase } from '../core/supabaseClient';
import { ClimateData } from '../../types';

/**
 * Validates ClimateData structure
 * @param data The data to validate
 * @returns boolean indicating if data is valid
 */
const validateClimateData = (data: any): data is ClimateData => {
  if (!data || typeof data !== 'object') {
    console.error('ClimateData validation failed: data is not an object');
    return false;
  }

  if (typeof data.localClimate !== 'string') {
    console.error('ClimateData validation failed: localClimate must be a string');
    return false;
  }

  return true;
};

/**
 * Maps database row to ClimateData interface
 * @param dbRow Raw data from Supabase
 * @returns ClimateData object
 */
const mapDbRowToClimateData = (dbRow: any): ClimateData => {
  console.log('DEBUG - mapDbRowToClimateData - Input:', dbRow);
  
  const mapped: ClimateData = {
    localClimate: dbRow?.local_climate || ''
  };
  
  console.log('DEBUG - mapDbRowToClimateData - Mapped:', mapped);
  return mapped;
};

/**
 * Maps ClimateData to database format
 * @param climateData ClimateData to map
 * @returns Object with database column names
 */
const mapClimateDataToDb = (climateData: ClimateData) => {
  console.log('DEBUG - mapClimateDataToDb - Input:', climateData);
  
  const dbData = {
    local_climate: climateData.localClimate
  };
  
  console.log('DEBUG - mapClimateDataToDb - Output:', dbData);
  return dbData;
};

/**
 * Gets climate data for a user
 * @param userId The user ID to get climate data for
 * @returns Promise with ClimateData or null if not found
 */
export const getClimateData = async (userId: string): Promise<ClimateData | null> => {
  console.log('DEBUG - getClimateData - ENTRY POINT with userId:', userId);
  
  if (!userId) {
    console.error('ERROR - getClimateData - Missing userId');
    throw new Error('Missing userId');
  }

  try {
    console.log('DEBUG - getClimateData - Fetching climate data from Supabase');
    
    // Select only the climate column
    const { data, error } = await supabase
      .from('user_preferences')
      .select('local_climate')
      .eq('user_id', userId)
      .single();

    console.log('DEBUG - getClimateData - Raw data from Supabase:', data);
    console.log('DEBUG - getClimateData - Error from Supabase:', error);

    if (error) {
      if (error.code === 'PGRST116') {
        console.log('DEBUG - getClimateData - No climate data found for user, returning null');
        return null;
      }
      throw error;
    }

    if (!data) {
      console.log('DEBUG - getClimateData - No data returned, returning null');
      return null;
    }

    const climateData = mapDbRowToClimateData(data);
    console.log('DEBUG - getClimateData - Final mapped climate data:', climateData);
    
    return climateData;
  } catch (error) {
    console.error('ERROR - getClimateData - Exception:', error);
    throw error;
  }
};

/**
 * Saves climate data for a user
 * @param userId The user ID to save climate data for
 * @param climateData The climate data to save
 * @returns Promise that resolves when save is complete
 */
export const saveClimateData = async (userId: string, climateData: ClimateData): Promise<void> => {
  console.log('DEBUG - saveClimateData - ENTRY POINT');
  console.log('DEBUG - saveClimateData - userId:', userId);
  console.log('DEBUG - saveClimateData - climateData:', climateData);

  if (!userId) {
    console.error('ERROR - saveClimateData - Missing userId');
    throw new Error('Missing userId');
  }

  if (!climateData) {
    console.error('ERROR - saveClimateData - Missing climateData');
    throw new Error('Missing climateData');
  }

  // Validate the data before saving
  if (!validateClimateData(climateData)) {
    console.error('ERROR - saveClimateData - Invalid climateData');
    throw new Error('Invalid climateData');
  }

  try {
    console.log('DEBUG - saveClimateData - Preparing database payload');
    const dbPayload = mapClimateDataToDb(climateData);
    console.log('DEBUG - saveClimateData - Database payload:', dbPayload);

    // Check if user has any preferences record
    const { data: existingData, error: fetchError } = await supabase
      .from('user_preferences')
      .select('user_id')
      .eq('user_id', userId)
      .single();

    console.log('DEBUG - saveClimateData - Existing data check:', existingData);
    console.log('DEBUG - saveClimateData - Fetch error:', fetchError);

    let result;
    if (existingData) {
      // Update existing record
      console.log('DEBUG - saveClimateData - Updating existing record');
      result = await supabase
        .from('user_preferences')
        .update(dbPayload)
        .eq('user_id', userId)
        .select();
    } else {
      // Insert new record
      console.log('DEBUG - saveClimateData - Inserting new record');
      result = await supabase
        .from('user_preferences')
        .insert({
          user_id: userId,
          ...dbPayload
        })
        .select();
    }

    console.log('DEBUG - saveClimateData - Save result:', result);

    if (result.error) {
      console.error('ERROR - saveClimateData - Supabase error:', result.error);
      throw result.error;
    }

    console.log('DEBUG - saveClimateData - Climate data saved successfully');
  } catch (error) {
    console.error('ERROR - saveClimateData - Exception:', error);
    throw error;
  }
};
