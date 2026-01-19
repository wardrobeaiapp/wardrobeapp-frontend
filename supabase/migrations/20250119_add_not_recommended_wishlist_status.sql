-- Add 'not_recommended' to wishlist_status enum values
-- This updates the CHECK constraint to include the new status option

-- Update ai_check_history table wishlist_status constraint
ALTER TABLE ai_check_history 
DROP CONSTRAINT IF EXISTS ai_check_history_wishlist_status_check;

ALTER TABLE ai_check_history 
ADD CONSTRAINT ai_check_history_wishlist_status_check 
CHECK (wishlist_status IN ('approved', 'potential_issue', 'not_reviewed', 'not_recommended'));

-- Update wardrobe_items table wishlist_status constraint
-- We know this table has wishlist_status column, so update it explicitly
ALTER TABLE wardrobe_items 
DROP CONSTRAINT IF EXISTS wardrobe_items_wishlist_status_check;

ALTER TABLE wardrobe_items 
ADD CONSTRAINT wardrobe_items_wishlist_status_check 
CHECK (wishlist_status IN ('approved', 'potential_issue', 'not_recommended', 'not_reviewed'));
