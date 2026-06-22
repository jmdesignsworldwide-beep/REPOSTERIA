"use client";

import { createClient } from "@/lib/supabase/client";
import { GlassCard } from "@/components/ui/glass-card";
import { ThemeToggle } from "@/components/theme-toggle";

export default function ExpiradoPage() {
  async function salir() {
    try {
      await createClient().auth.signOut();
    } catch {}
    // Navegación completa para que el servidor vea la sesión cerrada.
    window.location.assign("/login");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between p-4">
        <span className="flex items-center gap-2 font-display text-lg font-semibold">
          🍮 Azúcar <span className="text-primary">&amp;</span> Canela
        </span>
        <ThemeToggle />
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <GlassCard className="w-full max-w-md p-8 text-center">
          <div className="text-5xl">⏳</div>
          <h1 className="mt-4 font-display text-2xl font-bold">
            Tu acceso ha expirado
          </h1>
          <p className="mt-2 text-sm text-muted">
            Contacta a <span className="font-medium text-foreground">JM Designs</span>{" "}
            para renovarlo y seguir explorando el sistema.
          </p>
          <button
            onClick={salir}
            className="mt-6 rounded-xl border border-foreground/15 bg-glass/60 px-5 py-2.5 text-sm font-medium backdrop-blur transition-colors hover:border-primary/40"
          >
            Volver al inicio de sesión
          </button>
        </GlassCard>
      </main>
    </div>
  );
}
