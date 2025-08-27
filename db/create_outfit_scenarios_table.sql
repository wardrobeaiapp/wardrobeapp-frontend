-- Migration to create the outfit_scenarios join table
-- This moves scenario data from array in outfits table to a proper join table

-- Step 1: Check if the table already exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.tables 
                 WHERE table_schema = 'public' 
                 AND table_name = 'outfit_scenarios') THEN
    
    -- Create the outfit_scenarios join table
    CREATE TABLE outfit_scenarios (
      id SERIAL PRIMARY KEY,
      outfit_id INTEGER NOT NULL REFERENCES outfits(id) ON DELETE CASCADE,
      scenario_id INTEGER NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      -- Create a unique constraint to prevent duplicates
      UNIQUE(outfit_id, scenario_id)
    );
    
    -- Enable Row Level Security (RLS)
    ALTER TABLE outfit_scenarios ENABLE ROW LEVEL SECURITY;
    
    -- Create RLS policies
    CREATE POLICY "Allow all users to view outfit_scenarios" 
      ON outfit_scenarios FOR SELECT 
      USING (true);
      
    CREATE POLICY "Allow all users to insert outfit_scenarios" 
      ON outfit_scenarios FOR INSERT 
      WITH CHECK (true);
      
    CREATE POLICY "Allow all users to update outfit_scenarios" 
      ON outfit_scenarios FOR UPDATE 
      USING (true);
      
    CREATE POLICY "Allow all users to delete outfit_scenarios" 
      ON outfit_scenarios FOR DELETE 
      USING (true);
    
    -- Add comment to the table
    COMMENT ON TABLE outfit_scenarios IS 'Join table between outfits and scenarios';
  END IF;
END $$;

-- Step 2: Create a function to migrate existing scenario data from outfits table
-- This will only run if the outfit_scenarios table was just created
DO $$ 
DECLARE
  outfit_record RECORD;
  scenario_id TEXT;
BEGIN
  -- Check if the outfits table has a scenarios column
  IF EXISTS (SELECT FROM information_schema.columns 
             WHERE table_schema = 'public' 
             AND table_name = 'outfits' 
             AND column_name = 'scenarios') THEN
    
    -- Loop through outfits and migrate scenarios
    FOR outfit_record IN SELECT id, scenarios FROM outfits WHERE scenarios IS NOT NULL AND array_length(scenarios, 1) > 0 LOOP
      -- For each scenario in the array
      FOREACH scenario_id IN ARRAY outfit_record.scenarios LOOP
        -- Insert into the join table, ignore if already exists
        BEGIN
          INSERT INTO outfit_scenarios (outfit_id, scenario_id)
          VALUES (outfit_record.id, scenario_id::integer)
          ON CONFLICT (outfit_id, scenario_id) DO NOTHING;
        EXCEPTION WHEN OTHERS THEN
          -- Log error but continue with migration
          RAISE NOTICE 'Error inserting scenario % for outfit %: %', scenario_id, outfit_record.id, SQLERRM;
        END;
      END LOOP;
    END LOOP;
  END IF;
END $$;
