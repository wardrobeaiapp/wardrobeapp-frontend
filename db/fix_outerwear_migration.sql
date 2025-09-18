-- Fixed migration script to properly handle outerwear consolidation

-- =====================================================
-- STEP 1: CLEAN UP EXISTING ISSUES
-- =====================================================

-- Delete ALL outerwear rows (including any with scenario names)
DELETE FROM scenario_coverage_by_category 
WHERE LOWER(category) = 'outerwear';

-- Also clean up any potential variations
DELETE FROM scenario_coverage_by_category 
WHERE category ILIKE '%outerwear%';

-- =====================================================
-- STEP 2: RECREATE FROM BACKUP (if backup still exists)
-- =====================================================

-- Only run if backup table exists, otherwise skip
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'scenario_coverage_outerwear_backup') THEN
        
        -- Insert clean seasonal outerwear rows
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
        -- Create one row per user per season (prevent duplicates)
        SELECT 
            user_id,
            NULL::uuid as scenario_id,
            'All scenarios' as scenario_name,
            'Seasonal' as scenario_frequency,
            season,
            'outerwear' as category,
            -- Aggregate current items for this user/season
            COALESCE(SUM(current_items), 0) as current_items,
            -- Set seasonal targets
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
            -- Calculate coverage percent based on current vs ideal
            CASE 
                WHEN season = 'summer' THEN LEAST(100, (COALESCE(SUM(current_items), 0) * 100.0 / 2))
                WHEN season = 'winter' THEN LEAST(100, (COALESCE(SUM(current_items), 0) * 100.0 / 2))
                WHEN season = 'spring/fall' THEN LEAST(100, (COALESCE(SUM(current_items), 0) * 100.0 / 3))
                ELSE LEAST(100, (COALESCE(SUM(current_items), 0) * 100.0 / 1))
            END as coverage_percent,
            -- Calculate gap count (ideal - current, minimum 0)
            CASE 
                WHEN season = 'summer' THEN GREATEST(0, 2 - COALESCE(SUM(current_items), 0))
                WHEN season = 'winter' THEN GREATEST(0, 2 - COALESCE(SUM(current_items), 0))
                WHEN season = 'spring/fall' THEN GREATEST(0, 3 - COALESCE(SUM(current_items), 0))
                ELSE GREATEST(0, 1 - COALESCE(SUM(current_items), 0))
            END as gap_count,
            -- Mark as critical if below minimum
            CASE 
                WHEN season = 'summer' THEN COALESCE(SUM(current_items), 0) < 1
                WHEN season = 'winter' THEN COALESCE(SUM(current_items), 0) < 1
                WHEN season = 'spring/fall' THEN COALESCE(SUM(current_items), 0) < 2
                ELSE COALESCE(SUM(current_items), 0) < 1
            END as is_critical,
            '[]'::jsonb as category_recommendations,
            CURRENT_TIMESTAMP as last_updated
        FROM scenario_coverage_outerwear_backup
        WHERE LOWER(category) = 'outerwear'
        GROUP BY user_id, season  -- This prevents duplicates
        ORDER BY user_id, season;
        
        RAISE NOTICE 'Migration completed using backup data';
    ELSE
        RAISE NOTICE 'No backup table found - manual data entry required';
    END IF;
END $$;

-- =====================================================
-- STEP 3: MANUAL INSERT (if no backup available)
-- =====================================================

-- If no backup exists, create minimal seasonal structure for all users
-- This is a fallback - adjust user_ids as needed
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
    NULL::uuid as scenario_id,
    'All scenarios' as scenario_name,
    'Seasonal' as scenario_frequency,
    season_vals.season,
    'outerwear' as category,
    0 as current_items, -- Start with 0, will be updated by wardrobe counting
    season_vals.min_needed,
    season_vals.ideal_needed,
    season_vals.max_needed,
    0 as coverage_percent,
    season_vals.ideal_needed as gap_count,
    true as is_critical,
    '[]'::jsonb as category_recommendations,
    CURRENT_TIMESTAMP as last_updated
FROM 
    (SELECT DISTINCT user_id FROM scenario_coverage_by_category LIMIT 50) users
CROSS JOIN (
    VALUES 
        ('summer', 1, 2, 3),
        ('winter', 1, 2, 3),
        ('spring/fall', 2, 3, 4)
) season_vals(season, min_needed, ideal_needed, max_needed)
WHERE NOT EXISTS (
    -- Only insert if this user/season/category combination doesn't exist
    SELECT 1 FROM scenario_coverage_by_category existing
    WHERE existing.user_id = users.user_id 
    AND existing.season = season_vals.season 
    AND LOWER(existing.category) = 'outerwear'
);

-- =====================================================
-- STEP 4: VERIFICATION
-- =====================================================

SELECT 'FINAL RESULT: Outerwear rows after fix' as status;
SELECT user_id, scenario_name, season, category, current_items, needed_items_min, needed_items_ideal, needed_items_max
FROM scenario_coverage_by_category 
WHERE LOWER(category) = 'outerwear'
ORDER BY user_id, season;

-- Check for duplicates
SELECT 'DUPLICATE CHECK:' as status;
SELECT user_id, scenario_name, season, category, COUNT(*) as duplicate_count
FROM scenario_coverage_by_category 
WHERE LOWER(category) = 'outerwear'
GROUP BY user_id, scenario_name, season, category
HAVING COUNT(*) > 1;
