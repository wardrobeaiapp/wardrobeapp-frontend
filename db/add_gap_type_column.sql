-- Add gap_type column and remove deprecated category_recommendations column

-- Add the new gap_type column with a default value
ALTER TABLE scenario_coverage_by_category 
ADD COLUMN gap_type TEXT DEFAULT 'improvement';

-- Create a check constraint to ensure valid values
ALTER TABLE scenario_coverage_by_category 
ADD CONSTRAINT scenario_coverage_gap_type_check 
CHECK (gap_type IN ('critical', 'improvement', 'expansion', 'satisfied', 'oversaturated'));

-- Update existing records based on current logic
UPDATE scenario_coverage_by_category 
SET gap_type = CASE 
    WHEN current_items = 0 THEN 'critical'
    WHEN current_items < needed_items_min THEN 'critical' 
    WHEN current_items < needed_items_ideal THEN 'improvement'
    WHEN current_items < needed_items_max THEN 'expansion'
    WHEN current_items = needed_items_max THEN 'satisfied'
    WHEN current_items > needed_items_max THEN 'oversaturated'
    ELSE 'improvement'
END;

-- Verify the update
SELECT 
    gap_type,
    COUNT(*) as count,
    ROUND(AVG(current_items), 1) as avg_current,
    ROUND(AVG(needed_items_ideal), 1) as avg_ideal,
    ROUND(AVG(needed_items_max), 1) as avg_max
FROM scenario_coverage_by_category 
GROUP BY gap_type
ORDER BY 
    CASE gap_type
        WHEN 'critical' THEN 1
        WHEN 'improvement' THEN 2  
        WHEN 'expansion' THEN 3
        WHEN 'satisfied' THEN 4
        WHEN 'oversaturated' THEN 5
    END;

-- Remove deprecated columns
-- category_recommendations: Now generated dynamically based on gap_type
-- target columns: Were never implemented, always stored as 0
-- is_bottleneck: Logic was never implemented, always false
-- scenario_frequency: Duplicates data from scenarios table (frequency still used in calculations, just not stored redundantly)
ALTER TABLE scenario_coverage_by_category 
DROP COLUMN IF EXISTS category_recommendations,
DROP COLUMN IF EXISTS separates_focused_target,
DROP COLUMN IF EXISTS dress_focused_target,
DROP COLUMN IF EXISTS balanced_target,
DROP COLUMN IF EXISTS is_bottleneck,
DROP COLUMN IF EXISTS scenario_frequency;
