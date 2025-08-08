import { createClient } from '@supabase/supabase-js';

// Get Supabase client (assuming it exists in context)
const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL || '',
  process.env.REACT_APP_SUPABASE_ANON_KEY || ''
);

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
  shoppingCurrentSpent: number;
  
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
  currentSpent: number;
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
  console.log('💰 UserBudgetsService - Fetching user budgets data for user:', userId);

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
      console.log('💰 UserBudgetsService - Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      
      // If no record exists, this is expected for new users
      if (error.code === 'PGRST116') {
        console.log('💰 UserBudgetsService - No existing user budgets data found, returning defaults');
        return {
          currency: 'USD',
          periodStartDate: undefined,
          periodEndDate: undefined,
          shoppingLimitAmount: undefined,
          shoppingLimitFrequency: 'monthly',
          shoppingCurrentSpent: 0,
          clothingBudgetAmount: 0,
          clothingBudgetFrequency: 'monthly',
          clothingCurrentSpent: 0
        };
      }
      
      // For now, also handle other errors gracefully
      console.log('💰 UserBudgetsService - Unhandled error, returning defaults');
      return {
        currency: 'USD',
        periodStartDate: undefined,
        periodEndDate: undefined,
        shoppingLimitAmount: undefined,
        shoppingLimitFrequency: 'monthly',
        shoppingCurrentSpent: 0,
        clothingBudgetAmount: 0,
        clothingBudgetFrequency: 'monthly',
        clothingCurrentSpent: 0
      };
    }

    // Handle case where no data is returned
    if (!data || data.length === 0) {
      console.log('💰 UserBudgetsService - No budget data found, returning defaults');
      return {
        currency: 'USD',
        periodStartDate: undefined,
        periodEndDate: undefined,
        shoppingLimitAmount: undefined,
        shoppingLimitFrequency: 'monthly',
        shoppingCurrentSpent: 0,
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
      shoppingCurrentSpent: 0,
      clothingBudgetAmount: (record && typeof record.clothing_budget_amount === 'number') ? record.clothing_budget_amount : 0,
      clothingBudgetFrequency: 'monthly', // Default since we don't query this column
      clothingCurrentSpent: 0
    };

    console.log('💰 UserBudgetsService - Successfully fetched user budgets data:', mappedData);
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
  console.log('💰 UserBudgetsService - Saving user budgets data for user:', userId, userBudgetsData);

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

    console.log('💰 UserBudgetsService - Mapped data for database:', dbData);

    // Use upsert to handle both insert and update cases
    const { data, error } = await supabase
      .from('user_progress')
      .upsert(dbData)
      .select();

    if (error) {
      console.error('💰 UserBudgetsService - Supabase error saving user budgets data:', error);
      throw error;
    }

    console.log('💰 UserBudgetsService - Successfully saved user budgets data:', data);

  } catch (error) {
    console.error('💰 UserBudgetsService - Error saving user budgets data:', error);
    throw error;
  }
}

/**
 * Get shopping limit data only (optimized query for shopping limit section)
 */
export async function getShoppingLimitData(userId: string): Promise<ShoppingLimitData> {
  console.log('🛍️ UserBudgetsService - Fetching shopping limit data for user:', userId);

  try {
    // Query only shopping limit specific columns - get most recent record if multiple exist
    // Use ID-based ordering for consistent results
    const { data, error } = await supabase
      .from('user_progress')
      .select('shopping_limit_amount, shopping_limit_frequency, id')
      .eq('user_id', userId)
      .order('id', { ascending: false })
      .limit(1);

    if (error) {
      // Log the actual error details to understand what's happening
      console.error('🛍️ UserBudgetsService - Supabase error fetching shopping limit data:', error);
      
      if (error.code === 'PGRST116') {
        // No rows found - new user, return default values
        console.log('🛍️ UserBudgetsService - No shopping limit data found, returning defaults for new user');
        return {
          shoppingLimitAmount: undefined,
          shoppingLimitFrequency: 'monthly',
          currentSpent: 0,
          periodStartDate: undefined,
          periodEndDate: undefined
        };
      }
      
      throw error;
    }

    // Handle case where no data is returned
    if (!data || data.length === 0) {
      console.log('🛍️ UserBudgetsService - No shopping limit data found, returning defaults');
      return {
        shoppingLimitAmount: undefined,
        shoppingLimitFrequency: 'monthly',
        currentSpent: 0,
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
      currentSpent: 0, // Default to 0 since we don't store this
      periodStartDate: undefined,
      periodEndDate: undefined
    };

    console.log('🛍️ UserBudgetsService - Mapped shopping limit data:', mappedData);
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
  console.log('👕 UserBudgetsService - Fetching clothing budget data for user:', userId);

  try {
    // Query only clothing budget specific columns - get most recent record if multiple exist
    // Query only clothing budget specific columns - get most recent record if multiple exist
    const { data, error } = await supabase
      .from('user_progress')
      .select('clothing_budget_amount, clothing_budget_currency, clothing_budget_frequency, id')
      .eq('user_id', userId)
      .order('id', { ascending: false })
      .limit(1);

    if (error) {
      // Log the actual error details to understand what's happening
      console.error('👕 UserBudgetsService - Supabase error fetching clothing budget data:', error);
      
      if (error.code === 'PGRST116') {
        // No rows found - new user, return default values
        console.log('👕 UserBudgetsService - No clothing budget data found, returning defaults for new user');
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
      console.log('👕 UserBudgetsService - No clothing budget data found, returning defaults');
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
      currentSpent: 0, // Default to 0 since we don't store this
      periodStartDate: undefined,
      periodEndDate: undefined
    };

    console.log('👕 UserBudgetsService - Mapped clothing budget data:', mappedData);
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
    console.log('👕 UserBudgetsService - Starting to save clothing budget data:', clothingBudgetData);
    console.log('👕 UserBudgetsService - DEBUGGING: frequency value received:', clothingBudgetData.frequency, 'type:', typeof clothingBudgetData.frequency);
    
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
    
    console.log('👕 UserBudgetsService - Existing record found:', existingRecord?.id ? 'Yes' : 'No');
    console.log('👕 UserBudgetsService - Existing record ID:', existingRecord?.id);
    console.log('👕 UserBudgetsService - CRITICAL DEBUG: About to send clothing_budget_frequency to DB:', clothingBudgetData.frequency);
    
    // DEBUGGING: Let's see what happens before and after the save
    console.log('👕 BEFORE SAVE - Checking current database state...');
    const beforeSave = await supabase
      .from('user_progress')
      .select('id, user_id, clothing_budget_amount, clothing_budget_frequency')
      .eq('user_id', userId)
      .order('id', { ascending: false });
    console.log('👕 BEFORE SAVE - Current records:', beforeSave.data);

    // Simply UPDATE the existing record - no new records, no complex logic
    let data, error;
    
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
      data = result.data;
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
      data = result.data;
      error = result.error;
    }

    if (error) {
      console.error('👕 UserBudgetsService - Supabase error saving clothing budget data:', error);
      throw error;
    }

    console.log('👕 UserBudgetsService - Successfully saved clothing budget data:', data);
    
    // DEBUGGING: Let's see what the database looks like after the save
    console.log('👕 AFTER SAVE - Checking updated database state...');
    const afterSave = await supabase
      .from('user_progress')
      .select('id, user_id, clothing_budget_amount, clothing_budget_frequency')
      .eq('user_id', userId)
      .order('id', { ascending: false });
    console.log('👕 AFTER SAVE - All records (ordered by ID DESC):', afterSave.data);
    
    // Also check with different ordering to see what's happening
    const afterSaveAsc = await supabase
      .from('user_progress')
      .select('id, user_id, clothing_budget_amount, clothing_budget_frequency')
      .eq('user_id', userId)
      .order('id', { ascending: true });
    console.log('👕 AFTER SAVE - All records (ordered by ID ASC):', afterSaveAsc.data);

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
  console.log('🛍️ UserBudgetsService - Saving shopping limit data for user:', userId, shoppingLimitData);

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
    let data, error;
    
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
      data = result.data;
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
      data = result.data;
      error = result.error;
    }

    if (error) {
      console.error('🛍️ UserBudgetsService - Supabase error saving shopping limit data:', error);
      throw error;
    }

    console.log('🛍️ UserBudgetsService - Successfully saved shopping limit data:', data);

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
    currentSpent: userBudgetsData.shoppingCurrentSpent,
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
    shoppingCurrentSpent: shoppingLimitData.currentSpent,
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
