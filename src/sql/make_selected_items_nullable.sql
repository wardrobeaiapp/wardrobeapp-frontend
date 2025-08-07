-- Make selected_items column nullable (not required)
ALTER TABLE public.capsules 
ALTER COLUMN selected_items DROP NOT NULL;

-- Comment on the change
COMMENT ON COLUMN public.capsules.selected_items IS 'Array of WardrobeItem ids (optional)';
