-- Drop the old scenario_coverage table
-- This table has been replaced by the normalized scenario_coverage_by_category table
-- which provides better performance and more precise category-specific data

-- Drop the old table and all its indexes/policies
DROP TABLE IF EXISTS scenario_coverage CASCADE;

-- Add comment to document this migration
COMMENT ON SCHEMA public IS 'Dropped old scenario_coverage table - replaced with scenario_coverage_by_category for better performance';
