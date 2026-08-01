CREATE POLICY "Store assets are viewable" ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'store-assets');

CREATE POLICY "Owners upload store assets" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'store-assets'
  AND EXISTS (SELECT 1 FROM public.stores s WHERE s.owner_id = auth.uid() AND s.id::text = (storage.foldername(name))[1])
);

CREATE POLICY "Owners update store assets" ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'store-assets'
  AND EXISTS (SELECT 1 FROM public.stores s WHERE s.owner_id = auth.uid() AND s.id::text = (storage.foldername(name))[1])
);

CREATE POLICY "Owners delete store assets" ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'store-assets'
  AND EXISTS (SELECT 1 FROM public.stores s WHERE s.owner_id = auth.uid() AND s.id::text = (storage.foldername(name))[1])
);