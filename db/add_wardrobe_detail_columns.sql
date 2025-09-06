-- Add detail columns for wardrobe items
-- Run this migration to add sleeves, style, silhouette, and length columns

ALTER TABLE wardrobe_items 
ADD COLUMN IF NOT EXISTS sleeves TEXT,
ADD COLUMN IF NOT EXISTS style TEXT,
ADD COLUMN IF NOT EXISTS silhouette TEXT,
ADD COLUMN IF NOT EXISTS length TEXT;

-- Add constraints for valid values if they don't already exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'valid_sleeves') THEN
        ALTER TABLE wardrobe_items 
        ADD CONSTRAINT valid_sleeves CHECK (sleeves IS NULL OR sleeves IN ('sleeveless', 'short sleeves', 'long sleeves', '3/4 sleeves', 'one sleeve'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'valid_style') THEN
        ALTER TABLE wardrobe_items 
        ADD CONSTRAINT valid_style CHECK (style IS NULL OR style IN ('casual', 'elegant', 'special', 'sport'));
    END IF;
END
$$;

-- Note: silhouette and length constraints would be category-dependent, so we'll handle validation in the application layer

-- Add comments for documentation
COMMENT ON COLUMN wardrobe_items.sleeves IS 'Sleeve type for tops and one-piece items';
COMMENT ON COLUMN wardrobe_items.style IS 'Style category: casual, elegant, special, sport';
COMMENT ON COLUMN wardrobe_items.silhouette IS 'Item silhouette/fit (varies by category)';
COMMENT ON COLUMN wardrobe_items.length IS 'Item length (for applicable categories)';
