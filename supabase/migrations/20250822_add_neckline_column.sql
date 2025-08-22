-- Migration to add neckline column to wardrobe_items table
-- Date: 2025-08-22

ALTER TABLE wardrobe_items 
ADD COLUMN neckline TEXT;

-- Add comment for documentation
COMMENT ON COLUMN wardrobe_items.neckline IS 'Neckline style of the clothing item (e.g., v-neck, round, crew, turtleneck, off shoulder)';
