-- Drop existing ai_check_history table and create exact copy of ai_analysis_mocks + 2 status fields

-- Drop existing table if it exists
DROP TABLE IF EXISTS ai_check_history;

-- Create ai_check_history as EXACT copy of ALL 17 ai_analysis_mocks columns + 2 additional status fields
CREATE TABLE ai_check_history (
  -- ORIGINAL 7 COLUMNS FROM ai_analysis_mocks
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wardrobe_item_id UUID NOT NULL REFERENCES wardrobe_items(id) ON DELETE CASCADE,
  analysis_data JSONB NOT NULL,
  created_from_real_analysis BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- ADDITIONAL 10 COLUMNS FROM optimize_ai_analysis_mocks_structure.sql
  compatibility_score INTEGER DEFAULT 0,
  suitable_scenarios TEXT[], -- Array of scenario names
  item_subcategory TEXT,
  recommendation_action TEXT,
  recommendation_text TEXT,
  wishlist_status TEXT DEFAULT 'not_reviewed',
  has_compatible_items BOOLEAN DEFAULT FALSE,
  outfit_combinations_count INTEGER DEFAULT 0,
  analysis_error TEXT,
  analysis_error_details TEXT,
  
  -- ✅ ADDITIONAL STATUS FIELDS (only difference from mocks table)
  user_action_status TEXT DEFAULT 'pending' CHECK (user_action_status IN ('saved', 'dismissed', 'pending', 'applied')),
  -- Note: wishlist_status already exists above from mocks table
  
  -- Ensure one analysis per wardrobe item per user (allowing multiple users to analyze same item)
  UNIQUE(wardrobe_item_id, created_by)
);

-- Indexes for efficient queries (EXACT SAME AS MOCKS + additional ones for status fields)
-- Original indexes from mocks table
CREATE INDEX idx_ai_check_history_wardrobe_item_id 
ON ai_check_history(wardrobe_item_id);

CREATE INDEX idx_ai_check_history_created_by 
ON ai_check_history(created_by);

CREATE INDEX idx_ai_check_history_created_at 
ON ai_check_history(created_at);

-- Additional indexes from optimize migration
CREATE INDEX IF NOT EXISTS idx_ai_check_history_compatibility_score ON ai_check_history(compatibility_score);
CREATE INDEX IF NOT EXISTS idx_ai_check_history_suitable_scenarios ON ai_check_history USING GIN(suitable_scenarios);
CREATE INDEX IF NOT EXISTS idx_ai_check_history_item_subcategory ON ai_check_history(item_subcategory);
CREATE INDEX IF NOT EXISTS idx_ai_check_history_wishlist_status ON ai_check_history(wishlist_status);
CREATE INDEX IF NOT EXISTS idx_ai_check_history_has_compatible_items ON ai_check_history(has_compatible_items);

-- Additional index for our extra status field
CREATE INDEX idx_ai_check_history_user_action_status 
ON ai_check_history(user_action_status);

-- Add RLS (Row Level Security) policies (SAME AS MOCKS)
ALTER TABLE ai_check_history ENABLE ROW LEVEL SECURITY;

-- Users can only access history for their own wardrobe items
CREATE POLICY "Users can view their own check history" ON ai_check_history
  FOR SELECT USING (
    wardrobe_item_id IN (
      SELECT id FROM wardrobe_items WHERE user_id = auth.uid()
    )
  );

-- Users can only create history for their own wardrobe items
CREATE POLICY "Users can create check history for their items" ON ai_check_history
  FOR INSERT WITH CHECK (
    wardrobe_item_id IN (
      SELECT id FROM wardrobe_items WHERE user_id = auth.uid()
    )
  );

-- Users can only update history for their own wardrobe items
CREATE POLICY "Users can update their own check history" ON ai_check_history
  FOR UPDATE USING (
    wardrobe_item_id IN (
      SELECT id FROM wardrobe_items WHERE user_id = auth.uid()
    )
  );

-- Users can only delete history for their own wardrobe items
CREATE POLICY "Users can delete their own check history" ON ai_check_history
  FOR DELETE USING (
    wardrobe_item_id IN (
      SELECT id FROM wardrobe_items WHERE user_id = auth.uid()
    )
  );

-- Add trigger for updating updated_at timestamp (SAME AS MOCKS)
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
