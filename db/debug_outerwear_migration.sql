-- Debug script to check current outerwear data issues

-- =====================================================
-- CHECK 1: Current outerwear rows in main table
-- =====================================================
SELECT 'Current outerwear rows:' as status;
SELECT user_id, scenario_name, season, category, current_items, needed_items_min, needed_items_ideal
FROM scenario_coverage_by_category 
WHERE LOWER(category) = 'outerwear'
ORDER BY user_id, season, scenario_name;

-- =====================================================
-- CHECK 2: Look for spring/fall duplicates
-- =====================================================
SELECT 'Spring/fall duplicates:' as status;
SELECT user_id, scenario_name, season, category, COUNT(*) as duplicate_count
FROM scenario_coverage_by_category 
WHERE LOWER(category) = 'outerwear' AND season = 'spring/fall'
GROUP BY user_id, scenario_name, season, category
HAVING COUNT(*) > 1;

-- =====================================================
-- CHECK 3: All outerwear categories (check exact values)
-- =====================================================
SELECT 'Distinct category values:' as status;
SELECT DISTINCT category, LOWER(category), COUNT(*) as row_count
FROM scenario_coverage_by_category 
WHERE LOWER(category) LIKE '%outer%' OR category LIKE '%outer%'
GROUP BY category;
