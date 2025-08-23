-- Add type column to wardrobe_items table
-- This field will store specific type information for boots, formal shoes, bags, and jewelry

ALTER TABLE wardrobe_items 
ADD COLUMN type VARCHAR(50);

-- Add comment to describe the column purpose
COMMENT ON COLUMN wardrobe_items.type IS 'Specific type for subcategories like boots, formal shoes, bags, jewelry';

-- Create index for better query performance
CREATE INDEX idx_wardrobe_items_type ON wardrobe_items(type);

-- Add constraint to ensure valid type values based on category and subcategory
-- This will be enforced at the application level for flexibility
