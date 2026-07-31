import { Link, useRouterState } from "@tanstack/react-router";
import { ExternalLink, Images, Lightbulb, Star, Store as StoreIcon } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { store } from "@/data/mockData";

const items = [
  { title: "Gestão da Vitrine", url: "/dashboard/vitrine", icon: StoreIcon },
  { title: "Gerador de Artes", url: "/dashboard/artes", icon: Images },
  { title: "Avaliações", url: "/dashboard/avaliacoes", icon: Star },
  { title: "Arsenal de Estratégias", url: "/dashboard/estrategias", icon: Lightbulb },
] as const;

export function DashboardSidebar() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-4 py-4">
        <span className="font-display truncate text-base font-extrabold">
          Easy<span className="text-sidebar-primary">Manager</span>
        </span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Módulos</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    tooltip={item.title}
                  >
                    <Link to={item.url}>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Ver vitrine pública">
              <Link to="/$slug" params={{ slug: store.slug }}>
                <ExternalLink className="size-4" />
                <span>Ver vitrine</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
