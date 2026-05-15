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
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

interface SidebarProps {
  items: NavItem[];
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ items, collapsed, onToggle }: SidebarProps) {
  const location = useLocation();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300",
        collapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
          <School className="h-5 w-5 text-primary-foreground" />
        </div>
        {!collapsed && (
          <span className="text-base font-semibold text-foreground">EduSystem</span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {items.map((item) => {
          const isIndex = item.href === "/admin" || item.href === "/professor" || item.href === "/aluno";
          const isActive = isIndex
            ? location.pathname === item.href
            : location.pathname === item.href || location.pathname.startsWith(item.href + "/");
          return (
            <NavLink
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary/10 text-primary shadow-sm"
                  : "text-sidebar-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className={cn("h-5 w-5 shrink-0", isActive && "text-primary")} />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="border-t border-sidebar-border p-3">
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
