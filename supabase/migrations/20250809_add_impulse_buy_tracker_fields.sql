-- Add impulse buy tracker fields to user_progress table
-- These columns track when the impulse buy tracker becomes active after onboarding completion
-- impulse_buy_tracker_set: boolean to indicate if the tracker is active
-- impulse_buy_tracker_start_date: date when the tracker was activated

ALTER TABLE user_progress 
ADD COLUMN impulse_buy_tracker_set BOOLEAN DEFAULT false,
ADD COLUMN impulse_buy_tracker_start_date TIMESTAMPTZ;

-- Add comments to explain the columns
COMMENT ON COLUMN user_progress.impulse_buy_tracker_set IS 'Indicates if the impulse buy tracker is active (set after onboarding completion)';
COMMENT ON COLUMN user_progress.impulse_buy_tracker_start_date IS 'Date when the impulse buy tracker was activated (set after onboarding completion)';

-- Update existing rows to have false as the default value (in case there are existing records)
UPDATE user_progress 
SET impulse_buy_tracker_set = false 
WHERE impulse_buy_tracker_set IS NULL;
