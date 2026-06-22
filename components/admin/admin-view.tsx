"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Stagger, StaggerItem } from "@/components/ui/stagger";
import { Magnetic } from "@/components/ui/magnetic";
import { GlassCard } from "@/components/ui/glass-card";
import { Modal } from "@/components/ui/modal";
import {
  cambiarActivoCuenta,
  crearCuenta,
  renovarCuenta,
} from "@/app/(app)/admin/actions";
import { diasRestantes, estaVencida, type Cuenta } from "@/lib/cuentas/types";

const inputCls =
  "w-full rounded-xl border border-foreground/15 bg-background/60 px-3 py-2.5 text-sm outline-none backdrop-blur transition-colors focus:border-primary";

const RAPIDOS: { label: string; dias: number | null }[] = [
  { label: "7 días", dias: 7 },
  { label: "15 días", dias: 15 },
  { label: "30 días", dias: 30 },
  { label: "Sin vencimiento", dias: null },
];

export function AdminView({ initial }: { initial: Cuenta[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  // Formulario crear
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [dias, setDias] = useState<number | null>(7);
  const [custom, setCustom] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Renovar
  const [renovar, setRenovar] = useState<Cuenta | null>(null);
  const [renovarDias, setRenovarDias] = useState(7);

  function refrescar() {
    router.refresh();
  }

  async function onCrear(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setOkMsg(null);
    setSaving(true);
    const res = await crearCuenta({ username, password, dias });
    if (!res.ok) {
      setError(res.error);
    } else {
      setOkMsg(`Cuenta "${username}" creada.`);
      setUsername("");
      setPassword("");
      refrescar();
    }
    setSaving(false);
  }

  function aplicarRenovar() {
    if (!renovar) return;
    startTransition(async () => {
      await renovarCuenta(renovar.id, renovarDias);
      setRenovar(null);
      refrescar();
    });
  }

  function toggleActivo(c: Cuenta) {
    startTransition(async () => {
      await cambiarActivoCuenta(c.id, !c.activo);
      refrescar();
    });
  }

  const clientes = initial.filter((c) => c.rol === "cliente");

  return (
    <>
      <Stagger className="mx-auto max-w-5xl space-y-6">
        <StaggerItem>
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Accesos
          </h1>
          <p className="mt-1 text-sm text-muted">
            Crea y administra accesos temporales de clientes
          </p>
        </StaggerItem>

        {/* Crear cuenta */}
        <StaggerItem>
          <GlassCard className="p-5">
            <h2 className="mb-4 font-display text-lg font-semibold">
              Nueva cuenta de cliente
            </h2>
            <form onSubmit={onCrear} className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block space-y-1.5">
                  <span className="text-sm font-medium">Usuario</span>
                  <input
                    className={inputCls}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="ej. cliente-demo"
                    autoCapitalize="none"
                    required
                  />
                </label>
                <label className="block space-y-1.5">
                  <span className="text-sm font-medium">Contraseña</span>
                  <input
                    className={inputCls}
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="mínimo 6 caracteres"
                    required
                  />
                </label>
              </div>

              <div className="space-y-2">
                <span className="text-sm font-medium">Duración del acceso</span>
                <div className="flex flex-wrap gap-2">
                  {RAPIDOS.map((r) => (
                    <button
                      key={r.label}
                      type="button"
                      onClick={() => {
                        setDias(r.dias);
                        setCustom("");
                      }}
                      className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                        dias === r.dias && custom === ""
                          ? "bg-primary text-primary-foreground"
                          : "border border-foreground/15 bg-glass/60 text-muted"
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min={1}
                      value={custom}
                      onChange={(e) => {
                        setCustom(e.target.value);
                        const n = Number(e.target.value);
                        setDias(Number.isFinite(n) && n > 0 ? n : null);
                      }}
                      placeholder="otros…"
                      className={`${inputCls} w-24`}
                    />
                    <span className="text-sm text-muted">días</span>
                  </div>
                </div>
                <p className="text-xs text-muted">
                  {dias === null
                    ? "Acceso sin vencimiento."
                    : `Vence en ${dias} día(s) desde hoy.`}
                </p>
              </div>

              {error && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">
                  ⚠️ {error}
                </div>
              )}
              {okMsg && (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-400">
                  ✅ {okMsg}
                </div>
              )}

              <Magnetic strength={0.18}>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-60"
                >
                  {saving ? "Creando…" : "Crear cuenta"}
                </button>
              </Magnetic>
            </form>
          </GlassCard>
        </StaggerItem>

        {/* Lista de cuentas */}
        <StaggerItem>
          <GlassCard className="p-5">
            <h2 className="mb-4 font-display text-lg font-semibold">
              Cuentas de cliente ({clientes.length})
            </h2>
            {clientes.length === 0 ? (
              <p className="text-sm text-muted">Aún no has creado cuentas.</p>
            ) : (
              <Stagger className="space-y-2">
                {clientes.map((c) => {
                  const dias = diasRestantes(c.expira_at);
                  const vencida = estaVencida(c);
                  return (
                    <StaggerItem key={c.id}>
                      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-foreground/5 bg-foreground/[0.03] p-3">
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">{c.username}</p>
                          <p className="text-xs text-muted">
                            {c.expira_at === null
                              ? "Sin vencimiento"
                              : dias !== null && dias > 0
                                ? `${dias} día(s) restante(s)`
                                : "Vencida"}
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            !c.activo
                              ? "bg-foreground/10 text-muted"
                              : vencida
                                ? "bg-red-500/15 text-red-600 dark:text-red-400"
                                : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                          }`}
                        >
                          {!c.activo ? "Desactivada" : vencida ? "Vencida" : "Activa"}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setRenovar(c);
                              setRenovarDias(7);
                            }}
                            className="rounded-lg border border-foreground/15 bg-glass/60 px-3 py-1.5 text-xs font-medium"
                          >
                            Renovar
                          </button>
                          <button
                            disabled={pending}
                            onClick={() => toggleActivo(c)}
                            className="rounded-lg border border-foreground/15 bg-glass/60 px-3 py-1.5 text-xs font-medium disabled:opacity-60"
                          >
                            {c.activo ? "Desactivar" : "Activar"}
                          </button>
                        </div>
                      </div>
                    </StaggerItem>
                  );
                })}
              </Stagger>
            )}
          </GlassCard>
        </StaggerItem>
      </Stagger>

      {/* Modal renovar */}
      <Modal
        open={renovar !== null}
        onClose={() => setRenovar(null)}
        title="Renovar acceso"
        subtitle={renovar?.username}
      >
        {renovar && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {[7, 15, 30].map((d) => (
                <button
                  key={d}
                  onClick={() => setRenovarDias(d)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    renovarDias === d
                      ? "bg-primary text-primary-foreground"
                      : "border border-foreground/15 bg-glass/60 text-muted"
                  }`}
                >
                  +{d} días
                </button>
              ))}
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={1}
                  value={renovarDias}
                  onChange={(e) => setRenovarDias(Number(e.target.value) || 0)}
                  className={`${inputCls} w-24`}
                />
                <span className="text-sm text-muted">días</span>
              </div>
            </div>
            <p className="text-xs text-muted">
              Se suman a partir de {renovar.expira_at && diasRestantes(renovar.expira_at)! > 0 ? "la fecha de vencimiento actual" : "hoy"}.
            </p>
            <button
              disabled={pending || renovarDias <= 0}
              onClick={aplicarRenovar}
              className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-60"
            >
              {pending ? "Renovando…" : `Renovar +${renovarDias} días`}
            </button>
          </div>
        )}
      </Modal>
    </>
  );
}
