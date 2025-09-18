-- Step 2: Update outfits table only
-- Replace 'spring' and 'fall' with 'spring/fall' in season arrays

BEGIN;

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

-- Check results
SELECT 
  'outfits' AS table_name,
  COUNT(*) AS total_items,
  SUM(CASE WHEN 'spring/fall' = ANY(season) THEN 1 ELSE 0 END) AS transitional_items
FROM public.outfits
WHERE season IS NOT NULL;

-- Check for any remaining spring/fall values (should be 0)
SELECT 
  'remaining_spring_outfits' AS check_name,
  COUNT(*) AS count
FROM public.outfits
WHERE 'spring' = ANY(season) OR 'fall' = ANY(season);

COMMIT;
