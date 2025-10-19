-- Add details column to wardrobe_items table
-- This field will store additional styling details like puffed sleeves, bow details, wrap style, etc.
-- Useful for AI compatibility analysis that requires nuanced styling information

ALTER TABLE wardrobe_items 
ADD COLUMN details TEXT;

-- Add comment to describe the column purpose
COMMENT ON COLUMN wardrobe_items.details IS 'Additional styling details for enhanced AI compatibility analysis (e.g., puffed sleeves, bow details, wrap style, belt, decoration, etc.)';

-- Note: No index needed for this column as it's primarily for AI analysis input, not filtering/searching
-- The TEXT type allows for flexible length styling descriptions
