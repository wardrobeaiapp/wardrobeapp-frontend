-- Fix the three issues identified:
-- 1. Exclude wishlist items from current_items count  
-- 2. Update unrealistic outerwear targets
-- 3. This will eliminate the duplicate gap analysis issue

-- =====================================================
-- STEP 1: Update current_items count to exclude wishlist items
-- (Replace 'your-user-id' with the actual user ID)
-- =====================================================

UPDATE wardrobe_coverage 
SET current_items = (
    SELECT COUNT(*)
    FROM wardrobe_items 
    WHERE user_id = wardrobe_coverage.user_id
      AND LOWER(category) = 'outerwear'
      AND (wishlist = false OR wishlist IS NULL)
      AND (
          season @> ARRAY['spring/fall'] 
          OR 'spring/fall' = ANY(season)
          OR season @> ARRAY['spring'] 
          OR season @> ARRAY['fall']
          OR 'spring' = ANY(season) 
          OR 'fall' = ANY(season)
      )
)
WHERE LOWER(category) = 'outerwear' 
  AND season = 'spring/fall';

UPDATE wardrobe_coverage 
SET current_items = (
    SELECT COUNT(*)
    FROM wardrobe_items 
    WHERE user_id = wardrobe_coverage.user_id
      AND LOWER(category) = 'outerwear'
      AND (wishlist = false OR wishlist IS NULL)
      AND (
          season @> ARRAY['summer'] 
          OR 'summer' = ANY(season)
      )
)
WHERE LOWER(category) = 'outerwear' 
  AND season = 'summer';

UPDATE wardrobe_coverage 
SET current_items = (
    SELECT COUNT(*)
    FROM wardrobe_items 
    WHERE user_id = wardrobe_coverage.user_id
      AND LOWER(category) = 'outerwear'
      AND (wishlist = false OR wishlist IS NULL)
      AND (
          season @> ARRAY['winter'] 
          OR 'winter' = ANY(season)
      )
)
WHERE LOWER(category) = 'outerwear' 
  AND season = 'winter';

-- =====================================================
-- STEP 2: Update outerwear targets to realistic values
-- =====================================================

-- Spring/Fall outerwear (most variety needed)
UPDATE wardrobe_coverage 
SET 
    needed_items_min = 3,
    needed_items_ideal = 4,
    needed_items_max = 5,
    coverage_percent = CASE 
        WHEN 4 > 0 
        THEN LEAST(100, ROUND((current_items * 100.0) / 4))
        ELSE 100
    END,
    gap_type = CASE 
        WHEN current_items = 0 THEN 'critical'
        WHEN current_items < 3 THEN 'critical' 
        WHEN current_items < 4 THEN 'improvement'
        WHEN current_items < 5 THEN 'expansion'
        WHEN current_items = 5 THEN 'satisfied'
        WHEN current_items > 5 THEN 'oversaturated'
        ELSE 'improvement'
    END
WHERE LOWER(category) = 'outerwear' 
  AND season = 'spring/fall';

-- Winter outerwear  
UPDATE wardrobe_coverage 
SET 
    needed_items_min = 2,
    needed_items_ideal = 3,
    needed_items_max = 4,
    coverage_percent = CASE 
        WHEN 3 > 0 
        THEN LEAST(100, ROUND((current_items * 100.0) / 3))
        ELSE 100
    END,
    gap_type = CASE 
        WHEN current_items = 0 THEN 'critical'
        WHEN current_items < 2 THEN 'critical' 
        WHEN current_items < 3 THEN 'improvement'
        WHEN current_items < 4 THEN 'expansion'
        WHEN current_items = 4 THEN 'satisfied'
        WHEN current_items > 4 THEN 'oversaturated'
        ELSE 'improvement'
    END
WHERE LOWER(category) = 'outerwear' 
  AND season = 'winter';

-- Summer outerwear (least needed)
UPDATE wardrobe_coverage 
SET 
    needed_items_min = 1,
    needed_items_ideal = 2,
    needed_items_max = 3,
    coverage_percent = CASE 
        WHEN 2 > 0 
        THEN LEAST(100, ROUND((current_items * 100.0) / 2))
        ELSE 100
    END,
    gap_type = CASE 
        WHEN current_items = 0 THEN 'critical'
        WHEN current_items < 1 THEN 'critical' 
        WHEN current_items < 2 THEN 'improvement'
        WHEN current_items < 3 THEN 'expansion'
        WHEN current_items = 3 THEN 'satisfied'
        WHEN current_items > 3 THEN 'oversaturated'
        ELSE 'improvement'
    END
WHERE LOWER(category) = 'outerwear' 
  AND season = 'summer';

-- =====================================================
-- STEP 2B: Update accessories current_items (excluding wishlist)
-- =====================================================

-- All-season accessories (bags, jewelry, watches, belts, sunglasses)
UPDATE wardrobe_coverage 
SET current_items = (
    SELECT COUNT(*)
    FROM wardrobe_items 
    WHERE user_id = wardrobe_coverage.user_id
      AND LOWER(category) = 'accessory'
      AND (wishlist = false OR wishlist IS NULL)
      AND LOWER(subcategory) = LOWER(wardrobe_coverage.subcategory)
)
WHERE LOWER(category) = 'accessory' 
  AND season = 'all_seasons'
  AND LOWER(subcategory) IN ('bag', 'belt', 'jewelry', 'watch', 'sunglasses');

-- Seasonal accessories (hats, scarves, gloves)
-- Spring/Fall seasonal accessories
UPDATE wardrobe_coverage 
SET current_items = (
    SELECT COUNT(*)
    FROM wardrobe_items 
    WHERE user_id = wardrobe_coverage.user_id
      AND LOWER(category) = 'accessory'
      AND (wishlist = false OR wishlist IS NULL)
      AND LOWER(subcategory) = LOWER(wardrobe_coverage.subcategory)
      AND (
          season @> ARRAY['spring/fall'] 
          OR 'spring/fall' = ANY(season)
          OR season @> ARRAY['spring'] 
          OR season @> ARRAY['fall']
          OR 'spring' = ANY(season) 
          OR 'fall' = ANY(season)
      )
)
WHERE LOWER(category) = 'accessory' 
  AND season = 'spring/fall'
  AND LOWER(subcategory) IN ('hat', 'scarf', 'gloves');

-- Winter seasonal accessories  
UPDATE wardrobe_coverage 
SET current_items = (
    SELECT COUNT(*)
    FROM wardrobe_items 
    WHERE user_id = wardrobe_coverage.user_id
      AND LOWER(category) = 'accessory'
      AND (wishlist = false OR wishlist IS NULL)
      AND LOWER(subcategory) = LOWER(wardrobe_coverage.subcategory)
      AND (
          season @> ARRAY['winter'] 
          OR 'winter' = ANY(season)
      )
)
WHERE LOWER(category) = 'accessory' 
  AND season = 'winter'
  AND LOWER(subcategory) IN ('hat', 'scarf', 'gloves');

-- Summer seasonal accessories
UPDATE wardrobe_coverage 
SET current_items = (
    SELECT COUNT(*)
    FROM wardrobe_items 
    WHERE user_id = wardrobe_coverage.user_id
      AND LOWER(category) = 'accessory'
      AND (wishlist = false OR wishlist IS NULL)
      AND LOWER(subcategory) = LOWER(wardrobe_coverage.subcategory)
      AND (
          season @> ARRAY['summer'] 
          OR 'summer' = ANY(season)
      )
)
WHERE LOWER(category) = 'accessory' 
  AND season = 'summer'
  AND LOWER(subcategory) IN ('hat', 'scarf', 'gloves', 'sunglasses');

-- =====================================================
-- STEP 3: Verify the fixes
-- =====================================================

SELECT 
    'After Fix - Outerwear Coverage:' as status,
    season,
    current_items,
    needed_items_min,
    needed_items_ideal,
    needed_items_max,
    coverage_percent,
    gap_type
FROM wardrobe_coverage 
WHERE LOWER(category) = 'outerwear'
ORDER BY season;

-- Verify accessories fix
SELECT 
    'After Fix - Accessory Coverage:' as status,
    subcategory,
    season,
    current_items,
    coverage_percent
FROM wardrobe_coverage 
WHERE LOWER(category) = 'accessory'
ORDER BY subcategory, season;
