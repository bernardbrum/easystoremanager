DROP POLICY "Owners manage categories" ON public.categories;
CREATE POLICY "Owners manage categories" ON public.categories FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.stores s WHERE s.id = categories.store_id AND s.owner_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.stores s WHERE s.id = categories.store_id AND s.owner_id = auth.uid()));

DROP POLICY "Owners manage products" ON public.products;
CREATE POLICY "Owners manage products" ON public.products FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.stores s WHERE s.id = products.store_id AND s.owner_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.stores s WHERE s.id = products.store_id AND s.owner_id = auth.uid()));

DROP POLICY "Owners manage clients" ON public.clients;
CREATE POLICY "Owners manage clients" ON public.clients FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.stores s WHERE s.id = clients.store_id AND s.owner_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.stores s WHERE s.id = clients.store_id AND s.owner_id = auth.uid()));

DROP POLICY "Owners manage arts" ON public.generated_arts;
CREATE POLICY "Owners manage arts" ON public.generated_arts FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.stores s WHERE s.id = generated_arts.store_id AND s.owner_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.stores s WHERE s.id = generated_arts.store_id AND s.owner_id = auth.uid()));

DROP POLICY "Owners manage favorite strategies" ON public.favorite_strategies;
CREATE POLICY "Owners manage favorite strategies" ON public.favorite_strategies FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.stores s WHERE s.id = favorite_strategies.store_id AND s.owner_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.stores s WHERE s.id = favorite_strategies.store_id AND s.owner_id = auth.uid()));

DROP POLICY "Owners read reviews" ON public.reviews;
CREATE POLICY "Owners read reviews" ON public.reviews FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.stores s WHERE s.id = reviews.store_id AND s.owner_id = auth.uid()));

DROP POLICY "Owners delete reviews" ON public.reviews;
CREATE POLICY "Owners delete reviews" ON public.reviews FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM public.stores s WHERE s.id = reviews.store_id AND s.owner_id = auth.uid()));

DROP POLICY "Anyone can submit a review" ON public.reviews;
CREATE POLICY "Anyone can submit a review" ON public.reviews FOR INSERT TO anon, authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.stores s WHERE s.id = reviews.store_id));

DROP FUNCTION IF EXISTS public.owns_store(uuid);