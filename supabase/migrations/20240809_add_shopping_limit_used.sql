-- Add shopping_limit_used column to user_progress table
-- This column tracks how much of the shopping_limit_amount has actually been used
-- Defaults to 0 for new records

ALTER TABLE user_progress 
ADD COLUMN shopping_limit_used INTEGER DEFAULT 0;

-- Add a comment to explain the column
COMMENT ON COLUMN user_progress.shopping_limit_used IS 'Tracks how much of the shopping_limit_amount has been used (default 0)';

-- Update existing rows to have 0 as the default value (in case there are existing records)
UPDATE user_progress 
SET shopping_limit_used = 0 
WHERE shopping_limit_used IS NULL;
