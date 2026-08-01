import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Download, Star } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMyStore, useReviews } from "@/lib/db";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/dashboard/avaliacoes")({
  head: () => ({
    meta: [
      { title: "Avaliações — EasyManager" },
      {
        name: "description",
        content:
          "Acompanhe a nota média, o volume de avaliações e os feedbacks privados dos seus clientes.",
      },
    ],
  }),
  component: AvaliacoesPage,
});

function AvaliacoesPage() {
  const { data: store } = useMyStore();
  const { data: reviews = [] } = useReviews(store?.id);
  const qrWrapper = useRef<HTMLDivElement>(null);

  const stats = useMemo(() => {
    const total = reviews.length;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    const promoters = reviews.filter((r) => r.rating === 5).length;
    const privates = reviews.filter((r) => r.rating < 5 && r.feedback);
    return {
      total,
      average: total ? sum / total : 0,
      promoters,
      privates,
    };
  }, [reviews]);

  const reviewUrl =
    typeof window !== "undefined" && store
      ? `${window.location.origin}/${store.slug}/avaliar`
      : "";

  const downloadQr = () => {
    const canvas = qrWrapper.current?.querySelector("canvas");
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "qrcode-avaliacoes.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
    toast.success("QR Code baixado — imprima e deixe no balcão");
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold">Avaliações</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Notas 5 vão para o Google. Notas menores chegam aqui em privado.
        </p>
      </div>

      <section className="grid gap-3 sm:grid-cols-3">
        <div className="surface-card p-5">
          <p className="text-xs text-muted-foreground">Nota média</p>
          <p className="mt-1 flex items-center gap-2 text-3xl font-extrabold">
            {stats.average.toFixed(1)}
            <Star className="size-5 fill-warning text-warning" />
          </p>
        </div>
        <div className="surface-card p-5">
          <p className="text-xs text-muted-foreground">Total de avaliações</p>
          <p className="mt-1 text-3xl font-extrabold">{stats.total}</p>
        </div>
        <div className="surface-card p-5">
          <p className="text-xs text-muted-foreground">Promotores (5 estrelas)</p>
          <p className="mt-1 text-3xl font-extrabold text-primary">{stats.promoters}</p>
        </div>
      </section>

      <section className="surface-card flex flex-col gap-5 p-5 sm:flex-row sm:items-center">
        <div ref={qrWrapper} className="grid place-items-center rounded-xl bg-white p-4">
          {reviewUrl && <QRCodeCanvas value={reviewUrl} size={144} includeMargin={false} />}
        </div>
        <div className="min-w-0">
          <h2 className="text-base font-bold">QR Code do balcão</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Imprima e deixe ao lado da maquininha. O cliente avalia em 10 segundos.
          </p>
          <p className="mt-2 truncate text-xs text-muted-foreground">{reviewUrl}</p>
          <Button className="mt-4" variant="outline" onClick={downloadQr}>
            <Download className="size-4" />
            Baixar QR Code
          </Button>
        </div>
      </section>

      <section className="surface-card p-5">
        <h2 className="text-base font-bold">Feedbacks privados ({stats.privates.length})</h2>
        <div className="mt-4 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Nota</TableHead>
                <TableHead>Comentário</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.privates.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                    {formatDate(r.created_at)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={r.rating <= 2 ? "destructive" : "secondary"}>
                      {r.rating} ★
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{r.feedback}</TableCell>
                </TableRow>
              ))}
              {stats.privates.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="py-8 text-center text-sm text-muted-foreground">
                    Nenhum feedback privado até agora. Boa notícia!
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
