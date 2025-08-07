-- Add student_uniform column to user_preferences table
ALTER TABLE user_preferences 
ADD COLUMN IF NOT EXISTS student_uniform TEXT DEFAULT '';

-- Add comment to explain the purpose of the column
COMMENT ON COLUMN user_preferences.student_uniform IS 'Student uniform preference selected during onboarding when "student" is selected as daily activity';
