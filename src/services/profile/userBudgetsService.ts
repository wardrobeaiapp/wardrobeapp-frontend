import { supabase } from '../core';


/**
 * Unified User Budgets Data Interface
 * Contains both shopping limits and clothing budgets in a single row per user
 */
export interface UserBudgetsData {
  // Shared fields
  currency: string;
  periodStartDate?: string;
  periodEndDate?: string;
  
  // Shopping Limit fields
  shoppingLimitAmount?: number;
  shoppingLimitFrequency: 'monthly' | 'quarterly' | 'yearly';
  shoppingLimitUsed: number;
  
  // Clothing Budget fields
  clothingBudgetAmount: number;
  clothingBudgetFrequency: 'monthly' | 'quarterly' | 'yearly';
  clothingCurrentSpent: number;
}

/**
 * Shopping Limit Data (extracted from UserBudgetsData)
 */
export interface ShoppingLimitData {
  shoppingLimitAmount?: number;
  shoppingLimitFrequency: 'monthly' | 'quarterly' | 'yearly';
  shoppingLimitUsed: number;
  periodStartDate?: string;
  periodEndDate?: string;
}

/**
 * Clothing Budget Data (extracted from UserBudgetsData)  
 */
export interface ClothingBudgetData {
  amount: number;
  currency: string;
  frequency: 'monthly' | 'quarterly' | 'yearly';
  currentSpent: number;
  periodStartDate?: string;
  periodEndDate?: string;
}

/**
 * Fetch unified user budgets data for a specific user from user_budgets table
 */
export async function getUserBudgetsData(userId: string): Promise<UserBudgetsData> {

  try {
    // Query user_progress table for user's unified budget data
    const { data, error } = await supabase
      .from('user_progress')
      .select(`
        shopping_limit_amount,
        shopping_limit_frequency,
        clothing_budget_amount,
        clothing_budget_currency,
        shopping_period_start_date,
        shopping_period_end_date
      `)
      .eq('user_id', userId)
      .order('id', { ascending: false })
      .limit(1);

    if (error) {
      // Log the actual error details to understand what's happening
      
      // If no record exists, this is expected for new users
      if (error.code === 'PGRST116') {
        return {
          currency: 'USD',
          periodStartDate: undefined,
          periodEndDate: undefined,
          shoppingLimitAmount: undefined,
          shoppingLimitFrequency: 'monthly',
          shoppingLimitUsed: 0,
          clothingBudgetAmount: 0,
          clothingBudgetFrequency: 'monthly',
          clothingCurrentSpent: 0
        };
      }
      
      // For now, also handle other errors gracefully
      return {
        currency: 'USD',
        periodStartDate: undefined,
        periodEndDate: undefined,
        shoppingLimitAmount: undefined,
        shoppingLimitFrequency: 'monthly',
        shoppingLimitUsed: 0,
        clothingBudgetAmount: 0,
        clothingBudgetFrequency: 'monthly',
        clothingCurrentSpent: 0
      };
    }

    // Handle case where no data is returned
    if (!data || data.length === 0) {
      return {
        currency: 'USD',
        periodStartDate: undefined,
        periodEndDate: undefined,
        shoppingLimitAmount: undefined,
        shoppingLimitFrequency: 'monthly',
        shoppingLimitUsed: 0,
        clothingBudgetAmount: 0,
        clothingBudgetFrequency: 'monthly',
        clothingCurrentSpent: 0
      };
    }

    // Get the first record from the array (most recent due to ordering)
    const record = data[0];
    
    // Map database fields to UserBudgetsData interface
    const mappedData: UserBudgetsData = {
      currency: 'USD', // Default currency since shopping limit doesn't need it and clothing budget can use default
      periodStartDate: (record && typeof record.shopping_period_start_date === 'string') ? record.shopping_period_start_date : undefined,
      periodEndDate: (record && typeof record.shopping_period_end_date === 'string') ? record.shopping_period_end_date : undefined,
      shoppingLimitAmount: (record && typeof record.shopping_limit_amount === 'number') ? record.shopping_limit_amount : undefined,
      shoppingLimitFrequency: (record?.shopping_limit_frequency as 'monthly' | 'quarterly' | 'yearly') || 'monthly',
      shoppingLimitUsed: 0,
      clothingBudgetAmount: (record && typeof record.clothing_budget_amount === 'number') ? record.clothing_budget_amount : 0,
      clothingBudgetFrequency: 'monthly', // Default since we don't query this column
      clothingCurrentSpent: 0
    };

    return mappedData;

  } catch (error) {
    console.error('💰 UserBudgetsService - Error fetching user budgets data:', error);
    throw error;
  }
}

/**
 * Save unified user budgets data for a specific user to user_budgets table
 */
export async function saveUserBudgetsData(userId: string, userBudgetsData: UserBudgetsData): Promise<void> {

  try {
    // Map UserBudgetsData interface to database fields
    const dbData = {
      user_id: userId,
      shopping_period_start_date: userBudgetsData.periodStartDate || null,
      shopping_period_end_date: userBudgetsData.periodEndDate || null,
      shopping_limit_amount: userBudgetsData.shoppingLimitAmount || null,
      shopping_limit_frequency: userBudgetsData.shoppingLimitFrequency,

      clothing_budget_amount: userBudgetsData.clothingBudgetAmount || 0,
      clothing_budget_frequency: userBudgetsData.clothingBudgetFrequency
    };


    // Use upsert to handle both insert and update cases
    const { error } = await supabase
      .from('user_progress')
      .upsert(dbData)
      .select();

    if (error) {
      console.error('💰 UserBudgetsService - Supabase error saving user budgets data:', error);
      throw error;
    }


  } catch (error) {
    console.error('💰 UserBudgetsService - Error saving user budgets data:', error);
    throw error;
  }
}

/**
 * Get shopping limit data only (optimized query for shopping limit section)
 */
export async function getShoppingLimitData(userId: string): Promise<ShoppingLimitData> {

  try {
    // Query only shopping limit specific columns - get most recent record if multiple exist
    // Use ID-based ordering for consistent results
    const { data, error } = await supabase
      .from('user_progress')
      .select('shopping_limit_amount, shopping_limit_frequency, shopping_limit_used, id')
      .eq('user_id', userId)
      .order('id', { ascending: false })
      .limit(1);

    if (error) {
      // Log the actual error details to understand what's happening
      console.error('🛍️ UserBudgetsService - Supabase error fetching shopping limit data:', error);
      
      if (error.code === 'PGRST116') {
        // No rows found - new user, return default values
        return {
          shoppingLimitAmount: undefined,
          shoppingLimitFrequency: 'monthly',
          shoppingLimitUsed: 0,
          periodStartDate: undefined,
          periodEndDate: undefined
        };
      }
      
      throw error;
    }

    // Handle case where no data is returned
    if (!data || data.length === 0) {
      return {
        shoppingLimitAmount: undefined,
        shoppingLimitFrequency: 'monthly',
        shoppingLimitUsed: 0,
        periodStartDate: undefined,
        periodEndDate: undefined
      };
    }

    // Get the first record from the array
    const record = data[0];
    
    // Map database fields to ShoppingLimitData interface
    const mappedData: ShoppingLimitData = {
      shoppingLimitAmount: (record && typeof record.shopping_limit_amount === 'number') ? record.shopping_limit_amount : undefined,
      shoppingLimitFrequency: (record?.shopping_limit_frequency as 'monthly' | 'quarterly' | 'yearly') || 'monthly',
      shoppingLimitUsed: (record && typeof record.shopping_limit_used === 'number') ? record.shopping_limit_used : 0,
      periodStartDate: undefined,
      periodEndDate: undefined
    };

    return mappedData;

  } catch (error) {
    console.error('🛍️ UserBudgetsService - Error fetching shopping limit data:', error);
    throw error;
  }
}

/**
 * Get clothing budget data only (optimized fetch for clothing budget section)
 */
export async function getClothingBudgetData(userId: string): Promise<ClothingBudgetData> {

  try {
    // Query only clothing budget specific columns - get most recent record if multiple exist
    // Query only clothing budget specific columns - get most recent record if multiple exist
    const { data, error } = await supabase
      .from('user_progress')
      .select('clothing_budget_amount, clothing_budget_currency, clothing_budget_frequency, clothing_current_spent, id')
      .eq('user_id', userId)
      .order('id', { ascending: false })
      .limit(1);

    if (error) {
      // Log the actual error details to understand what's happening
      console.error('👕 UserBudgetsService - Supabase error fetching clothing budget data:', error);
      
      if (error.code === 'PGRST116') {
        // No rows found - new user, return default values
        return {
          amount: 0,
          currency: 'USD',
          frequency: 'monthly',
          currentSpent: 0,
          periodStartDate: undefined,
          periodEndDate: undefined
        };
      }
      
      throw error;
    }

    // Handle case where no data is returned
    if (!data || data.length === 0) {
      return {
        amount: 0,
        currency: 'USD',
        frequency: 'monthly',
        currentSpent: 0,
        periodStartDate: undefined,
        periodEndDate: undefined
      };
    }

    // Get the first record from the array (most recent due to ordering)
    const record = data[0];
    
    // Map database fields to ClothingBudgetData interface
    const mappedData: ClothingBudgetData = {
      amount: (record && typeof record.clothing_budget_amount === 'number') ? record.clothing_budget_amount : 0,
      currency: (record?.clothing_budget_currency as string) || 'USD',
      frequency: (record?.clothing_budget_frequency as 'monthly' | 'quarterly' | 'yearly') || 'monthly',
      currentSpent: (record && typeof record.clothing_current_spent === 'number') ? record.clothing_current_spent : 0,
      periodStartDate: undefined,
      periodEndDate: undefined
    };

    return mappedData;

  } catch (error) {
    console.error('👕 UserBudgetsService - Error fetching clothing budget data:', error);
    throw error;
  }
}

/**
 * Save clothing budget data only (optimized save for clothing budget section)
 */
export async function saveClothingBudgetData(userId: string, clothingBudgetData: ClothingBudgetData): Promise<ClothingBudgetData> {
  try {
    
    // First fetch ANY existing record for this user to determine update vs insert
    const { data: existingData, error: fetchError } = await supabase
      .from('user_progress')
      .select('shopping_limit_amount, shopping_limit_frequency, shopping_period_start_date, shopping_period_end_date, clothing_budget_amount, clothing_budget_currency, clothing_budget_frequency, id')
      .eq('user_id', userId)
      .order('id', { ascending: false })
      .limit(1);

    if (fetchError) {
      console.error('👕 UserBudgetsService - Error fetching existing data for preservation:', fetchError);
      // Continue with save even if fetch fails - just save new data
    }

    // Preserve existing shopping limit data if available
    const existingRecord = existingData?.[0];
    

    // Simply UPDATE the existing record - no new records, no complex logic
    let error;
    
    if (existingRecord?.id) {
      // Update the existing record - no timestamps needed
      const result = await supabase
        .from('user_progress')
        .update({
          clothing_budget_amount: clothingBudgetData.amount || null,
          clothing_budget_currency: clothingBudgetData.currency || 'USD',
          clothing_budget_frequency: clothingBudgetData.frequency || 'monthly'
        })
        .eq('id', existingRecord.id)
        .select();
      error = result.error;
    } else {
      // Create new record only if none exists - no timestamps needed
      const result = await supabase
        .from('user_progress')
        .insert({
          user_id: userId,
          clothing_budget_amount: clothingBudgetData.amount || null,
          clothing_budget_currency: clothingBudgetData.currency || 'USD',
          clothing_budget_frequency: clothingBudgetData.frequency || 'monthly'
        })
        .select();
      error = result.error;
    }

    if (error) {
      console.error('👕 UserBudgetsService - Supabase error saving clothing budget data:', error);
      throw error;
    }


    // Return the saved clothing budget data
    return {
      amount: clothingBudgetData.amount,
      currency: clothingBudgetData.currency,
      frequency: clothingBudgetData.frequency,
      currentSpent: clothingBudgetData.currentSpent,
      periodStartDate: clothingBudgetData.periodStartDate,
      periodEndDate: clothingBudgetData.periodEndDate
    };

  } catch (error) {
    console.error('👕 UserBudgetsService - Error saving clothing budget data:', error);
    throw error;
  }
}

/**
 * Save shopping limit data only (optimized save for shopping limit section)
 */
export async function saveShoppingLimitData(userId: string, shoppingLimitData: ShoppingLimitData): Promise<void> {

  try {
    // First fetch ANY existing record for this user to determine update vs insert
    const { data: existingData, error: fetchError } = await supabase
      .from('user_progress')
      .select('shopping_limit_amount, shopping_limit_frequency, shopping_period_start_date, shopping_period_end_date, clothing_budget_amount, clothing_budget_currency, clothing_budget_frequency, id')
      .eq('user_id', userId)
      .order('id', { ascending: false })
      .limit(1);

    if (fetchError) {
      console.error('🛍️ UserBudgetsService - Error fetching existing shopping limit data:', fetchError);
      throw fetchError;
    }

    const existingRecord = existingData?.[0];
    console.log('🛍️ UserBudgetsService - Existing record found:', existingRecord?.id ? 'Yes' : 'No');

    // Use update-or-insert logic to prevent duplicate records (same as clothing budget)
    let error;
    
    if (existingRecord?.id) {
      // Update the existing record - preserve clothing budget data
      const result = await supabase
        .from('user_progress')
        .update({
          shopping_limit_amount: shoppingLimitData.shoppingLimitAmount || null,
          shopping_limit_frequency: shoppingLimitData.shoppingLimitFrequency
        })
        .eq('id', existingRecord.id)
        .select();
      error = result.error;
    } else {
      // Create new record only if none exists
      const result = await supabase
        .from('user_progress')
        .insert({
          user_id: userId,
          shopping_limit_amount: shoppingLimitData.shoppingLimitAmount || null,
          shopping_limit_frequency: shoppingLimitData.shoppingLimitFrequency
        })
        .select();
      error = result.error;
    }

    if (error) {
      console.error('🛍️ UserBudgetsService - Supabase error saving shopping limit data:', error);
      throw error;
    }

    console.log('🛍️ UserBudgetsService - Successfully saved shopping limit data');

  } catch (error) {
    console.error('🛍️ UserBudgetsService - Error saving shopping limit data:', error);
    throw error;
  }
}

/**
 * Extract shopping limit data from unified user budgets data
 */
export function extractShoppingLimitData(userBudgetsData: UserBudgetsData): ShoppingLimitData {
  return {
    shoppingLimitAmount: userBudgetsData.shoppingLimitAmount,
    shoppingLimitFrequency: userBudgetsData.shoppingLimitFrequency,
    shoppingLimitUsed: userBudgetsData.shoppingLimitUsed,
    periodStartDate: userBudgetsData.periodStartDate,
    periodEndDate: userBudgetsData.periodEndDate
  };
}

/**
 * Extract clothing budget data from unified user budgets data
 */
export function extractClothingBudgetData(userBudgetsData: UserBudgetsData): ClothingBudgetData {
  return {
    amount: userBudgetsData.clothingBudgetAmount,
    currency: userBudgetsData.currency,
    frequency: userBudgetsData.clothingBudgetFrequency,
    currentSpent: userBudgetsData.clothingCurrentSpent,
    periodStartDate: userBudgetsData.periodStartDate,
    periodEndDate: userBudgetsData.periodEndDate
  };
}

/**
 * Update shopping limit portion of unified user budgets
 */
export async function updateShoppingLimitData(userId: string, shoppingLimitData: ShoppingLimitData): Promise<void> {
  // First get existing data
  const existingData = await getUserBudgetsData(userId);
  
  // Merge shopping limit updates with existing data
  const updatedData: UserBudgetsData = {
    ...existingData,
    shoppingLimitAmount: shoppingLimitData.shoppingLimitAmount,
    shoppingLimitFrequency: shoppingLimitData.shoppingLimitFrequency,
    shoppingLimitUsed: shoppingLimitData.shoppingLimitUsed,
    periodStartDate: shoppingLimitData.periodStartDate,
    periodEndDate: shoppingLimitData.periodEndDate
  };
  
  // Save merged data
  await saveUserBudgetsData(userId, updatedData);
}

/**
 * Update clothing budget portion of unified user budgets
 */
export async function updateClothingBudgetData(userId: string, clothingBudgetData: ClothingBudgetData): Promise<void> {
  // First get existing data
  const existingData = await getUserBudgetsData(userId);
  
  // Merge clothing budget updates with existing data
  const updatedData: UserBudgetsData = {
    ...existingData,
    clothingBudgetAmount: clothingBudgetData.amount,
    clothingBudgetFrequency: clothingBudgetData.frequency,
    clothingCurrentSpent: clothingBudgetData.currentSpent,
    currency: clothingBudgetData.currency,
    periodStartDate: clothingBudgetData.periodStartDate,
    periodEndDate: clothingBudgetData.periodEndDate
  };
  
  // Save merged data
  await saveUserBudgetsData(userId, updatedData);
}
