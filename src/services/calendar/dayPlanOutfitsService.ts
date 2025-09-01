import { supabase } from '../core';

export interface DayPlanOutfit {
  id?: string;
  day_plan_id: string;
  outfit_id: string;
  user_id: string;
  created_at?: string;
}

/**
 * Get all outfit IDs for a specific day plan
 */
export const getOutfitIdsForDayPlan = async (dayPlanId: string): Promise<string[]> => {
  const { data, error } = await supabase
    .from('day_plan_outfits')
    .select('outfit_id')
    .eq('day_plan_id', dayPlanId);
  
  if (error) {
    // Error handling for fetching outfit IDs for day plan
    return [];
  }
  
  const outfitIds = data.map((item) => {
    // Ensure outfit_id is a string
    if (typeof item.outfit_id === 'string') {
      return item.outfit_id;
    }
    // Fallback to empty string if not a string (shouldn't happen with proper DB schema)
    return String(item.outfit_id || '');
  });
  return outfitIds;
};

/**
 * Add multiple outfits to a day plan
 */
export const addOutfitsToDayPlan = async (
  dayPlanId: string,
  outfitIds: string[],
  userId: string
): Promise<boolean> => {
  if (!outfitIds.length) {
    return true;
  }
  
  // Create records to insert
  const outfitsToInsert = outfitIds.map(outfitId => ({
    day_plan_id: dayPlanId,
    outfit_id: outfitId,
    user_id: userId
  }));
  
  const { error } = await supabase
    .from('day_plan_outfits')
    .upsert(outfitsToInsert, { onConflict: 'day_plan_id,outfit_id' });
  
  if (error) {
    // Error handling for adding outfits to day plan
    return false;
  }
  
  // Successfully added outfits to day plan
  return true;
};

/**
 * Update outfits for a day plan (remove existing and add new)
 */
export const updateOutfitsForDayPlan = async (
  dayPlanId: string,
  outfitIds: string[],
  userId: string
): Promise<boolean> => {
  // Updating outfits for day plan
  
  try {
    // First, remove all existing outfit associations
    const { error: deleteError } = await supabase
      .from('day_plan_outfits')
      .delete()
      .eq('day_plan_id', dayPlanId);
    
    if (deleteError) {
      // Error handling for removing existing outfits from day plan
      return false;
    }
    
    // Then add the new outfit associations
    if (outfitIds.length > 0) {
      return await addOutfitsToDayPlan(dayPlanId, outfitIds, userId);
    }
    
    return true;
  } catch (error) {
    // Error handling for updating outfits for day plan
    return false;
  }
};

/**
 * Remove all outfits from a day plan
 */
export const removeOutfitsFromDayPlan = async (dayPlanId: string): Promise<boolean> => {
  // Removing all outfits from day plan
  
  const { error } = await supabase
    .from('day_plan_outfits')
    .delete()
    .eq('day_plan_id', dayPlanId);
  
  if (error) {
    // Error handling for removing outfits from day plan
    return false;
  }
  
  // Successfully removed all outfits from day plan
  return true;
};

/**
 * Get all day plans that include a specific outfit
 */
export const getDayPlansForOutfit = async (outfitId: string, userId: string): Promise<string[]> => {
  // Getting day plans for outfit
  
  const { data, error } = await supabase
    .from('day_plan_outfits')
    .select('day_plan_id')
    .eq('outfit_id', outfitId)
    .eq('user_id', userId);
  
  if (error) {
    // Error handling for fetching day plans for outfit
    return [];
  }
  
  const dayPlanIds = (data as { day_plan_id: string }[]).map(item => item.day_plan_id);
  // Found day plans for outfit
  return dayPlanIds;
};
