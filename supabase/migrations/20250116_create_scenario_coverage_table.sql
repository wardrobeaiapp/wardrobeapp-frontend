-- Create table for pre-calculated scenario coverage data
-- This stores outfit combination calculations for each user/scenario/season combination

CREATE TABLE IF NOT EXISTS scenario_coverage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scenario_id UUID REFERENCES scenarios(id) ON DELETE CASCADE,
  scenario_name TEXT NOT NULL, -- Denormalized for faster queries
  scenario_frequency TEXT, -- 'daily', 'weekly', 'monthly', 'rarely'
  season TEXT NOT NULL CHECK (season IN ('spring', 'summer', 'fall', 'winter')),
  
  -- Outfit combination results
  total_outfits INTEGER NOT NULL DEFAULT 0,
  coverage_level INTEGER NOT NULL DEFAULT 0 CHECK (coverage_level >= 0 AND coverage_level <= 5),
  
  -- Detailed breakdown (JSON)
  outfit_breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Example: {"topBottomCombos": 6, "dresses": 1, "jumpsuits": 0}
  
  -- Gap analysis
  bottleneck TEXT, -- 'footwear', 'tops', 'bottoms', 'tops_or_dresses', etc.
  missing_for_next_outfit TEXT, -- Human-readable suggestion
  
  -- Item counts for reference (JSON)
  item_counts JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Example: {"tops": 3, "bottoms": 2, "dresses": 1, "footwear": 1}
  
  -- Metadata
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Ensure one record per user/scenario/season combination
  UNIQUE(user_id, scenario_id, season)
);

-- Indexes for fast queries during AI analysis
CREATE INDEX idx_scenario_coverage_user_season ON scenario_coverage(user_id, season);
CREATE INDEX idx_scenario_coverage_user_scenario ON scenario_coverage(user_id, scenario_id);
CREATE INDEX idx_scenario_coverage_lookup ON scenario_coverage(user_id, scenario_name, season);

-- Index for cleanup queries
CREATE INDEX idx_scenario_coverage_last_updated ON scenario_coverage(last_updated);

-- Row Level Security
ALTER TABLE scenario_coverage ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own scenario coverage data
CREATE POLICY "Users can manage their own scenario coverage" ON scenario_coverage
  FOR ALL USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON scenario_coverage TO authenticated;

-- Add helpful comments
COMMENT ON TABLE scenario_coverage IS 'Pre-calculated outfit combination data for user scenarios by season';
COMMENT ON COLUMN scenario_coverage.total_outfits IS 'Total number of complete outfits possible for this scenario/season';
COMMENT ON COLUMN scenario_coverage.coverage_level IS 'Coverage score 0-5 based on outfit count (0=no outfits, 5=excellent variety)';
COMMENT ON COLUMN scenario_coverage.outfit_breakdown IS 'JSON breakdown of outfit types: {topBottomCombos, dresses, jumpsuits}';
COMMENT ON COLUMN scenario_coverage.bottleneck IS 'Category limiting outfit creation (footwear, tops, bottoms, etc.)';
COMMENT ON COLUMN scenario_coverage.item_counts IS 'JSON count of items by category for this scenario/season';
