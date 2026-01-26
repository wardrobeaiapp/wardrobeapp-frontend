-- Allow AI Check History for both wardrobe items and image-only analyses
-- This migration makes wardrobe_item_id nullable and updates RLS policies accordingly

-- Make wardrobe_item_id nullable to support image-only analyses
ALTER TABLE ai_check_history 
ALTER COLUMN wardrobe_item_id DROP NOT NULL;

-- Remove the unique constraint that requires wardrobe_item_id
DROP INDEX IF EXISTS ai_check_history_wardrobe_item_id_created_by_idx;

-- Add new unique constraint that allows NULL wardrobe_item_id
-- This allows multiple image-only analyses per user, but still prevents duplicates for actual wardrobe items
CREATE UNIQUE INDEX ai_check_history_unique_record 
ON ai_check_history(wardrobe_item_id, created_by) 
WHERE wardrobe_item_id IS NOT NULL;

-- Update RLS policies to handle both wardrobe items and image-only analyses

-- Users can view their own history (both wardrobe items and image-only)
DROP POLICY IF EXISTS "Users can view their own AI check history" ON ai_check_history;
CREATE POLICY "Users can view their own AI check history" ON ai_check_history
  FOR SELECT USING (
    created_by = auth.uid()
  );

-- Users can create history for their own wardrobe items OR image-only analyses
DROP POLICY IF EXISTS "Users can create check history for their items" ON ai_check_history;
CREATE POLICY "Users can create AI check history" ON ai_check_history
  FOR INSERT WITH CHECK (
    created_by = auth.uid() AND (
      -- For wardrobe items: ensure the item belongs to the user
      (wardrobe_item_id IS NOT NULL AND wardrobe_item_id IN (
        SELECT id FROM wardrobe_items WHERE user_id = auth.uid()
      )) OR
      -- For image-only analyses: allow null wardrobe_item_id
      (wardrobe_item_id IS NULL)
    )
  );

-- Users can update their own history (both types)
DROP POLICY IF EXISTS "Users can update their own AI check history" ON ai_check_history;
CREATE POLICY "Users can update their own AI check history" ON ai_check_history
  FOR UPDATE USING (
    created_by = auth.uid()
  );

-- Users can delete their own history (both types)
DROP POLICY IF EXISTS "Users can delete their own AI check history" ON ai_check_history;
CREATE POLICY "Users can delete their own AI check history" ON ai_check_history
  FOR DELETE USING (
    created_by = auth.uid()
  );

-- Add comment to clarify the purpose of nullable wardrobe_item_id
COMMENT ON COLUMN ai_check_history.wardrobe_item_id IS 'Nullable: References wardrobe_items.id for item analyses, NULL for image-only analyses';
