import { 
  UserBudgetsData, 
  ShoppingLimitData, 
  ClothingBudgetData 
} from '../../types/budget.types';

// Re-export types for backward compatibility
export type { UserBudgetsData, ShoppingLimitData, ClothingBudgetData };

// Type for the update operations
export type UpdateBudgetParams = {
  userId: string;
  data: Partial<UserBudgetsData>;
};
