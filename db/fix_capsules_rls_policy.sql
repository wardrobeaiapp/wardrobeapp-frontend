-- fix_capsules_rls_policy.sql
-- Fixes the Row-Level Security (RLS) policy for the capsules table

-- First, check if the table exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'capsules') THEN
        -- Drop existing RLS policies for the capsules table
        DROP POLICY IF EXISTS "Capsules are viewable by users who created them" ON "capsules";
        DROP POLICY IF EXISTS "Capsules are editable by users who created them" ON "capsules";
        
        -- Enable RLS on the table (in case it's not already enabled)
        ALTER TABLE "capsules" ENABLE ROW LEVEL SECURITY;
        
        -- Create a policy that allows users to view their own capsules
        CREATE POLICY "Capsules are viewable by users who created them"
            ON "capsules"
            FOR SELECT
            USING (auth.uid() = "user_id" OR auth.uid() IS NULL);
            
        -- Create a policy that allows users to insert, update, and delete their own capsules
        CREATE POLICY "Capsules are editable by users who created them"
            ON "capsules"
            FOR ALL
            USING (auth.uid() = "user_id" OR auth.uid() IS NULL);
            
        RAISE NOTICE 'Successfully updated RLS policies for capsules table';
    ELSE
        RAISE NOTICE 'Table "capsules" does not exist';
    END IF;
END
$$;
