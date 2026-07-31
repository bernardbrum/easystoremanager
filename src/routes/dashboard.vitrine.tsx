import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Eye, EyeOff, ImagePlus, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

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
import {
  categories,
  formatPrice,
  products as mockProducts,
  store as mockStore,
  type Product,
} from "@/data/mockData";

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

const emptyProduct: Product = {
  id: "",
  name: "",
  description: "",
  price: 0,
  category: categories[0],
  image: mockProducts[0].image,
  visible: true,
};

function VitrinePage() {
  const [storeForm, setStoreForm] = useState({
    name: mockStore.name,
    whatsapp: mockStore.whatsapp,
    mapsLink: mockStore.mapsLink,
    slug: mockStore.slug,
  });
  const [items, setItems] = useState<Product[]>(mockProducts);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Todos");
  const [editing, setEditing] = useState<Product | null>(null);

  const filtered = useMemo(
    () =>
      items.filter((p) => {
        const matchesCategory = categoryFilter === "Todos" || p.category === categoryFilter;
        const matchesQuery =
          !query.trim() || p.name.toLowerCase().includes(query.trim().toLowerCase());
        return matchesCategory && matchesQuery;
      }),
    [items, query, categoryFilter],
  );

  const saveStore = () => toast.success("Dados da loja atualizados");

  const toggleVisible = (id: string) => {
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, visible: !p.visible } : p)));
  };

  const removeProduct = (id: string) => {
    setItems((prev) => prev.filter((p) => p.id !== id));
    toast.success("Produto removido da vitrine");
  };

  const saveProduct = () => {
    if (!editing) return;
    if (!editing.name.trim()) {
      toast.error("Informe o nome do produto");
      return;
    }
    setItems((prev) =>
      editing.id
        ? prev.map((p) => (p.id === editing.id ? editing : p))
        : [...prev, { ...editing, id: `p${Date.now()}` }],
    );
    toast.success(editing.id ? "Produto atualizado" : "Produto cadastrado");
    setEditing(null);
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
        <h2 className="text-base font-bold">Dados da loja</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="name">Nome da loja</Label>
            <Input
              id="name"
              value={storeForm.name}
              onChange={(e) => setStoreForm({ ...storeForm, name: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="whatsapp">WhatsApp (com DDI e DDD)</Label>
            <Input
              id="whatsapp"
              value={storeForm.whatsapp}
              onChange={(e) => setStoreForm({ ...storeForm, whatsapp: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="maps">Link do Google Maps</Label>
            <Input
              id="maps"
              value={storeForm.mapsLink}
              onChange={(e) => setStoreForm({ ...storeForm, mapsLink: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="slug">Slug da vitrine</Label>
            <div className="flex items-center gap-2">
              <span className="shrink-0 text-xs text-muted-foreground">easymanager.app/</span>
              <Input
                id="slug"
                value={storeForm.slug}
                onChange={(e) => setStoreForm({ ...storeForm, slug: e.target.value })}
              />
            </div>
          </div>
        </div>
        <Button className="mt-5" onClick={saveStore}>
          Salvar alterações
        </Button>
      </section>

      <section className="surface-card p-5">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:justify-between">
          <h2 className="truncate text-base font-bold">Produtos ({items.length})</h2>
          <Button onClick={() => setEditing({ ...emptyProduct })}>
            <Plus className="size-4" />
            Novo Produto
          </Button>
        </div>

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
                <SelectItem key={c} value={c}>
                  {c}
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
              <img
                src={p.image}
                alt={p.name}
                width={768}
                height={768}
                loading="lazy"
                className="size-16 shrink-0 rounded-lg object-cover"
              />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-sm font-bold">{p.name}</p>
                  <Badge variant="secondary" className="text-[10px]">
                    {p.category}
                  </Badge>
                  {!p.visible && (
                    <Badge variant="outline" className="text-[10px]">
                      oculto
                    </Badge>
                  )}
                </div>
                <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{p.description}</p>
                <p className="mt-1 text-sm font-extrabold text-primary">{formatPrice(p.price)}</p>
              </div>
              <div className="col-span-2 flex items-center gap-2 sm:col-span-1">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => toggleVisible(p.id)}
                  aria-label="Alternar visibilidade"
                >
                  {p.visible ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => setEditing(p)}
                  aria-label="Editar produto"
                >
                  <Pencil className="size-4" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => removeProduct(p.id)}
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
                    value={editing.category}
                    onValueChange={(v) => setEditing({ ...editing, category: v })}
                  >
                    <SelectTrigger id="p-cat">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="p-price">Preço (R$)</Label>
                  <Input
                    id="p-price"
                    type="number"
                    step="0.01"
                    value={editing.price}
                    onChange={(e) =>
                      setEditing({ ...editing, price: Number(e.target.value) || 0 })
                    }
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
                <button
                  type="button"
                  onClick={() => toast.success("Upload simulado: imagem selecionada")}
                  className="flex items-center gap-3 rounded-xl border border-dashed border-border p-3 text-left transition-colors hover:bg-muted"
                >
                  <img
                    src={editing.image}
                    alt="Pré-visualização do produto"
                    width={768}
                    height={768}
                    loading="lazy"
                    className="size-14 rounded-lg object-cover"
                  />
                  <span className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ImagePlus className="size-4" />
                    Enviar nova foto (simulado)
                  </span>
                </button>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border p-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold">Visível na vitrine</p>
                  <p className="text-xs text-muted-foreground">
                    Desative para esconder sem excluir.
                  </p>
                </div>
                <Switch
                  checked={editing.visible}
                  onCheckedChange={(v) => setEditing({ ...editing, visible: v })}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancelar
            </Button>
            <Button onClick={saveProduct}>Salvar produto</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
