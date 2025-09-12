import { supabase } from '../core';
import { ClothingBudgetData } from './budget.types';

/**
 * Get clothing budget data only (optimized fetch for clothing budget section)
 */
export async function getClothingBudgetData(userId: string): Promise<ClothingBudgetData> {
  try {
    const { data, error } = await supabase
      .from('user_progress')
      .select('clothing_budget_amount, clothing_budget_currency, clothing_current_spent')
      .eq('user_id', userId)
      .order('id', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return {
        amount: 0,
        currency: 'USD',
        frequency: 'monthly',
        currentSpent: 0
      };
    }

    return {
      amount: (data.clothing_budget_amount as number) || 0,
      currency: (data.clothing_budget_currency as string) || 'USD',
      frequency: 'monthly', // Default value as it's not in the select
      currentSpent: (data.clothing_current_spent as number) || 0
    };
  } catch (error) {
    console.error('Error fetching clothing budget data:', error);
    throw error;
  }
}

/**
 * Save clothing budget data only (optimized save for clothing budget section)
 */
export async function saveClothingBudgetData(
  userId: string, 
  clothingBudgetData: ClothingBudgetData
): Promise<ClothingBudgetData> {
  try {
    const { error } = await supabase
      .from('user_progress')
      .upsert({
        user_id: userId,
        clothing_budget_amount: clothingBudgetData.amount,
        clothing_budget_currency: clothingBudgetData.currency,
        clothing_current_spent: clothingBudgetData.currentSpent,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id',
        ignoreDuplicates: false
      });

    if (error) {
      console.error('Error saving clothing budget data:', error);
      throw error;
    }

    return clothingBudgetData;
  } catch (error) {
    console.error('Error in saveClothingBudgetData:', error);
    throw error;
  }
}

/**
 * Extract clothing budget data from unified user budgets data
 */
import type { UserBudgetsData } from './budget.types';

export function extractClothingBudgetData(
  userBudgetsData: UserBudgetsData
): ClothingBudgetData {
  return {
    amount: userBudgetsData.clothingBudgetAmount,
    currency: userBudgetsData.currency || 'USD',
    frequency: userBudgetsData.clothingBudgetFrequency || 'monthly',
    currentSpent: userBudgetsData.clothingCurrentSpent || 0
  };
}

/**
 * Update clothing budget portion of unified user budgets
 */
export async function updateClothingBudgetData(
  userId: string, 
  clothingBudgetData: ClothingBudgetData
): Promise<void> {
  const { data: existingData } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)
    .order('id', { ascending: false })
    .limit(1)
    .single();

  const updateData = {
    clothing_budget_amount: clothingBudgetData.amount,
    clothing_budget_currency: clothingBudgetData.currency,
    clothing_current_spent: clothingBudgetData.currentSpent,
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
    console.error('Error updating clothing budget data:', error);
    throw error;
  }
}
