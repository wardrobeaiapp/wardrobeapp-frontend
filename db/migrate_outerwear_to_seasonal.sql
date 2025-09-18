-- Migration: Convert scenario-specific outerwear to seasonal "All scenarios" approach
-- This consolidates multiple outerwear rows per season into single seasonal rows

-- =====================================================
-- STEP 1: BACKUP EXISTING OUTERWEAR DATA (for rollback)
-- =====================================================

-- Create backup table
CREATE TABLE IF NOT EXISTS scenario_coverage_outerwear_backup AS 
SELECT * FROM scenario_coverage_by_category 
WHERE LOWER(category) = 'outerwear';

-- Log current outerwear rows
SELECT 'BEFORE: Current outerwear rows' as status;
SELECT scenario_name, season, category, current_items, needed_items_min, needed_items_ideal, needed_items_max
FROM scenario_coverage_by_category 
WHERE LOWER(category) = 'outerwear'
ORDER BY season, scenario_name;

-- =====================================================
-- STEP 2: DELETE EXISTING OUTERWEAR ROWS
-- =====================================================

DELETE FROM scenario_coverage_by_category 
WHERE LOWER(category) = 'outerwear';

-- =====================================================
-- STEP 3: INSERT NEW SEASONAL "ALL SCENARIOS" ROWS
-- =====================================================

-- Insert seasonal outerwear rows with "All scenarios"
INSERT INTO scenario_coverage_by_category (
    user_id,
    scenario_id,
    scenario_name,
    scenario_frequency,
    season,
    category,
    current_items,
    needed_items_min,
    needed_items_ideal,
    needed_items_max,
    coverage_percent,
    gap_count,
    is_critical,
    category_recommendations,
    last_updated
)
SELECT DISTINCT
    user_id,
    NULL::uuid as scenario_id,  -- No specific scenario (cast to uuid)
    'All scenarios' as scenario_name,
    'Seasonal' as scenario_frequency,
    season,
    'outerwear' as category,
    -- Aggregate current items across all scenarios for this season/user
    (
        SELECT COALESCE(SUM(current_items), 0) 
        FROM scenario_coverage_outerwear_backup b2 
        WHERE b2.user_id = b1.user_id 
        AND b2.season = b1.season 
        AND LOWER(b2.category) = 'outerwear'
    ) as current_items,
    -- Set seasonal targets based on season
    CASE 
        WHEN season = 'summer' THEN 1
        WHEN season = 'winter' THEN 1  
        WHEN season = 'spring/fall' THEN 2
        ELSE 1
    END as needed_items_min,
    CASE 
        WHEN season = 'summer' THEN 2
        WHEN season = 'winter' THEN 2
        WHEN season = 'spring/fall' THEN 3  
        ELSE 1
    END as needed_items_ideal,
    CASE 
        WHEN season = 'summer' THEN 3
        WHEN season = 'winter' THEN 3
        WHEN season = 'spring/fall' THEN 4
        ELSE 2  
    END as needed_items_max,
    -- Calculate coverage percent
    CASE 
        WHEN season = 'summer' THEN LEAST(100, ((SELECT COALESCE(SUM(current_items), 0) FROM scenario_coverage_outerwear_backup b3 WHERE b3.user_id = b1.user_id AND b3.season = b1.season AND LOWER(b3.category) = 'outerwear') * 100.0 / 2))
        WHEN season = 'winter' THEN LEAST(100, ((SELECT COALESCE(SUM(current_items), 0) FROM scenario_coverage_outerwear_backup b3 WHERE b3.user_id = b1.user_id AND b3.season = b1.season AND LOWER(b3.category) = 'outerwear') * 100.0 / 2))
        WHEN season = 'spring/fall' THEN LEAST(100, ((SELECT COALESCE(SUM(current_items), 0) FROM scenario_coverage_outerwear_backup b3 WHERE b3.user_id = b1.user_id AND b3.season = b1.season AND LOWER(b3.category) = 'outerwear') * 100.0 / 3))
        ELSE LEAST(100, ((SELECT COALESCE(SUM(current_items), 0) FROM scenario_coverage_outerwear_backup b3 WHERE b3.user_id = b1.user_id AND b3.season = b1.season AND LOWER(b3.category) = 'outerwear') * 100.0 / 1))
    END as coverage_percent,
    -- Calculate gap count  
    CASE 
        WHEN season = 'summer' THEN GREATEST(0, 2 - (SELECT COALESCE(SUM(current_items), 0) FROM scenario_coverage_outerwear_backup b3 WHERE b3.user_id = b1.user_id AND b3.season = b1.season AND LOWER(b3.category) = 'outerwear'))
        WHEN season = 'winter' THEN GREATEST(0, 2 - (SELECT COALESCE(SUM(current_items), 0) FROM scenario_coverage_outerwear_backup b3 WHERE b3.user_id = b1.user_id AND b3.season = b1.season AND LOWER(b3.category) = 'outerwear'))
        WHEN season = 'spring/fall' THEN GREATEST(0, 3 - (SELECT COALESCE(SUM(current_items), 0) FROM scenario_coverage_outerwear_backup b3 WHERE b3.user_id = b1.user_id AND b3.season = b1.season AND LOWER(b3.category) = 'outerwear'))
        ELSE GREATEST(0, 1 - (SELECT COALESCE(SUM(current_items), 0) FROM scenario_coverage_outerwear_backup b3 WHERE b3.user_id = b1.user_id AND b3.season = b1.season AND LOWER(b3.category) = 'outerwear'))
    END as gap_count,
    -- Mark as critical if below minimum
    CASE 
        WHEN season = 'summer' THEN (SELECT COALESCE(SUM(current_items), 0) FROM scenario_coverage_outerwear_backup b3 WHERE b3.user_id = b1.user_id AND b3.season = b1.season AND LOWER(b3.category) = 'outerwear') < 1
        WHEN season = 'winter' THEN (SELECT COALESCE(SUM(current_items), 0) FROM scenario_coverage_outerwear_backup b3 WHERE b3.user_id = b1.user_id AND b3.season = b1.season AND LOWER(b3.category) = 'outerwear') < 1
        WHEN season = 'spring/fall' THEN (SELECT COALESCE(SUM(current_items), 0) FROM scenario_coverage_outerwear_backup b3 WHERE b3.user_id = b1.user_id AND b3.season = b1.season AND LOWER(b3.category) = 'outerwear') < 2
        ELSE (SELECT COALESCE(SUM(current_items), 0) FROM scenario_coverage_outerwear_backup b3 WHERE b3.user_id = b1.user_id AND b3.season = b1.season AND LOWER(b3.category) = 'outerwear') < 1
    END as is_critical,
    '[]'::jsonb as category_recommendations, -- Empty array for now (cast to jsonb)
    CURRENT_TIMESTAMP as last_updated
FROM scenario_coverage_outerwear_backup b1
GROUP BY user_id, season
ORDER BY user_id, season;

-- =====================================================
-- STEP 4: VERIFICATION
-- =====================================================

-- Show new structure
SELECT 'AFTER: New seasonal outerwear structure' as status;
SELECT scenario_name, season, category, current_items, needed_items_min, needed_items_ideal, needed_items_max, coverage_percent, gap_count, is_critical
FROM scenario_coverage_by_category 
WHERE LOWER(category) = 'outerwear'
ORDER BY season, scenario_name;

-- Count comparison
SELECT 
    'COMPARISON: Row counts' as status,
    (SELECT COUNT(*) FROM scenario_coverage_outerwear_backup) as old_rows,
    (SELECT COUNT(*) FROM scenario_coverage_by_category WHERE LOWER(category) = 'outerwear') as new_rows;

-- =====================================================
-- ROLLBACK SCRIPT (if needed)
-- =====================================================

-- Uncomment to rollback:
-- DELETE FROM scenario_coverage_by_category WHERE LOWER(category) = 'outerwear';
-- INSERT INTO scenario_coverage_by_category SELECT * FROM scenario_coverage_outerwear_backup;
-- DROP TABLE scenario_coverage_outerwear_backup;

-- =====================================================
-- CLEANUP (run after verification)
-- =====================================================

-- Drop the backup table now that migration is complete
DROP TABLE IF EXISTS scenario_coverage_outerwear_backup;
