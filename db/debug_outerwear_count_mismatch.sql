-- Debug script to check outerwear count mismatch

-- Replace this user ID with your actual user ID in the queries below
-- 17e17127-60d9-4f7a-b62f-71089efea6ac

-- =====================================================
-- CHECK 1: What's in scenario_coverage_by_category table for outerwear?
-- =====================================================
SELECT 'Scenario Coverage Table - Outerwear Data:' as check_type;
SELECT 
    user_id,
    scenario_name,
    season,
    category,
    current_items,
    needed_items_min,
    needed_items_ideal,
    needed_items_max,
    coverage_percent,
    last_updated
FROM scenario_coverage_by_category 
WHERE user_id = '17e17127-60d9-4f7a-b62f-71089efea6ac'
AND LOWER(category) = 'outerwear'
ORDER BY season, scenario_name;

-- =====================================================
-- CHECK 2: Count actual wardrobe items for this user (outerwear, spring/fall)
-- =====================================================
SELECT 'Actual Wardrobe Items Count:' as check_type;
SELECT 
    category,
    season,
    COUNT(*) as actual_count
FROM wardrobe_items 
WHERE user_id = '17e17127-60d9-4f7a-b62f-71089efea6ac'
AND LOWER(category) = 'outerwear'
AND season @> ARRAY['spring/fall']  -- Text array contains check
GROUP BY category, season
ORDER BY season;

-- Alternative query if season is stored differently
SELECT 'Alternative Wardrobe Items Count (if season stored as text):' as check_type;
SELECT 
    category,
    season,
    COUNT(*) as actual_count
FROM wardrobe_items 
WHERE user_id = '17e17127-60d9-4f7a-b62f-71089efea6ac'
AND LOWER(category) = 'outerwear'
AND 'spring/fall' = ANY(season)  -- Alternative text array check
GROUP BY category, season;

-- =====================================================
-- CHECK 3: Show all spring/fall outerwear items for this user
-- =====================================================
SELECT 'Individual Outerwear Items:' as check_type;
SELECT 
    id,
    name,
    category,
    season,
    updated_at
FROM wardrobe_items 
WHERE user_id = '17e17127-60d9-4f7a-b62f-71089efea6ac'
AND LOWER(category) = 'outerwear'
AND (season @> ARRAY['spring/fall'] OR 'spring/fall' = ANY(season))
ORDER BY updated_at DESC;

-- =====================================================
-- CHECK 4: Check if there are multiple season formats in wardrobe_items
-- =====================================================
SELECT 'Season Format Analysis:' as check_type;
SELECT 
    season,
    COUNT(*) as count
FROM wardrobe_items 
WHERE user_id = '17e17127-60d9-4f7a-b62f-71089efea6ac'
AND LOWER(category) = 'outerwear'
GROUP BY season
ORDER BY count DESC;
