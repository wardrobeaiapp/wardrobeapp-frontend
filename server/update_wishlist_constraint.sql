-- Update the CHECK constraint to allow 'not_recommended' value
-- Drop the existing constraint
ALTER TABLE wardrobe_items DROP CONSTRAINT IF EXISTS valid_wishlist_status;
ALTER TABLE wardrobe_items DROP CONSTRAINT IF EXISTS valid_wish;

-- Add the updated constraint with all valid values
ALTER TABLE wardrobe_items 
ADD CONSTRAINT valid_wishlist_status 
CHECK (wishlist_status IN ('approved', 'potential_issue', 'not_reviewed', 'not_recommended'));
