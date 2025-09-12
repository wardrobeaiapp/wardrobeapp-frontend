import { supabase } from '../core';
import { 
  UserBudgetsData,
  ShoppingLimitData,
  ClothingBudgetData
} from './budget.types';
import {
  getShoppingLimitData,
  saveShoppingLimitData,
  extractShoppingLimitData
} from './shoppingLimitService';
import {
  getClothingBudgetData,
  saveClothingBudgetData,
  extractClothingBudgetData
} from './clothingBudgetService';

/**
 * Fetch unified user budgets data for a specific user from user_budgets table
 */
export async function getUserBudgetsData(userId: string): Promise<UserBudgetsData> {
  try {
    // Query user_progress table for user's unified budget data
    const { data, error } = await supabase
      .from('user_progress')
      .select('shopping_limit_amount, shopping_limit_frequency, clothing_budget_amount, clothing_budget_currency, shopping_period_start_date, shopping_period_end_date')
      .eq('user_id', userId)
      .order('id', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
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

    return {
      currency: (data.clothing_budget_currency as string) || 'USD',
      periodStartDate: data.shopping_period_start_date as string | undefined,
      periodEndDate: data.shopping_period_end_date as string | undefined,
      shoppingLimitAmount: data.shopping_limit_amount as number | undefined,
      shoppingLimitFrequency: (data.shopping_limit_frequency as 'monthly' | 'quarterly' | 'yearly') || 'monthly',
      shoppingLimitUsed: 0, // This would be calculated separately
      clothingBudgetAmount: (data.clothing_budget_amount as number) || 0,
      clothingBudgetFrequency: 'monthly', // Default value as it's not in the select
      clothingCurrentSpent: 0 // This would be calculated separately
    };
  } catch (error) {
    console.error('Error in getUserBudgetsData:', error);
    // Return default values in case of error
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
}

/**
 * Save unified user budgets data for a specific user to user_budgets table
 */
export async function saveUserBudgetsData(
  userId: string, 
  userBudgetsData: UserBudgetsData
): Promise<void> {
  try {
    const { error } = await supabase
      .from('user_progress')
      .upsert({
        user_id: userId,
        shopping_limit_amount: userBudgetsData.shoppingLimitAmount,
        shopping_limit_frequency: userBudgetsData.shoppingLimitFrequency,
        clothing_budget_amount: userBudgetsData.clothingBudgetAmount,
        clothing_budget_currency: userBudgetsData.currency,
        shopping_period_start_date: userBudgetsData.periodStartDate,
        shopping_period_end_date: userBudgetsData.periodEndDate,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id',
        ignoreDuplicates: false
      });

    if (error) {
      console.error('Error saving user budgets data:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in saveUserBudgetsData:', error);
    throw error;
  }
}

// Re--export all the functions from individual services
export * from './shoppingLimitService';
export * from './clothingBudgetService';
