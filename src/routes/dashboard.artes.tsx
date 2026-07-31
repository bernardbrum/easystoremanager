import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Download } from "lucide-react";
import { toast } from "sonner";

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
import { artTemplates, formatPrice, products, store } from "@/data/mockData";

export const Route = createFileRoute("/dashboard/artes")({
  head: () => ({
    meta: [
      { title: "Gerador de Artes 1-Clique — EasyManager" },
      {
        name: "description",
        content:
          "Escolha um produto, selecione o template e baixe a arte em formato story pronta para postar.",
      },
    ],
  }),
  component: ArtesPage,
});

const templateStyles: Record<string, { wrapper: string; badge: string; accentText: string }> = {
  oferta: {
    wrapper: "bg-accent text-accent-foreground",
    badge: "bg-destructive text-destructive-foreground",
    accentText: "text-accent-foreground",
  },
  destaque: {
    wrapper: "bg-primary text-primary-foreground",
    badge: "bg-accent text-accent-foreground",
    accentText: "text-primary-foreground",
  },
  novidade: {
    wrapper: "bg-card text-card-foreground",
    badge: "bg-primary text-primary-foreground",
    accentText: "text-primary",
  },
};

function ArtesPage() {
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [templateId, setTemplateId] = useState<string>(artTemplates[0].id);
  const template = artTemplates.find((t) => t.id === templateId) ?? artTemplates[0];
  const [title, setTitle] = useState<string>(artTemplates[0].defaultTitle);
  const [callToAction, setCallToAction] = useState<string>(
    artTemplates[0].defaultCallToAction,
  );
  const [downloading, setDownloading] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const product = products.find((p) => p.id === productId) ?? products[0];
  const styles = templateStyles[template.id] ?? templateStyles["oferta"]!;


  const selectTemplate = (id: string) => {
    const next = artTemplates.find((t) => t.id === id);
    if (!next) return;
    setTemplateId(id);
    setTitle(next.defaultTitle);
    setCallToAction(next.defaultCallToAction);
  };

  const download = async () => {
    if (!previewRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(previewRef.current, {
        pixelRatio: 1080 / previewRef.current.offsetWidth,
        cacheBust: true,
      });
      const link = document.createElement("a");
      link.download = `arte-${template.id}-${product?.id ?? "produto"}.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Arte baixada em PNG (1080x1920)");
    } catch {
      toast.error("Não foi possível gerar a imagem");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div>
        <h1 className="text-2xl font-extrabold">Gerador de Artes 1-Clique</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Monte um story de divulgação em segundos e baixe pronto para o Instagram ou status do
          WhatsApp.
        </p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto]">
        <section className="surface-card h-fit space-y-5 p-5">
          <div className="grid gap-2">
            <Label htmlFor="prod">Produto</Label>
            <Select value={productId} onValueChange={setProductId}>
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

          <div className="grid gap-2">
            <Label>Template visual</Label>
            <div className="grid gap-2 sm:grid-cols-3">
              {artTemplates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => selectTemplate(t.id)}
                  className={`rounded-xl border p-3 text-left transition-colors ${
                    template.id === t.id
                      ? "border-primary bg-primary-soft"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  <p className="text-sm font-bold">{t.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{t.description}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="title">Título</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="cta">Chamada</Label>
            <Input
              id="cta"
              value={callToAction}
              onChange={(e) => setCallToAction(e.target.value)}
            />
          </div>

          <Button className="w-full" onClick={download} disabled={downloading}>
            <Download className="size-4" />
            {downloading ? "Gerando..." : "Baixar Arte (PNG)"}
          </Button>
        </section>

        <section className="justify-self-center">
          <p className="mb-3 text-center text-xs text-muted-foreground">
            Pré-visualização · 1080x1920 (9:16)
          </p>
          <div
            ref={previewRef}
            className={`flex w-[270px] flex-col overflow-hidden rounded-2xl sm:w-[320px] ${styles.wrapper}`}
            style={{ aspectRatio: "9 / 16" }}
          >
            <div className="flex items-center justify-between px-5 pt-6">
              <span className="text-xs font-extrabold tracking-widest uppercase opacity-80">
                {store.name}
              </span>
              <span
                className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold ${styles.badge}`}
              >
                {template.badge}
              </span>
            </div>

            <h2 className="px-5 pt-5 text-center text-2xl leading-none font-extrabold sm:text-3xl">
              {title}
            </h2>

            <div className="mt-5 px-5">
              <img
                src={product?.image}
                alt={product?.name ?? "Produto"}
                width={768}
                height={768}
                className="aspect-square w-full rounded-xl object-cover"
              />
            </div>

            <div className="mt-4 flex-1 px-5 text-center">
              <p className="text-sm font-bold">{product?.name}</p>
              <p className="mt-3 text-4xl font-extrabold sm:text-5xl">
                {formatPrice(product?.price ?? 0)}
              </p>
              <p className="mt-3 text-xs opacity-80">{callToAction}</p>
            </div>

            <div className="px-5 pb-6 text-center text-[10px] font-semibold opacity-75">
              easymanager.app/{store.slug} · {store.whatsapp}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
