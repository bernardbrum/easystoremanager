import { createFileRoute, Outlet } from "@tanstack/react-router";

import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { store } from "@/data/mockData";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Painel EasyManager — gestão da sua loja" },
      {
        name: "description",
        content:
          "Gerencie vitrine, artes de divulgação, avaliações e estratégias de venda em um único painel.",
      },
    ],
  }),
  component: DashboardLayout,
});

function DashboardLayout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <DashboardSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur">
            <SidebarTrigger />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">{store.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                easymanager.app/{store.slug}
              </p>
            </div>
          </header>
          <main className="min-w-0 flex-1 p-4 sm:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
