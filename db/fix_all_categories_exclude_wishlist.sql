-- Universal fix: Exclude wishlist items from ALL scenario coverage calculations
-- This fixes current_items count for ALL categories (outerwear, accessory, footwear, etc.)

-- Replace this user ID with your actual user ID
-- 17e17127-60d9-4f7a-b62f-71089efea6ac

-- =====================================================
-- STEP 1: Show current state before fix
-- =====================================================
SELECT 'BEFORE: Coverage data by category (includes wishlist)' as status;
SELECT 
    category,
    season,
    SUM(current_items) as total_current_items,
    COUNT(*) as record_count
FROM wardrobe_coverage 
WHERE user_id = '17e17127-60d9-4f7a-b62f-71089efea6ac'
GROUP BY category, season
ORDER BY category, season;

-- =====================================================  
-- STEP 2: Universal fix for ALL categories
-- =====================================================

UPDATE wardrobe_coverage 
SET 
    current_items = (
        SELECT COUNT(*)
        FROM wardrobe_items wi
        WHERE wi.user_id = wardrobe_coverage.user_id
        AND LOWER(wi.category) = LOWER(wardrobe_coverage.category)
        AND (wi.wishlist = false OR wi.wishlist IS NULL)  -- EXCLUDE wishlist items
        AND (
            -- Handle season matching for all season types
            (wi.season @> ARRAY[wardrobe_coverage.season] OR wardrobe_coverage.season = ANY(wi.season)) OR
            (wardrobe_coverage.season = 'spring/fall' AND (wi.season @> ARRAY['spring'] OR wi.season @> ARRAY['fall'] OR 'spring' = ANY(wi.season) OR 'fall' = ANY(wi.season))) OR
            (wardrobe_coverage.season = 'summer' AND (wi.season @> ARRAY['summer'] OR 'summer' = ANY(wi.season))) OR
            (wardrobe_coverage.season = 'winter' AND (wi.season @> ARRAY['winter'] OR 'winter' = ANY(wi.season)))
        )
    ),
    -- Recalculate coverage percentage based on corrected current_items
    coverage_percent = CASE 
        WHEN needed_items_ideal > 0 THEN 
            LEAST(100, ((
                SELECT COUNT(*)
                FROM wardrobe_items wi
                WHERE wi.user_id = wardrobe_coverage.user_id
                AND LOWER(wi.category) = LOWER(wardrobe_coverage.category)
                AND (wi.wishlist = false OR wi.wishlist IS NULL)  -- EXCLUDE wishlist items
                AND (
                    (wi.season @> ARRAY[wardrobe_coverage.season] OR wardrobe_coverage.season = ANY(wi.season)) OR
                    (wardrobe_coverage.season = 'spring/fall' AND (wi.season @> ARRAY['spring'] OR wi.season @> ARRAY['fall'] OR 'spring' = ANY(wi.season) OR 'fall' = ANY(wi.season))) OR
                    (wardrobe_coverage.season = 'summer' AND (wi.season @> ARRAY['summer'] OR 'summer' = ANY(wi.season))) OR
                    (wardrobe_coverage.season = 'winter' AND (wi.season @> ARRAY['winter'] OR 'winter' = ANY(wi.season)))
                )
            ) * 100.0 / needed_items_ideal))
        ELSE 100
    END,
    -- Recalculate gap count
    gap_count = GREATEST(0, needed_items_ideal - (
        SELECT COUNT(*)
        FROM wardrobe_items wi
        WHERE wi.user_id = wardrobe_coverage.user_id
        AND LOWER(wi.category) = LOWER(wardrobe_coverage.category)
        AND (wi.wishlist = false OR wi.wishlist IS NULL)  -- EXCLUDE wishlist items
        AND (
            (wi.season @> ARRAY[wardrobe_coverage.season] OR wardrobe_coverage.season = ANY(wi.season)) OR
            (wardrobe_coverage.season = 'spring/fall' AND (wi.season @> ARRAY['spring'] OR wi.season @> ARRAY['fall'] OR 'spring' = ANY(wi.season) OR 'fall' = ANY(wi.season))) OR
            (wardrobe_coverage.season = 'summer' AND (wi.season @> ARRAY['summer'] OR 'summer' = ANY(wi.season))) OR
            (wardrobe_coverage.season = 'winter' AND (wi.season @> ARRAY['winter'] OR 'winter' = ANY(wi.season)))
        )
    )),
    -- Update critical status
    is_critical = (
        SELECT COUNT(*)
        FROM wardrobe_items wi
        WHERE wi.user_id = wardrobe_coverage.user_id
        AND LOWER(wi.category) = LOWER(wardrobe_coverage.category)
        AND (wi.wishlist = false OR wi.wishlist IS NULL)  -- EXCLUDE wishlist items
        AND (
            (wi.season @> ARRAY[wardrobe_coverage.season] OR wardrobe_coverage.season = ANY(wi.season)) OR
            (wardrobe_coverage.season = 'spring/fall' AND (wi.season @> ARRAY['spring'] OR wi.season @> ARRAY['fall'] OR 'spring' = ANY(wi.season) OR 'fall' = ANY(wi.season))) OR
            (wardrobe_coverage.season = 'summer' AND (wi.season @> ARRAY['summer'] OR 'summer' = ANY(wi.season))) OR
            (wardrobe_coverage.season = 'winter' AND (wi.season @> ARRAY['winter'] OR 'winter' = ANY(wi.season)))
        )
    ) < needed_items_min,
    last_updated = CURRENT_TIMESTAMP
WHERE user_id = '17e17127-60d9-4f7a-b62f-71089efea6ac';

-- =====================================================
-- STEP 3: Show updated state after fix
-- =====================================================
SELECT 'AFTER: Coverage data by category (excluding wishlist)' as status;
SELECT 
    category,
    season,
    SUM(current_items) as total_current_items,
    COUNT(*) as record_count
FROM wardrobe_coverage 
WHERE user_id = '17e17127-60d9-4f7a-b62f-71089efea6ac'
GROUP BY category, season
ORDER BY category, season;

-- =====================================================
-- STEP 4: Verification - show the bag case specifically
-- =====================================================
SELECT 'VERIFICATION: Bag accessory should now show 1 item, not 2' as status;
SELECT 
    scenario_name,
    season, 
    category,
    current_items,
    needed_items_ideal,
    coverage_percent
FROM wardrobe_coverage 
WHERE user_id = '17e17127-60d9-4f7a-b62f-71089efea6ac'
AND LOWER(category) = 'accessory'
ORDER BY scenario_name, season;
