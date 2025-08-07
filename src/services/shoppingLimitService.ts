import { supabase } from './supabaseClient';

// Interface for Shopping Limit data - matches ShoppingData from types/index.ts
export interface ShoppingLimitData {
  shoppingLimitAmount?: number;
  shoppingLimitFrequency?: 'monthly' | 'quarterly' | 'yearly';
  currentSpent?: number;
  periodStartDate?: string;
  periodEndDate?: string;
}

/**
 * Fetch shopping limit data for a specific user from user_progress table
 */
export const getShoppingLimitData = async (userId: string): Promise<ShoppingLimitData> => {
  console.log('🛍️ ShoppingLimitService - Fetching shopping limit data for user:', userId);

  try {
    const { data, error } = await supabase
      .from('user_progress')
      .select('limit_amount, limit_frequency, current_spent, period_start_date, period_end_date')
      .eq('user_id', userId)
      .eq('progress_type', 'shopping_limit')
      .is('category', null) // Shopping limits have no category
      .single();

    if (error) {
      // If no shopping limit data found, return default empty data
      if (error.code === 'PGRST116') {
        console.log('🛍️ ShoppingLimitService - No shopping limit data found, returning defaults');
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

    // Map database fields to ShoppingLimitData interface
    const mappedData: ShoppingLimitData = {
      shoppingLimitAmount: (data && typeof data.limit_amount === 'number') ? data.limit_amount : undefined,
      shoppingLimitFrequency: (data?.limit_frequency as 'monthly' | 'quarterly' | 'yearly') || 'monthly',
      currentSpent: (data && typeof data.current_spent === 'number') ? data.current_spent : 0,
      periodStartDate: (data && typeof data.period_start_date === 'string') ? data.period_start_date : undefined,
      periodEndDate: (data && typeof data.period_end_date === 'string') ? data.period_end_date : undefined
    };

    console.log('🛍️ ShoppingLimitService - Successfully fetched shopping limit data:', mappedData);
    return mappedData;

  } catch (error) {
    console.error('🛍️ ShoppingLimitService - Error fetching shopping limit data:', error);
    throw error;
  }
};

/**
 * Save shopping limit data for a specific user to user_progress table
 */
export const saveShoppingLimitData = async (userId: string, shoppingLimitData: ShoppingLimitData): Promise<void> => {
  console.log('🛍️ ShoppingLimitService - Saving shopping limit data for user:', userId, shoppingLimitData);

  try {
    // Map ShoppingLimitData interface to database fields
    const dbData = {
      user_id: userId,
      progress_type: 'shopping_limit' as const,
      category: null, // Shopping limits have no category
      limit_amount: shoppingLimitData.shoppingLimitAmount || null,
      limit_frequency: shoppingLimitData.shoppingLimitFrequency || 'monthly',
      current_spent: shoppingLimitData.currentSpent || 0,
      period_start_date: shoppingLimitData.periodStartDate || null,
      period_end_date: shoppingLimitData.periodEndDate || null,
      updated_at: new Date().toISOString()
    };

    console.log('🛍️ ShoppingLimitService - Mapped data for database:', dbData);

    // Use upsert to handle both insert and update cases
    const { data, error } = await supabase
      .from('user_progress')
      .upsert(dbData, {
        onConflict: 'user_id,progress_type,category',
        ignoreDuplicates: false
      })
      .select();

    if (error) {
      console.error('🛍️ ShoppingLimitService - Database error during save:', error);
      throw error;
    }

    console.log('🛍️ ShoppingLimitService - Successfully saved shopping limit data:', data);

  } catch (error) {
    console.error('🛍️ ShoppingLimitService - Error saving shopping limit data:', error);
    throw error;
  }
};

/**
 * Update current spent amount for shopping limit progress tracking
 */
export const updateShoppingSpent = async (userId: string, spentAmount: number): Promise<void> => {
  console.log('🛍️ ShoppingLimitService - Updating spent amount for user:', userId, 'Amount:', spentAmount);

  try {
    const { data, error } = await supabase
      .from('user_progress')
      .update({ 
        current_spent: spentAmount,
        last_purchase_date: new Date().toISOString().split('T')[0], // Today's date
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('progress_type', 'shopping_limit')
      .is('category', null)
      .select();

    if (error) {
      console.error('🛍️ ShoppingLimitService - Error updating spent amount:', error);
      throw error;
    }

    console.log('🛍️ ShoppingLimitService - Successfully updated spent amount:', data);

  } catch (error) {
    console.error('🛍️ ShoppingLimitService - Error updating spent amount:', error);
    throw error;
  }
};

/**
 * Get shopping progress summary (spent vs limit)
 */
export const getShoppingProgress = async (userId: string): Promise<{
  limit: number;
  spent: number;
  percentage: number;
  frequency: string;
  remainingAmount: number;
}> => {
  console.log('🛍️ ShoppingLimitService - Fetching shopping progress for user:', userId);

  try {
    const shoppingData = await getShoppingLimitData(userId);
    
    const limit = shoppingData.shoppingLimitAmount || 0;
    const spent = shoppingData.currentSpent || 0;
    const percentage = limit > 0 ? Math.round((spent / limit) * 100) : 0;
    const remainingAmount = Math.max(0, limit - spent);

    const progress = {
      limit,
      spent,
      percentage,
      frequency: shoppingData.shoppingLimitFrequency || 'monthly',
      remainingAmount
    };

    console.log('🛍️ ShoppingLimitService - Calculated shopping progress:', progress);
    return progress;

  } catch (error) {
    console.error('🛍️ ShoppingLimitService - Error calculating shopping progress:', error);
    throw error;
  }
};
