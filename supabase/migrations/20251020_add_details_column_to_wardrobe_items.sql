-- Migration to add details column to wardrobe_items table  
-- Date: 2025-10-20
-- Purpose: Store additional styling details for enhanced AI compatibility analysis

ALTER TABLE wardrobe_items 
ADD COLUMN details TEXT;

-- Add comment for documentation
COMMENT ON COLUMN wardrobe_items.details IS 'Additional styling details for AI compatibility analysis (e.g., puffed sleeves, bow details, wrap style, belt, decoration, etc.)';
