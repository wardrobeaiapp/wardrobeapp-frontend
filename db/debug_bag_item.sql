-- Debug: Check the actual bag item data to see why the count is 0

-- Replace with your actual user ID
-- 17e17127-60d9-4f7a-b62f-71089efea6ac

-- =====================================================
-- Check what bag items actually exist
-- =====================================================
SELECT 'ACTUAL BAG ITEMS:' as status;
SELECT 
    name,
    category,
    subcategory,
    season,
    wishlist,
    updated_at
FROM wardrobe_items 
WHERE user_id = '17e17127-60d9-4f7a-b62f-71089efea6ac'
AND (
    LOWER(category) = 'accessory' 
    OR LOWER(subcategory) LIKE '%bag%'
    OR LOWER(name) LIKE '%bag%'
)
ORDER BY updated_at DESC;

-- =====================================================
-- Check season format for spring/fall items specifically
-- =====================================================
SELECT 'SEASON FORMATS:' as status;
SELECT 
    DISTINCT season,
    COUNT(*) as item_count
FROM wardrobe_items 
WHERE user_id = '17e17127-60d9-4f7a-b62f-71089efea6ac'
GROUP BY season
ORDER BY season;

-- =====================================================
-- Test the exact query from the fix script for accessories
-- =====================================================
SELECT 'TESTING FIX QUERY FOR ACCESSORIES:' as status;
SELECT COUNT(*) as matching_items
FROM wardrobe_items wi
WHERE wi.user_id = '17e17127-60d9-4f7a-b62f-71089efea6ac'
AND LOWER(wi.category) = 'accessory'
AND (wi.wishlist = false OR wi.wishlist IS NULL)  -- EXCLUDE wishlist items
AND (
    -- Handle season matching for spring/fall specifically
    wi.season @> ARRAY['spring/fall'] OR 'spring/fall' = ANY(wi.season) OR
    wi.season @> ARRAY['spring'] OR wi.season @> ARRAY['fall'] OR
    'spring' = ANY(wi.season) OR 'fall' = ANY(wi.season)
);

-- =====================================================
-- Check what the wardrobe_coverage table expects
-- =====================================================
SELECT 'WARDROBE COVERAGE STRUCTURE:' as status;
SELECT 
    category,
    subcategory,
    season,
    current_items,
    coverage_percent
FROM wardrobe_coverage
WHERE user_id = '17e17127-60d9-4f7a-b62f-71089efea6ac'
AND LOWER(category) = 'accessory'
ORDER BY season;
