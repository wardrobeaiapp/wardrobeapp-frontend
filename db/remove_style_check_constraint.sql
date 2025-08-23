-- Remove the restrictive style check constraint
-- The constraint only allows ('casual', 'elegant', 'special', 'sport') 
-- but the application uses many more subcategory-specific styles like 'oxford', 'derby', 'chelsea', etc.

ALTER TABLE wardrobe_items 
DROP CONSTRAINT IF EXISTS valid_style;

-- Update comment to reflect that style validation is handled at application level
COMMENT ON COLUMN wardrobe_items.style IS 'Item style - varies by category and subcategory (validation handled in application)';
