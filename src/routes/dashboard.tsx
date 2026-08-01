import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LogOut, PanelsTopLeft } from "lucide-react";

import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";
import { useMyStore } from "@/lib/db";
import { Outlet, useNavigate, useRouter } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/dashboard")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/login" });
    return { user: data.user };
  },
  head: () => ({
    meta: [
      { title: "Painel EasyManager — gestão da sua loja" },
      {
        name: "description",
        content:
          "Gerencie vitrine, clientes, artes de divulgação, avaliações e estratégias de venda em um único painel.",
      },
    ],
  }),
  component: DashboardLayout,
});

function DashboardLayout() {
  const { data: store } = useMyStore();
  const navigate = useNavigate();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") router.invalidate();
    });
    return () => sub.subscription.unsubscribe();
  }, [router]);

  const signOut = async () => {
    setSigningOut(true);
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/login", replace: true });
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <DashboardSidebar slug={store?.slug} />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur">
            <SidebarTrigger />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold">{store?.name ?? "Carregando..."}</p>
              {store && (
                <Link
                  to="/$slug"
                  params={{ slug: store.slug }}
                  className="flex items-center gap-1 truncate text-xs text-muted-foreground hover:text-foreground"
                >
                  <PanelsTopLeft className="size-3" />
                  /{store.slug}
                </Link>
              )}
            </div>
            <ThemeToggle />
            <Button variant="outline" size="icon" onClick={signOut} disabled={signingOut} aria-label="Sair">
              <LogOut className="size-4" />
            </Button>
          </header>
          <main className="min-w-0 flex-1 p-4 sm:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
