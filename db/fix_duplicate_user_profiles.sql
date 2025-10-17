-- Fix duplicate user profiles in user_profiles table
-- This script will:
-- 1. Identify and remove duplicate records keeping the most recent one
-- 2. Add unique constraints to prevent future duplicates
-- 3. Ensure proper foreign key relationships

-- First, let's see the current duplicates
DO $$
BEGIN
    RAISE NOTICE 'Identifying duplicate user profiles...';
    
    -- Show duplicate emails
    IF EXISTS (
        SELECT email, COUNT(*) 
        FROM user_profiles 
        WHERE email IS NOT NULL 
        GROUP BY email 
        HAVING COUNT(*) > 1
    ) THEN
        RAISE NOTICE 'Found duplicate emails in user_profiles table:';
        
        -- This would show the duplicates (for logging purposes)
        FOR record IN 
            SELECT email, COUNT(*) as count
            FROM user_profiles 
            WHERE email IS NOT NULL 
            GROUP BY email 
            HAVING COUNT(*) > 1
        LOOP
            RAISE NOTICE 'Email: %, Count: %', record.email, record.count;
        END LOOP;
    ELSE
        RAISE NOTICE 'No duplicate emails found.';
    END IF;
END $$;

-- Step 1: Create a backup table
DROP TABLE IF EXISTS user_profiles_backup_duplicates;
CREATE TABLE user_profiles_backup_duplicates AS SELECT * FROM user_profiles;

-- Step 2: Remove duplicate records, keeping the most recent one (latest updated_at or created_at)
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
),
profiles_to_delete AS (
    SELECT id 
    FROM ranked_profiles 
    WHERE rn > 1
)
DELETE FROM user_profiles 
WHERE id IN (SELECT id FROM profiles_to_delete);

-- Step 3: Also handle duplicates by user_uuid (in case same user has multiple profiles with different emails)
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
),
uuid_profiles_to_delete AS (
    SELECT id 
    FROM ranked_uuid_profiles 
    WHERE rn > 1
)
DELETE FROM user_profiles 
WHERE id IN (SELECT id FROM uuid_profiles_to_delete);

-- Step 4: Add unique constraints to prevent future duplicates
-- First drop existing constraints if they exist
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_email_key;
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_user_uuid_key;

-- Add unique constraint on email (preventing duplicate emails)
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_email_unique UNIQUE (email);

-- Add unique constraint on user_uuid (preventing duplicate user profiles)
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_user_uuid_unique UNIQUE (user_uuid);

-- Step 5: Add an index on email for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_uuid ON user_profiles(user_uuid);

-- Step 6: Ensure the foreign key constraint exists
DO $$
BEGIN
    -- Check if foreign key constraint exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_user_profiles_user' 
        AND table_name = 'user_profiles'
    ) THEN
        -- Try to add the foreign key constraint
        BEGIN
            ALTER TABLE user_profiles 
            ADD CONSTRAINT fk_user_profiles_user 
            FOREIGN KEY (user_uuid) REFERENCES auth.users(id) ON DELETE CASCADE;
            
            RAISE NOTICE 'Added foreign key constraint successfully';
        EXCEPTION WHEN others THEN
            RAISE NOTICE 'Could not add foreign key constraint: %', SQLERRM;
        END;
    ELSE
        RAISE NOTICE 'Foreign key constraint already exists';
    END IF;
END $$;

-- Step 7: Update any NULL user_uuid fields if possible (match by email with auth.users)
UPDATE user_profiles 
SET user_uuid = auth_users.id
FROM (
    SELECT id, email 
    FROM auth.users 
    WHERE email IS NOT NULL
) auth_users
WHERE user_profiles.user_uuid IS NULL 
  AND user_profiles.email = auth_users.email;

-- Step 8: Final verification
DO $$
DECLARE
    duplicate_count INTEGER;
BEGIN
    -- Check for remaining email duplicates
    SELECT COUNT(*) INTO duplicate_count
    FROM (
        SELECT email, COUNT(*) 
        FROM user_profiles 
        WHERE email IS NOT NULL 
        GROUP BY email 
        HAVING COUNT(*) > 1
    ) t;
    
    IF duplicate_count > 0 THEN
        RAISE NOTICE 'WARNING: Still found % duplicate emails after cleanup', duplicate_count;
    ELSE
        RAISE NOTICE 'SUCCESS: No duplicate emails remain';
    END IF;
    
    -- Check for user_uuid duplicates
    SELECT COUNT(*) INTO duplicate_count
    FROM (
        SELECT user_uuid, COUNT(*) 
        FROM user_profiles 
        WHERE user_uuid IS NOT NULL 
        GROUP BY user_uuid 
        HAVING COUNT(*) > 1
    ) t;
    
    IF duplicate_count > 0 THEN
        RAISE NOTICE 'WARNING: Still found % duplicate user_uuid values after cleanup', duplicate_count;
    ELSE
        RAISE NOTICE 'SUCCESS: No duplicate user_uuid values remain';
    END IF;
END $$;

-- Show final summary
SELECT 
    COUNT(*) as total_profiles,
    COUNT(DISTINCT email) as unique_emails,
    COUNT(DISTINCT user_uuid) as unique_user_uuids
FROM user_profiles;

RAISE NOTICE 'User profiles duplicate cleanup completed!';
