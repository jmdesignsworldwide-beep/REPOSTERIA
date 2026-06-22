"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { emailDeUsuario } from "@/lib/auth/usuario";
import { ThemeToggle } from "@/components/theme-toggle";
import { Stagger, StaggerItem } from "@/components/ui/stagger";
import { Magnetic } from "@/components/ui/magnetic";
import { GlassCard } from "@/components/ui/glass-card";
import { PostresDecor } from "@/components/decor/PostresDecor";

export default function LoginPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailDeUsuario(usuario),
        password,
      });
      if (error) {
        setMsg({ ok: false, text: "Usuario o contraseña incorrectos." });
        setLoading(false);
        return;
      }
      // Si la cuenta está vencida/inactiva, el middleware lo enviará a /expirado.
      try {
        const meta = (data.user?.app_metadata ?? {}) as Record<string, unknown>;
        const nombre =
          (typeof meta.username === "string" && meta.username) ||
          (data.user?.user_metadata?.name as string | undefined) ||
          usuario;
        sessionStorage.setItem("ac_welcome_name", nombre);
        sessionStorage.removeItem("ac_welcome_seen");
      } catch {}
      setMsg({ ok: true, text: "Sesión iniciada. Redirigiendo…" });
      router.refresh();
      router.push("/");
    } catch {
      setMsg({ ok: false, text: "No se pudo conectar." });
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between p-4">
        <Link
          href="/"
          className="flex items-center gap-2 font-display text-lg font-semibold"
        >
          🍮 Azúcar <span className="text-primary">&amp;</span> Canela
        </Link>
        <ThemeToggle />
      </header>

      <main className="relative flex flex-1 items-center justify-center overflow-hidden px-4 py-10">
        <PostresDecor />
        <Stagger className="relative z-10 w-full max-w-sm">
          <Magnetic strength={0.12} glow={false}>
            <GlassCard className="p-7">
              <StaggerItem>
                <h1 className="font-display text-2xl font-bold">
                  Iniciar sesión
                </h1>
                <p className="mt-1 text-sm text-muted">
                  Accede al panel de tu repostería.
                </p>
              </StaggerItem>

              <form onSubmit={onSubmit} className="mt-6 space-y-4">
                <StaggerItem className="space-y-1.5">
                  <label htmlFor="usuario" className="text-sm font-medium">
                    Usuario
                  </label>
                  <input
                    id="usuario"
                    type="text"
                    autoCapitalize="none"
                    autoComplete="username"
                    required
                    value={usuario}
                    onChange={(e) => setUsuario(e.target.value)}
                    placeholder="tu usuario"
                    className="w-full rounded-xl border border-foreground/15 bg-background/60 px-3 py-2.5 text-sm outline-none backdrop-blur transition-colors focus:border-primary"
                  />
                </StaggerItem>

                <StaggerItem className="space-y-1.5">
                  <label htmlFor="password" className="text-sm font-medium">
                    Contraseña
                  </label>
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-foreground/15 bg-background/60 px-3 py-2.5 text-sm outline-none backdrop-blur transition-colors focus:border-primary"
                  />
                </StaggerItem>

                <StaggerItem>
                  <Magnetic strength={0.2}>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow transition-opacity hover:opacity-95 disabled:opacity-60"
                    >
                      {loading ? "Entrando…" : "Entrar"}
                    </button>
                  </Magnetic>
                </StaggerItem>
              </form>

              {msg && (
                <div className="mt-4 rounded-xl border border-foreground/10 bg-foreground/[0.04] px-3 py-2 text-sm">
                  {msg.ok ? "✅ " : "⚠️ "}
                  {msg.text}
                </div>
              )}

              <StaggerItem>
                <p className="mt-6 text-center text-xs text-muted">
                  ←{" "}
                  <Link href="/" className="underline">
                    Volver al panel
                  </Link>
                </p>
              </StaggerItem>
            </GlassCard>
          </Magnetic>
        </Stagger>
      </main>
    </div>
  );
}
