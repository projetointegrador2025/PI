import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  ClipboardList,
  Calendar,
  ChevronLeft,
  School,
  X,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

interface SidebarProps {
  items: NavItem[];
  collapsed: boolean;
  mobileOpen: boolean;
  onToggle: () => void;
  onMobileClose: () => void;
}

export function Sidebar({ items, collapsed, mobileOpen, onToggle, onMobileClose }: SidebarProps) {
  const location = useLocation();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300",
        // Desktop behavior
        "hidden lg:flex",
        collapsed ? "lg:w-[72px]" : "lg:w-[260px]",
        // Mobile behavior - overlay
        mobileOpen && "!flex w-[280px]"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <School className="h-5 w-5 text-primary-foreground" />
          </div>
          {(!collapsed || mobileOpen) && (
            <span className="text-base font-semibold text-foreground">EduSystem</span>
          )}
        </div>
        {/* Mobile close button */}
        {mobileOpen && (
          <button
            onClick={onMobileClose}
            className="rounded-lg p-2 text-sidebar-foreground transition-colors hover:bg-accent lg:hidden"
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Menu principal">
        {items.map((item) => {
          const isIndex = item.href === "/admin" || item.href === "/professor" || item.href === "/aluno";
          const isActive = isIndex
            ? location.pathname === item.href
            : location.pathname === item.href || location.pathname.startsWith(item.href + "/");
          return (
            <NavLink
              key={item.href}
              to={item.href}
              onClick={onMobileClose}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary/10 text-primary shadow-sm"
                  : "text-sidebar-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className={cn("h-5 w-5 shrink-0", isActive && "text-primary")} />
              {(!collapsed || mobileOpen) && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Collapse toggle - desktop only */}
      <div className="hidden border-t border-sidebar-border p-3 lg:block">
        <button
          onClick={onToggle}
          className="flex w-full items-center justify-center rounded-lg p-2 text-sidebar-foreground transition-colors hover:bg-accent"
          aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
        >
          <ChevronLeft className={cn("h-5 w-5 transition-transform", collapsed && "rotate-180")} />
        </button>
      </div>
    </aside>
  );
}

// Navigation configs per role
export const adminNavItems: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Alunos", href: "/admin/alunos", icon: Users },
  { label: "Professores", href: "/admin/professores", icon: GraduationCap },
  { label: "Grade de Aulas", href: "/admin/grade", icon: Calendar },
];

export const teacherNavItems: NavItem[] = [
  { label: "Dashboard", href: "/professor", icon: LayoutDashboard },
  { label: "Alunos", href: "/professor/alunos", icon: Users },
  { label: "Notas", href: "/professor/notas", icon: ClipboardList },
  { label: "Chamada", href: "/professor/chamada", icon: Calendar },
  { label: "Anotações", href: "/professor/anotacoes", icon: BookOpen },
];

export const studentNavItems: NavItem[] = [
  { label: "Dashboard", href: "/aluno", icon: LayoutDashboard },
  { label: "Grade de Aulas", href: "/aluno/grade", icon: Calendar },
];
