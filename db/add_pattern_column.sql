-- Add pattern column to wardrobe_items table
ALTER TABLE public.wardrobe_items ADD COLUMN IF NOT EXISTS pattern TEXT;

-- Update RLS policies to include the new column
DROP POLICY IF EXISTS "Users can read their own wardrobe items" ON public.wardrobe_items;
CREATE POLICY "Users can read their own wardrobe items" ON public.wardrobe_items
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own wardrobe items" ON public.wardrobe_items;
CREATE POLICY "Users can insert their own wardrobe items" ON public.wardrobe_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own wardrobe items" ON public.wardrobe_items;
CREATE POLICY "Users can update their own wardrobe items" ON public.wardrobe_items
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own wardrobe items" ON public.wardrobe_items;
CREATE POLICY "Users can delete their own wardrobe items" ON public.wardrobe_items
  FOR DELETE USING (auth.uid() = user_id);
