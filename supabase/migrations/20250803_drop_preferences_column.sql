-- Migration to drop the preferences column from user_profiles table
-- Date: 2025-08-03

-- IMPORTANT: This migration should only be run after ensuring that:
-- 1. All scenarios have been migrated to the scenarios table
-- 2. No application code is reading from or writing to preferences.scenarios
-- 3. The 20250803_remove_scenarios_from_preferences.sql migration has been applied

-- First, check if there's any remaining data in the preferences column that might be important
DO $$
DECLARE
    user_record RECORD;
    preferences_keys TEXT[];
    key_count INTEGER;
BEGIN
    -- Get all distinct keys in the preferences column across all users
    SELECT array_agg(DISTINCT jsonb_object_keys(preferences))
    INTO preferences_keys
    FROM user_profiles
    WHERE preferences IS NOT NULL AND preferences != '{}'::jsonb;
    
    -- Count how many distinct keys exist
    SELECT COALESCE(array_length(preferences_keys, 1), 0) INTO key_count;
    
    -- If there are keys other than 'scenarios', log them for review
    IF key_count > 0 THEN
        RAISE NOTICE 'The preferences column contains the following keys: %', preferences_keys;
        RAISE NOTICE 'Please ensure these preferences are properly migrated before dropping the column.';
    ELSE
        RAISE NOTICE 'No important data found in preferences column. Safe to drop.';
    END IF;
END $$;

-- Now drop the preferences column
ALTER TABLE user_profiles DROP COLUMN IF EXISTS preferences;

-- Log completion
DO $$
BEGIN
    RAISE NOTICE 'Migration complete: Dropped preferences column from user_profiles table';
END $$;
