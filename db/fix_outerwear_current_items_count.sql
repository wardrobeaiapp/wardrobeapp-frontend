-- Fix current_items count in scenario_coverage_by_category for outerwear

-- Replace this user ID with your actual user ID in the queries below
-- 17e17127-60d9-4f7a-b62f-71089efea6ac

-- =====================================================
-- STEP 1: Show current state before fix
-- =====================================================
SELECT 'BEFORE: Current outerwear coverage data' as status;
SELECT 
    scenario_name,
    season,
    current_items,
    needed_items_ideal,
    coverage_percent
FROM scenario_coverage_by_category 
WHERE user_id = '17e17127-60d9-4f7a-b62f-71089efea6ac'
AND LOWER(category) = 'outerwear'
ORDER BY season;

-- =====================================================
-- STEP 2: Update current_items count based on actual wardrobe items
-- =====================================================

-- For spring/fall season specifically
UPDATE scenario_coverage_by_category 
SET 
    current_items = (
        SELECT COUNT(*)
        FROM wardrobe_items 
        WHERE user_id = '17e17127-60d9-4f7a-b62f-71089efea6ac'
        AND LOWER(category) = 'outerwear'
        AND (wishlist = false OR wishlist IS NULL)  -- Exclude wishlist items
        AND (
            season @> ARRAY['spring/fall'] OR 
            'spring/fall' = ANY(season) OR
            season @> ARRAY['spring'] OR 
            season @> ARRAY['fall'] OR
            'spring' = ANY(season) OR 
            'fall' = ANY(season)
        )
    ),
    -- Recalculate coverage percentage
    coverage_percent = CASE 
        WHEN needed_items_ideal > 0 THEN 
            LEAST(100, ((
                SELECT COUNT(*)
                FROM wardrobe_items 
                WHERE user_id = '17e17127-60d9-4f7a-b62f-71089efea6ac'
                AND LOWER(category) = 'outerwear'
                AND (
                    season @> ARRAY['spring/fall'] OR 
                    'spring/fall' = ANY(season) OR
                    season @> ARRAY['spring'] OR 
                    season @> ARRAY['fall'] OR
                    'spring' = ANY(season) OR 
                    'fall' = ANY(season)
                )
            ) * 100.0 / needed_items_ideal))
        ELSE 100
    END,
    -- Recalculate gap count
    gap_count = GREATEST(0, needed_items_ideal - (
        SELECT COUNT(*)
        FROM wardrobe_items 
        WHERE user_id = '17e17127-60d9-4f7a-b62f-71089efea6ac'
        AND LOWER(category) = 'outerwear'
        AND (wishlist = false OR wishlist IS NULL)  -- Exclude wishlist items
        AND (
            season @> ARRAY['spring/fall'] OR 
            'spring/fall' = ANY(season) OR
            season @> ARRAY['spring'] OR 
            season @> ARRAY['fall'] OR
            'spring' = ANY(season) OR 
            'fall' = ANY(season)
        )
    )),
    -- Update critical status
    is_critical = (
        SELECT COUNT(*)
        FROM wardrobe_items 
        WHERE user_id = '17e17127-60d9-4f7a-b62f-71089efea6ac'
        AND LOWER(category) = 'outerwear'
        AND (wishlist = false OR wishlist IS NULL)  -- Exclude wishlist items
        AND (
            season @> ARRAY['spring/fall'] OR 
            'spring/fall' = ANY(season) OR
            season @> ARRAY['spring'] OR 
            season @> ARRAY['fall'] OR
            'spring' = ANY(season) OR 
            'fall' = ANY(season)
        )
    ) < needed_items_min,
    last_updated = CURRENT_TIMESTAMP
WHERE user_id = '17e17127-60d9-4f7a-b62f-71089efea6ac' 
AND LOWER(category) = 'outerwear'
AND season = 'spring/fall';

-- For summer season
UPDATE scenario_coverage_by_category 
SET 
    current_items = (
        SELECT COUNT(*)
        FROM wardrobe_items 
        WHERE user_id = '17e17127-60d9-4f7a-b62f-71089efea6ac'
        AND LOWER(category) = 'outerwear'
        AND (season @> ARRAY['summer'] OR 'summer' = ANY(season))
    ),
    coverage_percent = CASE 
        WHEN needed_items_ideal > 0 THEN 
            LEAST(100, ((
                SELECT COUNT(*)
                FROM wardrobe_items 
                WHERE user_id = '17e17127-60d9-4f7a-b62f-71089efea6ac'
                AND LOWER(category) = 'outerwear'
                AND (season @> ARRAY['summer'] OR 'summer' = ANY(season))
            ) * 100.0 / needed_items_ideal))
        ELSE 100
    END,
    gap_count = GREATEST(0, needed_items_ideal - (
        SELECT COUNT(*)
        FROM wardrobe_items 
        WHERE user_id = '17e17127-60d9-4f7a-b62f-71089efea6ac'
        AND LOWER(category) = 'outerwear'
        AND (season @> ARRAY['summer'] OR 'summer' = ANY(season))
    )),
    is_critical = (
        SELECT COUNT(*)
        FROM wardrobe_items 
        WHERE user_id = '17e17127-60d9-4f7a-b62f-71089efea6ac'
        AND LOWER(category) = 'outerwear'
        AND (season @> ARRAY['summer'] OR 'summer' = ANY(season))
    ) < needed_items_min,
    last_updated = CURRENT_TIMESTAMP
WHERE user_id = '17e17127-60d9-4f7a-b62f-71089efea6ac' 
AND LOWER(category) = 'outerwear'
AND season = 'summer';

-- For winter season  
UPDATE scenario_coverage_by_category 
SET 
    current_items = (
        SELECT COUNT(*)
        FROM wardrobe_items 
        WHERE user_id = '17e17127-60d9-4f7a-b62f-71089efea6ac'
        AND LOWER(category) = 'outerwear'
        AND (season @> ARRAY['winter'] OR 'winter' = ANY(season))
    ),
    coverage_percent = CASE 
        WHEN needed_items_ideal > 0 THEN 
            LEAST(100, ((
                SELECT COUNT(*)
                FROM wardrobe_items 
                WHERE user_id = '17e17127-60d9-4f7a-b62f-71089efea6ac'
                AND LOWER(category) = 'outerwear'
                AND (season @> ARRAY['winter'] OR 'winter' = ANY(season))
            ) * 100.0 / needed_items_ideal))
        ELSE 100
    END,
    gap_count = GREATEST(0, needed_items_ideal - (
        SELECT COUNT(*)
        FROM wardrobe_items 
        WHERE user_id = '17e17127-60d9-4f7a-b62f-71089efea6ac'
        AND LOWER(category) = 'outerwear'
        AND (season @> ARRAY['winter'] OR 'winter' = ANY(season))
    )),
    is_critical = (
        SELECT COUNT(*)
        FROM wardrobe_items 
        WHERE user_id = '17e17127-60d9-4f7a-b62f-71089efea6ac'
        AND LOWER(category) = 'outerwear'
        AND (season @> ARRAY['winter'] OR 'winter' = ANY(season))
    ) < needed_items_min,
    last_updated = CURRENT_TIMESTAMP
WHERE user_id = '17e17127-60d9-4f7a-b62f-71089efea6ac' 
AND LOWER(category) = 'outerwear'
AND season = 'winter';

-- =====================================================
-- STEP 3: Show updated state after fix
-- =====================================================
SELECT 'AFTER: Updated outerwear coverage data' as status;
SELECT 
    scenario_name,
    season,
    current_items,
    needed_items_ideal,
    coverage_percent,
    gap_count,
    is_critical
FROM scenario_coverage_by_category 
WHERE user_id = '17e17127-60d9-4f7a-b62f-71089efea6ac' 
AND LOWER(category) = 'outerwear'
ORDER BY season;

-- =====================================================
-- STEP 4: Verification - show actual vs database counts
-- =====================================================
SELECT 'VERIFICATION: Actual vs Database Counts' as status;
SELECT 
    'spring/fall' as season,
    (SELECT COUNT(*) FROM wardrobe_items WHERE user_id = '17e17127-60d9-4f7a-b62f-71089efea6ac' AND LOWER(category) = 'outerwear' AND (wishlist = false OR wishlist IS NULL) AND (season @> ARRAY['spring/fall'] OR 'spring/fall' = ANY(season) OR season @> ARRAY['spring'] OR season @> ARRAY['fall'] OR 'spring' = ANY(season) OR 'fall' = ANY(season))) as actual_wardrobe_count,
    (SELECT current_items FROM scenario_coverage_by_category WHERE user_id = '17e17127-60d9-4f7a-b62f-71089efea6ac' AND LOWER(category) = 'outerwear' AND season = 'spring/fall' AND scenario_name = 'All scenarios' LIMIT 1) as database_count
UNION ALL
SELECT 
    'summer' as season,
    (SELECT COUNT(*) FROM wardrobe_items WHERE user_id = '17e17127-60d9-4f7a-b62f-71089efea6ac' AND LOWER(category) = 'outerwear' AND (wishlist = false OR wishlist IS NULL) AND (season @> ARRAY['summer'] OR 'summer' = ANY(season))) as actual_wardrobe_count,
    (SELECT current_items FROM scenario_coverage_by_category WHERE user_id = '17e17127-60d9-4f7a-b62f-71089efea6ac' AND LOWER(category) = 'outerwear' AND season = 'summer' AND scenario_name = 'All scenarios' LIMIT 1) as database_count
UNION ALL
SELECT 
    'winter' as season,
    (SELECT COUNT(*) FROM wardrobe_items WHERE user_id = '17e17127-60d9-4f7a-b62f-71089efea6ac' AND LOWER(category) = 'outerwear' AND (wishlist = false OR wishlist IS NULL) AND (season @> ARRAY['winter'] OR 'winter' = ANY(season))) as actual_wardrobe_count,
    (SELECT current_items FROM scenario_coverage_by_category WHERE user_id = '17e17127-60d9-4f7a-b62f-71089efea6ac' AND LOWER(category) = 'outerwear' AND season = 'winter' AND scenario_name = 'All scenarios' LIMIT 1) as database_count;
