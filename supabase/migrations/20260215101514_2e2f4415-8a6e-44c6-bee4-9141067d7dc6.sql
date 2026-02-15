-- Allow super_admins/admins to manage all files in profile-images bucket
CREATE POLICY "Admins can insert any file"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'profile-images'
  AND public.is_admin(auth.uid())
);

CREATE POLICY "Admins can update any file"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'profile-images'
  AND public.is_admin(auth.uid())
);

CREATE POLICY "Admins can delete any file"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'profile-images'
  AND public.is_admin(auth.uid())
);
