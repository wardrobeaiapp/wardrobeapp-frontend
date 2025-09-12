-- Remove times_worn column from wardrobe_items table
-- This column was causing unnecessary "0" values to appear in the wishlist selection modal

ALTER TABLE wardrobe_items DROP COLUMN IF EXISTS times_worn;
