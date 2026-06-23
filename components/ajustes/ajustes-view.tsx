"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Stagger, StaggerItem } from "@/components/ui/stagger";
import { Magnetic } from "@/components/ui/magnetic";
import { GlassCard } from "@/components/ui/glass-card";

const inputCls =
  "w-full rounded-xl border border-foreground/15 bg-background/60 px-3 py-2.5 text-sm outline-none backdrop-blur transition-colors focus:border-primary";

export function AjustesView({ usuario }: { usuario: string }) {
  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (pw1.length < 6) {
      setMsg({ ok: false, text: "La contraseña debe tener al menos 6 caracteres." });
      return;
    }
    if (pw1 !== pw2) {
      setMsg({ ok: false, text: "Las contraseñas no coinciden." });
      return;
    }
    setSaving(true);
    const { error } = await createClient().auth.updateUser({ password: pw1 });
    setSaving(false);
    if (error) {
      setMsg({ ok: false, text: error.message });
      return;
    }
    setPw1("");
    setPw2("");
    setMsg({
      ok: true,
      text: "Contraseña actualizada. Úsala la próxima vez que inicies sesión.",
    });
  }

  return (
    <Stagger className="mx-auto max-w-2xl space-y-6">
      <StaggerItem>
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Ajustes
        </h1>
        <p className="mt-1 text-sm text-muted">
          Tu cuenta: <span className="font-medium text-foreground">{usuario}</span>
        </p>
      </StaggerItem>

      <StaggerItem>
        <GlassCard className="p-5">
          <h2 className="mb-1 font-display text-lg font-semibold">
            Cambiar contraseña
          </h2>
          <p className="mb-4 text-sm text-muted">
            Elige una contraseña privada. No la compartas con nadie.
          </p>

          <form onSubmit={submit} className="space-y-4">
            {/* Usuario oculto para los gestores de contraseñas */}
            <input
              type="text"
              name="username"
              autoComplete="username"
              value={usuario}
              readOnly
              className="hidden"
            />
            <label className="block space-y-1.5">
              <span className="text-sm font-medium">Nueva contraseña</span>
              <input
                type="password"
                autoComplete="new-password"
                className={inputCls}
                value={pw1}
                onChange={(e) => setPw1(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium">Repetir contraseña</span>
              <input
                type="password"
                autoComplete="new-password"
                className={inputCls}
                value={pw2}
                onChange={(e) => setPw2(e.target.value)}
                placeholder="Repite la nueva contraseña"
                required
              />
            </label>

            {msg && (
              <div
                className={`rounded-xl border px-3 py-2 text-sm ${
                  msg.ok
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                    : "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400"
                }`}
              >
                {msg.ok ? "✅ " : "⚠️ "}
                {msg.text}
              </div>
            )}

            <Magnetic strength={0.18}>
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-60"
              >
                {saving ? "Guardando…" : "Cambiar contraseña"}
              </button>
            </Magnetic>
          </form>
        </GlassCard>
      </StaggerItem>
    </Stagger>
  );
}
