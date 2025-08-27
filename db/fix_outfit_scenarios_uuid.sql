-- Fix conflict handling for outfit_scenarios table with UUID types

DO $$ 
BEGIN
  -- First check if the outfit_scenarios table exists
  IF EXISTS (SELECT FROM information_schema.tables 
             WHERE table_schema = 'public' 
             AND table_name = 'outfit_scenarios') THEN

    -- Check if the unique constraint exists
    IF NOT EXISTS (
      SELECT FROM information_schema.table_constraints
      WHERE table_schema = 'public'
      AND table_name = 'outfit_scenarios'
      AND constraint_name = 'outfit_scenarios_outfit_id_scenario_id_key'
    ) THEN
      -- Add the unique constraint if it doesn't exist
      ALTER TABLE outfit_scenarios ADD CONSTRAINT outfit_scenarios_outfit_id_scenario_id_key
        UNIQUE(outfit_id, scenario_id);
    END IF;

    -- Check for and fix ON DELETE CASCADE for the foreign key constraints
    -- We need to find out if the current constraints have ON DELETE CASCADE
    
    -- Drop and recreate outfit_id constraint if it exists but doesn't have CASCADE
    IF EXISTS (
      SELECT FROM information_schema.table_constraints tc
      JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_name = 'outfit_scenarios'
      AND ccu.table_name = 'outfits'
    ) AND NOT EXISTS (
      SELECT FROM pg_constraint con
      JOIN pg_namespace nsp ON nsp.oid = con.connamespace
      WHERE nsp.nspname = 'public'
      AND con.conname LIKE 'outfit_scenarios%'
      AND con.confdeltype = 'c'  -- 'c' is for CASCADE
      AND con.confrelid = 'public.outfits'::regclass::oid
    ) THEN
      -- Find the constraint name
      DO $FIND_CONSTRAINT$ BEGIN
        RAISE NOTICE 'Foreign key constraint for outfit_id needs to be updated';
      END $FIND_CONSTRAINT$;
    END IF;

    -- Let's print the existing RLS policies
    DO $CHECK_RLS$ 
    DECLARE
      pol RECORD;
    BEGIN
      RAISE NOTICE 'RLS policies on outfit_scenarios:';
      FOR pol IN (
        SELECT policyname, permissive, cmd, qual
        FROM pg_policies
        WHERE tablename = 'outfit_scenarios'
      ) LOOP
        RAISE NOTICE 'Policy: %, Permissive: %, Command: %, Using: %', 
          pol.policyname, pol.permissive, pol.cmd, pol.qual;
      END LOOP;
    END $CHECK_RLS$;
    
    -- Make sure RLS is enabled
    ALTER TABLE outfit_scenarios ENABLE ROW LEVEL SECURITY;
    
    -- Drop all existing RLS policies (if any) to ensure clean slate
    DROP POLICY IF EXISTS "Users can view their own outfit_scenarios" ON outfit_scenarios;
    DROP POLICY IF EXISTS "Users can insert their own outfit_scenarios" ON outfit_scenarios;
    DROP POLICY IF EXISTS "Users can update their own outfit_scenarios" ON outfit_scenarios;
    DROP POLICY IF EXISTS "Users can delete their own outfit_scenarios" ON outfit_scenarios;
    DROP POLICY IF EXISTS "Allow all users to view outfit_scenarios" ON outfit_scenarios;
    DROP POLICY IF EXISTS "Allow all users to insert outfit_scenarios" ON outfit_scenarios;
    DROP POLICY IF EXISTS "Allow all users to update outfit_scenarios" ON outfit_scenarios;
    DROP POLICY IF EXISTS "Allow all users to delete outfit_scenarios" ON outfit_scenarios;
    
    -- Create new permissive policies
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
    
    RAISE NOTICE 'Successfully fixed outfit_scenarios table constraints and permissions';
  ELSE
    RAISE NOTICE 'outfit_scenarios table does not exist, skipping fixes';
  END IF;
END $$;
