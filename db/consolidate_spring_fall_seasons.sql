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

-- Step 4: Update scenario coverage tables that reference seasons
-- Check if scenario_coverage table exists and update if needed (legacy table)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'scenario_coverage'
  ) THEN
    -- Update legacy scenario_coverage season column
    UPDATE public.scenario_coverage
    SET season = CASE 
      WHEN season = 'spring' OR season = 'fall' THEN 'spring/fall'
      ELSE season
    END
    WHERE season IN ('spring', 'fall');
  END IF;
END
$$;

-- Step 5: Update scenario_coverage_by_category table (main coverage table)
-- This is the primary table used for scenario coverage calculations
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'scenario_coverage_by_category'
  ) THEN
    -- Update scenario_coverage_by_category season column
    UPDATE public.scenario_coverage_by_category
    SET season = CASE 
      WHEN season = 'spring' OR season = 'fall' THEN 'spring/fall'
      ELSE season
    END
    WHERE season IN ('spring', 'fall');
    
    -- Important: After consolidating seasons, we may have duplicate rows
    -- (same user_id, scenario_id, category but now same consolidated season)
    -- We need to merge these by summing current_items and averaging other metrics
    WITH consolidated_coverage AS (
      SELECT 
        user_id,
        scenario_id,
        scenario_name,
        scenario_frequency,
        season,
        category,
        SUM(current_items) as total_current_items,
        AVG(needed_items_min) as avg_needed_min,
        AVG(needed_items_ideal) as avg_needed_ideal,
        AVG(needed_items_max) as avg_needed_max,
        -- Recalculate coverage percentage based on consolidated items
        CASE 
          WHEN AVG(needed_items_ideal) > 0 
          THEN LEAST(100, ROUND((SUM(current_items) * 100.0) / AVG(needed_items_ideal)))
          ELSE 100
        END as new_coverage_percent,
        MAX(gap_count::int) as max_gap_count,
        BOOL_OR(is_critical) as is_critical_combined,
        BOOL_OR(is_bottleneck) as is_bottleneck_combined,
        MIN(priority_level) as min_priority_level, -- Take highest priority (lowest number)
        -- Combine recommendations
        STRING_AGG(DISTINCT category_recommendations::text, '; ') as combined_recommendations,
        MAX(last_updated) as latest_update
      FROM public.scenario_coverage_by_category
      WHERE season = 'spring/fall'
      GROUP BY user_id, scenario_id, scenario_name, scenario_frequency, season, category
      HAVING COUNT(*) > 1  -- Only process groups that have duplicates
    )
    -- Delete the old duplicate rows
    DELETE FROM public.scenario_coverage_by_category sc
    WHERE sc.season = 'spring/fall' 
    AND EXISTS (
      SELECT 1 FROM consolidated_coverage cc 
      WHERE cc.user_id = sc.user_id 
      AND cc.scenario_id = sc.scenario_id 
      AND cc.category = sc.category
    );
    
    -- Insert the consolidated rows
    INSERT INTO public.scenario_coverage_by_category (
      user_id, scenario_id, scenario_name, scenario_frequency,
      season, category, current_items, needed_items_min, 
      needed_items_ideal, needed_items_max, coverage_percent,
      gap_count, is_critical, is_bottleneck, priority_level,
      category_recommendations, last_updated
    )
    SELECT 
      user_id, scenario_id, scenario_name, scenario_frequency,
      season, category, total_current_items, 
      ROUND(avg_needed_min), ROUND(avg_needed_ideal), ROUND(avg_needed_max),
      new_coverage_percent, max_gap_count, is_critical_combined,
      is_bottleneck_combined, min_priority_level,
      combined_recommendations::jsonb, latest_update
    FROM consolidated_coverage;
    
  END IF;
END
$$;

-- Step 6: Verify the changes
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

-- Add scenario_coverage_by_category to verification
UNION ALL

SELECT 
  'scenario_coverage_by_category' AS table_name,
  COUNT(*) AS total_items,
  SUM(CASE WHEN season = 'spring/fall' THEN 1 ELSE 0 END) AS transitional_items
FROM public.scenario_coverage_by_category
WHERE season IS NOT NULL;

-- Step 7: Check for any remaining spring/fall values (should be 0)
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
WHERE 'spring' = ANY(seasons) OR 'fall' = ANY(seasons)

UNION ALL

SELECT 
  'remaining_spring_coverage' AS check_name,
  COUNT(*) AS count
FROM public.scenario_coverage_by_category
WHERE season IN ('spring', 'fall');

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
