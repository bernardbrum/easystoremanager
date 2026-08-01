import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, Star } from "lucide-react";
import { toast } from "sonner";

import { StorageImage } from "@/components/storage-image";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { usePublicStore, useSubmitReview } from "@/lib/db";

export const Route = createFileRoute("/$slug/avaliar")({
  head: ({ params }) => ({
    meta: [
      { title: `Avaliar atendimento — ${params.slug} | EasyManager` },
      {
        name: "description",
        content:
          "Conte como foi sua experiência na loja. Leva 10 segundos e ajuda muito o comércio do bairro.",
      },
      { property: "og:title", content: `Avaliar atendimento — ${params.slug}` },
      {
        property: "og:description",
        content: "Sua avaliação em 10 segundos ajuda a loja a melhorar.",
      },
    ],
  }),
  component: AvaliarPage,
});

function AvaliarPage() {
  const { slug } = Route.useParams();
  const { data: store, isLoading } = usePublicStore(slug);
  const submit = useSubmitReview();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [done, setDone] = useState(false);

  const choose = async (value: number) => {
    setRating(value);
    if (!store) return;

    if (value === 5) {
      await submit.mutateAsync({ store_id: store.id, rating: value, feedback: "" });
      if (store.google_review_url) {
        window.open(store.google_review_url, "_blank", "noopener");
        setDone(true);
        return;
      }
      setDone(true);
      toast.success("Obrigado pela avaliação!");
      return;
    }
    setFeedbackOpen(true);
  };

  const sendFeedback = async () => {
    if (!store) return;
    if (feedback.trim().length < 3) {
      toast.error("Conte rapidamente o que podemos melhorar");
      return;
    }
    await submit.mutateAsync({ store_id: store.id, rating, feedback: feedback.trim() });
    setFeedbackOpen(false);
    setDone(true);
  };

  if (isLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <p className="text-sm text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-6 text-center">
        <div>
          <h1 className="text-xl font-extrabold">Loja não encontrada</h1>
          <Button asChild className="mt-6">
            <Link to="/">Voltar ao início</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center px-5 py-10"
      style={{ backgroundColor: store.bg_color }}
    >
      <div className="w-full max-w-md">
        <div className="surface-card p-6 text-center">
          <StorageImage
            path={store.logo_url}
            alt={`Logo ${store.name}`}
            className="mx-auto size-16 rounded-2xl border border-border bg-card object-contain p-1"
          />
          <h1 className="mt-4 text-xl font-extrabold">{store.name}</h1>

          {done ? (
            <div className="mt-6">
              <CheckCircle2 className="mx-auto size-12 text-success" />
              <p className="mt-4 text-base font-bold">Obrigado pelo seu retorno!</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {rating === 5
                  ? "Sua avaliação pública ajuda muito o comércio do bairro."
                  : "Recebemos seu comentário em particular e vamos trabalhar nisso."}
              </p>
              <Button asChild variant="outline" className="mt-6">
                <Link to="/$slug" params={{ slug }}>
                  Ver a vitrine
                </Link>
              </Button>
            </div>
          ) : (
            <>
              <p className="mt-2 text-sm text-muted-foreground">
                Como foi seu atendimento hoje? Toque em uma estrela.
              </p>
              <div className="mt-6 flex justify-center gap-1.5">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    onMouseEnter={() => setHover(value)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => choose(value)}
                    aria-label={`Dar nota ${value}`}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    <Star
                      className={`size-9 ${
                        value <= (hover || rating)
                          ? "fill-warning text-warning"
                          : "text-muted-foreground"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="mt-6 text-xs text-muted-foreground">
                Leva 10 segundos e faz toda a diferença para uma loja de bairro.
              </p>
            </>
          )}
        </div>
      </div>

      <Dialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>O que podemos melhorar?</DialogTitle>
            <DialogDescription>
              Seu comentário vai direto para o dono da loja — de forma privada.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            rows={4}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Conte o que aconteceu..."
            maxLength={800}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setFeedbackOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={sendFeedback} disabled={submit.isPending}>
              Enviar em privado
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
