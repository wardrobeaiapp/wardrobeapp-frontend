-- Remove budget-related columns from user_preferences table
-- All budget data is now stored in user_progress table via unified budget service

-- Remove shopping limit columns
ALTER TABLE user_preferences DROP COLUMN IF EXISTS shopping_limit_amount;
ALTER TABLE user_preferences DROP COLUMN IF EXISTS shopping_limit_frequency;

-- Remove clothing budget columns  
ALTER TABLE user_preferences DROP COLUMN IF EXISTS clothing_budget_amount;
ALTER TABLE user_preferences DROP COLUMN IF EXISTS clothing_budget_currency;
ALTER TABLE user_preferences DROP COLUMN IF EXISTS clothing_budget_frequency;

-- Add comment to document the change
COMMENT ON TABLE user_preferences IS 'User preferences table - budget data removed and moved to user_progress table for unified storage';
