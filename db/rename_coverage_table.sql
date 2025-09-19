-- Rename scenario_coverage_by_category to wardrobe_coverage
-- The old name was misleading since we now support:
-- - Scenario-agnostic coverage (outerwear/accessories)  
-- - Subcategory-based coverage (accessories)
-- - Various granularities beyond just "scenario + category"

-- Step 1: Rename the table
ALTER TABLE scenario_coverage_by_category 
RENAME TO wardrobe_coverage;

-- Step 2: Rename indexes to match new table name
ALTER INDEX idx_coverage_category_subcategory 
RENAME TO idx_wardrobe_coverage_lookup;

-- Step 3: Update constraint names to match new table name
ALTER TABLE wardrobe_coverage 
RENAME CONSTRAINT scenario_coverage_unique_key 
TO wardrobe_coverage_unique_key;

-- Step 4: Rename check constraint
ALTER TABLE wardrobe_coverage 
RENAME CONSTRAINT chk_accessory_subcategory 
TO chk_wardrobe_coverage_subcategory;

-- Step 5: Verify the rename worked
SELECT 
    'TABLE RENAMED SUCCESSFULLY' as status,
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'wardrobe_coverage'
ORDER BY ordinal_position;

-- Step 6: Show constraint info
SELECT 
    'CONSTRAINTS:' as info,
    constraint_name,
    constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'wardrobe_coverage';

-- Step 7: Show index info
SELECT 
    'INDEXES:' as info,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'wardrobe_coverage';

-- Expected results:
-- 1. Table should now be named 'wardrobe_coverage'
-- 2. All constraints and indexes should be renamed appropriately
-- 3. All existing data should be preserved
-- 4. No references to 'scenario_coverage_by_category' should remain in database
