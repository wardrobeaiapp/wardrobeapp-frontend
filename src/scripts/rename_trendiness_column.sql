-- Migration script to rename trendiness column to classic_vs_trendy
-- This makes column naming consistent with other style preference columns

-- Rename the column
ALTER TABLE user_preferences 
RENAME COLUMN trendiness TO classic_vs_trendy;

-- Ensure the check constraint is updated
ALTER TABLE user_preferences 
DROP CONSTRAINT IF EXISTS user_preferences_trendiness_check;

ALTER TABLE user_preferences 
ADD CONSTRAINT user_preferences_classic_vs_trendy_check 
CHECK (classic_vs_trendy BETWEEN 0 AND 100);

-- Update the comment if exists
COMMENT ON COLUMN user_preferences.classic_vs_trendy IS 'User preference for classic vs trendy styles (0-100 scale)';
