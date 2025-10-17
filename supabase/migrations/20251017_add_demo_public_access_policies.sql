-- Add public read access policies for demo accounts
-- This allows the demo page to access specific user wardrobes without authentication

-- Demo user IDs (these should be actual user accounts with populated data)
-- 17e17127-60d9-4f7a-b62f-71089efea6ac - Emma (Marketing Manager)
-- 8a2f9c4e-1b5d-4e7a-9f3c-2d8e5a7b9c1f - Max (Freelance Graphic Designer)  
-- c5f8d2a9-3e6b-4d7c-8a1f-9e2d5c7b4a6e - Lisa (Stay-At-Home Mom)
-- 9f3e7b2c-6a4d-4f8e-b9c2-3f7a8d5e9c1b - Zoe (College Student)

-- Allow public read access to wardrobe_items for demo users
CREATE POLICY "Public read access for demo accounts wardrobe items" ON wardrobe_items
  FOR SELECT USING (
    user_id IN (
      '17e17127-60d9-4f7a-b62f-71089efea6ac'::uuid,
      '8a2f9c4e-1b5d-4e7a-9f3c-2d8e5a7b9c1f'::uuid,
      'c5f8d2a9-3e6b-4d7c-8a1f-9e2d5c7b4a6e'::uuid,
      '9f3e7b2c-6a4d-4f8e-b9c2-3f7a8d5e9c1b'::uuid
    )
  );

-- Allow public read access to ai_analysis_mocks for demo users
CREATE POLICY "Public read access for demo accounts analysis mocks" ON ai_analysis_mocks
  FOR SELECT USING (
    wardrobe_item_id IN (
      SELECT id FROM wardrobe_items 
      WHERE user_id IN (
        '17e17127-60d9-4f7a-b62f-71089efea6ac'::uuid,
        '8a2f9c4e-1b5d-4e7a-9f3c-2d8e5a7b9c1f'::uuid,
        'c5f8d2a9-3e6b-4d7c-8a1f-9e2d5c7b4a6e'::uuid,
        '9f3e7b2c-6a4d-4f8e-b9c2-3f7a8d5e9c1b'::uuid
      )
    )
  );

-- Also need public access to related scenario data for demo users
-- (assuming scenarios table exists and has similar structure)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'scenarios') THEN
    EXECUTE 'CREATE POLICY "Public read access for demo accounts scenarios" ON scenarios
      FOR SELECT USING (
        user_id IN (
          ''17e17127-60d9-4f7a-b62f-71089efea6ac''::uuid,
          ''8a2f9c4e-1b5d-4e7a-9f3c-2d8e5a7b9c1f''::uuid,
          ''c5f8d2a9-3e6b-4d7c-8a1f-9e2d5c7b4a6e''::uuid,
          ''9f3e7b2c-6a4d-4f8e-b9c2-3f7a8d5e9c1b''::uuid
        )
      )';
  END IF;
END $$;

-- Also need public access to wardrobe_item_scenarios junction table if it exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'wardrobe_item_scenarios') THEN
    EXECUTE 'CREATE POLICY "Public read access for demo accounts item scenarios" ON wardrobe_item_scenarios
      FOR SELECT USING (
        item_id IN (
          SELECT id FROM wardrobe_items 
          WHERE user_id IN (
            ''17e17127-60d9-4f7a-b62f-71089efea6ac''::uuid,
            ''8a2f9c4e-1b5d-4e7a-9f3c-2d8e5a7b9c1f''::uuid,
            ''c5f8d2a9-3e6b-4d7c-8a1f-9e2d5c7b4a6e''::uuid,
            ''9f3e7b2c-6a4d-4f8e-b9c2-3f7a8d5e9c1b''::uuid
          )
        )
      )';
  END IF;
END $$;

-- Comprehensive verification queries to test the policies
-- Run these after the migration to verify public access works:
/*
-- 1. Test wardrobe_items access for Emma (should return count > 0 if data exists)
SELECT 'wardrobe_items' as table_name, COUNT(*) as count 
FROM wardrobe_items 
WHERE user_id = '17e17127-60d9-4f7a-b62f-71089efea6ac';

-- 2. Test scenarios access for Emma
SELECT 'scenarios' as table_name, COUNT(*) as count 
FROM scenarios 
WHERE user_id = '17e17127-60d9-4f7a-b62f-71089efea6ac';

-- 3. Test wardrobe_item_scenarios junction table access
SELECT 'wardrobe_item_scenarios' as table_name, COUNT(*) as count 
FROM wardrobe_item_scenarios wis
JOIN wardrobe_items wi ON wi.id = wis.item_id
WHERE wi.user_id = '17e17127-60d9-4f7a-b62f-71089efea6ac';

-- 4. Test ai_analysis_mocks access
SELECT 'ai_analysis_mocks' as table_name, COUNT(*) as count 
FROM ai_analysis_mocks aam
JOIN wardrobe_items wi ON wi.id = aam.wardrobe_item_id
WHERE wi.user_id = '17e17127-60d9-4f7a-b62f-71089efea6ac';

-- 5. Verify all policies were created
SELECT policyname, tablename, cmd, permissive 
FROM pg_policies 
WHERE tablename IN ('wardrobe_items', 'ai_analysis_mocks', 'scenarios', 'wardrobe_item_scenarios') 
AND policyname LIKE '%demo%'
ORDER BY tablename, policyname;
*/
