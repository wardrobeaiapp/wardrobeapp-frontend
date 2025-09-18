-- Debug: Check details of the "Casual Plain Jacket" that's in database but not in UI

SELECT 'Details of Casual Plain Jacket:' as debug_info;

SELECT 
    id,
    name,
    category,
    season,
    subcategory,
    color,
    brand,
    price,
    tags,
    wishlist,
    updated_at,
    -- Check if there are any deletion-related fields
    CASE 
        WHEN name ILIKE '%deleted%' THEN 'Possibly deleted'
        WHEN wishlist = true THEN 'Wishlist item'
        WHEN wishlist = false THEN 'Regular wardrobe item'
        WHEN wishlist IS NULL THEN 'Wishlist status unknown'
        ELSE 'Unknown status'
    END as item_status
FROM wardrobe_items 
WHERE user_id = '17e17127-60d9-4f7a-b62f-71089efea6ac'
AND LOWER(name) LIKE '%casual plain jacket%'
ORDER BY updated_at DESC;

-- Compare with other outerwear items to see what's different
SELECT 'Other Spring/Fall Outerwear Items for Comparison:' as debug_info;

SELECT 
    id,
    name,
    wishlist,
    updated_at,
    CASE 
        WHEN wishlist = true THEN 'Wishlist'
        WHEN wishlist = false THEN 'Wardrobe' 
        WHEN wishlist IS NULL THEN 'Unknown'
        ELSE 'Other'
    END as location
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
AND LOWER(name) != 'casual plain jacket'
ORDER BY wishlist, updated_at DESC;

-- Check if there are any items that should be excluded from wardrobe view
SELECT 'Count by wishlist status:' as debug_info;
SELECT 
    CASE 
        WHEN wishlist = true THEN 'Wishlist'
        WHEN wishlist = false THEN 'Wardrobe'
        WHEN wishlist IS NULL THEN 'Unknown'
        ELSE 'Other'
    END as location,
    COUNT(*) as count
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
GROUP BY wishlist
ORDER BY count DESC;
