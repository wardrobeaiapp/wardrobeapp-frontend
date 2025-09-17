-- Create normalized scenario coverage table split by category
-- This replaces the monolithic approach with efficient per-category rows

CREATE TABLE IF NOT EXISTS scenario_coverage_by_category (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scenario_id UUID REFERENCES scenarios(id) ON DELETE CASCADE,
  scenario_name TEXT NOT NULL,
  scenario_frequency TEXT, -- e.g., "3 times per week"
  season TEXT NOT NULL CHECK (season IN ('spring', 'summer', 'fall', 'winter')),
  category TEXT NOT NULL CHECK (category IN ('top', 'bottom', 'one_piece', 'outerwear', 'footwear', 'accessory')),
  
  -- Category-specific metrics
  current_items INTEGER NOT NULL DEFAULT 0,
  needed_items_min INTEGER NOT NULL DEFAULT 0,
  needed_items_ideal INTEGER NOT NULL DEFAULT 0,
  needed_items_max INTEGER NOT NULL DEFAULT 0,
  coverage_percent INTEGER NOT NULL DEFAULT 0 CHECK (coverage_percent >= 0 AND coverage_percent <= 100),
  gap_count INTEGER NOT NULL DEFAULT 0,
  
  -- Category status
  is_critical BOOLEAN DEFAULT FALSE,  -- True if this category has 0 items
  is_bottleneck BOOLEAN DEFAULT FALSE, -- True if this category is limiting outfit creation
  priority_level INTEGER DEFAULT 3 CHECK (priority_level >= 1 AND priority_level <= 5), -- 1=critical, 5=nice-to-have
  
  -- Recommendations
  category_recommendations JSONB DEFAULT '[]'::jsonb,
  -- Example: ["Add 2 more work shoes", "Consider leather vs. fabric options", "Black or brown recommended"]
  
  -- Strategy-specific targets (from outfitStrategies)
  separates_focused_target INTEGER DEFAULT 0,
  dress_focused_target INTEGER DEFAULT 0,
  balanced_target INTEGER DEFAULT 0,
  
  -- Metadata
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Ensure one record per user/scenario/season/category combination
  UNIQUE(user_id, scenario_id, season, category)
);

-- Indexes for fast queries
CREATE INDEX idx_scenario_coverage_by_category_user_category 
ON scenario_coverage_by_category(user_id, category);

CREATE INDEX idx_scenario_coverage_by_category_user_scenario 
ON scenario_coverage_by_category(user_id, scenario_id);

CREATE INDEX idx_scenario_coverage_by_category_user_season_category 
ON scenario_coverage_by_category(user_id, season, category);

CREATE INDEX idx_scenario_coverage_by_category_critical 
ON scenario_coverage_by_category(user_id, is_critical, priority_level) 
WHERE is_critical = TRUE;

CREATE INDEX idx_scenario_coverage_by_category_bottleneck 
ON scenario_coverage_by_category(user_id, is_bottleneck) 
WHERE is_bottleneck = TRUE;

-- Row Level Security
ALTER TABLE scenario_coverage_by_category ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own data
CREATE POLICY "Users can manage their own scenario coverage by category" 
ON scenario_coverage_by_category
FOR ALL USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON scenario_coverage_by_category TO authenticated;

-- Add helpful comments
COMMENT ON TABLE scenario_coverage_by_category IS 'Normalized scenario coverage data split by category for efficient querying and updates';
COMMENT ON COLUMN scenario_coverage_by_category.category IS 'Item category: top, bottom, one_piece, outerwear, footwear, accessory';
COMMENT ON COLUMN scenario_coverage_by_category.current_items IS 'Number of items user currently has in this category for this scenario/season';
COMMENT ON COLUMN scenario_coverage_by_category.needed_items_ideal IS 'Ideal number of items needed in this category based on frequency';
COMMENT ON COLUMN scenario_coverage_by_category.is_critical IS 'True if user has 0 items in an essential category';
COMMENT ON COLUMN scenario_coverage_by_category.is_bottleneck IS 'True if this category is limiting outfit creation the most';
COMMENT ON COLUMN scenario_coverage_by_category.priority_level IS '1=critical need, 2=high priority, 3=medium, 4=low, 5=nice-to-have';
COMMENT ON COLUMN scenario_coverage_by_category.category_recommendations IS 'Category-specific shopping and styling recommendations';
