-- Add subcategory support to scenario coverage for accessories
-- This enables granular coverage tracking for accessory subcategories

-- Step 1: Add subcategory column
ALTER TABLE scenario_coverage_by_category 
ADD COLUMN subcategory VARCHAR(50) NULL;

-- Step 2: Create index for efficient queries on category + subcategory
CREATE INDEX IF NOT EXISTS idx_coverage_category_subcategory 
ON scenario_coverage_by_category(user_id, category, subcategory, season);

-- Step 3: Update existing accessory records to have NULL subcategory (temporary)
-- This maintains backward compatibility during migration
UPDATE scenario_coverage_by_category 
SET subcategory = NULL 
WHERE category = 'accessory';

-- Step 4: Add check constraint for valid accessory subcategories
ALTER TABLE scenario_coverage_by_category 
ADD CONSTRAINT chk_accessory_subcategory 
CHECK (
  -- For non-accessory categories, subcategory must be NULL
  (category != 'accessory' AND subcategory IS NULL) 
  OR 
  -- For accessory category, subcategory can be NULL (for old records) or valid subcategory
  (category = 'accessory' AND (
    subcategory IS NULL OR 
    subcategory IN ('Bag', 'Belt', 'Hat', 'Scarf', 'Jewelry', 'Sunglasses', 'Watch', 'Socks', 'Tights')
  ))
);

-- Step 5: Update unique constraint to include subcategory
-- First, drop the old unique constraint (if it exists)
ALTER TABLE scenario_coverage_by_category 
DROP CONSTRAINT IF EXISTS scenario_coverage_by_category_user_id_scenario_id_season_category_key;

-- Add new unique constraint that includes subcategory
ALTER TABLE scenario_coverage_by_category 
ADD CONSTRAINT scenario_coverage_unique_key 
UNIQUE (user_id, scenario_id, season, category, subcategory);

-- Verification queries:

-- Check the new schema
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'scenario_coverage_by_category' 
AND column_name IN ('category', 'subcategory')
ORDER BY ordinal_position;

-- Check existing accessory coverage records
SELECT 
    user_id,
    scenario_name,
    season,
    category,
    subcategory,
    current_items,
    coverage_percent
FROM scenario_coverage_by_category 
WHERE category = 'accessory'
ORDER BY user_id, season, subcategory;

-- Count records by category
SELECT 
    category,
    COUNT(*) as total_records,
    COUNT(subcategory) as records_with_subcategory,
    COUNT(*) - COUNT(subcategory) as records_without_subcategory
FROM scenario_coverage_by_category 
GROUP BY category
ORDER BY category;

-- Expected results after migration:
-- 1. subcategory column should exist and be nullable
-- 2. All existing accessory records should have subcategory = NULL
-- 3. Non-accessory categories should have subcategory = NULL
-- 4. New unique constraint should include subcategory field
