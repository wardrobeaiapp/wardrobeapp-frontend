-- Migration to remove scenarios from preferences column in user_profiles table
-- Date: 2025-08-03

-- First, make sure all scenarios are properly stored in the scenarios table
-- This is a safety check before removing data from preferences

-- Check if any user has scenarios in preferences but not in scenarios table
DO $$
DECLARE
    user_record RECORD;
    scenario_record RECORD;
    preferences_scenarios JSONB;
BEGIN
    -- Loop through all user profiles with preferences.scenarios
    FOR user_record IN 
        SELECT id, user_id, preferences 
        FROM user_profiles 
        WHERE preferences ? 'scenarios'
    LOOP
        -- Extract scenarios from preferences
        preferences_scenarios := user_record.preferences->'scenarios';
        
        -- If preferences.scenarios is an array
        IF jsonb_typeof(preferences_scenarios) = 'array' THEN
            -- Loop through each scenario in preferences
            FOR i IN 0..jsonb_array_length(preferences_scenarios)-1 LOOP
                -- Get scenario data
                scenario_record := jsonb_array_element(preferences_scenarios, i);
                
                -- Check if this scenario exists in scenarios table
                IF NOT EXISTS (
                    SELECT 1 FROM scenarios 
                    WHERE user_id = user_record.user_id 
                    AND name = scenario_record->>'name'
                ) THEN
                    -- Insert missing scenario into scenarios table
                    INSERT INTO scenarios (user_id, name, frequency, type)
                    VALUES (
                        user_record.user_id,
                        scenario_record->>'name',
                        scenario_record->>'frequency',
                        COALESCE(scenario_record->>'type', 'default')
                    );
                    
                    RAISE NOTICE 'Migrated scenario % for user %', 
                        scenario_record->>'name', user_record.user_id;
                END IF;
            END LOOP;
        END IF;
    END LOOP;
END $$;

-- Now remove scenarios from preferences column
UPDATE user_profiles
SET preferences = preferences - 'scenarios'
WHERE preferences ? 'scenarios';

-- Log completion
DO $$
BEGIN
    RAISE NOTICE 'Migration complete: Removed scenarios from preferences column in user_profiles table';
END $$;
