-- Remove duplicate subcategory records created by faulty upsert logic
-- Keep only the most recent record for each unique combination

-- Step 1: Show duplicate records before cleanup
SELECT 
    'DUPLICATE RECORDS FOUND:' as info,
    user_id,
    scenario_id,
    season,
    category,
    subcategory,
    COUNT(*) as duplicate_count,
    MIN(last_updated) as oldest_record,
    MAX(last_updated) as newest_record
FROM wardrobe_coverage
WHERE category = 'accessory' 
AND subcategory IS NOT NULL
GROUP BY user_id, scenario_id, season, category, subcategory
HAVING COUNT(*) > 1
ORDER BY user_id, subcategory;

-- Step 2: Remove duplicates, keeping the most recent record
DELETE FROM wardrobe_coverage 
WHERE id IN (
    SELECT id FROM (
        SELECT id,
               ROW_NUMBER() OVER (
                   PARTITION BY user_id, scenario_id, season, category, subcategory 
                   ORDER BY last_updated DESC
               ) as rn
        FROM wardrobe_coverage
        WHERE category = 'accessory' 
        AND subcategory IS NOT NULL
    ) t WHERE rn > 1
);

-- Step 3: Verify cleanup worked - should show no duplicates
SELECT 
    'REMAINING AFTER CLEANUP:' as info,
    user_id,
    scenario_id,
    season,  
    category,
    subcategory,
    COUNT(*) as record_count
FROM wardrobe_coverage
WHERE category = 'accessory'
AND subcategory IS NOT NULL  
GROUP BY user_id, scenario_id, season, category, subcategory
HAVING COUNT(*) > 1
ORDER BY user_id, subcategory;

-- Step 4: Show final clean accessory records
SELECT 
    'FINAL CLEAN RECORDS:' as info,
    user_id,
    subcategory,
    season,
    current_items,
    coverage_percent,
    last_updated
FROM wardrobe_coverage
WHERE category = 'accessory'
AND subcategory IS NOT NULL
ORDER BY user_id, subcategory, season;

-- Expected result: Each user should have only one record per subcategory
-- Non-seasonal subcategories (Bag, Belt, Jewelry, Watch, Sunglasses): season = 'all_seasons'
-- Seasonal subcategories (Scarf, Hat, Tights, Socks): season = actual season
