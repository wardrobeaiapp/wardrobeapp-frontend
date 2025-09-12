-- Remove last_worn column from wardrobe_items table
-- This column is not needed for the current app functionality

ALTER TABLE wardrobe_items DROP COLUMN IF EXISTS last_worn;
