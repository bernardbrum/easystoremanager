import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Circle,
  Download,
  Loader2,
  Pencil,
  RectangleHorizontal,
  RectangleVertical,
  Save,
  Square,
  SquareRoundCorner,
  Star,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { StorageImage } from "@/components/storage-image";
import { Badge } from "@/components/ui/badge";
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
import { formatPrice } from "@/lib/format";
import { downloadNodeAsPng } from "@/lib/png";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/artes")({
  head: () => ({
    meta: [
      { title: "Gerador de Artes 1-Clique — EasyManager" },
      {
        name: "description",
        content:
          "Monte artes de divulgação com formatos, fontes e cores personalizadas e baixe em PNG de alta resolução.",
      },
      { property: "og:title", content: "Gerador de Artes 1-Clique — EasyManager" },
      {
        property: "og:description",
        content: "Artes profissionais para o seu comércio local em poucos cliques.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ArtesPage,
});

const FONTS = [
  { value: "Outfit", label: "Outfit (moderna)" },
  { value: "DM Sans", label: "DM Sans (limpa)" },
  { value: "Georgia", label: "Georgia (clássica)" },
  { value: "Impact", label: "Impacto" },
];

const TAGS = ["", "PROMOÇÃO", "NOVIDADE", "ÚLTIMAS UNIDADES", "SÓ HOJE", "FRETE GRÁTIS"];

const SHAPES = [
  { value: "square", label: "1:1", icon: Square, ratio: "1 / 1" },
  { value: "vertical", label: "4:5", icon: RectangleVertical, ratio: "4 / 5" },
  { value: "story", label: "9:16", icon: RectangleVertical, ratio: "9 / 16" },
  { value: "landscape", label: "16:9", icon: RectangleHorizontal, ratio: "16 / 9" },
] as const;

const ALIGNMENTS = [
  { value: "left", label: "Esquerda", icon: AlignLeft, className: "text-left items-start" },
  { value: "center", label: "Centro", icon: AlignCenter, className: "text-center items-center" },
  { value: "right", label: "Direita", icon: AlignRight, className: "text-right items-end" },
] as const;

type ArtForm = {
  id?: string;
  name: string;
  title: string;
  subtitle: string;
  price_text: string;
  old_price_text: string;
  tag: string;
  bg_color: string;
  text_color: string;
  title_font: string;
  price_font: string;
  text_align: string;
  format_shape: string;
  show_link: boolean;
  image_url: string | null;
  text_scale: number;
  image_scale: number;
  text_outline: boolean;
  image_border: boolean;
  image_border_color: string;
  image_border_width: number;
};

const emptyArt: ArtForm = {
  name: "Nova arte",
  title: "OFERTA DA SEMANA",
  subtitle: "Só nesta quinta, no balcão",
  price_text: "R$ 19,90",
  old_price_text: "",
  tag: "PROMOÇÃO",
  bg_color: "#1f6f4a",
  text_color: "#ffffff",
  title_font: "Outfit",
  price_font: "Outfit",
  text_align: "center",
  format_shape: "vertical",
  show_link: true,
  image_url: null,
  text_scale: 1,
  image_scale: 0.6,
  text_outline: false,
  image_border: false,
  image_border_color: "#ffffff",
  image_border_width: 4,
};


function OptionRow<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly { value: T; label: string; icon: typeof Square }[];
  onChange: (value: T) => void;
}) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const Icon = option.icon;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              aria-pressed={value === option.value}
              className={cn(
                "flex min-w-[76px] flex-1 flex-col items-center gap-1 rounded-xl border px-2 py-2.5 text-[11px] font-semibold transition-colors",
                value === option.value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:bg-muted",
              )}
            >
              <Icon className="size-4" />
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ArtesPage() {
  const { data: store } = useMyStore();
  const { data: products = [] } = useProducts(store?.id);
  const { data: arts = [] } = useArts(store?.id);
  const mutations = useArtMutations(store?.id);
  const [art, setArt] = useState<ArtForm>(emptyArt);
  const [downloading, setDownloading] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const hiddenRef = useRef<HTMLDivElement>(null);
  const [hidden, setHidden] = useState<ArtForm | null>(null);

  const favorites = useMemo(() => arts.filter((a) => a.is_favorite), [arts]);
  const set = <K extends keyof ArtForm>(key: K, value: ArtForm[K]) =>
    setArt((prev) => ({ ...prev, [key]: value }));

  const applyProduct = (id: string) => {
    const product = products.find((p) => p.id === id);
    if (!product) return;
    setArt((prev) => ({
      ...prev,
      title: product.name.toUpperCase(),
      subtitle: product.description || prev.subtitle,
      price_text: formatPrice(Number(product.price)),
      old_price_text: product.old_price ? formatPrice(Number(product.old_price)) : "",
      image_url: product.image_url,
    }));
  };

  const toForm = (a: (typeof arts)[number]): ArtForm => ({
    id: a.id,
    name: a.name,
    title: a.title,
    subtitle: a.subtitle,
    price_text: a.price_text,
    old_price_text: "",
    tag: a.tag,
    bg_color: a.bg_color,
    text_color: a.text_color,
    title_font: a.title_font,
    price_font: a.price_font,
    text_align: a.text_align,
    format_shape: a.format_shape,
    show_link: a.show_link,
    image_url: a.image_url,
    text_scale: Number(a.text_scale ?? 1),
    image_scale: Number(a.image_scale ?? 0.6),
    text_outline: a.text_outline ?? false,
    image_border: a.image_border ?? false,
    image_border_color: a.image_border_color ?? "#ffffff",
    image_border_width: Number(a.image_border_width ?? 4),
  });


  const download = async () => {
    if (!previewRef.current) return;
    setDownloading("current");
    try {
      await downloadNodeAsPng(previewRef.current, `arte-${art.name}`, 1080);
      toast.success("Arte baixada em PNG");
    } catch {
      toast.error("Não foi possível gerar a imagem");
    } finally {
      setDownloading(null);
    }
  };

  const downloadSaved = async (a: (typeof arts)[number]) => {
    setHidden(toForm(a));
    setDownloading(a.id);
    await new Promise((resolve) => setTimeout(resolve, 350));
    try {
      if (hiddenRef.current) await downloadNodeAsPng(hiddenRef.current, `arte-${a.name}`, 1080);
      toast.success("Arte baixada em PNG");
    } catch {
      toast.error("Não foi possível gerar a imagem");
    } finally {
      setDownloading(null);
      setHidden(null);
    }
  };

  const save = async (favorite?: boolean) => {
    if (!store) return;
    try {
      const id = await mutations.save.mutateAsync({
        ...(art.id ? { id: art.id } : {}),
        store_id: store.id,
        name: art.name,
        title: art.title,
        subtitle: art.subtitle,
        price_text: art.price_text,
        tag: art.tag,
        bg_color: art.bg_color,
        text_color: art.text_color,
        title_font: art.title_font,
        price_font: art.price_font,
        text_align: art.text_align,
        format_shape: art.format_shape,
        image_shape: art.image_shape,
        show_link: art.show_link,
        image_url: art.image_url,
        ...(favorite ? { is_favorite: true } : {}),
      });
      setArt((prev) => ({ ...prev, id }));
      toast.success(favorite ? "Arte salva nos favoritos" : "Arte salva no seu histórico");
    } catch {
      toast.error("Não foi possível salvar a arte");
    }
  };

  return (
    <div className="mx-auto max-w-6xl">
      <div>
        <h1 className="text-2xl font-extrabold">Gerador de Artes 1-Clique</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Escolha o formato, ajuste textos e cores e baixe pronto para publicar.
        </p>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="space-y-5">
          <div className="surface-card space-y-4 p-5">
            <h2 className="text-sm font-bold">Conteúdo</h2>
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
                <Input id="a-name" value={art.name} onChange={(e) => set("name", e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="a-tag">Tag</Label>
                <Select value={art.tag} onValueChange={(v) => set("tag", v === "none" ? "" : v)}>
                  <SelectTrigger id="a-tag">
                    <SelectValue placeholder="Nenhuma tag" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhuma tag</SelectItem>
                    {TAGS.filter(Boolean).map((tag) => (
                      <SelectItem key={tag} value={tag}>
                        {tag}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2 sm:col-span-2">
                <Label htmlFor="a-title">Título</Label>
                <Input id="a-title" value={art.title} onChange={(e) => set("title", e.target.value)} />
              </div>
              <div className="grid gap-2 sm:col-span-2">
                <Label htmlFor="a-sub">Subtítulo</Label>
                <Input id="a-sub" value={art.subtitle} onChange={(e) => set("subtitle", e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="a-price">Preço atual</Label>
                <Input
                  id="a-price"
                  value={art.price_text}
                  onChange={(e) => set("price_text", e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="a-old">Preço antigo (De/Por)</Label>
                <Input
                  id="a-old"
                  value={art.old_price_text}
                  onChange={(e) => set("old_price_text", e.target.value)}
                  placeholder="deixe vazio para preço único"
                />
              </div>
            </div>
          </div>

          <div className="surface-card space-y-4 p-5">
            <h2 className="text-sm font-bold">Formato</h2>
            <OptionRow
              label="Formato da arte"
              value={art.format_shape}
              options={SHAPES}
              onChange={(v) => set("format_shape", v)}
            />
            <OptionRow
              label="Formato da foto do produto"
              value={art.image_shape}
              options={IMAGE_SHAPES}
              onChange={(v) => set("image_shape", v)}
            />
            <OptionRow
              label="Alinhamento do texto"
              value={art.text_align}
              options={ALIGNMENTS}
              onChange={(v) => set("text_align", v)}
            />
          </div>

          <div className="surface-card space-y-4 p-5">
            <h2 className="text-sm font-bold">Tipografia e cores</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="a-tf">Fonte do título e subtítulo</Label>
                <Select value={art.title_font} onValueChange={(v) => set("title_font", v)}>
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
                <Select value={art.price_font} onValueChange={(v) => set("price_font", v)}>
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
              <div className="grid gap-2">
                <Label htmlFor="a-text-color">Cor da letra</Label>
                <div className="flex items-center gap-2">
                  <input
                    id="a-text-color"
                    type="color"
                    value={art.text_color}
                    onChange={(e) => set("text_color", e.target.value)}
                    className="size-10 shrink-0 cursor-pointer rounded-lg border border-border"
                  />
                  <Input value={art.text_color} onChange={(e) => set("text_color", e.target.value)} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="a-bg">Cor de fundo</Label>
                <div className="flex items-center gap-2">
                  <input
                    id="a-bg"
                    type="color"
                    value={art.bg_color}
                    onChange={(e) => set("bg_color", e.target.value)}
                    className="size-10 shrink-0 cursor-pointer rounded-lg border border-border"
                  />
                  <Input value={art.bg_color} onChange={(e) => set("bg_color", e.target.value)} />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border p-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold">Mostrar link da vitrine</p>
                <p className="text-xs text-muted-foreground">
                  Exibe /{store?.slug ?? "sua-loja"} no rodapé da arte.
                </p>
              </div>
              <Switch checked={art.show_link} onCheckedChange={(v) => set("show_link", v)} />
            </div>
          </div>

          {favorites.length > 0 && (
            <div className="surface-card space-y-3 p-5">
              <h2 className="text-sm font-bold">Carregar favorito</h2>
              <div className="flex flex-wrap gap-2">
                {favorites.map((a) => (
                  <Button key={a.id} size="sm" variant="outline" onClick={() => setArt(toForm(a))}>
                    <Star className="size-3.5 fill-warning text-warning" />
                    {a.name}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </section>

        <section className="lg:sticky lg:top-20 lg:h-fit">
          <div className="mx-auto w-full max-w-[320px] space-y-4">
            <ArtCanvas ref={previewRef} art={art} storeName={store?.name} storeSlug={store?.slug} />
            <div className="flex flex-wrap gap-2">
              <Button className="flex-1" onClick={download} disabled={downloading === "current"}>
                {downloading === "current" ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Download className="size-4" />
                )}
                Baixar PNG
              </Button>
              <Button variant="outline" onClick={() => save()} disabled={mutations.save.isPending}>
                <Save className="size-4" />
                Salvar
              </Button>
              <Button
                variant="outline"
                size="icon"
                aria-label="Salvar como favorito"
                onClick={() => save(true)}
                disabled={mutations.save.isPending}
              >
                <Star className="size-4" />
              </Button>
            </div>
          </div>
        </section>
      </div>

      <section className="surface-card mt-8 p-5">
        <h2 className="text-base font-bold">Minhas artes ({arts.length})</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {arts.map((a) => (
            <article
              key={a.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-3"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-bold">{a.name}</p>
                  {a.is_favorite && <Badge variant="secondary" className="text-[10px]">favorita</Badge>}
                </div>
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
                  <Star className={cn("size-4", a.is_favorite && "fill-warning text-warning")} />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  aria-label="Baixar PNG"
                  disabled={downloading === a.id}
                  onClick={() => void downloadSaved(a)}
                >
                  {downloading === a.id ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Download className="size-4" />
                  )}
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  aria-label="Editar arte"
                  onClick={() => setArt(toForm(a))}
                >
                  <Pencil className="size-4" />
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
            <p className="py-6 text-sm text-muted-foreground">Nenhuma arte salva ainda.</p>
          )}
        </div>
      </section>

      {hidden && (
        <div className="pointer-events-none fixed -left-[9999px] top-0" aria-hidden>
          <div className="w-[320px]">
            <ArtCanvas ref={hiddenRef} art={hidden} storeName={store?.name} storeSlug={store?.slug} />
          </div>
        </div>
      )}
    </div>
  );
}

function ArtCanvas({
  ref,
  art,
  storeName,
  storeSlug,
}: {
  ref: React.Ref<HTMLDivElement>;
  art: ArtForm;
  storeName?: string | undefined;
  storeSlug?: string | undefined;
}) {
  const shape = SHAPES.find((s) => s.value === art.format_shape) ?? SHAPES[1];
  const imageShape = IMAGE_SHAPES.find((s) => s.value === art.image_shape) ?? IMAGE_SHAPES[1];
  const align = ALIGNMENTS.find((a) => a.value === art.text_align) ?? ALIGNMENTS[1];

  return (
    <div
      ref={ref}
      className="relative w-full overflow-hidden rounded-2xl shadow-lg"
      style={{ backgroundColor: art.bg_color, aspectRatio: shape.ratio, color: art.text_color }}
    >
      <div className={cn("flex h-full flex-col justify-center gap-3 p-6", align.className)}>
        {art.tag && (
          <span
            className="inline-flex rounded-full px-3 py-1 text-[10px] font-bold tracking-widest uppercase"
            style={{ backgroundColor: `${art.text_color}26` }}
          >
            {art.tag}
          </span>
        )}
        <h2
          className="text-2xl leading-tight font-extrabold"
          style={{ fontFamily: art.title_font }}
        >
          {art.title}
        </h2>
        {art.subtitle && (
          <p className="text-xs opacity-85" style={{ fontFamily: art.title_font }}>
            {art.subtitle}
          </p>
        )}

        {art.image_url && (
          <div className={cn("w-full max-w-[60%] overflow-hidden", imageShape.className)}>
            <StorageImage
              path={art.image_url}
              alt={art.title}
              className="aspect-square w-full object-cover"
            />
          </div>
        )}

        <div style={{ fontFamily: art.price_font }}>
          {art.old_price_text && (
            <p className="text-xs opacity-75 line-through">De: {art.old_price_text}</p>
          )}
          <p className="text-3xl font-extrabold">
            {art.old_price_text ? `Por: ${art.price_text}` : art.price_text}
          </p>
        </div>
      </div>

      <div className={cn("absolute inset-x-6 bottom-4 text-[10px] opacity-80", align.className)}>
        <p className="font-bold">{storeName}</p>
        {art.show_link && storeSlug && <p>vitrine: /{storeSlug}</p>}
      </div>
    </div>
  );
}
