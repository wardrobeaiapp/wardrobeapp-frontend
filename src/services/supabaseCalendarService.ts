import { supabase } from './core';
import { DayPlan } from '../types';
import * as dayPlanItemsService from './dayPlanItemsService';
import * as dayPlanOutfitsService from './dayPlanOutfitsService';
import { formatDateToYYYYMMDD } from '../utils/calendarUtils';

// Helper function to map snake_case DB fields to camelCase TypeScript fields
const mapToCamelCase = (data: any, itemIds: string[] = [], outfitIds: string[] = []): DayPlan => {
  if (!data) return data;
  
  return {
    ...data,
    userId: data.user_id,
    // Use provided itemIds from join table if available, otherwise fallback to array in day_plans
    itemIds: itemIds.length > 0 ? itemIds : (data.item_ids || []),
    // Use provided outfitIds from join table if available, otherwise fallback to array in day_plans
    outfitIds: outfitIds.length > 0 ? outfitIds : (data.outfit_ids || []),
    createdAt: data.created_at,
    updatedAt: data.updated_at
  } as DayPlan;
};

// Table name for day plans
const TABLE_NAME = 'day_plans';

/**
 * Get all day plans for a user
 * @param userId The user ID to fetch day plans for
 * @returns Array of day plans
 */
export const getDayPlans = async (userId: string): Promise<DayPlan[]> => {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('user_id', userId);
      
    if (error) {
      // Error handling for fetching day plans
      throw error;
    }
    
    if (!data || data.length === 0) {
      return [];
    }
    
    // Process day plans from database
    
    // Fetch items and outfits for each day plan from the join tables
    const dayPlansWithRelations = await Promise.all(data.map(async (plan) => {
      const itemIds = await dayPlanItemsService.getItemsForDayPlan(plan.id as string);
      const outfitIds = await dayPlanOutfitsService.getOutfitIdsForDayPlan(plan.id as string);
      return mapToCamelCase(plan, itemIds, outfitIds);
    }));
    
    return dayPlansWithRelations;
  } catch (error) {
    // Error handling for fetching day plans
    throw error;
  }
};

/**
 * Get a specific day plan by ID
 * @param id The day plan ID
 * @returns The day plan or null if not found
 */
export const getDayPlanById = async (id: string): Promise<DayPlan | null> => {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned (not found)
        return null;
      }
      throw error;
    }
    
    // Fetch items and outfits from the join tables
    const itemIds = await dayPlanItemsService.getItemsForDayPlan(id);
    const outfitIds = await dayPlanOutfitsService.getOutfitIdsForDayPlan(id);
    return mapToCamelCase(data, itemIds, outfitIds);
  } catch (error) {
    // Error handling for fetching day plan by ID
    throw error;
  }
};

/**
 * Get day plans for a specific date
 * @param userId The user ID
 * @param date The date to fetch plans for (ISO string format)
 * @returns Day plan for the specified date or null if not found
 */
export const getDayPlanByDate = async (userId: string, date: string): Promise<DayPlan | null> => {
  try {
    // Format date to YYYY-MM-DD using our consistent formatter
    const dateObj = new Date(date);
    const formattedDate = formatDateToYYYYMMDD(dateObj);
    
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('user_id', userId)
      .eq('date', formattedDate)
      .maybeSingle();
      
    if (error) {
      // Error handling for fetching day plan by date
      throw error;
    }
    
    if (!data) {
      return null;
    }
    
    // Fetch items and outfits from the join tables
    const itemIds = await dayPlanItemsService.getItemsForDayPlan(data.id as string);
    const outfitIds = await dayPlanOutfitsService.getOutfitIdsForDayPlan(data.id as string);
    
    const mappedData = mapToCamelCase(data, itemIds, outfitIds);
    
    return mappedData;
  } catch (error) {
    // Error handling in getDayPlanByDate
    throw error;
  }
};

/**
 * Upsert a day plan (create if it doesn't exist, update if it does)
 * @param dayPlan The day plan to upsert
 * @returns The created or updated day plan
 */
export const upsertDayPlan = async (dayPlan: Omit<DayPlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<DayPlan> => {
  try {
    // Format date to YYYY-MM-DD for Postgres
    const formattedDate = new Date(dayPlan.date).toISOString().split('T')[0];
    
    // Check if a plan already exists for this date
    const existingPlan = await getDayPlanByDate(dayPlan.userId, formattedDate);
    
    let result;
    let dayPlanId;
    
    if (existingPlan) {
      // Update existing plan
      dayPlanId = existingPlan.id;
      
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .update({
          outfit_ids: dayPlan.outfitIds || [],
          // Keep item_ids for backward compatibility, but we'll use the join table going forward
          item_ids: dayPlan.itemIds || [],
          notes: dayPlan.notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingPlan.id)
        .select('*')
        .single();
        
      if (error) {
        // Error handling for updating day plan
        throw error;
      }
      
      result = data;
    } else {
      // Create new plan
      
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .insert({
          user_id: dayPlan.userId,
          date: formattedDate,
          outfit_ids: dayPlan.outfitIds || [],
          // Keep item_ids for backward compatibility, but we'll use the join table going forward
          item_ids: dayPlan.itemIds || [],
          notes: dayPlan.notes
        })
        .select('*')
        .single();
        
      if (error) {
        // Error handling for creating day plan
        throw error;
      }
      
      result = data;
      dayPlanId = result.id;
      // Day plan created successfully
    }
    
    // Update items in the join table
    if (dayPlanId && dayPlan.itemIds && dayPlan.itemIds.length > 0) {
      // Updating items in join table for day plan
      // Ensure userId is always a string, handling the case where it might be an empty object
      let userId = '';
      if (typeof dayPlan.userId === 'string') {
        userId = dayPlan.userId;
      } else if (dayPlan.userId && typeof dayPlan.userId === 'object') {
        // Handle empty object case
        userId = Object.keys(dayPlan.userId).length === 0 ? '' : String(dayPlan.userId);
      } else if (dayPlan.userId) {
        // Handle any other non-null/undefined value
        userId = String(dayPlan.userId);
      }
      // Ensure userId is a string and itemIds is an array before passing to updateDayPlanItems
      const itemIdsArray = Array.isArray(dayPlan.itemIds) ? dayPlan.itemIds : [];
      // Make sure userId is always a string, even if it's an empty object
      const userIdString = typeof userId === 'object' ? '' : String(userId || '');
      // Make sure dayPlanId is always a string, even if it's an empty object
      const dayPlanIdString = typeof dayPlanId === 'object' ? '' : String(dayPlanId || '');
      await dayPlanItemsService.updateDayPlanItems(dayPlanIdString, itemIdsArray, userIdString);
    } else if (dayPlanId) {
      // If no items, clear any existing items
      // Ensure dayPlanId is a string
      const dayPlanIdString = typeof dayPlanId === 'object' ? 
        (Object.keys(dayPlanId).length === 0 ? '' : String(dayPlanId)) : 
        String(dayPlanId);
      await dayPlanItemsService.deleteAllItemsForDayPlan(dayPlanIdString);
    }
    
    // Update outfits in the join table
    if (dayPlanId && dayPlan.outfitIds) {
      // Ensure outfitIds is an array
      const outfitIdsArray = Array.isArray(dayPlan.outfitIds) ? dayPlan.outfitIds : [];
      
      if (outfitIdsArray.length > 0) {
        // Updating outfits in join table for day plan
        // Ensure userId is a string before passing it to updateOutfitsForDayPlan
        let userIdString = '';
        if (typeof dayPlan.userId === 'string') {
          userIdString = dayPlan.userId;
        } else if (dayPlan.userId && typeof dayPlan.userId === 'object') {
          // Handle empty object case
          userIdString = Object.keys(dayPlan.userId).length === 0 ? '' : String(dayPlan.userId || '');
        } else if (dayPlan.userId) {
          // Handle any other non-null/undefined value
          userIdString = String(dayPlan.userId);
        }
        // Final check to ensure userIdString is always a string
        userIdString = typeof userIdString === 'object' ? '' : String(userIdString || '');
        // Ensure dayPlanId is a string
        const dayPlanIdString = typeof dayPlanId === 'object' ? 
          (Object.keys(dayPlanId).length === 0 ? '' : String(dayPlanId)) : 
          String(dayPlanId);
        await dayPlanOutfitsService.updateOutfitsForDayPlan(dayPlanIdString, outfitIdsArray, userIdString);
      }
    } else if (dayPlanId) {
      // If no outfits, clear any existing outfits
      // Ensure dayPlanId is a string
      const dayPlanIdString = typeof dayPlanId === 'object' ? 
        (Object.keys(dayPlanId).length === 0 ? '' : String(dayPlanId)) : 
        String(dayPlanId);
      await dayPlanOutfitsService.removeOutfitsFromDayPlan(dayPlanIdString);
    }
    
    // Fetch the updated items and outfits from the join tables
    // Ensure dayPlanId is a string with a safer approach
    let dayPlanIdForFetch = '';
    if (dayPlanId === null || dayPlanId === undefined) {
      dayPlanIdForFetch = '';
    } else if (typeof dayPlanId === 'object') {
      // Only call Object.keys if we're sure it's a non-null object
      try {
        dayPlanIdForFetch = Object.keys(dayPlanId).length === 0 ? '' : String(dayPlanId);
      } catch (e) {
        // If any error occurs with Object.keys, use empty string
        dayPlanIdForFetch = '';
      }
    } else {
      // For all other types, convert to string
      dayPlanIdForFetch = String(dayPlanId);
    }
    const itemIds = await dayPlanItemsService.getItemsForDayPlan(dayPlanIdForFetch);
    const outfitIds = await dayPlanOutfitsService.getOutfitIdsForDayPlan(dayPlanIdForFetch);
    return mapToCamelCase(result, itemIds, outfitIds);
  } catch (error) {
    // Error handling in upsertDayPlan
    throw error;
  }
};

/**
 * Create a new day plan (legacy method, use upsertDayPlan instead)
 * @deprecated Use upsertDayPlan instead
 * @param dayPlan The day plan to create
 * @returns The created day plan
 */
export const createDayPlan = async (dayPlan: Omit<DayPlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<DayPlan> => {
  // Deprecated method warning
  return upsertDayPlan(dayPlan);
};

/**
 * Update an existing day plan
 * @param id The day plan ID to update
 * @param dayPlan The updated day plan data
 * @returns The updated day plan
 */
export const updateDayPlan = async (id: string, dayPlan: Partial<DayPlan>): Promise<DayPlan> => {
  try {
    // Update day plan with provided data
    
    // Get the existing day plan to merge with updates
    const existingPlan = await getDayPlanById(id);
    
    if (!existingPlan) {
      throw new Error(`Day plan with ID ${id} not found`);
    }
    
    // Retrieved existing plan for update
    
    // Prepare the data for update
    const updateData: any = {
      updated_at: new Date().toISOString()
    };
    
    // Only include fields that are provided in the update
    if (dayPlan.outfitIds !== undefined) {
      // Keep outfit_ids for backward compatibility, but we'll use the join table going forward
      updateData.outfit_ids = dayPlan.outfitIds;
      
      // Update outfits in the join table
      if (dayPlan.userId) {
        await dayPlanOutfitsService.updateOutfitsForDayPlan(id, dayPlan.outfitIds, dayPlan.userId);
      } else if (existingPlan.userId) {
        await dayPlanOutfitsService.updateOutfitsForDayPlan(id, dayPlan.outfitIds, existingPlan.userId);
      }
    }
    
    if (dayPlan.itemIds !== undefined) {
      // Keep item_ids for backward compatibility, but we'll use the join table going forward
      updateData.item_ids = dayPlan.itemIds;
      
      // Update items in the join table
      if (dayPlan.userId) {
        await dayPlanItemsService.updateDayPlanItems(id, dayPlan.itemIds, dayPlan.userId);
      } else if (existingPlan.userId) {
        await dayPlanItemsService.updateDayPlanItems(id, dayPlan.itemIds, existingPlan.userId);
      }
    }
    
    if (dayPlan.notes !== undefined) {
      updateData.notes = dayPlan.notes;
    }
    
    // Prepared update data for Supabase
    
    // Update the day plan
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();
      
    if (error) {
      // Error handling for updating day plan
      throw error;
    }
    
    // Successfully updated day plan
    
    // Fetch the updated items and outfits from the join tables
    const itemIds = await dayPlanItemsService.getItemsForDayPlan(id);
    const outfitIds = await dayPlanOutfitsService.getOutfitIdsForDayPlan(id);
    return mapToCamelCase(data, itemIds, outfitIds);
  } catch (error) {
    // Error handling in updateDayPlan
    throw error;
  }
};

/**
 * Delete a day plan
 * @param id The day plan ID to delete
 * @returns True if successful
 */
export const deleteDayPlan = async (id: string): Promise<boolean> => {
  try {
    // Delete day plan with provided ID
    
    // Delete all items and outfits from the join tables first
    await dayPlanItemsService.deleteAllItemsForDayPlan(id);
    await dayPlanOutfitsService.removeOutfitsFromDayPlan(id);
    
    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('id', id);
      
    if (error) {
      // Error handling for deleting day plan
      throw error;
    }
    
    // Successfully deleted day plan
    return true;
  } catch (error) {
    // Error handling in deleteDayPlan
    throw error;
  }
};

/**
 * Delete a day plan by date
 * @param userId The user ID
 * @param date The date to delete the plan for (ISO string format)
 * @returns True if successful
 */
export const deleteDayPlanByDate = async (userId: string, date: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('user_id', userId)
      .eq('date', date);
      
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    // Error handling for deleting day plan by date
    throw error;
  }
};
