-- Enable RLS on tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenarios ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view their own scenarios" ON scenarios;
DROP POLICY IF EXISTS "Users can insert their own scenarios" ON scenarios;
DROP POLICY IF EXISTS "Users can update their own scenarios" ON scenarios;
DROP POLICY IF EXISTS "Users can delete their own scenarios" ON scenarios;

-- Create policies for user_profiles table
CREATE POLICY "Users can view their own profile"
ON user_profiles
FOR SELECT
USING (auth.uid()::text = user_uuid::text);

CREATE POLICY "Users can update their own profile"
ON user_profiles
FOR UPDATE
USING (auth.uid()::text = user_uuid::text);

-- Create policies for scenarios table
CREATE POLICY "Users can view their own scenarios"
ON scenarios
FOR SELECT
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own scenarios"
ON scenarios
FOR INSERT
WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own scenarios"
ON scenarios
FOR UPDATE
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete their own scenarios"
ON scenarios
FOR DELETE
USING (auth.uid()::text = user_id::text);

-- Note: These policies assume that:
-- 1. user_profiles table has a user_uuid column that can be compared with auth.uid()
-- 2. scenarios table has a user_id column that can be compared with auth.uid()
-- 3. You're using Supabase Auth for authentication
-- 4. Both values are explicitly cast to text to avoid type mismatch errors
