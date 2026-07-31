import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, ExternalLink, Star } from "lucide-react";
import { toast } from "sonner";

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
import { store } from "@/data/mockData";

export const Route = createFileRoute("/$slug/avaliar")({
  head: () => ({
    meta: [
      { title: `Avalie sua experiência — ${store.name}` },
      {
        name: "description",
        content: `Conte em 10 segundos como foi sua visita ao ${store.name}. Sua opinião ajuda a melhorar nosso atendimento.`,
      },
      { property: "og:title", content: `Avalie sua experiência — ${store.name}` },
      {
        property: "og:description",
        content: "Deixe sua nota de 1 a 5 estrelas e ajude nossa loja a melhorar.",
      },
    ],
  }),
  component: AvaliarPage,
});

function AvaliarPage() {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const handleRate = (value: number) => {
    setRating(value);
    if (value < 5) {
      setMessage("");
      setSent(false);
      setFeedbackOpen(true);
    }
  };

  const submitFeedback = () => {
    if (!message.trim()) {
      toast.error("Escreva sua sugestão para enviarmos.");
      return;
    }
    setSent(true);
    setFeedbackOpen(false);
    toast.success("Feedback enviado. Obrigado por nos ajudar!");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-5 py-14">
      <div className="w-full max-w-md text-center">
        <img
          src={store.logo}
          alt={`Logo ${store.name}`}
          width={512}
          height={512}
          className="mx-auto size-24 rounded-3xl border border-border bg-card object-contain p-2"
        />
        <p className="mt-5 text-sm font-semibold tracking-wide text-muted-foreground uppercase">
          {store.name}
        </p>
        <h1 className="mt-3 text-2xl leading-tight font-extrabold sm:text-3xl">
          Como foi sua experiência conosco hoje?
        </h1>

        <div className="mt-8 flex justify-center gap-1.5" role="group" aria-label="Nota de 1 a 5">
          {[1, 2, 3, 4, 5].map((value) => {
            const filled = value <= (hover || rating);
            return (
              <button
                key={value}
                onClick={() => handleRate(value)}
                onMouseEnter={() => setHover(value)}
                onMouseLeave={() => setHover(0)}
                aria-label={`${value} ${value === 1 ? "estrela" : "estrelas"}`}
                className="p-1 transition-transform hover:scale-110"
              >
                <Star
                  className={`size-11 sm:size-14 ${
                    filled ? "fill-accent text-accent" : "text-border"
                  }`}
                  strokeWidth={1.5}
                />
              </button>
            );
          })}
        </div>

        {rating === 0 && (
          <p className="mt-6 text-sm text-muted-foreground">
            Toque nas estrelas para dar sua nota.
          </p>
        )}

        {rating === 5 && (
          <div className="surface-card mt-8 p-6">
            <p className="text-base font-bold">Que alegria! 🎉</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Sua avaliação no Google ajuda outros vizinhos a encontrarem a gente.
            </p>
            <Button asChild size="lg" className="mt-5 w-full">
              <a href={store.googleReviewLink} target="_blank" rel="noopener noreferrer">
                Avaliar no Google Maps
                <ExternalLink className="size-4" />
              </a>
            </Button>
          </div>
        )}

        {rating > 0 && rating < 5 && !sent && (
          <div className="surface-card mt-8 p-6">
            <p className="text-sm text-muted-foreground">
              Queremos entender o que faltou para você.
            </p>
            <Button className="mt-4 w-full" onClick={() => setFeedbackOpen(true)}>
              Contar o que podemos melhorar
            </Button>
          </div>
        )}

        {sent && (
          <div className="surface-card mt-8 flex flex-col items-center p-6">
            <CheckCircle2 className="size-10 text-primary" />
            <p className="mt-3 text-base font-bold">Feedback recebido</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Sua mensagem foi enviada direto para o dono da loja. Obrigado pela sinceridade!
            </p>
          </div>
        )}
      </div>

      <Dialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Como podemos melhorar?</DialogTitle>
            <DialogDescription>
              Este feedback é privado e vai apenas para a equipe da loja.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            placeholder="Conte o que não saiu como você esperava..."
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setFeedbackOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={submitFeedback}>Enviar feedback</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
