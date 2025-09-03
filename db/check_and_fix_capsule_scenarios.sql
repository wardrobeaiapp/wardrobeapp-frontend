-- Check and Fix Capsule Scenarios Table Structure

-- First, check the current data types
DO $$ 
BEGIN
  RAISE NOTICE 'capsules.id data type: %', (
    SELECT data_type FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'capsules'
    AND column_name = 'id'
  );
  
  RAISE NOTICE 'capsule_scenarios.capsule_id data type: %', (
    SELECT data_type FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'capsule_scenarios'
    AND column_name = 'capsule_id'
  );
  
  RAISE NOTICE 'capsule_scenarios.scenario_id data type: %', (
    SELECT data_type FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'capsule_scenarios'
    AND column_name = 'scenario_id'
  );
END $$;

-- If there's a mismatch, fix it
DO $$ 
BEGIN
  -- Get the data types
  DECLARE
    capsules_id_type TEXT;
    capsule_scenarios_id_type TEXT;
  BEGIN
    SELECT data_type INTO capsules_id_type 
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'capsules'
    AND column_name = 'id';
    
    SELECT data_type INTO capsule_scenarios_id_type 
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'capsule_scenarios'
    AND column_name = 'capsule_id';
    
    -- If there's a mismatch
    IF capsules_id_type <> capsule_scenarios_id_type THEN
      RAISE NOTICE 'Mismatch detected: capsules.id is % but capsule_scenarios.capsule_id is %', 
        capsules_id_type, capsule_scenarios_id_type;
      
      -- Drop constraints
      ALTER TABLE IF EXISTS capsule_scenarios DROP CONSTRAINT IF EXISTS capsule_scenarios_capsule_id_fkey;
      
      -- If capsules.id is UUID, convert capsule_scenarios.capsule_id to UUID
      IF capsules_id_type = 'uuid' THEN
        -- Clear existing data since we can't safely convert integer to UUID
        TRUNCATE capsule_scenarios;
        
        -- Change type to UUID
        ALTER TABLE capsule_scenarios ALTER COLUMN capsule_id TYPE UUID USING NULL;
        
        RAISE NOTICE 'Changed capsule_scenarios.capsule_id to UUID';
      
      -- If capsules.id is INTEGER, convert capsule_scenarios.capsule_id to INTEGER
      ELSIF capsules_id_type = 'integer' THEN
        -- Clear existing data
        TRUNCATE capsule_scenarios;
        
        -- Change type to INTEGER
        ALTER TABLE capsule_scenarios ALTER COLUMN capsule_id TYPE INTEGER USING NULL;
        
        RAISE NOTICE 'Changed capsule_scenarios.capsule_id to INTEGER';
      END IF;
      
      -- Recreate foreign key constraint
      ALTER TABLE capsule_scenarios
        ADD CONSTRAINT capsule_scenarios_capsule_id_fkey
        FOREIGN KEY (capsule_id) REFERENCES capsules(id) ON DELETE CASCADE;
      
      RAISE NOTICE 'Recreated foreign key constraint';
    ELSE
      RAISE NOTICE 'No mismatch detected. Both capsules.id and capsule_scenarios.capsule_id are %', capsules_id_type;
    END IF;
  END;
END $$;

-- Check and fix user_id column constraint
DO $$ 
BEGIN
  -- Check if user_id column has NOT NULL constraint
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'capsule_scenarios'
    AND column_name = 'user_id'
    AND is_nullable = 'NO'
  ) THEN
    -- Make user_id nullable
    ALTER TABLE capsule_scenarios ALTER COLUMN user_id DROP NOT NULL;
    RAISE NOTICE 'Modified capsule_scenarios.user_id to allow NULL values';
  ELSE
    RAISE NOTICE 'capsule_scenarios.user_id already allows NULL values or does not exist';
  END IF;
END $$;

-- Ensure RLS policies are permissive
DROP POLICY IF EXISTS "Allow all users to view capsule_scenarios" ON capsule_scenarios;
DROP POLICY IF EXISTS "Allow all users to insert capsule_scenarios" ON capsule_scenarios;
DROP POLICY IF EXISTS "Allow all users to update capsule_scenarios" ON capsule_scenarios;
DROP POLICY IF EXISTS "Allow all users to delete capsule_scenarios" ON capsule_scenarios;

-- Create permissive policies
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

-- Notify about completion using a DO block
DO $$ 
BEGIN
  RAISE NOTICE 'RLS policies updated to be fully permissive';
END $$;
