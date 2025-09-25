-- Remove redundant columns from wardrobe_coverage table
-- Removes is_critical (redundant with gap_type = 'critical') and created_at (redundant with last_updated)

-- Step 1: Verify current table structure before changes
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'wardrobe_coverage'
  AND column_name IN ('is_critical', 'created_at', 'gap_type')
ORDER BY ordinal_position;

-- Step 2: Verify that gap_type column exists and is populated
-- This ensures our code changes are working and gap_type has the needed data
SELECT 
    gap_type,
    COUNT(*) as record_count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 1) as percentage
FROM wardrobe_coverage 
GROUP BY gap_type
ORDER BY record_count DESC;

-- Step 3: Verify is_critical vs gap_type equivalency before dropping
-- This should show perfect correlation between is_critical=true and gap_type='critical'
SELECT 
    is_critical,
    gap_type,
    COUNT(*) as record_count
FROM wardrobe_coverage
GROUP BY is_critical, gap_type
ORDER BY is_critical, gap_type;

-- Expected: All is_critical=true records should have gap_type='critical'
-- Expected: All is_critical=false records should have gap_type != 'critical'

-- Step 4: Drop the redundant is_critical column
-- Safe to drop because gap_type='critical' provides the same information
ALTER TABLE wardrobe_coverage 
DROP COLUMN IF EXISTS is_critical;

-- Step 5: Drop the redundant created_at column  
-- Safe to drop because last_updated serves the same tracking purpose
ALTER TABLE wardrobe_coverage 
DROP COLUMN IF EXISTS created_at;

-- Step 6: Update any indexes that might reference the dropped columns
-- Check if there are any indexes on is_critical that need to be recreated on gap_type
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'wardrobe_coverage'
  AND indexdef ILIKE '%is_critical%';

-- If the above query returns results, we may need to recreate indexes
-- Example: If there was an index on is_critical, create one on gap_type instead
-- CREATE INDEX CONCURRENTLY idx_wardrobe_coverage_critical_gaps 
-- ON wardrobe_coverage(user_id, gap_type) 
-- WHERE gap_type = 'critical';

-- Step 7: Verify the changes were successful
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'wardrobe_coverage'
ORDER BY ordinal_position;

-- Step 8: Test that critical gap queries still work with new structure
-- This should return same results as the old is_critical=true query
SELECT 
    user_id,
    scenario_name,
    category,
    subcategory,
    gap_type,
    current_items,
    needed_items_ideal,
    priority_level
FROM wardrobe_coverage
WHERE gap_type = 'critical'
ORDER BY priority_level, user_id
LIMIT 5;

-- Step 9: Show final table size reduction
SELECT 
    pg_size_pretty(pg_total_relation_size('wardrobe_coverage')) as table_size_after,
    pg_size_pretty(pg_relation_size('wardrobe_coverage')) as data_size_after;

-- Expected results:
-- 1. is_critical column should be completely removed
-- 2. created_at column should be completely removed  
-- 3. gap_type column should remain and work for critical gap queries
-- 4. All existing functionality should work with gap_type = 'critical'
-- 5. Table size should be slightly smaller (9 bytes per record saved)

COMMENT ON COLUMN wardrobe_coverage.gap_type IS 'Replaces is_critical: critical=urgent need, improvement=some gaps, expansion=room to grow, satisfied=perfect amount, oversaturated=too many items';
