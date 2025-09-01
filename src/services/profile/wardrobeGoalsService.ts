import { supabase } from '../core/supabaseClient';
import { WardrobeGoalsData } from '../../types';

/**
 * Validates WardrobeGoalsData structure
 * @param data The data to validate
 * @returns boolean indicating if data is valid
 */
const validateWardrobeGoalsData = (data: any): data is WardrobeGoalsData => {
  if (!data || typeof data !== 'object') {
    console.error('WardrobeGoalsData validation failed: data is not an object');
    return false;
  }

  if (!Array.isArray(data.wardrobeGoals)) {
    console.error('WardrobeGoalsData validation failed: wardrobeGoals must be an array');
    return false;
  }

  if (data.otherWardrobeGoal !== undefined && typeof data.otherWardrobeGoal !== 'string') {
    console.error('WardrobeGoalsData validation failed: otherWardrobeGoal must be a string or undefined');
    return false;
  }

  return true;
};

/**
 * Maps database row to WardrobeGoalsData interface
 * @param dbRow Raw data from Supabase
 * @returns WardrobeGoalsData object
 */
const mapDbRowToWardrobeGoalsData = (dbRow: any): WardrobeGoalsData => {
  console.log('DEBUG - mapDbRowToWardrobeGoalsData - Input:', dbRow);
  
  const mapped: WardrobeGoalsData = {
    wardrobeGoals: Array.isArray(dbRow?.wardrobe_goals) ? dbRow.wardrobe_goals : [],
    otherWardrobeGoal: dbRow?.other_wardrobe_goal || undefined
  };
  
  console.log('DEBUG - mapDbRowToWardrobeGoalsData - Mapped:', mapped);
  return mapped;
};

/**
 * Maps WardrobeGoalsData to database format
 * @param wardrobeGoalsData WardrobeGoalsData to map
 * @returns Object with database column names
 */
const mapWardrobeGoalsDataToDb = (wardrobeGoalsData: WardrobeGoalsData) => {
  console.log('DEBUG - mapWardrobeGoalsDataToDb - Input:', wardrobeGoalsData);
  
  const dbData = {
    wardrobe_goals: wardrobeGoalsData.wardrobeGoals,
    other_wardrobe_goal: wardrobeGoalsData.otherWardrobeGoal || null
  };
  
  console.log('DEBUG - mapWardrobeGoalsDataToDb - Output:', dbData);
  return dbData;
};

/**
 * Gets wardrobe goals data for a user
 * @param userId The user ID to get wardrobe goals data for
 * @returns Promise with WardrobeGoalsData or null if not found
 */
export const getWardrobeGoalsData = async (userId: string): Promise<WardrobeGoalsData | null> => {
  console.log('DEBUG - getWardrobeGoalsData - ENTRY POINT with userId:', userId);
  
  if (!userId) {
    console.error('ERROR - getWardrobeGoalsData - Missing userId');
    throw new Error('Missing userId');
  }

  try {
    console.log('DEBUG - getWardrobeGoalsData - Fetching wardrobe goals data from Supabase');
    
    // Select only the wardrobe goals columns
    const { data, error } = await supabase
      .from('user_preferences')
      .select('wardrobe_goals, other_wardrobe_goal')
      .eq('user_id', userId)
      .single();

    console.log('DEBUG - getWardrobeGoalsData - Raw data from Supabase:', data);
    console.log('DEBUG - getWardrobeGoalsData - Error from Supabase:', error);

    if (error) {
      if (error.code === 'PGRST116') {
        console.log('DEBUG - getWardrobeGoalsData - No wardrobe goals data found for user, returning null');
        return null;
      }
      throw error;
    }

    if (!data) {
      console.log('DEBUG - getWardrobeGoalsData - No data returned, returning null');
      return null;
    }

    const wardrobeGoalsData = mapDbRowToWardrobeGoalsData(data);
    console.log('DEBUG - getWardrobeGoalsData - Final mapped wardrobe goals data:', wardrobeGoalsData);
    
    return wardrobeGoalsData;
  } catch (error) {
    console.error('ERROR - getWardrobeGoalsData - Exception:', error);
    throw error;
  }
};

/**
 * Saves wardrobe goals data for a user
 * @param userId The user ID to save wardrobe goals data for
 * @param wardrobeGoalsData The wardrobe goals data to save
 * @returns Promise that resolves when save is complete
 */
export const saveWardrobeGoalsData = async (userId: string, wardrobeGoalsData: WardrobeGoalsData): Promise<void> => {
  console.log('DEBUG - saveWardrobeGoalsData - ENTRY POINT');
  console.log('DEBUG - saveWardrobeGoalsData - userId:', userId);
  console.log('DEBUG - saveWardrobeGoalsData - wardrobeGoalsData:', wardrobeGoalsData);

  if (!userId) {
    console.error('ERROR - saveWardrobeGoalsData - Missing userId');
    throw new Error('Missing userId');
  }

  if (!wardrobeGoalsData) {
    console.error('ERROR - saveWardrobeGoalsData - Missing wardrobeGoalsData');
    throw new Error('Missing wardrobeGoalsData');
  }

  // Validate the data before saving
  if (!validateWardrobeGoalsData(wardrobeGoalsData)) {
    console.error('ERROR - saveWardrobeGoalsData - Invalid wardrobeGoalsData');
    throw new Error('Invalid wardrobeGoalsData');
  }

  try {
    console.log('DEBUG - saveWardrobeGoalsData - Preparing database payload');
    const dbPayload = mapWardrobeGoalsDataToDb(wardrobeGoalsData);
    console.log('DEBUG - saveWardrobeGoalsData - Database payload:', dbPayload);

    // Check if user has any preferences record
    const { data: existingData, error: fetchError } = await supabase
      .from('user_preferences')
      .select('user_id')
      .eq('user_id', userId)
      .single();

    console.log('DEBUG - saveWardrobeGoalsData - Existing data check:', existingData);
    console.log('DEBUG - saveWardrobeGoalsData - Fetch error:', fetchError);

    let result;
    if (existingData) {
      // Update existing record
      console.log('DEBUG - saveWardrobeGoalsData - Updating existing record');
      result = await supabase
        .from('user_preferences')
        .update(dbPayload)
        .eq('user_id', userId)
        .select();
    } else {
      // Insert new record
      console.log('DEBUG - saveWardrobeGoalsData - Inserting new record');
      result = await supabase
        .from('user_preferences')
        .insert({
          user_id: userId,
          ...dbPayload
        })
        .select();
    }

    console.log('DEBUG - saveWardrobeGoalsData - Save result:', result);

    if (result.error) {
      console.error('ERROR - saveWardrobeGoalsData - Supabase error:', result.error);
      throw result.error;
    }

    console.log('DEBUG - saveWardrobeGoalsData - Wardrobe goals data saved successfully');
  } catch (error) {
    console.error('ERROR - saveWardrobeGoalsData - Exception:', error);
    throw error;
  }
};
