"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  CalendarDays,
  Users,
  Wallet,
  Cake,
  ChefHat,
  Package,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

const NAV: { label: string; icon: LucideIcon; href: string }[] = [
  { label: "Inicio", icon: LayoutDashboard, href: "/" },
  { label: "Pedidos", icon: ClipboardList, href: "/pedidos" },
  { label: "Calendario", icon: CalendarDays, href: "/calendario" },
  { label: "Clientes", icon: Users, href: "/clientes" },
  { label: "Caja", icon: Wallet, href: "/caja" },
  { label: "Catálogo", icon: Cake, href: "/catalogo" },
  { label: "Recetas", icon: ChefHat, href: "/recetas" },
  { label: "Inventario", icon: Package, href: "/inventario" },
  { label: "Ajustes", icon: Settings, href: "#" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen">
      {/* ───────────── Sidebar ───────────── */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-foreground/10 bg-glass/60 backdrop-blur-xl transition-transform duration-200 md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center gap-2 border-b border-foreground/10 px-5">
          <span className="text-xl">🍮</span>
          <span className="font-display text-lg font-semibold leading-tight">
            Azúcar <span className="text-primary">&amp;</span> Canela
          </span>
        </div>
        <nav className="flex flex-col gap-1 p-3">
          {NAV.map((item) => {
            const active = item.href === pathname;
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  active
                    ? "bg-primary text-primary-foreground shadow-glow"
                    : "text-muted hover:bg-foreground/5 hover:text-foreground"
                }`}
              >
                <Icon className="h-[18px] w-[18px]" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* ───────────── Fondo (solo móvil) ───────────── */}
      {open && (
        <button
          aria-label="Cerrar menú"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden"
        />
      )}

      {/* ───────────── Contenido ───────────── */}
      <div className="md:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-foreground/10 bg-glass/60 px-4 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Abrir menú"
              onClick={() => setOpen(true)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-foreground/10 bg-glass/60 text-xl backdrop-blur md:hidden"
            >
              ☰
            </button>
            <span className="text-sm font-medium text-muted">Panel</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/login"
              className="rounded-full border border-foreground/10 bg-glass/60 px-4 py-1.5 text-sm font-medium backdrop-blur transition-colors hover:border-primary/40"
            >
              Entrar
            </Link>
          </div>
        </header>

        <main className="p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
