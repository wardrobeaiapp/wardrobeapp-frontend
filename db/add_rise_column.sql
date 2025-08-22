-- Add rise column for wardrobe items
-- Run this migration to add rise column for BOTTOM category items

ALTER TABLE wardrobe_items 
ADD COLUMN IF NOT EXISTS rise TEXT;

-- Add constraint for valid rise values
ALTER TABLE wardrobe_items 
ADD CONSTRAINT valid_rise CHECK (rise IS NULL OR rise IN ('High', 'Mid', 'Low'));

-- Add comment for documentation
COMMENT ON COLUMN wardrobe_items.rise IS 'Rise type for bottom items: High, Mid, Low';
