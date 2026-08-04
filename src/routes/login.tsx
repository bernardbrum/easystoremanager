import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Store } from "lucide-react";
import { toast } from "sonner";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";

// Only same-origin relative paths may be used as a post-login destination.
const safeNext = (value: unknown) =>
  typeof value === "string" && value.startsWith("/") && !value.startsWith("//") ? value : "";

export const Route = createFileRoute("/login")({
  validateSearch: (s: Record<string, unknown>) => ({ next: safeNext(s["next"]) }),
  head: () => ({
    meta: [
      { title: "Entrar no painel — EasyManager" },
      {
        name: "description",
        content:
          "Acesse o painel EasyManager para gerenciar sua vitrine digital, clientes, artes e avaliações.",
      },
      { property: "og:title", content: "Entrar no painel — EasyManager" },
      { property: "og:description", content: "Acesso do lojista ao painel EasyManager." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { next } = Route.useSearch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const go = () => {
      if (next) {
        window.location.href = next;
        return;
      }
      navigate({ to: "/dashboard/vitrine", replace: true });
    };
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) go();
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) go();
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate, next]);

  // Keep OAuth/email returns on a public origin URL unless a saved path is pending.
  const returnUrl = () => `${window.location.origin}${next || ""}`;

  const signIn = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error("E-mail ou senha inválidos");
      return;
    }
    toast.success("Bem-vindo de volta!");
  };

  const signUp = async () => {
    if (password.length < 6) {
      toast.error("A senha precisa ter ao menos 6 caracteres");
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: returnUrl() },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (!data.session) {
      toast.success("Confira seu e-mail para confirmar a conta");
      return;
    }
    toast.success("Conta criada! Vamos configurar sua loja.");
  };

  const signInWithGoogle = async () => {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: returnUrl(),
    });
    if (result.error) {
      toast.error("Não foi possível entrar com o Google");
      return;
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary text-primary-foreground">
            <Store className="size-6" />
          </div>
          <h1 className="mt-4 text-2xl font-extrabold">
            Easy<span className="text-primary">Manager</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Painel do lojista: vitrine, clientes, artes e avaliações.
          </p>
        </div>

        <div className="surface-card p-5">
          <Tabs defaultValue="entrar">
            <TabsList className="w-full">
              <TabsTrigger value="entrar" className="flex-1">
                Entrar
              </TabsTrigger>
              <TabsTrigger value="criar" className="flex-1">
                Criar conta
              </TabsTrigger>
            </TabsList>

            <div className="mt-5 grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="voce@sualoja.com.br"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <TabsContent value="entrar" className="mt-4">
              <Button className="w-full" onClick={signIn} disabled={loading || !email}>
                {loading && <Loader2 className="size-4 animate-spin" />}
                Entrar no painel
              </Button>
            </TabsContent>
            <TabsContent value="criar" className="mt-4">
              <Button className="w-full" onClick={signUp} disabled={loading || !email}>
                {loading && <Loader2 className="size-4 animate-spin" />}
                Criar minha conta
              </Button>
            </TabsContent>
          </Tabs>

          <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            ou
            <span className="h-px flex-1 bg-border" />
          </div>

          <Button variant="outline" className="w-full" onClick={signInWithGoogle}>
            Continuar com Google
          </Button>
        </div>
      </div>
    </div>
  );
}
