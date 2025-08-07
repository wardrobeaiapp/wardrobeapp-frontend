-- SQL script to fix the user_profiles table ID column type

-- Ensure the update_modified_column function exists
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Check if the extension is available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Fix the user_profiles table
DO
$$
DECLARE
    column_exists boolean;
    column_type text;
BEGIN
    -- Check if the table exists
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_profiles') THEN
        -- Check if the id column exists
        SELECT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'user_profiles' 
            AND column_name = 'id'
        ) INTO column_exists;
        
        IF column_exists THEN
            -- Get the column type
            SELECT data_type INTO column_type
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'user_profiles' 
            AND column_name = 'id';
            
            -- If it's a bigint, convert it
            IF column_type = 'bigint' THEN
                -- Create a backup
                DROP TABLE IF EXISTS user_profiles_backup;
                CREATE TABLE user_profiles_backup AS SELECT * FROM user_profiles;
                
                -- Add a UUID column
                ALTER TABLE user_profiles ADD COLUMN temp_id UUID;
                
                -- Try to convert existing IDs if they look like UUIDs
                UPDATE user_profiles 
                SET temp_id = CASE 
                    WHEN id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' 
                    THEN id::text::uuid 
                    ELSE uuid_generate_v4() 
                END;
                
                -- Drop and rename
                ALTER TABLE user_profiles DROP COLUMN id;
                ALTER TABLE user_profiles RENAME COLUMN temp_id TO id;
                ALTER TABLE user_profiles ADD PRIMARY KEY (id);
                
                -- Add user_uuid if needed
                IF NOT EXISTS (
                    SELECT FROM information_schema.columns 
                    WHERE table_schema = 'public' 
                    AND table_name = 'user_profiles' 
                    AND column_name = 'user_uuid'
                ) THEN
                    ALTER TABLE user_profiles ADD COLUMN user_uuid UUID;
                    UPDATE user_profiles SET user_uuid = id;
                    -- Add foreign key if possible
                    BEGIN
                        ALTER TABLE user_profiles 
                        ADD CONSTRAINT fk_user_profiles_user 
                        FOREIGN KEY (user_uuid) REFERENCES auth.users(id) ON DELETE CASCADE;
                    EXCEPTION WHEN OTHERS THEN
                        RAISE NOTICE 'Could not add foreign key constraint: %', SQLERRM;
                    END;
                END IF;
                
                RAISE NOTICE 'Successfully converted user_profiles.id to UUID';
            ELSE
                RAISE NOTICE 'The id column is already type %', column_type;
            END IF;
        ELSE
            RAISE NOTICE 'The id column does not exist in user_profiles';
        END IF;
    ELSE
        -- Create the table
        CREATE TABLE user_profiles (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_uuid UUID,
            name TEXT,
            email TEXT,
            onboarding_completed BOOLEAN DEFAULT FALSE,
            profile_completed BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Try to add foreign key
        BEGIN
            ALTER TABLE user_profiles 
            ADD CONSTRAINT fk_user_profiles_user 
            FOREIGN KEY (user_uuid) REFERENCES auth.users(id) ON DELETE CASCADE;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Could not add foreign key constraint: %', SQLERRM;
        END;
        
        -- Add RLS
        ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
        CREATE POLICY user_profiles_policy ON user_profiles
            USING (auth.uid() = user_uuid)
            WITH CHECK (auth.uid() = user_uuid);
        
        -- Add update trigger
        CREATE TRIGGER update_user_profiles_updated_at
        BEFORE UPDATE ON user_profiles
        FOR EACH ROW
        EXECUTE FUNCTION update_modified_column();
        
        RAISE NOTICE 'Created new user_profiles table';
    END IF;
    
    -- Add comments
    COMMENT ON TABLE user_profiles IS 'User profiles with UUID primary key';
    COMMENT ON COLUMN user_profiles.id IS 'Primary key (UUID)';
    COMMENT ON COLUMN user_profiles.user_uuid IS 'Foreign key to auth.users table';
END
$$;
