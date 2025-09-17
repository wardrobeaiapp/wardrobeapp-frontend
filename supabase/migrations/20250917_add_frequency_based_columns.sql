-- Add new columns for frequency-based scenario coverage
-- This migration adds columns needed for the new frequency-based coverage system

-- Add new columns that don't exist yet
ALTER TABLE scenario_coverage 
ADD COLUMN IF NOT EXISTS scenario_frequency TEXT,
ADD COLUMN IF NOT EXISTS total_outfits INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS coverage_level INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS outfit_breakdown JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS bottleneck TEXT,
ADD COLUMN IF NOT EXISTS missing_for_next_outfit TEXT,
ADD COLUMN IF NOT EXISTS item_counts JSONB DEFAULT '{}'::jsonb;

-- Add check constraint for coverage_level
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'scenario_coverage_coverage_level_check'
        AND table_name = 'scenario_coverage'
    ) THEN
        ALTER TABLE scenario_coverage 
        ADD CONSTRAINT scenario_coverage_coverage_level_check 
        CHECK (coverage_level >= 0 AND coverage_level <= 5);
    END IF;
END $$;

-- Update season constraint to include the correct values if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'scenario_coverage_season_check'
        AND table_name = 'scenario_coverage'
    ) THEN
        ALTER TABLE scenario_coverage 
        ADD CONSTRAINT scenario_coverage_season_check 
        CHECK (season IN ('spring', 'summer', 'fall', 'winter', 'all'));
    END IF;
END $$;

-- Add helpful comments for new columns
COMMENT ON COLUMN scenario_coverage.scenario_frequency IS 'Frequency text from scenarios table (e.g., "3 times per week")';
COMMENT ON COLUMN scenario_coverage.total_outfits IS 'Total number of complete outfits possible for this scenario/season';
COMMENT ON COLUMN scenario_coverage.coverage_level IS 'Coverage score 0-5 based on outfit count (0=no outfits, 5=excellent variety)';
COMMENT ON COLUMN scenario_coverage.outfit_breakdown IS 'JSON breakdown of outfit types: {topBottomCombos, dresses, strategies}';
COMMENT ON COLUMN scenario_coverage.bottleneck IS 'Category limiting outfit creation (top, bottom, one_piece, etc.)';
COMMENT ON COLUMN scenario_coverage.missing_for_next_outfit IS 'Human-readable suggestion for improving coverage';
COMMENT ON COLUMN scenario_coverage.item_counts IS 'JSON count of items by category for this scenario/season';
