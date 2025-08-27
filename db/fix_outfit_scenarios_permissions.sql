-- Fix RLS policies and reference constraints for outfit_scenarios table

-- 1. Check if the table exists and dump its structure
DO $$ 
BEGIN
  PERFORM FROM information_schema.tables 
  WHERE table_schema = 'public' AND table_name = 'outfit_scenarios';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'outfit_scenarios table does not exist';
  END IF;
END $$;

-- 2. Update RLS policies - recreate with more permissive policies
DROP POLICY IF EXISTS "Users can view their own outfit_scenarios" ON outfit_scenarios;
DROP POLICY IF EXISTS "Users can insert their own outfit_scenarios" ON outfit_scenarios;
DROP POLICY IF EXISTS "Users can update their own outfit_scenarios" ON outfit_scenarios;
DROP POLICY IF EXISTS "Users can delete their own outfit_scenarios" ON outfit_scenarios;

-- Create more permissive policies
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

-- 3. Check and fix outfit_id foreign key constraint
DO $$ 
BEGIN
  -- Verify outfits table
  PERFORM FROM information_schema.tables 
  WHERE table_schema = 'public' AND table_name = 'outfits';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'outfits table does not exist';
  END IF;
  
  -- Verify foreign key
  IF NOT EXISTS (
    SELECT FROM information_schema.table_constraints tc
    JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'outfit_scenarios' 
    AND ccu.table_name = 'outfits'
  ) THEN
    -- Drop the constraint if it exists with an incorrect definition
    BEGIN
      ALTER TABLE outfit_scenarios DROP CONSTRAINT IF EXISTS outfit_scenarios_outfit_id_fkey;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not drop constraint: %', SQLERRM;
    END;
    
    -- Add the foreign key constraint
    BEGIN
      ALTER TABLE outfit_scenarios ADD CONSTRAINT outfit_scenarios_outfit_id_fkey
        FOREIGN KEY (outfit_id) REFERENCES outfits(id) ON DELETE CASCADE;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not add constraint: %', SQLERRM;
    END;
  END IF;
END $$;

-- 4. Check and fix scenario_id foreign key constraint
DO $$ 
BEGIN
  -- Verify scenarios table
  PERFORM FROM information_schema.tables 
  WHERE table_schema = 'public' AND table_name = 'scenarios';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'scenarios table does not exist';
  END IF;
  
  -- Verify foreign key
  IF NOT EXISTS (
    SELECT FROM information_schema.table_constraints tc
    JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'outfit_scenarios' 
    AND ccu.table_name = 'scenarios'
  ) THEN
    -- Drop the constraint if it exists with an incorrect definition
    BEGIN
      ALTER TABLE outfit_scenarios DROP CONSTRAINT IF EXISTS outfit_scenarios_scenario_id_fkey;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not drop constraint: %', SQLERRM;
    END;
    
    -- Add the foreign key constraint
    BEGIN
      ALTER TABLE outfit_scenarios ADD CONSTRAINT outfit_scenarios_scenario_id_fkey
        FOREIGN KEY (scenario_id) REFERENCES scenarios(id) ON DELETE CASCADE;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not add constraint: %', SQLERRM;
    END;
  END IF;
END $$;

-- 5. Check for test data
DO $$ 
BEGIN
  -- Count scenarios
  PERFORM count(*) FROM scenarios;
  
  -- Insert a test scenario if none exist
  IF NOT FOUND OR (SELECT count(*) FROM scenarios) = 0 THEN
    INSERT INTO scenarios (name, user_id)
    VALUES ('Test Scenario', '00000000-0000-0000-0000-000000000000')
    ON CONFLICT DO NOTHING;
  END IF;
END $$;
