-- Step 0: Update database constraints to allow new season values
-- Run this BEFORE the other migration steps

BEGIN;

-- Drop the old season constraint on scenario_coverage_by_category
ALTER TABLE public.scenario_coverage_by_category 
DROP CONSTRAINT IF EXISTS scenario_coverage_by_category_season_check;

-- Add new constraint that allows the consolidated season values
ALTER TABLE public.scenario_coverage_by_category
ADD CONSTRAINT scenario_coverage_by_category_season_check 
CHECK (season IN ('summer', 'winter', 'spring/fall'));

-- Also update any other tables that might have season constraints
-- Check for wardrobe_items constraints
DO $$
BEGIN
  -- Try to drop constraint if it exists (won't error if it doesn't)
  BEGIN
    ALTER TABLE public.wardrobe_items DROP CONSTRAINT wardrobe_items_season_check;
  EXCEPTION WHEN others THEN
    -- Ignore error if constraint doesn't exist
    NULL;
  END;
END
$$;

-- Check for outfits constraints  
DO $$
BEGIN
  BEGIN
    ALTER TABLE public.outfits DROP CONSTRAINT outfits_season_check;
  EXCEPTION WHEN others THEN
    NULL;
  END;
END
$$;

-- Check for capsules constraints
DO $$
BEGIN
  BEGIN
    ALTER TABLE public.capsules DROP CONSTRAINT capsules_seasons_check;
  EXCEPTION WHEN others THEN
    NULL;
  END;
END
$$;

-- Show current constraints for verification
SELECT 
  tc.table_name,
  tc.constraint_name,
  cc.check_clause
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc 
  ON tc.constraint_name = cc.constraint_name
WHERE tc.table_schema = 'public' 
  AND tc.constraint_type = 'CHECK'
  AND (tc.table_name LIKE '%scenario_coverage%' 
       OR tc.table_name IN ('wardrobe_items', 'outfits', 'capsules'))
  AND cc.check_clause LIKE '%season%';

COMMIT;
