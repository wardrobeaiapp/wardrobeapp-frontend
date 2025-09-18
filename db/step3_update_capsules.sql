-- Step 3: Update capsules table only
-- Replace 'spring' and 'fall' with 'spring/fall' in seasons arrays (note: column is plural)

BEGIN;

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

-- Check results
SELECT 
  'capsules' AS table_name,
  COUNT(*) AS total_items,
  SUM(CASE WHEN 'spring/fall' = ANY(seasons) THEN 1 ELSE 0 END) AS transitional_items
FROM public.capsules
WHERE seasons IS NOT NULL;

-- Check for any remaining spring/fall values (should be 0)
SELECT 
  'remaining_spring_capsules' AS check_name,
  COUNT(*) AS count
FROM public.capsules
WHERE 'spring' = ANY(seasons) OR 'fall' = ANY(seasons);

COMMIT;
