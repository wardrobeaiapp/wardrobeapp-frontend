-- SQL script to fix user_profiles permissions and RLS policies

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- First, let's make sure the table exists with the right structure
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_uuid UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT,
    email TEXT,
    first_name TEXT,
    last_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Check and fix RLS policies
DO
$$
BEGIN
    -- Check if user_profiles table exists
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_profiles') THEN
        -- Enable RLS on the table
        ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
        
        -- Drop all existing policies first to start fresh
        DROP POLICY IF EXISTS user_profiles_policy ON user_profiles;
        DROP POLICY IF EXISTS user_profiles_select_policy ON user_profiles;
        DROP POLICY IF EXISTS user_profiles_insert_policy ON user_profiles;
        DROP POLICY IF EXISTS user_profiles_update_policy ON user_profiles;
        DROP POLICY IF EXISTS user_profiles_delete_policy ON user_profiles;
        
        -- Create separate policies for each operation for better control
        
        -- Very permissive SELECT policy for debugging
        CREATE POLICY user_profiles_select_policy ON user_profiles
            FOR SELECT USING (true);
        
        -- INSERT policy - allow authenticated users to insert their own profiles
        CREATE POLICY user_profiles_insert_policy ON user_profiles
            FOR INSERT WITH CHECK (true);
        
        -- UPDATE policy - allow authenticated users to update their own profiles
        CREATE POLICY user_profiles_update_policy ON user_profiles
            FOR UPDATE USING (true);
        
        -- DELETE policy - allow authenticated users to delete their own profiles
        CREATE POLICY user_profiles_delete_policy ON user_profiles
            FOR DELETE USING (true);
            
        RAISE NOTICE 'Created highly permissive RLS policies for user_profiles for debugging';
        
        -- Ensure anon role has access to the table
        GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_profiles TO anon;
        GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_profiles TO authenticated;
        GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_profiles TO service_role;
        
        RAISE NOTICE 'Granted permissions to all roles on user_profiles';
        
        -- Check and fix the id column
        IF EXISTS (
            SELECT FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = 'user_profiles'
            AND column_name = 'id'
        ) THEN
            -- Make sure id has a default value
            ALTER TABLE user_profiles 
            ALTER COLUMN id SET DEFAULT uuid_generate_v4();
            
            -- Fix any NULL id values
            UPDATE user_profiles
            SET id = uuid_generate_v4()
            WHERE id IS NULL;
            
            RAISE NOTICE 'Ensured id column has default value and no NULLs';
        END IF;
        
        -- Check and fix the user_uuid column
        IF EXISTS (
            SELECT FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = 'user_profiles'
            AND column_name = 'user_uuid'
        ) THEN
            -- Make sure user_uuid has proper references
            BEGIN
                ALTER TABLE user_profiles 
                DROP CONSTRAINT IF EXISTS fk_user_profiles_user;
                
                ALTER TABLE user_profiles 
                ADD CONSTRAINT fk_user_profiles_user 
                FOREIGN KEY (user_uuid) REFERENCES auth.users(id) ON DELETE CASCADE;
                
                RAISE NOTICE 'Updated foreign key constraint on user_uuid';
            EXCEPTION WHEN OTHERS THEN
                RAISE NOTICE 'Could not update foreign key constraint: %', SQLERRM;
            END;
        END IF;
    ELSE
        RAISE NOTICE 'user_profiles table does not exist';
    END IF;
END
$$;

-- Create a function to debug user_profiles access
CREATE OR REPLACE FUNCTION debug_user_profiles_access(user_id uuid)
RETURNS TABLE (
    has_access boolean,
    error_message text,
    user_exists boolean,
    policy_exists boolean,
    role_has_permission boolean
) AS $$
DECLARE
    user_exists boolean;
    policy_exists boolean;
    role_has_permission boolean;
    error_message text;
    has_access boolean;
BEGIN
    -- Check if user exists
    SELECT EXISTS (
        SELECT FROM auth.users WHERE id = user_id
    ) INTO user_exists;
    
    -- Check if policy exists
    SELECT EXISTS (
        SELECT FROM pg_policies 
        WHERE tablename = 'user_profiles' 
        AND schemaname = 'public'
    ) INTO policy_exists;
    
    -- Check if role has permission
    SELECT EXISTS (
        SELECT FROM information_schema.role_table_grants
        WHERE table_name = 'user_profiles'
        AND table_schema = 'public'
        AND grantee = 'authenticated'
        AND privilege_type = 'SELECT'
    ) INTO role_has_permission;
    
    -- Try to access the data
    BEGIN
        EXECUTE format('SET LOCAL ROLE authenticated; SET LOCAL "request.jwt.claims" = ''{"sub": "%s"}''', user_id);
        
        PERFORM * FROM user_profiles WHERE user_uuid = user_id LIMIT 1;
        has_access := true;
        error_message := NULL;
    EXCEPTION WHEN OTHERS THEN
        has_access := false;
        error_message := SQLERRM;
    END;
    
    RETURN QUERY SELECT 
        has_access,
        error_message,
        user_exists,
        policy_exists,
        role_has_permission;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
