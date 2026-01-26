-- Add image_url column to ai_check_history table
-- This allows storing image URLs for AI history items like wardrobe items

ALTER TABLE ai_check_history 
ADD COLUMN image_url TEXT;

-- Add comment to clarify the purpose of image_url column
COMMENT ON COLUMN ai_check_history.image_url IS 'Image URL for AI history items, stored like wardrobe_items.image_url';
