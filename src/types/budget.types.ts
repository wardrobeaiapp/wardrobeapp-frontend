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
