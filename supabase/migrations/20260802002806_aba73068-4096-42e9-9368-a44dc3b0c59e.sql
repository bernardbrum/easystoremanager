DROP POLICY IF EXISTS "Owners upload store assets" ON storage.objects;
DROP POLICY IF EXISTS "Owners update store assets" ON storage.objects;
DROP POLICY IF EXISTS "Owners delete store assets" ON storage.objects;

CREATE POLICY "Owners upload store assets" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'store-assets'
    AND EXISTS (
      SELECT 1 FROM public.stores s
      WHERE s.owner_id = auth.uid()
        AND s.id::text = (storage.foldername(storage.objects.name))[1]
    )
  );

CREATE POLICY "Owners update store assets" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'store-assets'
    AND EXISTS (
      SELECT 1 FROM public.stores s
      WHERE s.owner_id = auth.uid()
        AND s.id::text = (storage.foldername(storage.objects.name))[1]
    )
  )
  WITH CHECK (
    bucket_id = 'store-assets'
    AND EXISTS (
      SELECT 1 FROM public.stores s
      WHERE s.owner_id = auth.uid()
        AND s.id::text = (storage.foldername(storage.objects.name))[1]
    )
  );

CREATE POLICY "Owners delete store assets" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'store-assets'
    AND EXISTS (
      SELECT 1 FROM public.stores s
      WHERE s.owner_id = auth.uid()
        AND s.id::text = (storage.foldername(storage.objects.name))[1]
    )
  );

-- Restrict anon reads to non-sensitive columns (excludes pix_key)
REVOKE SELECT ON public.stores FROM anon;
GRANT SELECT (
  id, owner_id, name, slug, whatsapp, google_review_url,
  logo_url, banner_url, description, business_hours, bg_color, created_at
) ON public.stores TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.stores TO authenticated;
GRANT ALL ON public.stores TO service_role;