-- Add uniform_preference column to user_preferences table
ALTER TABLE user_preferences
ADD COLUMN IF NOT EXISTS uniform_preference TEXT DEFAULT '';

COMMENT ON COLUMN user_preferences.uniform_preference IS 'Uniform preference selected during onboarding when "physical" is selected as daily activity';
