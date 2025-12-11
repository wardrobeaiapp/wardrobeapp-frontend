-- Quick fix: Make wardrobe-images bucket public for demo images
-- This will allow demo persona images to load without authentication

-- Update bucket to be public
UPDATE storage.buckets 
SET public = true 
WHERE id = 'wardrobe-images';

-- Also update the demo storage policies to use correct user IDs
DROP POLICY IF EXISTS "Public read access for demo accounts wardrobe images" ON storage.objects;

CREATE POLICY "Public read access for demo accounts wardrobe images"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'wardrobe-images' 
  AND (storage.foldername(name))[1] IN (
    'bdc94953-9f24-477d-9fea-30a8f7192f53',  -- Emma (Marketing Manager)
    '4d3ab63a-ae73-4dcd-8309-231bdd734272',  -- Max (Freelance Designer)
    '9206c9a8-920a-4304-a99a-1129e308609e',  -- Lisa (Stay-At-Home Mom) 
    'fba15166-e5e0-48ab-98f6-fee5a08e7945'   -- Zoe (College Student)
  )
);

-- Check if demo users have files
SELECT 
  (storage.foldername(name))[1] as user_id,
  COUNT(*) as file_count
FROM storage.objects 
WHERE bucket_id = 'wardrobe-images'
  AND (storage.foldername(name))[1] IN (
    'bdc94953-9f24-477d-9fea-30a8f7192f53',
    '4d3ab63a-ae73-4dcd-8309-231bdd734272',
    '9206c9a8-920a-4304-a99a-1129e308609e',
    'fba15166-e5e0-48ab-98f6-fee5a08e7945'
  )
GROUP BY (storage.foldername(name))[1];
