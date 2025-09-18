-- Step 0: Remove all season constraints to allow data updates
-- Run this FIRST to remove constraints that block our data migration

BEGIN;

-- Drop the season constraint on scenario_coverage_by_category completely
ALTER TABLE public.scenario_coverage_by_category 
DROP CONSTRAINT IF EXISTS scenario_coverage_by_category_season_check;

-- Drop any other season constraints that might exist
DO $$
BEGIN
  BEGIN
    ALTER TABLE public.wardrobe_items DROP CONSTRAINT IF EXISTS wardrobe_items_season_check;
  EXCEPTION WHEN others THEN
    NULL;
  END;
END
$$;

DO $$
BEGIN
  BEGIN
    ALTER TABLE public.outfits DROP CONSTRAINT IF EXISTS outfits_season_check;
  EXCEPTION WHEN others THEN
    NULL;
  END;
END
$$;

DO $$
BEGIN
  BEGIN
    ALTER TABLE public.capsules DROP CONSTRAINT IF EXISTS capsules_seasons_check;
  EXCEPTION WHEN others THEN
    NULL;
  END;
END
$$;

-- Verify constraints are removed
SELECT 
  tc.table_name,
  tc.constraint_name,
  'REMOVED' as status
FROM information_schema.table_constraints tc
WHERE tc.table_schema = 'public' 
  AND tc.constraint_type = 'CHECK'
  AND tc.constraint_name LIKE '%season%'
  AND tc.table_name IN ('scenario_coverage_by_category', 'wardrobe_items', 'outfits', 'capsules');

-- If no rows returned, all season constraints have been removed successfully

COMMIT;
