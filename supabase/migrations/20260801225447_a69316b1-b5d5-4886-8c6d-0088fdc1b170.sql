CREATE TABLE public.stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'Minha Loja',
  slug text NOT NULL UNIQUE,
  whatsapp text NOT NULL DEFAULT '',
  google_review_url text NOT NULL DEFAULT '',
  pix_key text NOT NULL DEFAULT '',
  logo_url text,
  banner_url text,
  description text NOT NULL DEFAULT '',
  business_hours text NOT NULL DEFAULT '',
  bg_color text NOT NULL DEFAULT '#f7f5ef',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX stores_owner_id_key ON public.stores(owner_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.stores TO authenticated;
GRANT SELECT ON public.stores TO anon;
GRANT ALL ON public.stores TO service_role;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners manage their store" ON public.stores FOR ALL TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Stores are publicly viewable" ON public.stores FOR SELECT TO anon USING (true);

CREATE OR REPLACE FUNCTION public.owns_store(_store_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.stores s WHERE s.id = _store_id AND s.owner_id = auth.uid())
$$;

CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT SELECT ON public.categories TO anon;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners manage categories" ON public.categories FOR ALL TO authenticated USING (public.owns_store(store_id)) WITH CHECK (public.owns_store(store_id));
CREATE POLICY "Categories are publicly viewable" ON public.categories FOR SELECT TO anon USING (true);

CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  price numeric(10,2) NOT NULL DEFAULT 0,
  old_price numeric(10,2),
  unit text NOT NULL DEFAULT 'UN',
  image_url text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT SELECT ON public.products TO anon;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners manage products" ON public.products FOR ALL TO authenticated USING (public.owns_store(store_id)) WITH CHECK (public.owns_store(store_id));
CREATE POLICY "Active products are publicly viewable" ON public.products FOR SELECT TO anon USING (is_active);

CREATE TABLE public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone text NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT '',
  birth_date date,
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clients TO authenticated;
GRANT ALL ON public.clients TO service_role;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners manage clients" ON public.clients FOR ALL TO authenticated USING (public.owns_store(store_id)) WITH CHECK (public.owns_store(store_id));

CREATE TABLE public.generated_arts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'Arte sem nome',
  title text NOT NULL DEFAULT '',
  subtitle text NOT NULL DEFAULT '',
  price_text text NOT NULL DEFAULT '',
  image_url text,
  bg_color text NOT NULL DEFAULT '#0f2f22',
  title_font text NOT NULL DEFAULT 'Outfit',
  price_font text NOT NULL DEFAULT 'Outfit',
  show_link boolean NOT NULL DEFAULT true,
  tag text NOT NULL DEFAULT '',
  is_favorite boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.generated_arts TO authenticated;
GRANT ALL ON public.generated_arts TO service_role;
ALTER TABLE public.generated_arts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners manage arts" ON public.generated_arts FOR ALL TO authenticated USING (public.owns_store(store_id)) WITH CHECK (public.owns_store(store_id));

CREATE TABLE public.favorite_strategies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  strategy_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (store_id, strategy_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.favorite_strategies TO authenticated;
GRANT ALL ON public.favorite_strategies TO service_role;
ALTER TABLE public.favorite_strategies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners manage favorite strategies" ON public.favorite_strategies FOR ALL TO authenticated USING (public.owns_store(store_id)) WITH CHECK (public.owns_store(store_id));

CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  feedback text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT INSERT ON public.reviews TO anon;
GRANT ALL ON public.reviews TO service_role;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners read reviews" ON public.reviews FOR SELECT TO authenticated USING (public.owns_store(store_id));
CREATE POLICY "Owners delete reviews" ON public.reviews FOR DELETE TO authenticated USING (public.owns_store(store_id));
CREATE POLICY "Anyone can submit a review" ON public.reviews FOR INSERT TO anon, authenticated WITH CHECK (true);