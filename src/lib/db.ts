import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { slugify } from "@/lib/format";

export type Store = Tables<"stores">;
export type Category = Tables<"categories">;
export type Product = Tables<"products">;
export type Client = Tables<"clients">;
export type GeneratedArt = Tables<"generated_arts">;
export type Review = Tables<"reviews">;

export const BUCKET = "store-assets";
export const UNITS = ["UN", "KG", "G", "L", "ML", "CX", "PCT", "DZ", "MT"] as const;

/* ---------------------------------- assets --------------------------------- */

const isAbsolute = (value: string) => /^(https?:|data:|blob:|\/)/.test(value);

export function useAssetUrl(path?: string | null) {
  return useQuery({
    queryKey: ["asset", path],
    enabled: !!path,
    staleTime: 30 * 60 * 1000,
    queryFn: async () => {
      if (!path) return null;
      if (isAbsolute(path)) return path;
      const { data } = await supabase.storage.from(BUCKET).createSignedUrl(path, 60 * 60 * 6);
      return data?.signedUrl ?? null;
    },
  });
}

export async function uploadStoreAsset(storeId: string, folder: string, file: File) {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `${storeId}/${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: true });
  if (error) throw error;
  return path;
}

/* ---------------------------------- store ---------------------------------- */

export async function getOrCreateStore(userId: string, email: string | null) {
  const existing = await supabase.from("stores").select("*").eq("owner_id", userId).maybeSingle();
  if (existing.error) throw existing.error;
  if (existing.data) return existing.data;

  const base = slugify(email?.split("@")[0] ?? "minha-loja") || "minha-loja";
  const created = await supabase
    .from("stores")
    .insert({
      owner_id: userId,
      name: "Minha Loja",
      slug: `${base}-${Math.random().toString(36).slice(2, 6)}`,
    })
    .select("*")
    .single();
  if (created.error) throw created.error;
  return created.data;
}

export function useMyStore() {
  return useQuery({
    queryKey: ["my-store"],
    queryFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return null;
      return getOrCreateStore(auth.user.id, auth.user.email ?? null);
    },
  });
}

export function useUpdateStore(storeId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patch: TablesUpdate<"stores">) => {
      if (!storeId) throw new Error("Loja não encontrada");
      const { error } = await supabase.from("stores").update(patch).eq("id", storeId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-store"] });
      qc.invalidateQueries({ queryKey: ["public-store"] });
    },
  });
}

export function usePublicStore(slug: string) {
  return useQuery({
    queryKey: ["public-store", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stores")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

/* -------------------------------- categories ------------------------------- */

export function useCategories(storeId?: string) {
  return useQuery({
    queryKey: ["categories", storeId],
    enabled: !!storeId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("store_id", storeId!)
        .order("name");
      if (error) throw error;
      return data;
    },
  });
}

export function useCategoryMutations(storeId?: string) {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["categories"] });
    qc.invalidateQueries({ queryKey: ["products"] });
  };

  const create = useMutation({
    mutationFn: async (name: string) => {
      if (!storeId) throw new Error("Loja não encontrada");
      const { error } = await supabase.from("categories").insert({ store_id: storeId, name });
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const rename = useMutation({
    mutationFn: async (input: { id: string; name: string }) => {
      const { error } = await supabase
        .from("categories")
        .update({ name: input.name })
        .eq("id", input.id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  return { create, remove, rename };
}

/* --------------------------------- products -------------------------------- */

export function useProducts(storeId?: string) {
  return useQuery({
    queryKey: ["products", storeId],
    enabled: !!storeId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("store_id", storeId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useProductMutations(storeId?: string) {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["products"] });

  const save = useMutation({
    mutationFn: async (input: TablesInsert<"products"> & { id?: string | undefined }) => {
      if (!storeId) throw new Error("Loja não encontrada");
      const { id, ...values } = input;
      if (id) {
        const { error } = await supabase.from("products").update(values).eq("id", id);
        if (error) throw error;
        return;
      }
      const { error } = await supabase.from("products").insert({ ...values, store_id: storeId });
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const bulkInsert = useMutation({
    mutationFn: async (rows: Omit<TablesInsert<"products">, "store_id">[]) => {
      if (!storeId) throw new Error("Loja não encontrada");
      const { error } = await supabase
        .from("products")
        .insert(rows.map((r) => ({ ...r, store_id: storeId })));
      if (error) throw error;
      return rows.length;
    },
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const toggleActive = useMutation({
    mutationFn: async (input: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("products")
        .update({ is_active: input.is_active })
        .eq("id", input.id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  return { save, bulkInsert, remove, toggleActive };
}

export function usePublicCatalog(storeId?: string) {
  return useQuery({
    queryKey: ["public-catalog", storeId],
    enabled: !!storeId,
    queryFn: async () => {
      const [products, categories] = await Promise.all([
        supabase
          .from("products")
          .select("*")
          .eq("store_id", storeId!)
          .eq("is_active", true)
          .order("created_at", { ascending: false }),
        supabase.from("categories").select("*").eq("store_id", storeId!).order("name"),
      ]);
      if (products.error) throw products.error;
      if (categories.error) throw categories.error;
      return { products: products.data, categories: categories.data };
    },
  });
}

/* --------------------------------- clients --------------------------------- */

export function useClients(storeId?: string) {
  return useQuery({
    queryKey: ["clients", storeId],
    enabled: !!storeId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("store_id", storeId!)
        .order("name");
      if (error) throw error;
      return data;
    },
  });
}

export function useClientMutations(storeId?: string) {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["clients"] });

  const save = useMutation({
    mutationFn: async (input: TablesInsert<"clients"> & { id?: string | undefined }) => {
      if (!storeId) throw new Error("Loja não encontrada");
      const { id, ...values } = input;
      if (id) {
        const { error } = await supabase.from("clients").update(values).eq("id", id);
        if (error) throw error;
        return;
      }
      const { error } = await supabase.from("clients").insert({ ...values, store_id: storeId });
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const bulkInsert = useMutation({
    mutationFn: async (rows: Omit<TablesInsert<"clients">, "store_id">[]) => {
      if (!storeId) throw new Error("Loja não encontrada");
      const { error } = await supabase
        .from("clients")
        .insert(rows.map((r) => ({ ...r, store_id: storeId })));
      if (error) throw error;
      return rows.length;
    },
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("clients").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  return { save, bulkInsert, remove };
}

/* ------------------------------ generated arts ----------------------------- */

export function useArts(storeId?: string) {
  return useQuery({
    queryKey: ["arts", storeId],
    enabled: !!storeId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("generated_arts")
        .select("*")
        .eq("store_id", storeId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useArtMutations(storeId?: string) {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["arts"] });

  const save = useMutation({
    mutationFn: async (input: TablesInsert<"generated_arts"> & { id?: string | undefined }) => {
      if (!storeId) throw new Error("Loja não encontrada");
      const { id, ...values } = input;
      if (id) {
        const { error } = await supabase.from("generated_arts").update(values).eq("id", id);
        if (error) throw error;
        return id;
      }
      const { data, error } = await supabase
        .from("generated_arts")
        .insert({ ...values, store_id: storeId })
        .select("id")
        .single();
      if (error) throw error;
      return data.id;
    },
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("generated_arts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const toggleFavorite = useMutation({
    mutationFn: async (input: { id: string; is_favorite: boolean }) => {
      const { error } = await supabase
        .from("generated_arts")
        .update({ is_favorite: input.is_favorite })
        .eq("id", input.id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  return { save, remove, toggleFavorite };
}

/* ---------------------------------- reviews -------------------------------- */

export function useReviews(storeId?: string) {
  return useQuery({
    queryKey: ["reviews", storeId],
    enabled: !!storeId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("store_id", storeId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useSubmitReview() {
  return useMutation({
    mutationFn: async (input: { store_id: string; rating: number; feedback: string }) => {
      const { error } = await supabase.from("reviews").insert(input);
      if (error) throw error;
    },
  });
}

/* ----------------------------- favorite strategies ------------------------- */

export function useFavoriteStrategies(storeId?: string) {
  return useQuery({
    queryKey: ["favorite-strategies", storeId],
    enabled: !!storeId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("favorite_strategies")
        .select("strategy_id")
        .eq("store_id", storeId!);
      if (error) throw error;
      return data.map((row) => row.strategy_id);
    },
  });
}

export function useToggleFavoriteStrategy(storeId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { strategyId: string; favorite: boolean }) => {
      if (!storeId) throw new Error("Loja não encontrada");
      if (input.favorite) {
        const { error } = await supabase
          .from("favorite_strategies")
          .insert({ store_id: storeId, strategy_id: input.strategyId });
        if (error) throw error;
        return;
      }
      const { error } = await supabase
        .from("favorite_strategies")
        .delete()
        .eq("store_id", storeId)
        .eq("strategy_id", input.strategyId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["favorite-strategies"] }),
  });
}
