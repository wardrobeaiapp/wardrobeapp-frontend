-- Create table for storing AI analysis mock data for demo purposes
-- This allows saving real AI analysis results to use in demo mode

CREATE TABLE IF NOT EXISTS ai_analysis_mocks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wardrobe_item_id UUID NOT NULL REFERENCES wardrobe_items(id) ON DELETE CASCADE,
  
  -- Store the full analysis data as JSON
  analysis_data JSONB NOT NULL,
  -- Example structure:
  -- {
  --   "compatibility": { "score": 85, "reasons": [...] },
  --   "suggestions": [...],
  --   "complementingItems": [...],
  --   "analysis": "Your burgundy sweater analysis..."
  -- }
  
  -- Track if this was saved from a real AI analysis (vs manually created)
  created_from_real_analysis BOOLEAN DEFAULT TRUE,
  
  -- User who saved this mock (for tracking purposes)
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Ensure one mock per wardrobe item
  UNIQUE(wardrobe_item_id)
);

-- Indexes for efficient queries
CREATE INDEX idx_ai_analysis_mocks_wardrobe_item_id 
ON ai_analysis_mocks(wardrobe_item_id);

CREATE INDEX idx_ai_analysis_mocks_created_by 
ON ai_analysis_mocks(created_by);

CREATE INDEX idx_ai_analysis_mocks_created_at 
ON ai_analysis_mocks(created_at);

-- Add RLS (Row Level Security) policies
ALTER TABLE ai_analysis_mocks ENABLE ROW LEVEL SECURITY;

-- Users can only access mocks for their own wardrobe items
CREATE POLICY "Users can view their own analysis mocks" ON ai_analysis_mocks
  FOR SELECT USING (
    wardrobe_item_id IN (
      SELECT id FROM wardrobe_items WHERE user_id = auth.uid()
    )
  );

-- Users can only create mocks for their own wardrobe items
CREATE POLICY "Users can create analysis mocks for their items" ON ai_analysis_mocks
  FOR INSERT WITH CHECK (
    wardrobe_item_id IN (
      SELECT id FROM wardrobe_items WHERE user_id = auth.uid()
    )
  );

-- Users can only update mocks for their own wardrobe items
CREATE POLICY "Users can update their own analysis mocks" ON ai_analysis_mocks
  FOR UPDATE USING (
    wardrobe_item_id IN (
      SELECT id FROM wardrobe_items WHERE user_id = auth.uid()
    )
  );

-- Users can only delete mocks for their own wardrobe items
CREATE POLICY "Users can delete their own analysis mocks" ON ai_analysis_mocks
  FOR DELETE USING (
    wardrobe_item_id IN (
      SELECT id FROM wardrobe_items WHERE user_id = auth.uid()
    )
  );

-- Add trigger for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_ai_analysis_mocks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_ai_analysis_mocks_updated_at
  BEFORE UPDATE ON ai_analysis_mocks
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_analysis_mocks_updated_at();
