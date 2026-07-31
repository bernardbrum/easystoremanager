import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Images,
  LayoutDashboard,
  Lightbulb,
  Star,
  Store as StoreIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { store } from "@/data/mockData";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "EasyManager — o gerente digital do comércio local" },
      {
        name: "description",
        content:
          "Vitrine digital com pedidos no WhatsApp, ímã de avaliações no Google, artes prontas em 1 clique e estratégias de balcão.",
      },
      { property: "og:title", content: "EasyManager — o gerente digital do comércio local" },
      {
        property: "og:description",
        content:
          "Vitrine digital, avaliações no Google, artes em 1 clique e estratégias de venda para o comércio de bairro.",
      },
    ],
  }),
  component: Landing,
});

const modules = [
  {
    icon: StoreIcon,
    title: "Vitrine Digital",
    text: "Um BioLink com catálogo, busca por categoria e pedido fechado direto no WhatsApp.",
  },
  {
    icon: Star,
    title: "Ímã de Avaliações",
    text: "5 estrelas vão para o Google Maps. Notas menores viram feedback privado para você resolver.",
  },
  {
    icon: Images,
    title: "Artes em 1 Clique",
    text: "Escolha o produto, o template e baixe a arte em formato story pronta para postar.",
  },
  {
    icon: Lightbulb,
    title: "Arsenal de Estratégias",
    text: "Passo a passo, checklist de materiais e scripts prontos de WhatsApp por segmento.",
  },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-5 py-6">
        <span className="font-display text-lg font-extrabold tracking-tight">
          Easy<span className="text-primary">Manager</span>
        </span>
        <Button asChild size="sm" variant="outline">
          <Link to="/dashboard/vitrine">
            <LayoutDashboard className="size-4" />
            Painel
          </Link>
        </Button>
      </header>

      <main className="mx-auto max-w-5xl px-5 pb-20">
        <section className="pt-6 pb-14 sm:pt-14">
          <p className="inline-flex rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
            Micro-SaaS para comércio de bairro
          </p>
          <h1 className="mt-5 max-w-3xl text-4xl leading-[1.05] font-extrabold sm:text-6xl">
            Todo o essencial da sua loja em um só lugar.
          </h1>
          <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
            Catálogo que vende pelo WhatsApp, mais avaliações no Google, artes prontas e
            estratégias testadas de balcão — sem precisar de agência.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/dashboard/vitrine">
                Abrir o painel
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/$slug" params={{ slug: store.slug }}>
                Ver vitrine de exemplo
              </Link>
            </Button>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          {modules.map((m) => (
            <article key={m.title} className="surface-card p-6">
              <div className="grid size-11 place-items-center rounded-xl bg-primary-soft text-primary">
                <m.icon className="size-5" />
              </div>
              <h2 className="mt-4 text-lg font-bold">{m.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{m.text}</p>
            </article>
          ))}
        </section>

        <section className="surface-card mt-10 flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-lg font-bold">Loja demonstrativa</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {store.name} · easymanager.app/{store.slug}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="secondary">
              <Link to="/$slug" params={{ slug: store.slug }}>
                Vitrine
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link to="/$slug/avaliar" params={{ slug: store.slug }}>
                Página de avaliação
              </Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
