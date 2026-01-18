-- Simplify ai_check_history to match ai_analysis_mocks structure + status fields
-- This eliminates redundant columns and aligns with the working mocks format

-- Drop the existing complex table and recreate with simplified structure
DROP TABLE IF EXISTS ai_check_history CASCADE;

CREATE TABLE ai_check_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wardrobe_item_id UUID NOT NULL REFERENCES wardrobe_items(id) ON DELETE CASCADE,
  
  -- Store the full analysis data as JSON (same as ai_analysis_mocks)
  analysis_data JSONB NOT NULL,
  -- Structure matches analysis_mocks for compatibility:
  -- {
  --   "analysis": "Full analysis text...",
  --   "score": 8.5,
  --   "feedback": "This item works well...",
  --   "recommendationText": "Consider pairing with...",
  --   "suitableScenarios": ["casual", "business"],
  --   "compatibleItems": { "top": [...], "footwear": [...] },
  --   "outfitCombinations": [...],
  --   "itemDetails": { "id": "...", "name": "...", "imageUrl": "..." }
  -- }
  
  -- Status fields (the key difference from analysis_mocks)
  user_action_status TEXT CHECK (user_action_status IN ('saved', 'dismissed', 'pending', 'applied')) DEFAULT 'pending',
  wishlist_status TEXT CHECK (wishlist_status IN ('approved', 'potential_issue', 'not_reviewed')),
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- One history record per user+item combination
  UNIQUE(user_id, wardrobe_item_id)
);

-- Indexes for efficient queries
CREATE INDEX idx_ai_check_history_user_id ON ai_check_history(user_id);
CREATE INDEX idx_ai_check_history_wardrobe_item_id ON ai_check_history(wardrobe_item_id);
CREATE INDEX idx_ai_check_history_user_action_status ON ai_check_history(user_action_status);
CREATE INDEX idx_ai_check_history_created_at ON ai_check_history(created_at);

-- GIN index for analysis_data JSON queries
CREATE INDEX idx_ai_check_history_analysis_data ON ai_check_history USING GIN (analysis_data);

-- RLS policies
ALTER TABLE ai_check_history ENABLE ROW LEVEL SECURITY;

-- Users can only view their own history
CREATE POLICY "Users can view their own AI check history" ON ai_check_history
  FOR SELECT USING (user_id = auth.uid());

-- Users can only create their own history  
CREATE POLICY "Users can create their own AI check history" ON ai_check_history
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can only update their own history
CREATE POLICY "Users can update their own AI check history" ON ai_check_history
  FOR UPDATE USING (user_id = auth.uid());

-- Users can only delete their own history
CREATE POLICY "Users can delete their own AI check history" ON ai_check_history
  FOR DELETE USING (user_id = auth.uid());

-- Add trigger for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_ai_check_history_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_ai_check_history_updated_at
  BEFORE UPDATE ON ai_check_history
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_check_history_updated_at();
