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
FROM scenario_coverage_by_category 
WHERE category = 'accessory' 
AND subcategory IS NULL
ORDER BY user_id, season;

-- Step 2: Delete old accessory records without subcategory
-- The new calculation logic will create proper subcategory-specific records
DELETE FROM scenario_coverage_by_category 
WHERE category = 'accessory' 
AND subcategory IS NULL;

-- Step 3: Verify the cleanup worked
SELECT 
    'REMAINING ACCESSORY RECORDS:' as info,
    COUNT(*) as total_accessory_records,
    COUNT(CASE WHEN subcategory IS NULL THEN 1 END) as null_subcategory_records,
    COUNT(CASE WHEN subcategory IS NOT NULL THEN 1 END) as with_subcategory_records
FROM scenario_coverage_by_category 
WHERE category = 'accessory';

-- Step 4: Show breakdown by subcategory
SELECT 
    'BREAKDOWN BY SUBCATEGORY:' as info,
    subcategory,
    COUNT(*) as record_count,
    AVG(current_items) as avg_items,
    AVG(coverage_percent) as avg_coverage
FROM scenario_coverage_by_category 
WHERE category = 'accessory' 
AND subcategory IS NOT NULL
GROUP BY subcategory
ORDER BY subcategory;

-- Expected results after cleanup:
-- 1. All accessory records should have a subcategory (no NULL values)
-- 2. Multiple records per user/season combination (one per subcategory)
-- 3. Old single "total" accessory records should be gone
