-- Optimize ai_analysis_mocks table structure by extracting commonly accessed fields

-- Add separate columns for frequently accessed fields
ALTER TABLE ai_analysis_mocks 
ADD COLUMN IF NOT EXISTS compatibility_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS suitable_scenarios TEXT[], -- Array of scenario names
ADD COLUMN IF NOT EXISTS item_subcategory TEXT,
ADD COLUMN IF NOT EXISTS recommendation_action TEXT,
ADD COLUMN IF NOT EXISTS recommendation_text TEXT,
ADD COLUMN IF NOT EXISTS wishlist_status TEXT DEFAULT 'not_reviewed',
ADD COLUMN IF NOT EXISTS has_compatible_items BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS outfit_combinations_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS analysis_error TEXT,
ADD COLUMN IF NOT EXISTS analysis_error_details TEXT;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_ai_analysis_mocks_compatibility_score ON ai_analysis_mocks(compatibility_score);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_mocks_suitable_scenarios ON ai_analysis_mocks USING GIN(suitable_scenarios);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_mocks_item_subcategory ON ai_analysis_mocks(item_subcategory);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_mocks_wishlist_status ON ai_analysis_mocks(wishlist_status);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_mocks_has_compatible_items ON ai_analysis_mocks(has_compatible_items);

-- Add comment explaining the new structure
COMMENT ON COLUMN ai_analysis_mocks.compatibility_score IS 'Compatibility score (0-100)';
COMMENT ON COLUMN ai_analysis_mocks.suitable_scenarios IS 'Array of scenario names this item is suitable for';
COMMENT ON COLUMN ai_analysis_mocks.item_subcategory IS 'Item subcategory from analysis';
COMMENT ON COLUMN ai_analysis_mocks.recommendation_action IS 'Recommended action (e.g., "add_to_wardrobe", "skip")';
COMMENT ON COLUMN ai_analysis_mocks.recommendation_text IS 'Human-readable recommendation text';
COMMENT ON COLUMN ai_analysis_mocks.wishlist_status IS 'Wishlist status (approved, potential_issue, not_reviewed)';
COMMENT ON COLUMN ai_analysis_mocks.has_compatible_items IS 'Whether this item has compatible items in the wardrobe';
COMMENT ON COLUMN ai_analysis_mocks.outfit_combinations_count IS 'Number of possible outfit combinations';
COMMENT ON COLUMN ai_analysis_mocks.analysis_error IS 'Error message if analysis failed';
COMMENT ON COLUMN ai_analysis_mocks.analysis_error_details IS 'Detailed error information';

-- analysis_data will now store only the complex nested data:
-- - compatibleItems (detailed item objects by category)
-- - outfitCombinations (detailed outfit objects) 
-- - seasonScenarioCombinations (detailed combination data)
-- - coverageGapsWithNoOutfits (detailed gap analysis)
-- - extractedTags (detailed tag extraction data)
-- - analysisResult (full raw analysis text)

COMMENT ON COLUMN ai_analysis_mocks.analysis_data IS 'Complex nested data: compatibleItems, outfitCombinations, seasonScenarioCombinations, coverageGapsWithNoOutfits, extractedTags, analysisResult';
