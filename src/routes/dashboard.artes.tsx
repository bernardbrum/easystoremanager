import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Download,
  ImageOff,
  Loader2,
  Move,
  Pencil,
  RectangleHorizontal,
  RectangleVertical,
  RotateCcw,
  Save,
  Square,
  Star,
  Trash2,
  Type,
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
import { Slider } from "@/components/ui/slider";
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
  { value: "left", label: "Esquerda", icon: AlignLeft },
  { value: "center", label: "Centro", icon: AlignCenter },
  { value: "right", label: "Direita", icon: AlignRight },
] as const;

const BORDER_STYLES = [
  { value: "solid", label: "Sólida" },
  { value: "dashed", label: "Tracejada" },
  { value: "dotted", label: "Pontilhada" },
  { value: "double", label: "Dupla" },
] as const;

type ElementKey = "tag" | "title" | "subtitle" | "price";

const ELEMENTS: { value: ElementKey; label: string }[] = [
  { value: "tag", label: "Tag" },
  { value: "title", label: "Título" },
  { value: "subtitle", label: "Subtítulo" },
  { value: "price", label: "Preço" },
];

const BASE_SIZE: Record<ElementKey, number> = { tag: 10, title: 26, subtitle: 12, price: 32 };

type Pos = { x: number; y: number };
type ElementLayout = { scale: number; color: string | null } & Pos;

type Layout = {
  elements: Record<ElementKey, ElementLayout>;
  image: Pos;
  show_image: boolean;
  frame: { enabled: boolean; color: string; width: number; style: string };
};

const defaultLayout: Layout = {
  elements: {
    tag: { scale: 1, color: null, x: 50, y: 10 },
    title: { scale: 1, color: null, x: 50, y: 23 },
    subtitle: { scale: 1, color: null, x: 50, y: 34 },
    price: { scale: 1, color: null, x: 50, y: 84 },
  },
  image: { x: 50, y: 58 },
  show_image: true,
  frame: { enabled: false, color: "#ffffff", width: 6, style: "solid" },
};

function normalizeLayout(raw: unknown): Layout {
  const source = (raw ?? {}) as Partial<Layout>;
  const elements = { ...defaultLayout.elements };
  for (const key of Object.keys(elements) as ElementKey[]) {
    const el = source.elements?.[key];
    elements[key] = {
      scale: Number(el?.scale ?? defaultLayout.elements[key].scale),
      color: el?.color ?? null,
      x: Number(el?.x ?? defaultLayout.elements[key].x),
      y: Number(el?.y ?? defaultLayout.elements[key].y),
    };
  }
  return {
    elements,
    image: {
      x: Number(source.image?.x ?? defaultLayout.image.x),
      y: Number(source.image?.y ?? defaultLayout.image.y),
    },
    show_image: source.show_image ?? true,
    frame: {
      enabled: source.frame?.enabled ?? false,
      color: source.frame?.color ?? "#ffffff",
      width: Number(source.frame?.width ?? 6),
      style: source.frame?.style ?? "solid",
    },
  };
}

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
  layout: Layout;
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
  layout: defaultLayout,
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
  const [selected, setSelected] = useState<ElementKey>("title");
  const [downloading, setDownloading] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const hiddenRef = useRef<HTMLDivElement>(null);
  const [hidden, setHidden] = useState<ArtForm | null>(null);

  const favorites = useMemo(() => arts.filter((a) => a.is_favorite), [arts]);
  const set = <K extends keyof ArtForm>(key: K, value: ArtForm[K]) =>
    setArt((prev) => ({ ...prev, [key]: value }));

  const setLayout = (patch: (layout: Layout) => Layout) =>
    setArt((prev) => ({ ...prev, layout: patch(prev.layout) }));

  const setElement = (key: ElementKey, patch: Partial<ElementLayout>) =>
    setLayout((layout) => ({
      ...layout,
      elements: { ...layout.elements, [key]: { ...layout.elements[key], ...patch } },
    }));

  const setFrame = (patch: Partial<Layout["frame"]>) =>
    setLayout((layout) => ({ ...layout, frame: { ...layout.frame, ...patch } }));

  const movePart = (part: ElementKey | "image", pos: Pos) =>
    setLayout((layout) =>
      part === "image"
        ? { ...layout, image: pos }
        : {
            ...layout,
            elements: { ...layout.elements, [part]: { ...layout.elements[part], ...pos } },
          },
    );

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
    layout: normalizeLayout(a.layout),
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
        text_scale: art.text_scale,
        image_scale: art.image_scale,
        text_outline: art.text_outline,
        image_border: art.image_border,
        image_border_color: art.image_border_color,
        image_border_width: art.image_border_width,
        layout: art.layout as unknown as Record<string, unknown>,
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

  const selectedEl = art.layout.elements[selected];
  const selectedLabel = ELEMENTS.find((e) => e.value === selected)?.label ?? "";

  return (
    <div className="mx-auto max-w-6xl">
      <div>
        <h1 className="text-2xl font-extrabold">Gerador de Artes 1-Clique</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Escolha o formato, arraste os textos no preview e baixe pronto para publicar.
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
              label="Alinhamento do texto"
              value={art.text_align}
              options={ALIGNMENTS}
              onChange={(v) => set("text_align", v)}
            />
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="a-text-scale">Tamanho geral das letras</Label>
                <span className="text-xs font-semibold text-muted-foreground">
                  {Math.round(art.text_scale * 100)}%
                </span>
              </div>
              <Slider
                id="a-text-scale"
                min={0.6}
                max={2.5}
                step={0.05}
                value={[art.text_scale]}
                onValueChange={([v]: number[]) => set("text_scale", v ?? 1)}
              />
            </div>
          </div>

          <div className="surface-card space-y-4 p-5">
            <div className="flex items-center gap-2">
              <Type className="size-4 text-primary" />
              <h2 className="text-sm font-bold">Editar um texto específico</h2>
            </div>
            <p className="text-xs text-muted-foreground">
              Escolha aqui (ou clique direto no preview) e arraste o texto na arte para mudar o
              lugar.
            </p>
            <div className="flex flex-wrap gap-2">
              {ELEMENTS.map((el) => (
                <button
                  key={el.value}
                  type="button"
                  onClick={() => setSelected(el.value)}
                  aria-pressed={selected === el.value}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                    selected === el.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:bg-muted",
                  )}
                >
                  {el.label}
                </button>
              ))}
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="a-el-scale">Tamanho das letras — {selectedLabel}</Label>
                <span className="text-xs font-semibold text-muted-foreground">
                  {Math.round(selectedEl.scale * 100)}%
                </span>
              </div>
              <Slider
                id="a-el-scale"
                min={0.5}
                max={3}
                step={0.05}
                value={[selectedEl.scale]}
                onValueChange={([v]: number[]) => setElement(selected, { scale: v ?? 1 })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="a-el-color">Cor do {selectedLabel.toLowerCase()}</Label>
              <div className="flex items-center gap-2">
                <input
                  id="a-el-color"
                  type="color"
                  value={selectedEl.color ?? art.text_color}
                  onChange={(e) => setElement(selected, { color: e.target.value })}
                  className="size-10 shrink-0 cursor-pointer rounded-lg border border-border"
                />
                <Input
                  value={selectedEl.color ?? ""}
                  placeholder="usa a cor geral"
                  onChange={(e) => setElement(selected, { color: e.target.value || null })}
                />
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Voltar à cor geral"
                  onClick={() => setElement(selected, { color: null })}
                >
                  <RotateCcw className="size-4" />
                </Button>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setElement(selected, {
                  x: defaultLayout.elements[selected].x,
                  y: defaultLayout.elements[selected].y,
                })
              }
            >
              <Move className="size-4" />
              Voltar posição do {selectedLabel.toLowerCase()}
            </Button>
          </div>

          <div className="surface-card space-y-4 p-5">
            <h2 className="text-sm font-bold">Foto do produto</h2>
            <div className="flex items-center justify-between rounded-xl border border-border p-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold">Mostrar a foto na arte</p>
                <p className="text-xs text-muted-foreground">
                  Desligue para uma arte só com texto.
                </p>
              </div>
              <Switch
                checked={art.layout.show_image}
                onCheckedChange={(v) => setLayout((l) => ({ ...l, show_image: v }))}
              />
            </div>
            {art.layout.show_image && (
              <>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="a-img-scale">Tamanho da foto</Label>
                    <span className="text-xs font-semibold text-muted-foreground">
                      {Math.round(art.image_scale * 100)}%
                    </span>
                  </div>
                  <Slider
                    id="a-img-scale"
                    min={0.2}
                    max={1}
                    step={0.02}
                    value={[art.image_scale]}
                    onValueChange={([v]: number[]) => set("image_scale", v ?? 0.6)}
                  />
                </div>
                <div className="flex items-center justify-between rounded-xl border border-border p-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">Borda na foto</p>
                    <p className="text-xs text-muted-foreground">Moldura em volta da imagem.</p>
                  </div>
                  <Switch checked={art.image_border} onCheckedChange={(v) => set("image_border", v)} />
                </div>
                {art.image_border && (
                  <div className="grid gap-4 rounded-xl border border-border p-3 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="a-bd-color">Cor da borda da foto</Label>
                      <div className="flex items-center gap-2">
                        <input
                          id="a-bd-color"
                          type="color"
                          value={art.image_border_color}
                          onChange={(e) => set("image_border_color", e.target.value)}
                          className="size-10 shrink-0 cursor-pointer rounded-lg border border-border"
                        />
                        <Input
                          value={art.image_border_color}
                          onChange={(e) => set("image_border_color", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="a-bd-width">Espessura</Label>
                        <span className="text-xs font-semibold text-muted-foreground">
                          {art.image_border_width}px
                        </span>
                      </div>
                      <Slider
                        id="a-bd-width"
                        min={1}
                        max={20}
                        step={1}
                        value={[art.image_border_width]}
                        onValueChange={([v]: number[]) => set("image_border_width", v ?? 4)}
                      />
                    </div>
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLayout((l) => ({ ...l, image: defaultLayout.image }))}
                >
                  <Move className="size-4" />
                  Voltar posição da foto
                </Button>
              </>
            )}
            {!art.layout.show_image && (
              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                <ImageOff className="size-4" />
                A arte está sem foto do produto.
              </p>
            )}
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
                <Label htmlFor="a-text-color">Cor geral da letra</Label>
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
                <p className="text-sm font-semibold">Contorno nas letras</p>
                <p className="text-xs text-muted-foreground">
                  Cria um traço escuro em volta do texto para dar destaque.
                </p>
              </div>
              <Switch checked={art.text_outline} onCheckedChange={(v) => set("text_outline", v)} />
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

          <div className="surface-card space-y-4 p-5">
            <h2 className="text-sm font-bold">Borda da arte</h2>
            <div className="flex items-center justify-between rounded-xl border border-border p-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold">Ativar moldura</p>
                <p className="text-xs text-muted-foreground">
                  Uma borda em volta de todo o formato da arte.
                </p>
              </div>
              <Switch
                checked={art.layout.frame.enabled}
                onCheckedChange={(v) => setFrame({ enabled: v })}
              />
            </div>
            {art.layout.frame.enabled && (
              <div className="grid gap-4 rounded-xl border border-border p-3 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="a-fr-color">Cor da moldura</Label>
                  <div className="flex items-center gap-2">
                    <input
                      id="a-fr-color"
                      type="color"
                      value={art.layout.frame.color}
                      onChange={(e) => setFrame({ color: e.target.value })}
                      className="size-10 shrink-0 cursor-pointer rounded-lg border border-border"
                    />
                    <Input
                      value={art.layout.frame.color}
                      onChange={(e) => setFrame({ color: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="a-fr-style">Tipo de borda</Label>
                  <Select
                    value={art.layout.frame.style}
                    onValueChange={(v) => setFrame({ style: v })}
                  >
                    <SelectTrigger id="a-fr-style">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BORDER_STYLES.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2 sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="a-fr-width">Espessura da moldura</Label>
                    <span className="text-xs font-semibold text-muted-foreground">
                      {art.layout.frame.width}px
                    </span>
                  </div>
                  <Slider
                    id="a-fr-width"
                    min={1}
                    max={30}
                    step={1}
                    value={[art.layout.frame.width]}
                    onValueChange={([v]: number[]) => setFrame({ width: v ?? 6 })}
                  />
                </div>
              </div>
            )}
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
            <ArtCanvas
              ref={previewRef}
              art={art}
              storeName={store?.name}
              storeSlug={store?.slug}
              editable
              selected={selected}
              onSelect={setSelected}
              onMove={movePart}
            />
            <p className="text-center text-[11px] text-muted-foreground">
              Clique num texto para selecionar e arraste para posicionar.
            </p>
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
  editable = false,
  selected,
  onSelect,
  onMove,
}: {
  ref: React.Ref<HTMLDivElement>;
  art: ArtForm;
  storeName?: string | undefined;
  storeSlug?: string | undefined;
  editable?: boolean;
  selected?: ElementKey;
  onSelect?: (key: ElementKey) => void;
  onMove?: (part: ElementKey | "image", pos: Pos) => void;
}) {
  const shape = SHAPES.find((s) => s.value === art.format_shape) ?? SHAPES[1];
  const layout = art.layout;
  const textAlign = art.text_align as "left" | "center" | "right";
  const containerRef = useRef<HTMLDivElement>(null);

  const startDrag = (part: ElementKey | "image") => (event: React.PointerEvent) => {
    if (!editable || !onMove) return;
    if (part !== "image" && onSelect) onSelect(part as ElementKey);
    const box = containerRef.current?.getBoundingClientRect();
    if (!box) return;
    event.preventDefault();
    const target = event.currentTarget as HTMLElement;
    target.setPointerCapture(event.pointerId);
    const move = (e: PointerEvent) => {
      const x = Math.min(98, Math.max(2, ((e.clientX - box.left) / box.width) * 100));
      const y = Math.min(98, Math.max(2, ((e.clientY - box.top) / box.height) * 100));
      onMove(part, { x, y });
    };
    const up = () => {
      target.removeEventListener("pointermove", move);
      target.removeEventListener("pointerup", up);
    };
    target.addEventListener("pointermove", move);
    target.addEventListener("pointerup", up);
  };

  const outline = art.text_outline
    ? { WebkitTextStroke: "0.5px rgba(0,0,0,0.85)", paintOrder: "stroke fill" as const }
    : {};

  const partStyle = (key: ElementKey): React.CSSProperties => ({
    position: "absolute",
    left: `${layout.elements[key].x}%`,
    top: `${layout.elements[key].y}%`,
    transform: "translate(-50%, -50%)",
    width: "88%",
    textAlign,
    color: layout.elements[key].color ?? art.text_color,
    fontSize: `${BASE_SIZE[key] * layout.elements[key].scale * art.text_scale}px`,
    ...outline,
  });

  const partClass = (key: ElementKey) =>
    cn(
      editable && "cursor-move touch-none rounded-md ring-offset-1",
      editable && selected === key && "ring-2 ring-white/70",
    );

  return (
    <div
      ref={ref}
      className="relative w-full overflow-hidden rounded-2xl shadow-lg"
      style={{
        backgroundColor: art.bg_color,
        aspectRatio: shape.ratio,
        color: art.text_color,
        boxSizing: "border-box",
        ...(layout.frame.enabled
          ? { border: `${layout.frame.width}px ${layout.frame.style} ${layout.frame.color}` }
          : {}),
      }}
    >
      <div ref={containerRef} className="absolute inset-0">
        {art.tag && (
          <div
            style={partStyle("tag")}
            className={partClass("tag")}
            onPointerDown={startDrag("tag")}
          >
            <span
              className="inline-flex rounded-full px-3 py-1 font-bold tracking-widest uppercase"
              style={{ backgroundColor: `${art.text_color}26` }}
            >
              {art.tag}
            </span>
          </div>
        )}

        <div
          style={{ ...partStyle("title"), fontFamily: art.title_font }}
          className={cn("leading-tight font-extrabold", partClass("title"))}
          onPointerDown={startDrag("title")}
        >
          {art.title}
        </div>

        {art.subtitle && (
          <div
            style={{ ...partStyle("subtitle"), fontFamily: art.title_font }}
            className={cn("opacity-85", partClass("subtitle"))}
            onPointerDown={startDrag("subtitle")}
          >
            {art.subtitle}
          </div>
        )}

        {layout.show_image && art.image_url && (
          <div
            className={cn("overflow-hidden rounded-2xl", editable && "cursor-move touch-none")}
            style={{
              position: "absolute",
              left: `${layout.image.x}%`,
              top: `${layout.image.y}%`,
              transform: "translate(-50%, -50%)",
              width: `${Math.round(art.image_scale * 100)}%`,
              ...(art.image_border
                ? { border: `${art.image_border_width}px solid ${art.image_border_color}` }
                : {}),
            }}
            onPointerDown={startDrag("image")}
          >
            <StorageImage
              path={art.image_url}
              alt={art.title}
              className="pointer-events-none aspect-square w-full object-cover"
            />
          </div>
        )}

        <div
          style={{ ...partStyle("price"), fontFamily: art.price_font }}
          className={partClass("price")}
          onPointerDown={startDrag("price")}
        >
          {art.old_price_text && (
            <p className="line-through opacity-75" style={{ fontSize: "0.4em" }}>
              De: {art.old_price_text}
            </p>
          )}
          <p className="font-extrabold">
            {art.old_price_text ? `Por: ${art.price_text}` : art.price_text}
          </p>
        </div>
      </div>

      <div
        className="absolute inset-x-6 bottom-4 text-[10px] opacity-80"
        style={{ textAlign }}
      >
        <p className="font-bold">{storeName}</p>
        {art.show_link && storeSlug && <p>vitrine: /{storeSlug}</p>}
      </div>
    </div>
  );
}
