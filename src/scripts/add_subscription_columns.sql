-- Add subscription columns to user_profiles table
ALTER TABLE user_profiles
ADD COLUMN subscription_plan TEXT DEFAULT 'free',
ADD COLUMN subscription_renewal_date DATE;

-- Update existing rows to have default values
UPDATE user_profiles
SET subscription_plan = 'free',
    subscription_renewal_date = NOW() + INTERVAL '1 month'
WHERE subscription_plan IS NULL;

-- Add comment to explain the columns
COMMENT ON COLUMN user_profiles.subscription_plan IS 'User subscription plan (free or pro)';
COMMENT ON COLUMN user_profiles.subscription_renewal_date IS 'Date when the subscription will renew';
