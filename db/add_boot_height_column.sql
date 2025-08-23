-- Add boot_height column to wardrobe_items table
ALTER TABLE public.wardrobe_items
ADD COLUMN IF NOT EXISTS boot_height VARCHAR(20);

-- Add comment to document the column
COMMENT ON COLUMN public.wardrobe_items.boot_height IS 'Boot height for footwear items, applicable to boots subcategory. Values: ankle, mid-calf, knee-high, thigh-high';
