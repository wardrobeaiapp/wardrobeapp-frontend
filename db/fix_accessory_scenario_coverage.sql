-- Fix accessory scenario coverage to be scenario-agnostic like outerwear
-- Accessories should not be tied to specific scenarios - they work across all scenarios

-- Step 1: Delete existing scenario-specific accessory coverage
-- (Similar to what we did for outerwear - clean slate approach)
DELETE FROM scenario_coverage_by_category 
WHERE category = 'accessory' 
AND scenario_name != 'All scenarios';

-- Step 2: Verification query
-- Check remaining accessory coverage entries (should only be "All scenarios" or empty)
SELECT 
    scenario_name,
    season,
    COUNT(*) as count,
    AVG(current_items) as avg_items,
    AVG(coverage_percent) as avg_coverage
FROM scenario_coverage_by_category 
WHERE category = 'accessory'
GROUP BY scenario_name, season
ORDER BY scenario_name, season;

-- Step 3: Optional - If needed, insert placeholder "All scenarios" entries
-- This would be done by the application when it recalculates accessory coverage
-- The new calculation logic will automatically create "All scenarios" entries

-- Verification: Count total accessory coverage entries by type
SELECT 
    'Before cleanup' as phase,
    COUNT(*) as total_accessory_entries,
    COUNT(CASE WHEN scenario_name = 'All scenarios' THEN 1 END) as all_scenarios_entries,
    COUNT(CASE WHEN scenario_name != 'All scenarios' THEN 1 END) as specific_scenario_entries
FROM scenario_coverage_by_category 
WHERE category = 'accessory';

-- Expected result after running this migration:
-- - All scenario-specific accessory entries should be deleted
-- - Only "All scenarios" accessory entries should remain  
-- - Application will recalculate and populate as needed
