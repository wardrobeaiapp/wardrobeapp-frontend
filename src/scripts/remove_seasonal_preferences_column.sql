-- Migration script to remove the redundant seasonal_preferences column from user_preferences table
-- This column is redundant with the local_climate field and is not actively used in the application

-- Remove the column from the user_preferences table
ALTER TABLE user_preferences 
DROP COLUMN IF EXISTS seasonal_preferences;

-- Note: This is a destructive operation that will permanently remove the column and its data
-- Make sure to back up any data if needed before running this script
