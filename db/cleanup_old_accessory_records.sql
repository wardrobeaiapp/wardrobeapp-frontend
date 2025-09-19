-- Clean up old accessory coverage records that don't have subcategory
-- These are from before we implemented subcategory-based accessory coverage

-- Step 1: Verify what we're about to delete
SELECT 
    'OLD ACCESSORY RECORDS TO DELETE:' as info,
    user_id,
    scenario_name,
    season,
    category,
    subcategory,
    current_items,
    coverage_percent,
    last_updated
FROM wardrobe_coverage 
WHERE category = 'accessory' 
AND subcategory IS NULL
ORDER BY user_id, season;

-- Step 2: Delete old accessory records without subcategory
-- The new calculation logic will create proper subcategory-specific records
DELETE FROM wardrobe_coverage 
WHERE category = 'accessory' 
AND subcategory IS NULL;

-- Step 2.5: Remove SEASONAL records for NON-SEASONAL subcategories
-- Non-seasonal subcategories should ONLY have 'all_seasons' records, not seasonal ones
DELETE FROM wardrobe_coverage 
WHERE category = 'accessory' 
AND subcategory IN ('Bag', 'Belt', 'Jewelry', 'Watch', 'Sunglasses')
AND season != 'all_seasons';

-- Step 2.6: Clean up duplicate non-seasonal accessory records  
-- Remove duplicate "all_seasons" records for non-seasonal subcategories
-- Keep only one record per user/subcategory for non-seasonal accessories
DELETE FROM wardrobe_coverage 
WHERE id IN (
    SELECT id FROM (
        SELECT id,
               ROW_NUMBER() OVER (
                   PARTITION BY user_id, category, subcategory 
                   ORDER BY last_updated DESC
               ) as rn
        FROM wardrobe_coverage
        WHERE category = 'accessory' 
        AND season = 'all_seasons'
        AND subcategory IN ('Bag', 'Belt', 'Jewelry', 'Watch', 'Sunglasses')
    ) t WHERE rn > 1
);

-- Step 3: Verify the cleanup worked
SELECT 
    'REMAINING ACCESSORY RECORDS:' as info,
    COUNT(*) as total_accessory_records,
    COUNT(CASE WHEN subcategory IS NULL THEN 1 END) as null_subcategory_records,
    COUNT(CASE WHEN subcategory IS NOT NULL THEN 1 END) as with_subcategory_records
FROM wardrobe_coverage 
WHERE category = 'accessory';

-- Step 4: Show breakdown by subcategory
SELECT 
    'BREAKDOWN BY SUBCATEGORY:' as info,
    subcategory,
    COUNT(*) as record_count,
    AVG(current_items) as avg_items,
    AVG(coverage_percent) as avg_coverage
FROM wardrobe_coverage 
WHERE category = 'accessory' 
AND subcategory IS NOT NULL
GROUP BY subcategory
ORDER BY subcategory;

-- Expected results after cleanup:
-- 1. All accessory records should have a subcategory (no NULL values)
-- 2. Multiple records per user/season combination (one per subcategory)
-- 3. Old single "total" accessory records should be gone
