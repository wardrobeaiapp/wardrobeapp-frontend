-- Migration: Fix duplicate user profiles and add constraints
-- Date: 2025-10-18
-- Description: Remove duplicate user_profiles records and add unique constraints to prevent future duplicates

-- Log start of migration
SELECT 'Starting duplicate user profiles cleanup and constraint addition...' as status;

-- Create backup table before making changes
CREATE TABLE IF NOT EXISTS user_profiles_backup_20251018 AS 
SELECT * FROM user_profiles;

-- Step 1: Remove duplicate records by email, keeping the most recent one
WITH ranked_profiles AS (
    SELECT *,
           ROW_NUMBER() OVER (
               PARTITION BY email 
               ORDER BY 
                 updated_at DESC NULLS LAST,
                 created_at DESC NULLS LAST,
                 id DESC
           ) as rn
    FROM user_profiles
    WHERE email IS NOT NULL
)
DELETE FROM user_profiles 
WHERE id IN (
    SELECT id FROM ranked_profiles WHERE rn > 1
);

-- Step 2: Remove duplicate records by user_uuid, keeping the most recent one
WITH ranked_uuid_profiles AS (
    SELECT *,
           ROW_NUMBER() OVER (
               PARTITION BY user_uuid 
               ORDER BY 
                 updated_at DESC NULLS LAST,
                 created_at DESC NULLS LAST,
                 id DESC
           ) as rn
    FROM user_profiles
    WHERE user_uuid IS NOT NULL
)
DELETE FROM user_profiles 
WHERE id IN (
    SELECT id FROM ranked_uuid_profiles WHERE rn > 1
);

-- Step 3: Drop existing constraints if they exist (to avoid conflicts)
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_email_key;
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_user_uuid_key;
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS unique_user_email;
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS unique_user_uuid;

-- Step 4: Add unique constraints to prevent future duplicates
DO $$
BEGIN
    -- Add email unique constraint if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'user_profiles_email_unique' 
        AND table_name = 'user_profiles'
    ) THEN
        ALTER TABLE user_profiles 
        ADD CONSTRAINT user_profiles_email_unique UNIQUE (email);
        RAISE NOTICE 'Added email unique constraint';
    ELSE
        RAISE NOTICE 'Email unique constraint already exists';
    END IF;

    -- Add user_uuid unique constraint if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'user_profiles_user_uuid_unique' 
        AND table_name = 'user_profiles'
    ) THEN
        ALTER TABLE user_profiles 
        ADD CONSTRAINT user_profiles_user_uuid_unique UNIQUE (user_uuid);
        RAISE NOTICE 'Added user_uuid unique constraint';
    ELSE
        RAISE NOTICE 'User UUID unique constraint already exists';
    END IF;
END $$;

-- Step 5: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_uuid ON user_profiles(user_uuid);

-- Step 6: Ensure proper foreign key constraint exists
DO $$
BEGIN
    -- Drop existing foreign key constraints if they exist
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_user_profiles_user' 
        AND table_name = 'user_profiles'
    ) THEN
        ALTER TABLE user_profiles DROP CONSTRAINT fk_user_profiles_user;
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'user_profiles_user_uuid_fkey' 
        AND table_name = 'user_profiles'
    ) THEN
        ALTER TABLE user_profiles DROP CONSTRAINT user_profiles_user_uuid_fkey;
    END IF;
    
    -- Add the foreign key constraint with proper type handling
    BEGIN
        -- Ensure user_uuid column is UUID type first
        ALTER TABLE user_profiles ALTER COLUMN user_uuid TYPE UUID USING user_uuid::UUID;
        
        -- Add the foreign key constraint
        ALTER TABLE user_profiles 
        ADD CONSTRAINT user_profiles_user_uuid_fkey 
        FOREIGN KEY (user_uuid) REFERENCES auth.users(id) ON DELETE CASCADE;
        
        RAISE NOTICE 'Added foreign key constraint successfully';
    EXCEPTION WHEN others THEN
        -- Log the error but continue
        RAISE NOTICE 'Could not add foreign key constraint: %', SQLERRM;
    END;
END $$;

-- Step 7: Enable Row Level Security if not already enabled
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Step 8: Update/create RLS policy
DROP POLICY IF EXISTS user_profiles_policy ON user_profiles;
CREATE POLICY user_profiles_policy ON user_profiles
    FOR ALL USING (auth.uid()::text = user_uuid::text)
    WITH CHECK (auth.uid()::text = user_uuid::text);

-- Step 9: Final verification and summary
DO $$
DECLARE
    total_profiles INTEGER;
    unique_emails INTEGER;
    unique_user_uuids INTEGER;
    email_duplicates INTEGER;
    uuid_duplicates INTEGER;
BEGIN
    -- Get counts
    SELECT COUNT(*) INTO total_profiles FROM user_profiles;
    SELECT COUNT(DISTINCT email) INTO unique_emails FROM user_profiles WHERE email IS NOT NULL;
    SELECT COUNT(DISTINCT user_uuid) INTO unique_user_uuids FROM user_profiles WHERE user_uuid IS NOT NULL;
    
    -- Check for remaining duplicates
    SELECT COUNT(*) INTO email_duplicates
    FROM (
        SELECT email, COUNT(*) 
        FROM user_profiles 
        WHERE email IS NOT NULL 
        GROUP BY email 
        HAVING COUNT(*) > 1
    ) t;
    
    SELECT COUNT(*) INTO uuid_duplicates
    FROM (
        SELECT user_uuid, COUNT(*) 
        FROM user_profiles 
        WHERE user_uuid IS NOT NULL 
        GROUP BY user_uuid 
        HAVING COUNT(*) > 1
    ) t;
    
    -- Log results
    RAISE NOTICE 'Migration completed successfully!';
    RAISE NOTICE 'Total profiles: %', total_profiles;
    RAISE NOTICE 'Unique emails: %', unique_emails;
    RAISE NOTICE 'Unique user UUIDs: %', unique_user_uuids;
    
    IF email_duplicates > 0 THEN
        RAISE NOTICE 'WARNING: % duplicate emails still exist', email_duplicates;
    END IF;
    
    IF uuid_duplicates > 0 THEN
        RAISE NOTICE 'WARNING: % duplicate user_uuids still exist', uuid_duplicates;
    END IF;
    
    IF email_duplicates = 0 AND uuid_duplicates = 0 THEN
        RAISE NOTICE 'SUCCESS: All duplicates have been removed!';
    END IF;
END $$;

SELECT 'Migration completed: fix_duplicate_user_profiles' as status;
