-- Step 4: Update scenario_coverage_by_category table
-- This consolidates spring and fall data in one operation to avoid unique constraint violations

BEGIN;

-- First, create consolidated rows for spring/fall combinations
-- This handles the consolidation BEFORE updating to avoid unique constraint issues
-- Step 1: Create consolidated spring/fall rows
INSERT INTO public.scenario_coverage_by_category (
  user_id, scenario_id, scenario_name, scenario_frequency,
  season, category, current_items, needed_items_min, 
  needed_items_ideal, needed_items_max, coverage_percent,
  gap_count, is_critical, is_bottleneck, priority_level,
  category_recommendations, last_updated
)
SELECT 
  user_id,
  scenario_id,
  scenario_name,
  scenario_frequency,
  'spring/fall' as season,  -- Set the new consolidated season
  category,
  SUM(current_items) as total_current_items,
  ROUND(AVG(needed_items_min)) as avg_needed_min,
  ROUND(AVG(needed_items_ideal)) as avg_needed_ideal,
  ROUND(AVG(needed_items_max)) as avg_needed_max,
  -- Recalculate coverage percentage based on consolidated items
  CASE 
    WHEN AVG(needed_items_ideal) > 0 
    THEN LEAST(100, ROUND((SUM(current_items) * 100.0) / AVG(needed_items_ideal)))
    ELSE 100
  END as new_coverage_percent,
  MAX(gap_count::int) as max_gap_count,
  BOOL_OR(is_critical) as is_critical_combined,
  BOOL_OR(is_bottleneck) as is_bottleneck_combined,
  MIN(priority_level) as min_priority_level,
  STRING_AGG(DISTINCT category_recommendations::text, '; ')::jsonb as combined_recommendations,
  MAX(last_updated) as latest_update
FROM public.scenario_coverage_by_category
WHERE season IN ('spring', 'fall')  -- Process spring and fall rows
GROUP BY user_id, scenario_id, scenario_name, scenario_frequency, category
HAVING COUNT(*) > 0;  -- Process all spring/fall combinations

-- Step 2: Delete the old spring and fall rows
DELETE FROM public.scenario_coverage_by_category 
WHERE season IN ('spring', 'fall');

-- Step 3: Update any remaining single-season rows that aren't spring/fall
UPDATE public.scenario_coverage_by_category
SET season = season  -- Keep summer and winter as-is
WHERE season NOT IN ('spring', 'fall', 'spring/fall');

-- Check results
SELECT 
  'scenario_coverage_by_category' AS table_name,
  COUNT(*) AS total_items,
  SUM(CASE WHEN season = 'spring/fall' THEN 1 ELSE 0 END) AS transitional_items
FROM public.scenario_coverage_by_category
WHERE season IS NOT NULL;

-- Check for any remaining spring/fall values (should be 0)
SELECT 
  'remaining_spring_coverage' AS check_name,
  COUNT(*) AS count
FROM public.scenario_coverage_by_category
WHERE season IN ('spring', 'fall');

COMMIT;
