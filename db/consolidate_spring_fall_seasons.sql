-- Consolidate Spring and Fall seasons into Transitional (spring/fall)
-- This migration updates all existing wardrobe items, outfits, and capsules
-- to use the new 'spring/fall' season value instead of separate 'spring' and 'fall' values

-- BACKUP REMINDER: Please backup your database before running this migration!

BEGIN;

-- Step 1: Update wardrobe_items table
-- Replace 'spring' and 'fall' with 'spring/fall' in season arrays
UPDATE public.wardrobe_items
SET season = ARRAY(
  SELECT DISTINCT 
    CASE 
      WHEN unnest_season = 'spring' OR unnest_season = 'fall' THEN 'spring/fall'
      ELSE unnest_season
    END
  FROM unnest(season) AS unnest_season
  WHERE unnest_season IS NOT NULL
)
WHERE season && ARRAY['spring', 'fall']::text[];

-- Step 2: Update outfits table
-- Replace 'spring' and 'fall' with 'spring/fall' in season arrays
UPDATE public.outfits
SET season = ARRAY(
  SELECT DISTINCT 
    CASE 
      WHEN unnest_season = 'spring' OR unnest_season = 'fall' THEN 'spring/fall'
      ELSE unnest_season
    END
  FROM unnest(season) AS unnest_season
  WHERE unnest_season IS NOT NULL
)
WHERE season && ARRAY['spring', 'fall']::text[];

-- Step 3: Update capsules table
-- Replace 'spring' and 'fall' with 'spring/fall' in seasons arrays (note: column is plural)
UPDATE public.capsules
SET seasons = ARRAY(
  SELECT DISTINCT 
    CASE 
      WHEN unnest_season = 'spring' OR unnest_season = 'fall' THEN 'spring/fall'
      ELSE unnest_season
    END
  FROM unnest(seasons) AS unnest_season
  WHERE unnest_season IS NOT NULL
)
WHERE seasons && ARRAY['spring', 'fall']::text[];

-- Step 4: Update any scenario coverage data that might reference seasons
-- Check if scenario_coverage table exists and update if needed
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'scenario_coverage'
  ) THEN
    -- Update scenario_coverage season column
    UPDATE public.scenario_coverage
    SET season = CASE 
      WHEN season = 'spring' OR season = 'fall' THEN 'spring/fall'
      ELSE season
    END
    WHERE season IN ('spring', 'fall');
  END IF;
END
$$;

-- Step 5: Verify the changes
-- Check updated counts
SELECT 
  'wardrobe_items' AS table_name,
  COUNT(*) AS total_items,
  SUM(CASE WHEN 'spring/fall' = ANY(season) THEN 1 ELSE 0 END) AS transitional_items
FROM public.wardrobe_items
WHERE season IS NOT NULL

UNION ALL

SELECT 
  'outfits' AS table_name,
  COUNT(*) AS total_items,
  SUM(CASE WHEN 'spring/fall' = ANY(season) THEN 1 ELSE 0 END) AS transitional_items
FROM public.outfits
WHERE season IS NOT NULL

UNION ALL

SELECT 
  'capsules' AS table_name,
  COUNT(*) AS total_items,
  SUM(CASE WHEN 'spring/fall' = ANY(seasons) THEN 1 ELSE 0 END) AS transitional_items
FROM public.capsules
WHERE seasons IS NOT NULL;

-- Step 6: Check for any remaining spring/fall values (should be 0)
SELECT 
  'remaining_spring_items' AS check_name,
  COUNT(*) AS count
FROM public.wardrobe_items
WHERE 'spring' = ANY(season) OR 'fall' = ANY(season)

UNION ALL

SELECT 
  'remaining_spring_outfits' AS check_name,
  COUNT(*) AS count
FROM public.outfits
WHERE 'spring' = ANY(season) OR 'fall' = ANY(season)

UNION ALL

SELECT 
  'remaining_spring_capsules' AS check_name,
  COUNT(*) AS count
FROM public.capsules
WHERE 'spring' = ANY(seasons) OR 'fall' = ANY(seasons);

COMMIT;

-- Optional: Create a constraint to prevent future spring/fall values
-- This will ensure only the new season values are used going forward
-- Uncomment if you want to enforce this at the database level

-- ALTER TABLE public.wardrobe_items
-- ADD CONSTRAINT check_season_values 
-- CHECK (
--   NOT (season && ARRAY['spring', 'fall']::text[]) AND
--   season <@ ARRAY['summer', 'winter', 'spring/fall']::text[]
-- );
--
-- ALTER TABLE public.outfits
-- ADD CONSTRAINT check_outfit_season_values 
-- CHECK (
--   NOT (season && ARRAY['spring', 'fall']::text[]) AND
--   season <@ ARRAY['summer', 'winter', 'spring/fall']::text[]
-- );
--
-- ALTER TABLE public.capsules
-- ADD CONSTRAINT check_capsule_season_values 
-- CHECK (
--   NOT (season && ARRAY['spring', 'fall']::text[]) AND
--   season <@ ARRAY['summer', 'winter', 'spring/fall']::text[]
-- );
