-- Step 5: Add new season constraints after data migration is complete
-- Run this AFTER all the data update steps (steps 1-4)

BEGIN;

-- Add new constraint for scenario_coverage_by_category that allows consolidated seasons
ALTER TABLE public.scenario_coverage_by_category
ADD CONSTRAINT scenario_coverage_by_category_season_check 
CHECK (season IN ('summer', 'winter', 'spring/fall'));

-- Verify the constraint was added successfully
SELECT 
  tc.table_name,
  tc.constraint_name,
  cc.check_clause,
  'ADDED' as status
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc 
  ON tc.constraint_name = cc.constraint_name
WHERE tc.table_schema = 'public' 
  AND tc.constraint_type = 'CHECK'
  AND tc.constraint_name = 'scenario_coverage_by_category_season_check';

COMMIT;
