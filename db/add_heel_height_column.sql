-- Add heel_height column to wardrobe_items table
ALTER TABLE public.wardrobe_items
ADD COLUMN heel_height VARCHAR(50);

-- Update RLS policy to include new column
DROP POLICY IF EXISTS "Users can view their own wardrobe items" ON public.wardrobe_items;
DROP POLICY IF EXISTS "Users can insert their own wardrobe items" ON public.wardrobe_items;
DROP POLICY IF EXISTS "Users can update their own wardrobe items" ON public.wardrobe_items;

-- Recreate policies with the new column
CREATE POLICY "Users can view their own wardrobe items" 
ON public.wardrobe_items
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wardrobe items" 
ON public.wardrobe_items
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wardrobe items" 
ON public.wardrobe_items
FOR UPDATE
USING (auth.uid() = user_id);

-- Update the type for the insert/update triggers
DROP TRIGGER IF EXISTS on_wardrobe_item_created ON public.wardrobe_items;
DROP TRIGGER IF EXISTS on_wardrobe_item_updated ON public.wardrobe_items;

-- Recreate the triggers with the new column
CREATE TRIGGER on_wardrobe_item_created
  BEFORE INSERT ON public.wardrobe_items
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_wardrobe_item();

CREATE TRIGGER on_wardrobe_item_updated
  BEFORE UPDATE ON public.wardrobe_items
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_wardrobe_item();
