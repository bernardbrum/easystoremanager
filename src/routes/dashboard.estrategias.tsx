import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CalendarHeart, CheckCircle2, ClipboardList, Copy, Target } from "lucide-react";
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
  strategies,
  strategyCategories,
  strategyDates,
  type Strategy,
} from "@/data/mockData";

export const Route = createFileRoute("/dashboard/estrategias")({
  head: () => ({
    meta: [
      { title: "Arsenal de Estratégias — EasyManager" },
      {
        name: "description",
        content:
          "Estratégias de venda por segmento e data comemorativa, com checklist, roteiro de balcão e scripts de WhatsApp.",
      },
    ],
  }),
  component: EstrategiasPage,
});

const difficultyVariant = (level: Strategy["difficulty"]) =>
  level === "Fácil" ? "default" : level === "Médio" ? "secondary" : "outline";

function EstrategiasPage() {
  const [category, setCategory] = useState<string>("Todas");
  const [date, setDate] = useState<string>("Todas");
  const [selected, setSelected] = useState<Strategy | null>(null);

  const filtered = useMemo(
    () =>
      strategies.filter(
        (s) =>
          (category === "Todas" || s.category === category) &&
          (date === "Todas" || s.date === date),
      ),
    [category, date],
  );

  const copyScript = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Script copiado para o WhatsApp");
    } catch {
      toast.error("Não foi possível copiar o script");
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold">Arsenal de Estratégias</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ações testadas no comércio de bairro, com passo a passo e scripts prontos.
        </p>
      </div>

      <section className="surface-card space-y-4 p-5">
        <div>
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Categoria do comércio
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {["Todas", ...strategyCategories].map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                  category === c
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Data comemorativa
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {["Todas", ...strategyDates].map((d) => (
              <button
                key={d}
                onClick={() => setDate(d)}
                className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                  date === d
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {filtered.map((s) => (
          <article key={s.id} className="surface-card flex flex-col p-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{s.category}</Badge>
              <Badge variant="outline">
                <CalendarHeart className="size-3" />
                {s.date}
              </Badge>
              <Badge variant={difficultyVariant(s.difficulty)}>{s.difficulty}</Badge>
            </div>
            <h2 className="mt-3 text-lg leading-tight font-bold">{s.title}</h2>
            <p className="mt-2 flex-1 text-sm text-muted-foreground">{s.summary}</p>
            <p className="mt-3 text-xs text-muted-foreground">⏱ {s.estimatedTime}</p>
            <Button variant="secondary" className="mt-4" onClick={() => setSelected(s)}>
              Ver Passo a Passo Completo
            </Button>
          </article>
        ))}
        {filtered.length === 0 && (
          <p className="py-12 text-center text-sm text-muted-foreground md:col-span-2">
            Nenhuma estratégia para esta combinação de filtros.
          </p>
        )}
      </section>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-2xl">
          {selected && (
            <>
              <DialogHeader>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{selected.category}</Badge>
                  <Badge variant="outline">{selected.date}</Badge>
                  <Badge variant={difficultyVariant(selected.difficulty)}>
                    {selected.difficulty}
                  </Badge>
                </div>
                <DialogTitle className="mt-2 text-xl">{selected.title}</DialogTitle>
                <DialogDescription>{selected.summary}</DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                <div className="rounded-xl bg-primary-soft p-4">
                  <p className="flex items-center gap-2 text-sm font-bold text-primary">
                    <Target className="size-4" />
                    Objetivo
                  </p>
                  <p className="mt-2 text-sm text-foreground">{selected.objective}</p>
                </div>

                <div>
                  <p className="flex items-center gap-2 text-sm font-bold">
                    <ClipboardList className="size-4" />
                    Checklist de materiais
                  </p>
                  <ul className="mt-3 space-y-2">
                    {selected.materials.map((m) => (
                      <li key={m} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                        <span>{m}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="text-sm font-bold">Roteiro de balcão</p>
                  <ol className="mt-3 space-y-3">
                    {selected.counterScript.map((step, index) => (
                      <li key={step} className="flex gap-3 text-sm">
                        <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                          {index + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                <div>
                  <p className="text-sm font-bold">Scripts prontos para WhatsApp</p>
                  <div className="mt-3 space-y-3">
                    {selected.whatsappScripts.map((script) => (
                      <div key={script.label} className="rounded-xl border border-border p-4">
                        <p className="text-xs font-semibold text-muted-foreground uppercase">
                          {script.label}
                        </p>
                        <p className="mt-2 text-sm">{script.text}</p>
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
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
