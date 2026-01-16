-- Migration: Create ai_check_history table for storing AI Check analysis results
-- Date: 2025-01-16
-- Purpose: Store comprehensive AI Check history data separate from ai_analysis_mocks

-- Create ai_check_history table
CREATE TABLE ai_check_history (
    -- Primary key and metadata
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Base history item fields (from BaseAIHistoryItem interface)
    title TEXT NOT NULL, -- Item name for display
    description TEXT NOT NULL, -- Brief description of the analysis
    summary TEXT NOT NULL, -- Summary of analysis results
    analysis_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- Date of analysis
    status TEXT CHECK (status IN ('approved', 'potential_issue', 'not_reviewed')), -- WishlistStatus
    user_action_status TEXT CHECK (user_action_status IN ('saved', 'dismissed', 'pending', 'applied')), -- UserActionStatus
    
    -- Core Analysis Results
    score DECIMAL(3,1) NOT NULL CHECK (score >= 0 AND score <= 10), -- AI recommendation score (0-10)
    feedback TEXT NOT NULL, -- Core feedback from analysis
    recommendation_text TEXT, -- Human-readable explanation from gap analysis
    
    -- Item Details (for history context)
    item_id TEXT NOT NULL, -- Wardrobe item ID that was analyzed
    item_name TEXT NOT NULL, -- Item name
    item_category TEXT NOT NULL CHECK (item_category IN ('top', 'bottom', 'one_piece', 'outerwear', 'footwear', 'accessory', 'other')),
    item_subcategory TEXT, -- Item subcategory
    item_image_url TEXT, -- Item image URL
    item_wishlist_status TEXT CHECK (item_wishlist_status IN ('approved', 'potential_issue', 'not_reviewed')), -- Wishlist status at analysis time
    
    -- Scenario & Compatibility Analysis (stored as JSON)
    suitable_scenarios JSONB DEFAULT '[]'::jsonb, -- Array of suitable scenario names
    compatible_items JSONB DEFAULT '{}'::jsonb, -- Compatible items by category: { "tops": [...], "footwear": [...] }
    
    -- Outfit Recommendations (stored as JSON)
    outfit_combinations JSONB DEFAULT '[]'::jsonb, -- Complete outfit recommendations: [{ scenario, season, outfits: [{ items, description }] }]
    
    -- Coverage Analysis (stored as JSON)
    season_scenario_combinations JSONB DEFAULT '[]'::jsonb, -- Season + scenario completion status
    coverage_gaps_with_no_outfits JSONB DEFAULT '[]'::jsonb, -- Coverage gaps with 0 outfits available
    
    -- Raw Analysis Data (for debugging/future use)
    raw_analysis TEXT, -- Complete analysis text from AI
    analysis_metadata JSONB DEFAULT '{}'::jsonb, -- { tokensUsed, processingTimeMs, aiModel, analysisVersion }
    
    -- Legacy support fields (for backward compatibility)
    items_checked INTEGER DEFAULT 1, -- Number of items checked (usually 1 for single item analysis)
    legacy_analysis_results JSONB DEFAULT '{}'::jsonb -- Legacy format: { recommendations: [], issues: [], suggestions: [] }
);

-- Create indexes for efficient querying
CREATE INDEX idx_ai_check_history_user_id ON ai_check_history(user_id);
CREATE INDEX idx_ai_check_history_item_id ON ai_check_history(item_id);
CREATE INDEX idx_ai_check_history_created_at ON ai_check_history(created_at DESC);
CREATE INDEX idx_ai_check_history_item_category ON ai_check_history(item_category);
CREATE INDEX idx_ai_check_history_score ON ai_check_history(score DESC);

-- Create GIN indexes for JSON fields for efficient searching
CREATE INDEX idx_ai_check_history_suitable_scenarios ON ai_check_history USING GIN(suitable_scenarios);
CREATE INDEX idx_ai_check_history_compatible_items ON ai_check_history USING GIN(compatible_items);
CREATE INDEX idx_ai_check_history_outfit_combinations ON ai_check_history USING GIN(outfit_combinations);

-- Enable Row Level Security (RLS)
ALTER TABLE ai_check_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own AI check history"
    ON ai_check_history FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own AI check history"
    ON ai_check_history FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI check history"
    ON ai_check_history FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own AI check history"
    ON ai_check_history FOR DELETE
    USING (auth.uid() = user_id);

-- Add trigger for updated_at timestamp
CREATE OR REPLACE FUNCTION update_ai_check_history_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_ai_check_history_updated_at
    BEFORE UPDATE ON ai_check_history
    FOR EACH ROW
    EXECUTE FUNCTION update_ai_check_history_updated_at();

-- Add helpful comments
COMMENT ON TABLE ai_check_history IS 'Stores comprehensive AI Check analysis results for user history tracking';
COMMENT ON COLUMN ai_check_history.score IS 'AI recommendation score from 0-10';
COMMENT ON COLUMN ai_check_history.suitable_scenarios IS 'JSON array of scenario names this item is suitable for';
COMMENT ON COLUMN ai_check_history.compatible_items IS 'JSON object with compatible items organized by category';
COMMENT ON COLUMN ai_check_history.outfit_combinations IS 'JSON array of complete outfit recommendations with scenario/season organization';
COMMENT ON COLUMN ai_check_history.season_scenario_combinations IS 'JSON array showing completion status for each season+scenario combination';
COMMENT ON COLUMN ai_check_history.coverage_gaps_with_no_outfits IS 'JSON array of coverage gaps that have 0 outfits available';
COMMENT ON COLUMN ai_check_history.analysis_metadata IS 'JSON object with analysis performance metrics and metadata';
