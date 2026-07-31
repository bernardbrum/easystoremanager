import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Copy, MessageSquareWarning, Star, ThumbsUp, TrendingUp } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, reviews, store } from "@/data/mockData";

export const Route = createFileRoute("/dashboard/avaliacoes")({
  head: () => ({
    meta: [
      { title: "Gestão de Avaliações — EasyManager" },
      {
        name: "description",
        content:
          "Acompanhe métricas de avaliações, compartilhe o QR Code de balcão e leia os feedbacks privados.",
      },
    ],
  }),
  component: AvaliacoesPage,
});

function AvaliacoesPage() {
  const reviewLink = `easymanager.app/${store.slug}/avaliar`;
  const [search, setSearch] = useState("");

  const metrics = useMemo(() => {
    const total = reviews.length;
    const average = total ? reviews.reduce((s, r) => s + r.rating, 0) / total : 0;
    const google = reviews.filter((r) => r.channel === "google").length;
    const privates = reviews.filter((r) => r.channel === "private").length;
    return { total, average, google, privates };
  }, []);

  const privateReviews = useMemo(
    () =>
      reviews
        .filter((r) => r.rating < 5)
        .filter(
          (r) =>
            !search.trim() || r.message.toLowerCase().includes(search.trim().toLowerCase()),
        )
        .sort((a, b) => (a.date < b.date ? 1 : -1)),
    [search],
  );

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(`https://${reviewLink}`);
      toast.success("Link de avaliação copiado!");
    } catch {
      toast.error("Não foi possível copiar o link");
    }
  };

  const cards = [
    { label: "Total de avaliações", value: metrics.total, icon: Star },
    { label: "Média geral", value: metrics.average.toFixed(1), icon: TrendingUp },
    { label: "Enviados ao Google", value: metrics.google, icon: ThumbsUp },
    { label: "Feedbacks privados", value: metrics.privates, icon: MessageSquareWarning },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold">Gestão de Avaliações</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Notas 5 estrelas vão para o Google. As demais chegam aqui em privado.
        </p>
      </div>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map((c) => (
          <article key={c.label} className="surface-card p-4">
            <div className="grid size-9 place-items-center rounded-lg bg-primary-soft text-primary">
              <c.icon className="size-4" />
            </div>
            <p className="mt-3 text-2xl font-extrabold">{c.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{c.label}</p>
          </article>
        ))}
      </section>

      <section className="surface-card grid gap-5 p-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
        <div className="min-w-0">
          <h2 className="text-base font-bold">Link e QR Code de balcão</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Imprima o QR Code e deixe no caixa para capturar avaliações na hora.
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Input readOnly value={reviewLink} className="font-mono text-xs" />
            <Button onClick={copyLink}>
              <Copy className="size-4" />
              Copiar link
            </Button>
          </div>
        </div>
        <div className="justify-self-center rounded-xl border border-border bg-card p-3">
          <QRCodeSVG value={`https://${reviewLink}`} size={136} level="M" />
        </div>
      </section>

      <section className="surface-card p-5">
        <div className="grid gap-3 sm:flex sm:items-center sm:justify-between">
          <h2 className="text-base font-bold">Feedbacks privados (menos de 5 estrelas)</h2>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar na mensagem..."
            className="sm:w-64"
          />
        </div>

        <div className="mt-4 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-28">Data</TableHead>
                <TableHead className="w-32">Estrelas</TableHead>
                <TableHead>Crítica do cliente</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {privateReviews.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="text-xs whitespace-nowrap text-muted-foreground">
                    {formatDate(r.date)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={r.rating <= 2 ? "destructive" : "secondary"}>
                      {r.rating} ★
                    </Badge>
                  </TableCell>
                  <TableCell className="min-w-64 text-sm">
                    <p className="font-medium">{r.customer}</p>
                    <p className="text-muted-foreground">{r.message}</p>
                  </TableCell>
                </TableRow>
              ))}
              {privateReviews.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="py-8 text-center text-sm text-muted-foreground">
                    Nenhum feedback privado encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}
