import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Clock,
  Copy,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  Star,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { StorageImage } from "@/components/storage-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { formatPrice } from "@/lib/format";
import { getStorePix } from "@/lib/store.functions";
import { usePublicCatalog, usePublicStore, type Product } from "@/lib/db";

export const Route = createFileRoute("/$slug/")({
  head: ({ params }) => ({
    meta: [
      { title: `Vitrine digital — ${params.slug} | EasyManager` },
      {
        name: "description",
        content:
          "Veja o catálogo atualizado, monte seu pedido e envie direto pelo WhatsApp da loja.",
      },
      { property: "og:title", content: `Vitrine digital — ${params.slug}` },
      {
        property: "og:description",
        content: "Catálogo, preços e pedido pelo WhatsApp em poucos toques.",
      },
    ],
  }),
  component: BioLinkPage,
});

type CartItem = { product: Product; qty: number };

function BioLinkPage() {
  const { slug } = Route.useParams();
  const { data: store, isLoading } = usePublicStore(slug);
  const { data: catalog } = usePublicCatalog(store?.id);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  const products = catalog?.products ?? [];
  const categories = catalog?.categories ?? [];

  const categoryName = (id: string | null) =>
    categories.find((c) => c.id === id)?.name ?? "Geral";

  const visibleProducts = useMemo(
    () =>
      products.filter((p) => {
        const matchesCategory =
          activeCategory === "Todos" || categoryName(p.category_id) === activeCategory;
        const matchesQuery =
          !query.trim() ||
          `${p.name} ${p.description}`.toLowerCase().includes(query.trim().toLowerCase());
        return matchesCategory && matchesQuery;
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [products, categories, activeCategory, query],
  );

  const itemCount = cart.reduce((sum, i) => sum + i.qty, 0);
  const total = cart.reduce((sum, i) => sum + i.qty * Number(i.product.price), 0);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const found = prev.find((i) => i.product.id === product.id);
      if (found) {
        return prev.map((i) => (i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...prev, { product, qty: 1 }];
    });
    toast.success(`${product.name} adicionado ao carrinho`);
  };

  const changeQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) => (i.product.id === productId ? { ...i, qty: i.qty + delta } : i))
        .filter((i) => i.qty > 0),
    );
  };

  const copyPix = async () => {
    try {
      const { pixKey } = await getStorePix({ data: { slug } });
      if (!pixKey) {
        toast.error("Esta loja ainda não cadastrou uma chave PIX");
        return;
      }
      await navigator.clipboard.writeText(pixKey);
      toast.success("Chave PIX copiada!");
    } catch {
      toast.error("Não foi possível copiar a chave PIX");
    }
  };

  const sendOrder = () => {
    if (!cart.length || !store) return;
    const lines = cart.map(
      (i) =>
        `• ${i.qty}x ${i.product.name} (${i.product.unit}) — ${formatPrice(
          i.qty * Number(i.product.price),
        )}`,
    );
    const message = [
      `Olá, ${store.name}! Gostaria de fazer este pedido:`,
      "",
      ...lines,
      "",
      `Total: ${formatPrice(total)}`,
      "",
      "Pedido enviado pela vitrine digital.",
    ].join("\n");
    window.open(
      `https://wa.me/${store.whatsapp}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener",
    );
  };

  if (isLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <p className="text-sm text-muted-foreground">Carregando vitrine...</p>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-6 text-center">
        <div>
          <h1 className="text-xl font-extrabold">Vitrine não encontrada</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            O endereço /{slug} não pertence a nenhuma loja ativa.
          </p>
          <Button asChild className="mt-6">
            <Link to="/">Voltar ao início</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-28" style={{ backgroundColor: store.bg_color }}>
      <div className="mx-auto max-w-2xl">
        <div className="relative h-44 w-full overflow-hidden sm:h-56 sm:rounded-b-3xl">
          <StorageImage
            path={store.banner_url}
            alt={`Fachada da loja ${store.name}`}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-foreground/25" />
        </div>

        <header className="relative z-10 -mt-12 px-5">
          <div className="surface-card p-5">
            <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4">
              <StorageImage
                path={store.logo_url}
                alt={`Logo ${store.name}`}
                className="size-16 shrink-0 rounded-2xl border border-border bg-card object-contain p-1"
              />
              <div className="min-w-0">
                <h1 className="truncate text-xl font-extrabold sm:text-2xl">{store.name}</h1>
                {store.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {store.description}
                  </p>
                )}
              </div>
            </div>

            {store.business_hours && (
              <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
                <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="size-4" />
                  {store.business_hours}
                </span>
              </div>
            )}

            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {store.whatsapp && (
                <Button asChild>
                  <a
                    href={`https://wa.me/${store.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ShoppingBag className="size-4" />
                    Falar no WhatsApp
                  </a>
                </Button>
              )}
              <Button variant="outline" onClick={copyPix}>
                <Copy className="size-4" />
                Copiar PIX
              </Button>
            </div>
          </div>

          <Link
            to="/$slug/avaliar"
            params={{ slug }}
            className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-primary-soft px-4 py-3 text-sm font-semibold text-primary transition-opacity hover:opacity-90"
          >
            <Star className="size-4" />
            Avalie sua experiência em 10 segundos
          </Link>
        </header>

        <div className="sticky top-0 z-20 mt-6 px-5 py-3 backdrop-blur" style={{ backgroundColor: `${store.bg_color}f2` }}>
          <div className="relative">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar produto..."
              className="bg-card pl-9"
              aria-label="Buscar produto"
            />
          </div>
          <div className="hide-scrollbar -mx-5 mt-3 flex gap-2 overflow-x-auto px-5">
            {["Todos", ...categories.map((c) => c.name)].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                  activeCategory === cat
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <section className="px-5 pt-2">
          <h2 className="sr-only">Produtos</h2>
          {visibleProducts.length === 0 ? (
            <p className="py-16 text-center text-sm text-muted-foreground">
              Nenhum produto encontrado para esta busca.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {visibleProducts.map((p) => (
                <article key={p.id} className="surface-card flex flex-col overflow-hidden">
                  <StorageImage
                    path={p.image_url}
                    alt={p.name}
                    className="aspect-square w-full object-cover"
                  />
                  <div className="flex flex-1 flex-col p-3">
                    <Badge variant="secondary" className="w-fit text-[10px]">
                      {categoryName(p.category_id)}
                    </Badge>
                    <h3 className="mt-2 text-sm leading-tight font-bold">{p.name}</h3>
                    {p.description && (
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                        {p.description}
                      </p>
                    )}
                    <div className="mt-3 flex flex-wrap items-baseline gap-2">
                      {p.old_price != null && Number(p.old_price) > Number(p.price) && (
                        <span className="text-xs text-muted-foreground line-through">
                          {formatPrice(Number(p.old_price))}
                        </span>
                      )}
                      <span className="text-base font-extrabold text-primary">
                        {formatPrice(Number(p.price))}
                      </span>
                      <span className="text-[10px] text-muted-foreground">/{p.unit}</span>
                    </div>
                    <Button size="sm" className="mt-3 w-full" onClick={() => addToCart(p)}>
                      <Plus className="size-4" />
                      Adicionar
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      <button
        onClick={() => setCartOpen(true)}
        className="fixed right-5 bottom-5 z-30 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-4 text-sm font-bold text-primary-foreground shadow-lg transition-transform hover:scale-105"
        aria-label="Abrir carrinho"
      >
        <ShoppingBag className="size-5" />
        {formatPrice(total)}
        <span className="grid size-6 place-items-center rounded-full bg-accent text-xs font-extrabold text-accent-foreground">
          {itemCount}
        </span>
      </button>

      <Sheet open={cartOpen} onOpenChange={setCartOpen}>
        <SheetContent side="bottom" className="mx-auto max-h-[85vh] max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Seu pedido</SheetTitle>
            <SheetDescription>
              Revise os itens e envie direto para o WhatsApp da loja.
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-3 px-4">
            {cart.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                Seu carrinho está vazio.
              </p>
            ) : (
              cart.map((item) => (
                <div
                  key={item.product.id}
                  className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-border p-3"
                >
                  <StorageImage
                    path={item.product.image_url}
                    alt={item.product.name}
                    className="size-14 shrink-0 rounded-lg object-cover"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{item.product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatPrice(Number(item.product.price))} · {item.product.unit}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button
                      size="icon"
                      variant="outline"
                      className="size-8"
                      onClick={() => changeQty(item.product.id, -1)}
                      aria-label="Remover uma unidade"
                    >
                      {item.qty === 1 ? (
                        <Trash2 className="size-3.5" />
                      ) : (
                        <Minus className="size-3.5" />
                      )}
                    </Button>
                    <span className="w-6 text-center text-sm font-bold">{item.qty}</span>
                    <Button
                      size="icon"
                      variant="outline"
                      className="size-8"
                      onClick={() => changeQty(item.product.id, 1)}
                      aria-label="Adicionar uma unidade"
                    >
                      <Plus className="size-3.5" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          <SheetFooter>
            <div className="flex items-center justify-between text-base font-bold">
              <span>Total</span>
              <span className="text-primary">{formatPrice(total)}</span>
            </div>
            <Button size="lg" disabled={!cart.length} onClick={sendOrder}>
              Enviar pedido via WhatsApp
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
