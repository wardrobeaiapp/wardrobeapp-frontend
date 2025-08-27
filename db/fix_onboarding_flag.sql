-- Fix for onboarding_completed flag

-- Update all user profiles to set onboarding_completed to true
-- This ensures users who have already gone through onboarding don't get redirected
UPDATE user_profiles
SET onboarding_completed = true
WHERE onboarding_completed = false;

-- For debugging: Show updated profiles
SELECT id, user_uuid, name, onboarding_completed, updated_at
FROM user_profiles
ORDER BY updated_at DESC
LIMIT 10;
