-- Add clothing_current_spent column to user_progress table
-- This column tracks how much of the clothing_budget_amount has actually been spent
-- Defaults to 0 for new records

ALTER TABLE user_progress 
ADD COLUMN clothing_current_spent DECIMAL(10, 2) DEFAULT 0.00;

-- Add a comment to explain the column
COMMENT ON COLUMN user_progress.clothing_current_spent IS 'Tracks how much of the clothing_budget_amount has been spent (default 0.00)';

-- Update existing rows to have 0.00 as the default value (in case there are existing records)
UPDATE user_progress 
SET clothing_current_spent = 0.00 
WHERE clothing_current_spent IS NULL;
