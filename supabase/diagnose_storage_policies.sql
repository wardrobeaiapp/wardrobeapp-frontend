-- Diagnostic queries to check storage bucket configuration and policies
-- Run these queries in your Supabase SQL editor to diagnose the 406 image errors

-- 1. Check if wardrobe-images bucket exists and its configuration
SELECT 
  id, 
  name, 
  public, 
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets 
WHERE id = 'wardrobe-images';

-- 2. Check RLS status on storage.objects table
SELECT 
  schemaname, 
  tablename, 
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'storage' AND tablename = 'objects';

-- 3. List all existing storage policies (with both USING and WITH CHECK conditions)
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  cmd as action,
  permissive,
  roles,
  qual as using_condition,
  with_check as with_check_condition
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
ORDER BY policyname;

-- 4. Count wardrobe images per user (to see if images exist)
SELECT 
  (storage.foldername(name))[1] as user_id,
  COUNT(*) as image_count,
  MIN(created_at) as first_upload,
  MAX(created_at) as latest_upload
FROM storage.objects 
WHERE bucket_id = 'wardrobe-images'
GROUP BY (storage.foldername(name))[1]
ORDER BY image_count DESC
LIMIT 10;

-- 5. Sample of actual file paths (to understand structure)
SELECT 
  name as file_path,
  metadata,
  created_at,
  updated_at
FROM storage.objects 
WHERE bucket_id = 'wardrobe-images'
ORDER BY created_at DESC
LIMIT 5;

-- 6. Check for any storage policies containing 'wardrobe' (after running migration)
SELECT 
  policyname,
  cmd as action,
  qual as condition
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects' 
AND (
  policyname ILIKE '%wardrobe%' 
  OR qual ILIKE '%wardrobe%'
)
ORDER BY policyname;

-- 7. Test policy with sample user (replace with actual user ID)
-- This query tests if the RLS policy would allow access
SELECT 
  name,
  (storage.foldername(name))[1] as extracted_user_id,
  bucket_id
FROM storage.objects 
WHERE bucket_id = 'wardrobe-images'
  AND (storage.foldername(name))[1] = '17e17127-60d9-4f7a-b62f-71089efea6ac' -- Replace with actual user ID
LIMIT 3;

-- If you see any results from the queries above, the storage is working
-- If queries 1-3 show missing bucket/policies, run the migration:
-- 20251023_add_storage_bucket_policies.sql
