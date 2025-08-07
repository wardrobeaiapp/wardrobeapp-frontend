-- SQL script to fix the NOT NULL constraint violation in user_profiles table

-- Ensure the uuid-ossp extension is available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Fix the user_profiles table
DO
$$
BEGIN
    -- Check if the table exists
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_profiles') THEN
        -- Check if id column has a default value
        IF NOT EXISTS (
            SELECT FROM pg_attribute a
            JOIN pg_class t ON a.attrelid = t.oid
            JOIN pg_namespace s ON t.relnamespace = s.oid
            JOIN pg_attrdef d ON t.oid = d.adrelid AND a.attnum = d.adnum
            WHERE a.attname = 'id'
            AND t.relname = 'user_profiles'
            AND s.nspname = 'public'
        ) THEN
            -- Add default value to id column
            ALTER TABLE user_profiles 
            ALTER COLUMN id SET DEFAULT uuid_generate_v4();
            
            RAISE NOTICE 'Added DEFAULT uuid_generate_v4() to user_profiles.id column';
        ELSE
            RAISE NOTICE 'user_profiles.id already has a default value';
        END IF;
        
        -- Check if user_uuid column has a default value
        IF EXISTS (
            SELECT FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = 'user_profiles'
            AND column_name = 'user_uuid'
        ) AND NOT EXISTS (
            SELECT FROM pg_attribute a
            JOIN pg_class t ON a.attrelid = t.oid
            JOIN pg_namespace s ON t.relnamespace = s.oid
            JOIN pg_attrdef d ON t.oid = d.adrelid AND a.attnum = d.adnum
            WHERE a.attname = 'user_uuid'
            AND t.relname = 'user_profiles'
            AND s.nspname = 'public'
        ) THEN
            -- Add default value to user_uuid column if it exists
            ALTER TABLE user_profiles 
            ALTER COLUMN user_uuid SET DEFAULT auth.uid();
            
            RAISE NOTICE 'Added DEFAULT auth.uid() to user_profiles.user_uuid column';
        END IF;
        
        -- Fix any existing NULL id values
        UPDATE user_profiles
        SET id = uuid_generate_v4()
        WHERE id IS NULL;
        
        RAISE NOTICE 'Fixed any NULL id values in user_profiles table';
        
        -- Examine the createUserProfile function in supabaseAuthService.ts
        -- It should be explicitly setting the id to a UUID value
    ELSE
        RAISE NOTICE 'user_profiles table does not exist';
    END IF;
END
$$;
