-- Migration: Add RLS policies for scenarios table to prevent data leakage
-- Date: 2025-10-18
-- Description: Ensures scenarios table has proper Row Level Security policies

-- Log start of migration
SELECT 'Starting scenarios RLS policies migration...' as status;

-- Step 1: Enable RLS on scenarios table if not already enabled
ALTER TABLE scenarios ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop existing policies if they exist (for clean setup)
DROP POLICY IF EXISTS "Users can view their own scenarios" ON scenarios;
DROP POLICY IF EXISTS "Users can insert their own scenarios" ON scenarios;
DROP POLICY IF EXISTS "Users can update their own scenarios" ON scenarios;
DROP POLICY IF EXISTS "Users can delete their own scenarios" ON scenarios;

-- Step 3: Create comprehensive RLS policies for scenarios table
-- These policies preserve demo functionality while securing user data

-- SELECT policy - users can view their own scenarios + demo scenarios for unauthenticated access
CREATE POLICY "Users can view their own scenarios"
  ON scenarios
  FOR SELECT
  USING (
    auth.uid()::text = user_id::text 
    OR user_id = '00000000-0000-0000-0000-000000000000'::uuid  -- Special demo user
    OR user_id IN (  -- Specific demo user accounts for public access
      '17e17127-60d9-4f7a-b62f-71089efea6ac'::uuid,  -- Emma (Marketing Manager)
      '8a2f9c4e-1b5d-4e7a-9f3c-2d8e5a7b9c1f'::uuid,  -- Max (Freelance Graphic Designer)
      'c5f8d2a9-3e6b-4d7c-8a1f-9e2d5c7b4a6e'::uuid,  -- Lisa (Stay-At-Home Mom)
      '9f3e7b2c-6a4d-4f8e-b9c2-3f7a8d5e9c1b'::uuid   -- Zoe (College Student)
    )
  );

-- INSERT policy - users can create scenarios for themselves + demo scenarios
CREATE POLICY "Users can insert their own scenarios"
  ON scenarios
  FOR INSERT
  WITH CHECK (
    auth.uid()::text = user_id::text 
    OR user_id = '00000000-0000-0000-0000-000000000000'::uuid
  );

-- UPDATE policy - users can update their own scenarios + demo scenarios
CREATE POLICY "Users can update their own scenarios"
  ON scenarios
  FOR UPDATE
  USING (
    auth.uid()::text = user_id::text 
    OR user_id = '00000000-0000-0000-0000-000000000000'::uuid
  )
  WITH CHECK (
    auth.uid()::text = user_id::text 
    OR user_id = '00000000-0000-0000-0000-000000000000'::uuid
  );

-- DELETE policy - users can delete their own scenarios + demo scenarios  
CREATE POLICY "Users can delete their own scenarios"
  ON scenarios
  FOR DELETE
  USING (
    auth.uid()::text = user_id::text 
    OR user_id = '00000000-0000-0000-0000-000000000000'::uuid
  );

-- Step 4: Verify policies were created successfully
DO $$
DECLARE
    policy_count INTEGER;
BEGIN
    -- Count RLS policies for scenarios table
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies 
    WHERE tablename = 'scenarios' 
    AND schemaname = 'public';
    
    IF policy_count >= 4 THEN
        RAISE NOTICE 'SUCCESS: % RLS policies created for scenarios table', policy_count;
    ELSE
        RAISE NOTICE 'WARNING: Only % RLS policies found for scenarios table', policy_count;
    END IF;
END $$;

-- Step 5: Test that RLS is working (optional verification)
DO $$
BEGIN
    -- Check if RLS is enabled
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'scenarios' 
        AND rowsecurity = true
    ) THEN
        RAISE NOTICE 'SUCCESS: Row Level Security is enabled on scenarios table';
    ELSE
        RAISE NOTICE 'WARNING: Row Level Security is NOT enabled on scenarios table';
    END IF;
END $$;

SELECT 'Migration completed: add_scenarios_rls_policies' as status;
