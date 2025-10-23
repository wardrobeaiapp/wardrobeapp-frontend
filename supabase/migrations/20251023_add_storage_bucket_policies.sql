-- Add Row Level Security policies for wardrobe-images storage bucket
-- This fixes 406 errors when loading user images

-- Create wardrobe-images bucket if it doesn't exist (idempotent)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'wardrobe-images', 
  'wardrobe-images', 
  false,  -- Keep private, use RLS policies instead
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp']
)
ON CONFLICT (id) DO NOTHING;

-- Note: RLS is already enabled by default on storage.objects table in Supabase
-- No need to enable it manually - skipping ALTER TABLE command

-- Policy 1: Users can read their own images
CREATE POLICY "Users can view their own wardrobe images"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'wardrobe-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 2: Users can insert/upload their own images  
CREATE POLICY "Users can upload their own wardrobe images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'wardrobe-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 3: Users can update their own images
CREATE POLICY "Users can update their own wardrobe images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'wardrobe-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 4: Users can delete their own images
CREATE POLICY "Users can delete their own wardrobe images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'wardrobe-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 5: Public read access for demo accounts (if you have them)
-- This allows your demo page to work without authentication
CREATE POLICY "Public read access for demo accounts wardrobe images"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'wardrobe-images' 
  AND (storage.foldername(name))[1] IN (
    '17e17127-60d9-4f7a-b62f-71089efea6ac',
    '8a2f9c4e-1b5d-4e7a-9f3c-2d8e5a7b9c1f',
    'c5f8d2a9-3e6b-4d7c-8a1f-9e2d5c7b4a6e',
    '9f3e7b2c-6a4d-4f8e-b9c2-3f7a8d5e9c1b'
  )
);

-- Verification queries to check if policies were created successfully
-- Run these after the migration:
/*
-- 1. Check if bucket exists
SELECT id, name, public FROM storage.buckets WHERE id = 'wardrobe-images';

-- 2. Check if policies were created
SELECT schemaname, tablename, policyname, cmd, roles, qual 
FROM pg_policies 
WHERE tablename = 'objects' AND policyname LIKE '%wardrobe%'
ORDER BY policyname;

-- 3. Test policy with a sample file path (replace with actual user ID and file)
-- This should return true if the policy allows access
SELECT storage.foldername('17e17127-60d9-4f7a-b62f-71089efea6ac/wardrobe/test-image.jpg');

-- 4. Check RLS status
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'objects' AND schemaname = 'storage';
*/

-- Add comment
COMMENT ON TABLE storage.objects IS 'Storage objects table with RLS policies for user-specific wardrobe image access';
