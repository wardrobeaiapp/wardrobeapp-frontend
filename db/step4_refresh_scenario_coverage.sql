-- Step 4: Refresh scenario coverage for transitional season
-- This script will trigger recalculation of coverage for spring/fall items

BEGIN;

-- Check current scenario coverage state
SELECT 
  'Before refresh' as status,
  season,
  COUNT(*) as coverage_rows
FROM public.scenario_coverage_by_category 
GROUP BY season
ORDER BY season;

-- Note: The actual recalculation needs to happen in the application code
-- This SQL script shows what needs to be refreshed, but the heavy lifting
-- happens in the TypeScript services

-- Show scenarios that need coverage refresh
SELECT DISTINCT
  s.id as scenario_id,
  s.name as scenario_name,
  s.frequency,
  'Needs spring/fall coverage refresh' as action_needed
FROM public.scenarios s
WHERE s.id NOT IN (
  SELECT DISTINCT scenario_id 
  FROM public.scenario_coverage_by_category 
  WHERE season = 'spring/fall'
)
ORDER BY s.name;

-- Show users who have spring/fall items but missing coverage
SELECT DISTINCT
  wi.user_id,
  COUNT(wi.id) as items_with_spring_fall,
  'Missing spring/fall coverage' as action_needed
FROM public.wardrobe_items wi
WHERE 'spring/fall' = ANY(wi.season)
  AND wi.user_id NOT IN (
    SELECT DISTINCT user_id 
    FROM public.scenario_coverage_by_category 
    WHERE season = 'spring/fall'
  )
GROUP BY wi.user_id
ORDER BY items_with_spring_fall DESC;

COMMIT;

-- MANUAL STEP REQUIRED:
-- After running this script, you need to trigger scenario coverage 
-- recalculation in your application. This can be done by:
--
-- 1. Running the AI analysis on some items (which triggers coverage updates)
-- 2. Or calling the coverage service directly in Node.js:
--
-- import { updateAllCategoriesForScenario } from './services/wardrobe/scenarioCoverage/category';
--
-- // For each user and scenario, refresh coverage for all seasons including spring/fall
-- await updateAllCategoriesForScenario(userId, scenario, Season.TRANSITIONAL, items);
