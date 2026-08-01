import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Check, Copy, Star } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  strategies,
  strategyCategories,
  strategyDates,
  type Strategy,
} from "@/data/strategies";
import { useFavoriteStrategies, useMyStore, useToggleFavoriteStrategy } from "@/lib/db";

export const Route = createFileRoute("/dashboard/estrategias")({
  head: () => ({
    meta: [
      { title: "Arsenal de Estratégias — EasyManager" },
      {
        name: "description",
        content:
          "Estratégias de venda com passo a passo, checklist de materiais e scripts prontos de WhatsApp.",
      },
    ],
  }),
  component: EstrategiasPage,
});

function EstrategiasPage() {
  const { data: store } = useMyStore();
  const { data: favorites = [] } = useFavoriteStrategies(store?.id);
  const toggleFavorite = useToggleFavoriteStrategy(store?.id);
  const [category, setCategory] = useState("Todas");
  const [date, setDate] = useState("Todas");
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [active, setActive] = useState<Strategy | null>(null);

  const filtered = useMemo(
    () =>
      strategies.filter((s) => {
        const matchesCategory = category === "Todas" || s.category === category;
        const matchesDate = date === "Todas" || s.date === date;
        const matchesFavorite = !onlyFavorites || favorites.includes(s.id);
        return matchesCategory && matchesDate && matchesFavorite;
      }),
    [category, date, onlyFavorites, favorites],
  );

  const copyScript = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Script copiado!");
    } catch {
      toast.error("Não foi possível copiar o script");
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold">Arsenal de Estratégias</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ações testadas de balcão, com checklist e scripts prontos para o WhatsApp.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="sm:w-52">
            <SelectValue placeholder="Segmento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Todas">Todos os segmentos</SelectItem>
            {strategyCategories.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={date} onValueChange={setDate}>
          <SelectTrigger className="sm:w-52">
            <SelectValue placeholder="Data comemorativa" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Todas">Todas as datas</SelectItem>
            {strategyDates.map((d) => (
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant={onlyFavorites ? "default" : "outline"}
          onClick={() => setOnlyFavorites((v) => !v)}
        >
          <Star className="size-4" />
          Favoritas ({favorites.length})
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {filtered.map((s) => {
          const isFavorite = favorites.includes(s.id);
          return (
            <article key={s.id} className="surface-card flex flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-base font-bold">{s.title}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{s.summary}</p>
                </div>
                <Button
                  size="icon"
                  variant="outline"
                  aria-label="Favoritar estratégia"
                  onClick={() =>
                    toggleFavorite.mutate({ strategyId: s.id, favorite: !isFavorite })
                  }
                >
                  <Star className={`size-4 ${isFavorite ? "fill-warning text-warning" : ""}`} />
                </Button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant="secondary">{s.category}</Badge>
                <Badge variant="outline">{s.date}</Badge>
                <Badge variant="outline">{s.difficulty}</Badge>
                <Badge variant="outline">{s.estimatedTime}</Badge>
              </div>
              <Button className="mt-4" variant="secondary" onClick={() => setActive(s)}>
                Ver passo a passo
              </Button>
            </article>
          );
        })}
        {filtered.length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground sm:col-span-2">
            Nenhuma estratégia encontrada com esses filtros.
          </p>
        )}
      </div>

      <Dialog open={!!active} onOpenChange={(open) => !open && setActive(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{active?.title}</DialogTitle>
            <DialogDescription>{active?.objective}</DialogDescription>
          </DialogHeader>

          {active && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-bold">Materiais necessários</h3>
                <ul className="mt-2 grid gap-1.5">
                  {active.materials.map((m) => (
                    <li key={m} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                      {m}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-bold">Passo a passo no balcão</h3>
                <ol className="mt-2 grid gap-2">
                  {active.counterScript.map((step, index) => (
                    <li key={step} className="flex gap-2 text-sm">
                      <span className="grid size-5 shrink-0 place-items-center rounded-full bg-primary-soft text-[11px] font-bold text-primary">
                        {index + 1}
                      </span>
                      <span className="text-muted-foreground">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div>
                <h3 className="text-sm font-bold">Scripts de WhatsApp</h3>
                <div className="mt-2 grid gap-2">
                  {active.whatsappScripts.map((script) => (
                    <div key={script.label} className="rounded-xl border border-border p-3">
                      <p className="text-xs font-bold text-primary">{script.label}</p>
                      <p className="mt-1 text-sm whitespace-pre-line text-muted-foreground">
                        {script.text}
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-3"
                        onClick={() => copyScript(script.text)}
                      >
                        <Copy className="size-3.5" />
                        Copiar script
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
