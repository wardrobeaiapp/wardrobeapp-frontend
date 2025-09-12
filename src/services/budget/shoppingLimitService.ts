import { supabase } from '../core';
import { ShoppingLimitData, UserBudgetsData } from './budget.types';

/**
 * Get shopping limit data only (optimized query for shopping limit section)
 */
export async function getShoppingLimitData(userId: string): Promise<ShoppingLimitData> {
  try {
    const { data, error } = await supabase
      .from('user_progress')
      .select('shopping_limit_amount, shopping_limit_frequency, shopping_period_start_date, shopping_period_end_date')
      .eq('user_id', userId)
      .order('id', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return {
        shoppingLimitAmount: undefined,
        shoppingLimitFrequency: 'monthly',
        periodStartDate: undefined,
        periodEndDate: undefined,
        shoppingLimitUsed: 0
      };
    }

    return {
      shoppingLimitAmount: data.shopping_limit_amount as number | undefined,
      shoppingLimitFrequency: (data.shopping_limit_frequency as 'monthly' | 'quarterly' | 'yearly') || 'monthly',
      periodStartDate: data.shopping_period_start_date as string | undefined,
      periodEndDate: data.shopping_period_end_date as string | undefined,
      shoppingLimitUsed: 0 // This would be calculated separately
    };
  } catch (error) {
    console.error('Error fetching shopping limit data:', error);
    throw error;
  }
}

/**
 * Save shopping limit data only (optimized save for shopping limit section)
 */
export async function saveShoppingLimitData(
  userId: string, 
  shoppingLimitData: ShoppingLimitData
): Promise<void> {
  try {
    const { error } = await supabase
      .from('user_progress')
      .upsert({
        user_id: userId,
        shopping_limit_amount: shoppingLimitData.shoppingLimitAmount,
        shopping_limit_frequency: shoppingLimitData.shoppingLimitFrequency,
        shopping_period_start_date: shoppingLimitData.periodStartDate,
        shopping_period_end_date: shoppingLimitData.periodEndDate,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id',
        ignoreDuplicates: false
      });

    if (error) {
      console.error('Error saving shopping limit data:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in saveShoppingLimitData:', error);
    throw error;
  }
}

/**
 * Extract shopping limit data from unified user budgets data
 */
export function extractShoppingLimitData(
  userBudgetsData: UserBudgetsData
): ShoppingLimitData {
  return {
    shoppingLimitAmount: userBudgetsData.shoppingLimitAmount,
    shoppingLimitFrequency: userBudgetsData.shoppingLimitFrequency,
    periodStartDate: userBudgetsData.periodStartDate,
    periodEndDate: userBudgetsData.periodEndDate,
    shoppingLimitUsed: userBudgetsData.shoppingLimitUsed || 0
  };
}

/**
 * Update shopping limit portion of unified user budgets
 */
export async function updateShoppingLimitData(
  userId: string, 
  shoppingLimitData: ShoppingLimitData
): Promise<void> {
  const { data: existingData } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)
    .order('id', { ascending: false })
    .limit(1)
    .single();

  const updateData = {
    shopping_limit_amount: shoppingLimitData.shoppingLimitAmount,
    shopping_limit_frequency: shoppingLimitData.shoppingLimitFrequency,
    shopping_period_start_date: shoppingLimitData.periodStartDate,
    shopping_period_end_date: shoppingLimitData.periodEndDate,
    updated_at: new Date().toISOString()
  };

  const { error } = await supabase
    .from('user_progress')
    .upsert({
      ...existingData,
      ...updateData,
      user_id: userId
    });

  if (error) {
    console.error('Error updating shopping limit data:', error);
    throw error;
  }
}
