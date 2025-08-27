-- Migration to create the capsule_scenarios join table
-- This moves scenario data from array in capsules table to a proper join table

-- Step 1: Check if the table already exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.tables 
                 WHERE table_schema = 'public' 
                 AND table_name = 'capsule_scenarios') THEN
    
    -- First check data types of the primary keys in referenced tables
    DO $CHECK_TYPES$ BEGIN
      RAISE NOTICE 'capsules.id data type: %', (
        SELECT data_type FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'capsules'
        AND column_name = 'id'
      );
      
      RAISE NOTICE 'scenarios.id data type: %', (
        SELECT data_type FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'scenarios'
        AND column_name = 'id'
      );
    END $CHECK_TYPES$;
    
    -- Create the capsule_scenarios join table with appropriate data types
    -- Using UUID for scenario_id as that's what the scenarios table uses
    CREATE TABLE capsule_scenarios (
      id SERIAL PRIMARY KEY,
      capsule_id INTEGER NOT NULL REFERENCES capsules(id) ON DELETE CASCADE,
      scenario_id UUID NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      -- Create a unique constraint to prevent duplicates
      UNIQUE(capsule_id, scenario_id)
    );
    
    -- Enable Row Level Security (RLS)
    ALTER TABLE capsule_scenarios ENABLE ROW LEVEL SECURITY;
    
    -- Create RLS policies
    CREATE POLICY "Allow all users to view capsule_scenarios" 
      ON capsule_scenarios FOR SELECT 
      USING (true);
      
    CREATE POLICY "Allow all users to insert capsule_scenarios" 
      ON capsule_scenarios FOR INSERT 
      WITH CHECK (true);
      
    CREATE POLICY "Allow all users to update capsule_scenarios" 
      ON capsule_scenarios FOR UPDATE 
      USING (true);
      
    CREATE POLICY "Allow all users to delete capsule_scenarios" 
      ON capsule_scenarios FOR DELETE 
      USING (true);
    
    -- Add comment to the table
    COMMENT ON TABLE capsule_scenarios IS 'Join table between capsules and scenarios';
  END IF;
END $$;

-- Step 2: Create a function to migrate existing scenario data from capsules table
-- This will only run if the capsule_scenarios table was just created
DO $$ 
DECLARE
  capsule_record RECORD;
  scenario_name TEXT;
  scenario_id UUID;
BEGIN
  -- Check if the capsules table has a scenarios column
  IF EXISTS (SELECT FROM information_schema.columns 
             WHERE table_schema = 'public' 
             AND table_name = 'capsules' 
             AND column_name = 'scenarios') THEN
    
    -- Show a sample of the data we're working with
    RAISE NOTICE 'Sample capsule scenarios data: %', (
      SELECT scenarios FROM capsules WHERE scenarios IS NOT NULL AND array_length(scenarios, 1) > 0 LIMIT 1
    );
    
    -- Loop through capsules and migrate scenarios
    FOR capsule_record IN SELECT id, scenarios FROM capsules WHERE scenarios IS NOT NULL AND array_length(scenarios, 1) > 0 LOOP
      -- For each scenario in the array
      FOREACH scenario_name IN ARRAY capsule_record.scenarios LOOP
        -- Try to find the scenario ID from the scenarios table
        SELECT id INTO scenario_id FROM scenarios WHERE name = scenario_name LIMIT 1;
        
        -- If we found a matching scenario
        IF scenario_id IS NOT NULL THEN
          -- Insert into the join table, ignore if already exists
          BEGIN
            INSERT INTO capsule_scenarios (capsule_id, scenario_id)
            VALUES (capsule_record.id, scenario_id)
            ON CONFLICT (capsule_id, scenario_id) DO NOTHING;
            
            RAISE NOTICE 'Migrated scenario % (UUID: %) for capsule %', scenario_name, scenario_id, capsule_record.id;
          EXCEPTION WHEN OTHERS THEN
            -- Log error but continue with migration
            RAISE NOTICE 'Error inserting scenario % (UUID: %) for capsule %: %', scenario_name, scenario_id, capsule_record.id, SQLERRM;
          END;
        ELSE
          RAISE NOTICE 'Could not find scenario ID for name: % in capsule %', scenario_name, capsule_record.id;
        END IF;
      END LOOP;
    END LOOP;
  END IF;
END $$;
