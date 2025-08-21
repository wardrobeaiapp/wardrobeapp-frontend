-- Migration to add silhouette and length columns to wardrobe_items table
-- Date: 2025-08-21

ALTER TABLE wardrobe_items 
ADD COLUMN silhouette TEXT,
ADD COLUMN length TEXT;

-- Add comments for documentation
COMMENT ON COLUMN wardrobe_items.silhouette IS 'Silhouette style of the clothing item (e.g., slim fit, regular fit, oversized)';
COMMENT ON COLUMN wardrobe_items.length IS 'Length specification of the clothing item (e.g., full length, cropped, mini, midi, maxi)';
