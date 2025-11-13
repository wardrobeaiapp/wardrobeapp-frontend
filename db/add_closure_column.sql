-- Add closure column to wardrobe_items table
-- This field will store closure type information for outer layer items like cardigans and blazers
-- Enables AI outfit generation to determine if underlayers are required

ALTER TABLE wardrobe_items 
ADD COLUMN closure TEXT;

-- Add comment to describe the column purpose
COMMENT ON COLUMN wardrobe_items.closure IS 'Closure method for outer layer items (Buttons, Zipper, Belt/Tie, Snap/Hook, Open Front, Wrap Style). Used by AI to determine if underlayers are required.';

-- Note: No index needed for this column as it's primarily for AI analysis input, not frequent filtering
-- TEXT type allows flexibility for future closure types while keeping existing varchar patterns
