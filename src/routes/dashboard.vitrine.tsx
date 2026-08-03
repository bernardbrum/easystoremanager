import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { Eye, EyeOff, Loader2, Pencil, Plus, Search, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

import { StorageImage } from "@/components/storage-image";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { parseCsv, parseNumber } from "@/lib/csv";
import {
  UNITS,
  uploadStoreAsset,
  useCategories,
  useCategoryMutations,
  useMyStore,
  useProductMutations,
  useProducts,
  useUpdateStore,
} from "@/lib/db";
import { formatPrice, onlyDigits, slugify } from "@/lib/format";

export const Route = createFileRoute("/dashboard/vitrine")({
  head: () => ({
    meta: [
      { title: "Gestão da Vitrine — EasyManager" },
      {
        name: "description",
        content: "Edite os dados da loja e gerencie o catálogo de produtos da vitrine digital.",
      },
    ],
  }),
  component: VitrinePage,
});

type StoreForm = {
  name: string;
  slug: string;
  description: string;
  whatsapp: string;
  google_review_url: string;
  pix_key: string;
  business_hours: string;
  bg_color: string;
};

type ProductForm = {
  id?: string;
  name: string;
  description: string;
  price: string;
  old_price: string;
  unit: string;
  category_id: string | null;
  image_url: string | null;
  is_active: boolean;
};

const emptyForm: ProductForm = {
  name: "",
  description: "",
  price: "",
  old_price: "",
  unit: "UN",
  category_id: null,
  image_url: null,
  is_active: true,
};

function VitrinePage() {
  const { data: store } = useMyStore();
  const updateStore = useUpdateStore(store?.id);
  const { data: categories = [] } = useCategories(store?.id);
  const { data: products = [] } = useProducts(store?.id);
  const catMutations = useCategoryMutations(store?.id);
  const productMutations = useProductMutations(store?.id);

  const [form, setForm] = useState<StoreForm | null>(null);
  const [newCategory, setNewCategory] = useState("");
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Todos");
  const [editing, setEditing] = useState<ProductForm | null>(null);
  const [uploading, setUploading] = useState(false);
  const csvRef = useRef<HTMLInputElement>(null);

  const values = form ?? {
    name: store?.name ?? "",
    slug: store?.slug ?? "",
    description: store?.description ?? "",
    whatsapp: store?.whatsapp ?? "",
    google_review_url: store?.google_review_url ?? "",
    pix_key: store?.pix_key ?? "",
    business_hours: store?.business_hours ?? "",
    bg_color: store?.bg_color ?? "#ffffff",
  };
  const setValue = (key: keyof StoreForm, value: string) => setForm({ ...values, [key]: value });

  const filtered = useMemo(
    () =>
      products.filter((p) => {
        const categoryName = categories.find((c) => c.id === p.category_id)?.name ?? "Geral";
        const matchesCategory = categoryFilter === "Todos" || categoryName === categoryFilter;
        const matchesQuery =
          !query.trim() || p.name.toLowerCase().includes(query.trim().toLowerCase());
        return matchesCategory && matchesQuery;
      }),
    [products, categories, query, categoryFilter],
  );

  const saveStore = async () => {
    try {
      await updateStore.mutateAsync({
        name: values.name,
        slug: slugify(values.slug),
        description: values.description,
        whatsapp: onlyDigits(values.whatsapp),
        google_review_url: values.google_review_url,
        pix_key: values.pix_key,
        business_hours: values.business_hours,
        bg_color: values.bg_color,
      });
      setForm(null);
      toast.success("Dados da loja atualizados");
    } catch {
      toast.error("Não foi possível salvar. O endereço da vitrine pode já estar em uso.");
    }
  };

  const uploadImage = async (kind: "logo_url" | "banner_url", file: File) => {
    if (!store) return;
    setUploading(true);
    try {
      const path = await uploadStoreAsset(store.id, kind === "logo_url" ? "logo" : "banner", file);
      await updateStore.mutateAsync({ [kind]: path });
      toast.success("Imagem atualizada");
    } catch {
      toast.error("Falha no upload da imagem");
    } finally {
      setUploading(false);
    }
  };

  const uploadProductImage = async (file: File) => {
    if (!store || !editing) return;
    setUploading(true);
    try {
      const path = await uploadStoreAsset(store.id, "produtos", file);
      setEditing({ ...editing, image_url: path });
      toast.success("Foto carregada");
    } catch {
      toast.error("Falha no upload da foto");
    } finally {
      setUploading(false);
    }
  };

  const saveProduct = async () => {
    if (!editing) return;
    if (!editing.name.trim()) {
      toast.error("Informe o nome do produto");
      return;
    }
    const price = parseNumber(editing.price) ?? 0;
    const oldPrice = parseNumber(editing.old_price);
    try {
      await productMutations.save.mutateAsync({
        ...(editing.id ? { id: editing.id } : {}),
        store_id: store!.id,
        name: editing.name.trim(),
        description: editing.description,
        price,
        old_price: oldPrice,
        unit: editing.unit,
        category_id: editing.category_id,
        image_url: editing.image_url,
        is_active: editing.is_active,
      });
      toast.success(editing.id ? "Produto atualizado" : "Produto cadastrado");
      setEditing(null);
    } catch {
      toast.error("Não foi possível salvar o produto");
    }
  };

  const importCsv = async (file: File) => {
    if (!store) return;
    const rows = parseCsv(await file.text());
    if (!rows.length) {
      toast.error("CSV vazio ou inválido");
      return;
    }
    const catMap = new Map(categories.map((c) => [c.name.toLowerCase(), c.id]));
    const missing = [
      ...new Set(
        rows
          .map((r) => (r["categoria"] ?? "").trim())
          .filter((name) => name && !catMap.has(name.toLowerCase())),
      ),
    ];
    for (const name of missing) {
      await catMutations.create.mutateAsync(name);
    }
    const refreshed = await Promise.resolve(); // categories query invalidated above
    void refreshed;

    const payload = rows
      .filter((r) => (r["nome"] ?? "").trim())
      .map((r) => ({
        name: r["nome"]!.trim(),
        description: r["descricao"] ?? "",
        price: parseNumber(r["preco"]) ?? 0,
        old_price: parseNumber(r["preco_antigo"]),
        unit: (r["unidade"] || "UN").toUpperCase(),
        category_id: catMap.get((r["categoria"] ?? "").trim().toLowerCase()) ?? null,
        is_active: true,
      }));

    try {
      const count = await productMutations.bulkInsert.mutateAsync(payload);
      toast.success(`${count} produtos importados`);
    } catch {
      toast.error("Falha ao importar o CSV");
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold">Gestão da Vitrine</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Dados da loja e catálogo exibidos no seu BioLink público.
        </p>
      </div>

      <section className="surface-card p-5">
        <h2 className="text-base font-bold">Configurações da loja</h2>
        <Accordion type="single" collapsible defaultValue="identidade" className="mt-2">
          <AccordionItem value="identidade">
            <AccordionTrigger>Identidade visual</AccordionTrigger>
            <AccordionContent>
              <div className="grid gap-4 pt-1 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nome da loja</Label>
                  <Input id="name" value={values.name} onChange={(e) => setValue("name", e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="slug">Endereço da vitrine</Label>
                  <div className="flex items-center gap-2">
                    <span className="shrink-0 text-xs text-muted-foreground">/</span>
                    <Input id="slug" value={values.slug} onChange={(e) => setValue("slug", e.target.value)} />
                  </div>
                </div>
                <div className="grid gap-2 sm:col-span-2">
                  <Label htmlFor="desc">Descrição curta</Label>
                  <Textarea
                    id="desc"
                    rows={2}
                    value={values.description}
                    onChange={(e) => setValue("description", e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="bg">Cor de fundo da vitrine</Label>
                  <div className="flex items-center gap-2">
                    <input
                      id="bg"
                      type="color"
                      value={values.bg_color}
                      onChange={(e) => setValue("bg_color", e.target.value)}
                      className="size-10 shrink-0 cursor-pointer rounded-lg border border-border bg-card"
                    />
                    <Input value={values.bg_color} onChange={(e) => setValue("bg_color", e.target.value)} />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Logo</Label>
                  <div className="flex items-center gap-3">
                    <StorageImage
                      path={store?.logo_url}
                      alt="Logo da loja"
                      className="size-14 rounded-xl border border-border object-contain"
                    />
                    <Button variant="outline" size="sm" asChild>
                      <label>
                        <Upload className="size-4" />
                        Enviar logo
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) void uploadImage("logo_url", file);
                          }}
                        />
                      </label>
                    </Button>
                  </div>
                </div>
                <div className="grid gap-2 sm:col-span-2">
                  <Label>Banner</Label>
                  <div className="flex items-center gap-3">
                    <StorageImage
                      path={store?.banner_url}
                      alt="Banner da loja"
                      className="h-14 w-24 rounded-xl border border-border object-cover"
                    />
                    <Button variant="outline" size="sm" asChild>
                      <label>
                        <Upload className="size-4" />
                        Enviar banner
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) void uploadImage("banner_url", file);
                          }}
                        />
                      </label>
                    </Button>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="pagamento">
            <AccordionTrigger>Pagamento &amp; links</AccordionTrigger>
            <AccordionContent>
              <div className="grid gap-4 pt-1 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="whatsapp">WhatsApp (com DDI e DDD)</Label>
                  <Input
                    id="whatsapp"
                    value={values.whatsapp}
                    onChange={(e) => setValue("whatsapp", e.target.value)}
                    placeholder="5511999999999"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="pix">Chave PIX</Label>
                  <Input id="pix" value={values.pix_key} onChange={(e) => setValue("pix_key", e.target.value)} />
                </div>
                <div className="grid gap-2 sm:col-span-2">
                  <Label htmlFor="google">Link de avaliação no Google</Label>
                  <Input
                    id="google"
                    value={values.google_review_url}
                    onChange={(e) => setValue("google_review_url", e.target.value)}
                    placeholder="https://g.page/r/..."
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="horarios">
            <AccordionTrigger>Horários</AccordionTrigger>
            <AccordionContent>
              <div className="grid gap-2 pt-1">
                <Label htmlFor="hours">Horário de funcionamento</Label>
                <Input
                  id="hours"
                  value={values.business_hours}
                  onChange={(e) => setValue("business_hours", e.target.value)}
                  placeholder="Seg a Sáb, 8h às 19h"
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Button className="mt-5" onClick={saveStore} disabled={updateStore.isPending || uploading}>
          {(updateStore.isPending || uploading) && <Loader2 className="size-4 animate-spin" />}
          Salvar alterações
        </Button>
      </section>


      <section className="surface-card p-5">
        <h2 className="text-base font-bold">Categorias ({categories.length})</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {categories.map((c) => (
            <span
              key={c.id}
              className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-sm"
            >
              {c.name}
              <button
                onClick={() => catMutations.remove.mutate(c.id)}
                aria-label={`Remover categoria ${c.name}`}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="size-3.5" />
              </button>
            </span>
          ))}
          {categories.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhuma categoria cadastrada ainda.</p>
          )}
        </div>
        <div className="mt-4 flex gap-2">
          <Input
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Nova categoria"
          />
          <Button
            variant="outline"
            onClick={() => {
              if (!newCategory.trim()) return;
              catMutations.create.mutate(newCategory.trim());
              setNewCategory("");
            }}
          >
            <Plus className="size-4" />
            Adicionar
          </Button>
        </div>
      </section>

      <section className="surface-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="truncate text-base font-bold">Produtos ({products.length})</h2>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => csvRef.current?.click()}>
              <Upload className="size-4" />
              Importar CSV
            </Button>
            <input
              ref={csvRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void importCsv(file);
                e.target.value = "";
              }}
            />
            <Button onClick={() => setEditing({ ...emptyForm })}>
              <Plus className="size-4" />
              Novo Produto
            </Button>
          </div>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          CSV com colunas: nome, descricao, preco, preco_antigo, unidade, categoria.
        </p>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar produto..."
              className="pl-9"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="sm:w-52">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todos">Todas as categorias</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.name}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mt-4 grid gap-3">
          {filtered.map((p) => (
            <article
              key={p.id}
              className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3 rounded-xl border border-border p-3 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center"
            >
              <StorageImage
                path={p.image_url}
                alt={p.name}
                className="size-16 shrink-0 rounded-lg object-cover"
              />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-sm font-bold">{p.name}</p>
                  <Badge variant="secondary" className="text-[10px]">
                    {categories.find((c) => c.id === p.category_id)?.name ?? "Geral"}
                  </Badge>
                  {!p.is_active && (
                    <Badge variant="outline" className="text-[10px]">
                      oculto
                    </Badge>
                  )}
                </div>
                <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{p.description}</p>
                <p className="mt-1 text-sm font-extrabold text-primary">
                  {formatPrice(Number(p.price))}{" "}
                  <span className="text-xs font-medium text-muted-foreground">/{p.unit}</span>
                </p>
              </div>
              <div className="col-span-2 flex items-center gap-2 sm:col-span-1">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() =>
                    productMutations.toggleActive.mutate({ id: p.id, is_active: !p.is_active })
                  }
                  aria-label="Alternar visibilidade"
                >
                  {p.is_active ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  aria-label="Editar produto"
                  onClick={() =>
                    setEditing({
                      id: p.id,
                      name: p.name,
                      description: p.description,
                      price: String(p.price),
                      old_price: p.old_price == null ? "" : String(p.old_price),
                      unit: p.unit,
                      category_id: p.category_id,
                      image_url: p.image_url,
                      is_active: p.is_active,
                    })
                  }
                >
                  <Pencil className="size-4" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => productMutations.remove.mutate(p.id)}
                  aria-label="Remover produto"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </article>
          ))}
          {filtered.length === 0 && (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Nenhum produto encontrado.
            </p>
          )}
        </div>
      </section>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Editar produto" : "Novo produto"}</DialogTitle>
            <DialogDescription>
              As alterações aparecem imediatamente na vitrine digital.
            </DialogDescription>
          </DialogHeader>

          {editing && (
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="p-name">Nome</Label>
                <Input
                  id="p-name"
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="p-cat">Categoria</Label>
                  <Select
                    value={editing.category_id ?? "none"}
                    onValueChange={(v) =>
                      setEditing({ ...editing, category_id: v === "none" ? null : v })
                    }
                  >
                    <SelectTrigger id="p-cat">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sem categoria</SelectItem>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="p-unit">Unidade</Label>
                  <Select
                    value={editing.unit}
                    onValueChange={(v) => setEditing({ ...editing, unit: v })}
                  >
                    <SelectTrigger id="p-unit">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {UNITS.map((u) => (
                        <SelectItem key={u} value={u}>
                          {u}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="p-price">Preço (R$)</Label>
                  <Input
                    id="p-price"
                    value={editing.price}
                    onChange={(e) => setEditing({ ...editing, price: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="p-old">Preço antigo (opcional)</Label>
                  <Input
                    id="p-old"
                    value={editing.old_price}
                    onChange={(e) => setEditing({ ...editing, old_price: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="p-desc">Descrição</Label>
                <Textarea
                  id="p-desc"
                  rows={3}
                  value={editing.description}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Foto do produto</Label>
                <div className="flex items-center gap-3">
                  <StorageImage
                    path={editing.image_url}
                    alt="Pré-visualização do produto"
                    className="size-14 rounded-lg object-cover"
                  />
                  <Button variant="outline" size="sm" asChild>
                    <label>
                      <Upload className="size-4" />
                      Enviar foto
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) void uploadProductImage(file);
                        }}
                      />
                    </label>
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border p-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold">Visível na vitrine</p>
                  <p className="text-xs text-muted-foreground">
                    Desative para esconder sem excluir.
                  </p>
                </div>
                <Switch
                  checked={editing.is_active}
                  onCheckedChange={(v) => setEditing({ ...editing, is_active: v })}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancelar
            </Button>
            <Button onClick={saveProduct} disabled={productMutations.save.isPending || uploading}>
              Salvar produto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
