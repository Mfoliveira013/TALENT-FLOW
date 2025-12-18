

import React, { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  LayoutDashboard,
  Folder,
  Users, 
  Upload, 
  Calendar,
  UserCheck, // Ícone para Entrevistados
  Briefcase,
  UserCircle,
  LogOut,
  Loader2
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const navigationItems = [
  { title: "Dashboard", url: createPageUrl("Dashboard"), icon: LayoutDashboard, adminOnly: true },
  { title: "Setores", url: createPageUrl("Setores"), icon: Folder },
  { title: "Candidatos", url: createPageUrl("Candidatos"), icon: Users },
  { title: "Entrevistados", url: createPageUrl("Entrevistados"), icon: UserCheck },
  { title: "Upload de Currículos", url: createPageUrl("Upload"), icon: Upload },
  { title: "Agenda", url: createPageUrl("Agenda"), icon: Calendar },
  { title: "Equipe", url: createPageUrl("Equipe"), icon: Briefcase },
  { title: "Meu Perfil", url: createPageUrl("MeuPerfil"), icon: UserCircle },
];

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { data: user, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  useEffect(() => {
    if (!isLoading && user) {
      if (!user.setup_completo && location.pathname !== createPageUrl('ConfiguracaoInicial')) {
        navigate(createPageUrl('ConfiguracaoInicial'));
      }
      // Apply theme
      document.documentElement.classList.remove('claro', 'escuro');
      document.documentElement.classList.add(user.tema || 'claro');
    }
  }, [user, isLoading, navigate, location.pathname]);

  if (isLoading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-slate-100">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (user && !user.setup_completo) {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    await base44.auth.logout();
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <SidebarProvider>
      <style>{`
        :root {
          --background: 210 40% 98%;
          --foreground: 222 47% 11%;
          --primary: 222 47% 37%;
          --primary-foreground: 210 40% 98%;
          --card: 0 0% 100%;
          --card-foreground: 222 47% 11%;
          --border: 214 32% 91%;
          --muted: 210 40% 96%;
          --muted-foreground: 215 28% 44%;
        }
        .dark {
          --background: 222 47% 11%;
          --foreground: 210 40% 98%;
          --primary: 210 40% 98%;
          --primary-foreground: 222 47% 11%;
          --card: 222 47% 15%;
          --card-foreground: 210 40% 98%;
          --border: 217 33% 25%;
          --muted: 217 33% 17%;
          --muted-foreground: 215 28% 65%;
        }
        body { background-color: hsl(var(--background)); color: hsl(var(--foreground)); }
      `}</style>
      <div className="min-h-screen flex w-full bg-background text-foreground">
        <Sidebar className="border-r border-border bg-card">
          <SidebarHeader className="border-b border-border p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center shadow-lg">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-card-foreground text-lg">BTNEF</h2>
                <p className="text-xs text-muted-foreground">Banco de Talentos</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-3">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-3">
                Menu Principal
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => {
                    // Conditional rendering based on adminOnly property and user role/setor_interno
                    if (item.adminOnly && user?.role !== 'admin' && user?.setor_interno !== 'Recursos Humanos') {
                        return null;
                    }
                    return (
                        <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild className={`hover:bg-muted rounded-xl mb-1 ${ location.pathname.startsWith(item.url) ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'hover:text-primary' }`}>
                            <Link to={item.url} className="flex items-center gap-3 px-4 py-3">
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium">{item.title}</span>
                            </Link>
                        </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-border p-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3 px-2">
                <Avatar className="w-10 h-10 border-2 border-primary/20">
                  <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                    {getInitials(user?.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-card-foreground text-sm truncate">{user?.full_name || "Usuário"}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.cargo || user?.email}</p>
                </div>
              </div>
              <Button variant="outline" className="w-full justify-start gap-2 text-muted-foreground hover:text-red-500 hover:border-red-500/50" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
                Sair
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="bg-card/80 backdrop-blur-sm border-b border-border px-6 py-4 md:hidden sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-muted p-2 rounded-lg" />
              <h1 className="text-xl font-bold">BTNEF</h1>
            </div>
          </header>
          <div className="flex-1 overflow-auto">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}

