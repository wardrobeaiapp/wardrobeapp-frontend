-- Add ai_checks_used column to user_progress table
-- This column tracks how many AI checks the user has used in the current period
-- Defaults to 0 for new records

ALTER TABLE user_progress 
ADD COLUMN ai_checks_used INTEGER DEFAULT 0;

-- Add a comment to explain the column
COMMENT ON COLUMN user_progress.ai_checks_used IS 'Tracks how many AI checks the user has used in the current period (default 0)';

-- Update existing rows to have 0 as the default value (in case there are existing records)
UPDATE user_progress 
SET ai_checks_used = 0 
WHERE ai_checks_used IS NULL;
