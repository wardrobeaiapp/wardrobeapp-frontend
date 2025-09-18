-- Debug: Show exactly which 7 spring/fall outerwear items the SQL is finding

SELECT 'All 7 Spring/Fall Outerwear Items Found by SQL:' as debug_info;

SELECT 
    id,
    name,
    category,
    season,
    updated_at,
    CASE 
        WHEN season @> ARRAY['spring/fall'] THEN 'Contains spring/fall'
        WHEN 'spring/fall' = ANY(season) THEN 'spring/fall in array'
        WHEN season @> ARRAY['spring'] THEN 'Contains spring'
        WHEN season @> ARRAY['fall'] THEN 'Contains fall'  
        WHEN 'spring' = ANY(season) THEN 'spring in array'
        WHEN 'fall' = ANY(season) THEN 'fall in array'
        ELSE 'Unknown match'
    END as match_reason
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
ORDER BY updated_at DESC;

-- Show season format breakdown
SELECT 'Season Format Breakdown:' as debug_info;
SELECT 
    season,
    COUNT(*) as count,
    STRING_AGG(name, ', ' ORDER BY name) as item_names
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
GROUP BY season
ORDER BY count DESC;

-- Check for items that ONLY have spring/fall (stricter match like UI might use)
SELECT 'Items with ONLY spring/fall season:' as debug_info;
SELECT 
    id,
    name,
    season,
    updated_at
FROM wardrobe_items 
WHERE user_id = '17e17127-60d9-4f7a-b62f-71089efea6ac'
AND LOWER(category) = 'outerwear'
AND season = ARRAY['spring/fall']  -- Exact match
ORDER BY updated_at DESC;
