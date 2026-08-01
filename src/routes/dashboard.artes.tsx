import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Download, Loader2, Save, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { StorageImage } from "@/components/storage-image";
import { Button } from "@/components/ui/button";
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
import { useArtMutations, useArts, useMyStore, useProducts } from "@/lib/db";
import { downloadNodeAsPng } from "@/lib/png";

export const Route = createFileRoute("/dashboard/artes")({
  head: () => ({
    meta: [
      { title: "Gerador de Artes 1-Clique — EasyManager" },
      {
        name: "description",
        content:
          "Monte artes de divulgação personalizadas, salve seus modelos e baixe em PNG 1080x1920.",
      },
    ],
  }),
  component: ArtesPage,
});

const FONTS = [
  { value: "Outfit", label: "Outfit (moderna)" },
  { value: "DM Sans", label: "DM Sans (limpa)" },
  { value: "Georgia", label: "Georgia (clássica)" },
  { value: "Impact", label: "Impact (impacto)" },
];

type ArtForm = {
  id?: string;
  name: string;
  title: string;
  subtitle: string;
  price_text: string;
  tag: string;
  bg_color: string;
  title_font: string;
  price_font: string;
  show_link: boolean;
  image_url: string | null;
};

const emptyArt: ArtForm = {
  name: "Nova arte",
  title: "OFERTA DA SEMANA",
  subtitle: "Só nesta quinta, no balcão",
  price_text: "R$ 19,90",
  tag: "PROMOÇÃO",
  bg_color: "#1f6f4a",
  title_font: "Outfit",
  price_font: "Outfit",
  show_link: true,
  image_url: null,
};

function ArtesPage() {
  const { data: store } = useMyStore();
  const { data: products = [] } = useProducts(store?.id);
  const { data: arts = [] } = useArts(store?.id);
  const mutations = useArtMutations(store?.id);
  const [art, setArt] = useState<ArtForm>(emptyArt);
  const [downloading, setDownloading] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const applyProduct = (id: string) => {
    const product = products.find((p) => p.id === id);
    if (!product) return;
    setArt((prev) => ({
      ...prev,
      title: product.name.toUpperCase(),
      subtitle: product.description || prev.subtitle,
      price_text: Number(product.price).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      }),
      image_url: product.image_url,
    }));
  };

  const download = async () => {
    if (!previewRef.current) return;
    setDownloading(true);
    try {
      await downloadNodeAsPng(previewRef.current, `arte-${art.name}`, 1080);
      toast.success("Arte baixada em PNG (1080x1920)");
    } catch {
      toast.error("Não foi possível gerar a imagem");
    } finally {
      setDownloading(false);
    }
  };

  const save = async () => {
    if (!store) return;
    try {
      await mutations.save.mutateAsync({
        ...(art.id ? { id: art.id } : {}),
        store_id: store.id,
        name: art.name,
        title: art.title,
        subtitle: art.subtitle,
        price_text: art.price_text,
        tag: art.tag,
        bg_color: art.bg_color,
        title_font: art.title_font,
        price_font: art.price_font,
        show_link: art.show_link,
        image_url: art.image_url,
      });
      toast.success("Arte salva no seu histórico");
    } catch {
      toast.error("Não foi possível salvar a arte");
    }
  };

  return (
    <div className="mx-auto max-w-6xl">
      <div>
        <h1 className="text-2xl font-extrabold">Gerador de Artes 1-Clique</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Personalize cores, textos e fontes, salve o modelo e baixe pronto para o Instagram.
        </p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto]">
        <section className="surface-card h-fit space-y-5 p-5">
          <div className="grid gap-2">
            <Label htmlFor="prod">Puxar dados de um produto</Label>
            <Select onValueChange={applyProduct}>
              <SelectTrigger id="prod">
                <SelectValue placeholder="Selecione o produto" />
              </SelectTrigger>
              <SelectContent>
                {products.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="a-name">Nome do modelo</Label>
              <Input
                id="a-name"
                value={art.name}
                onChange={(e) => setArt({ ...art, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="a-tag">Etiqueta</Label>
              <Input
                id="a-tag"
                value={art.tag}
                onChange={(e) => setArt({ ...art, tag: e.target.value })}
              />
            </div>
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="a-title">Título</Label>
              <Input
                id="a-title"
                value={art.title}
                onChange={(e) => setArt({ ...art, title: e.target.value })}
              />
            </div>
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="a-sub">Chamada</Label>
              <Input
                id="a-sub"
                value={art.subtitle}
                onChange={(e) => setArt({ ...art, subtitle: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="a-price">Preço em destaque</Label>
              <Input
                id="a-price"
                value={art.price_text}
                onChange={(e) => setArt({ ...art, price_text: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="a-bg">Cor de fundo</Label>
              <div className="flex items-center gap-2">
                <input
                  id="a-bg"
                  type="color"
                  value={art.bg_color}
                  onChange={(e) => setArt({ ...art, bg_color: e.target.value })}
                  className="size-10 shrink-0 cursor-pointer rounded-lg border border-border"
                />
                <Input
                  value={art.bg_color}
                  onChange={(e) => setArt({ ...art, bg_color: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="a-tf">Fonte do título</Label>
              <Select
                value={art.title_font}
                onValueChange={(v) => setArt({ ...art, title_font: v })}
              >
                <SelectTrigger id="a-tf">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FONTS.map((f) => (
                    <SelectItem key={f.value} value={f.value}>
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="a-pf">Fonte do preço</Label>
              <Select
                value={art.price_font}
                onValueChange={(v) => setArt({ ...art, price_font: v })}
              >
                <SelectTrigger id="a-pf">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FONTS.map((f) => (
                    <SelectItem key={f.value} value={f.value}>
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-border p-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold">Mostrar link da vitrine</p>
              <p className="text-xs text-muted-foreground">Exibe /{store?.slug} no rodapé da arte.</p>
            </div>
            <Switch
              checked={art.show_link}
              onCheckedChange={(v) => setArt({ ...art, show_link: v })}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={download} disabled={downloading}>
              {downloading ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
              Baixar PNG
            </Button>
            <Button variant="outline" onClick={save} disabled={mutations.save.isPending}>
              <Save className="size-4" />
              Salvar modelo
            </Button>
          </div>
        </section>

        <section className="mx-auto w-full max-w-[320px]">
          <div
            ref={previewRef}
            className="relative aspect-[9/16] w-full overflow-hidden rounded-2xl p-6 text-white"
            style={{ backgroundColor: art.bg_color }}
          >
            <span className="inline-flex rounded-full bg-white/20 px-3 py-1 text-[10px] font-bold tracking-widest uppercase">
              {art.tag}
            </span>
            <h2
              className="mt-4 text-3xl leading-tight font-extrabold"
              style={{ fontFamily: art.title_font }}
            >
              {art.title}
            </h2>
            <p className="mt-2 text-sm text-white/85">{art.subtitle}</p>

            {art.image_url && (
              <div className="mt-5 overflow-hidden rounded-xl">
                <StorageImage
                  path={art.image_url}
                  alt={art.title}
                  className="aspect-square w-full object-cover"
                />
              </div>
            )}

            <p
              className="mt-6 text-4xl font-extrabold"
              style={{ fontFamily: art.price_font }}
            >
              {art.price_text}
            </p>

            <div className="absolute inset-x-6 bottom-6 text-xs text-white/80">
              <p className="font-bold text-white">{store?.name}</p>
              {art.show_link && store?.slug && <p>vitrine: /{store.slug}</p>}
            </div>
          </div>
        </section>
      </div>

      <section className="surface-card mt-6 p-5">
        <h2 className="text-base font-bold">Meus modelos ({arts.length})</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {arts.map((a) => (
            <article
              key={a.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-border p-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">{a.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {a.title} · {a.price_text}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  aria-label="Favoritar arte"
                  onClick={() =>
                    mutations.toggleFavorite.mutate({ id: a.id, is_favorite: !a.is_favorite })
                  }
                >
                  <Star className={`size-4 ${a.is_favorite ? "fill-warning text-warning" : ""}`} />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  aria-label="Carregar arte"
                  onClick={() =>
                    setArt({
                      id: a.id,
                      name: a.name,
                      title: a.title,
                      subtitle: a.subtitle,
                      price_text: a.price_text,
                      tag: a.tag,
                      bg_color: a.bg_color,
                      title_font: a.title_font,
                      price_font: a.price_font,
                      show_link: a.show_link,
                      image_url: a.image_url,
                    })
                  }
                >
                  <Download className="size-4 rotate-180" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  aria-label="Excluir arte"
                  onClick={() => mutations.remove.mutate(a.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </article>
          ))}
          {arts.length === 0 && (
            <p className="py-6 text-sm text-muted-foreground">Nenhum modelo salvo ainda.</p>
          )}
        </div>
      </section>
    </div>
  );
}
