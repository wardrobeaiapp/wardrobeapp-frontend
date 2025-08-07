-- Add home_activities column to user_preferences table
ALTER TABLE user_preferences 
ADD COLUMN IF NOT EXISTS home_activities TEXT[] DEFAULT '{}';

-- Add comment to explain the purpose of the column
COMMENT ON COLUMN user_preferences.home_activities IS 'Array of home activity types selected during onboarding (e.g., housekeeping, gardening, etc.)';
