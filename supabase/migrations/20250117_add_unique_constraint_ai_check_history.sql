-- Add unique constraint on (user_id, item_id) to prevent duplicate AI checks for same item
-- This enables upsert functionality to update existing records instead of creating duplicates

ALTER TABLE ai_check_history 
ADD CONSTRAINT unique_user_item_check 
UNIQUE (user_id, item_id);

-- Add comment for clarity
COMMENT ON CONSTRAINT unique_user_item_check ON ai_check_history IS 
'Ensures one AI check record per user per item - enables upsert to update existing records';
