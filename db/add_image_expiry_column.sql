-- SQL script to add image_expiry column for URL expiration tracking

-- Add image_expiry column to wardrobe_items table
ALTER TABLE wardrobe_items ADD COLUMN IF NOT EXISTS image_expiry TIMESTAMP WITH TIME ZONE;

-- Create index for efficient expiry queries
CREATE INDEX IF NOT EXISTS idx_wardrobe_items_image_expiry 
ON wardrobe_items(image_expiry) WHERE image_expiry IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN wardrobe_items.image_expiry IS 'Timestamp when the stored signed URL expires';
