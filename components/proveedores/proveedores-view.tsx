"use client";

import { useState } from "react";
import { Stagger, StaggerItem } from "@/components/ui/stagger";
import { Magnetic } from "@/components/ui/magnetic";
import { GlassCard } from "@/components/ui/glass-card";
import { Modal } from "@/components/ui/modal";
import { CountUp } from "@/components/ui/count-up";
import { fmtRD } from "@/lib/data/mock";
import { COMPARATIVA, PROVEEDORES } from "@/lib/data/proveedores";
import type { EstadoOrden, Proveedor } from "@/lib/data/proveedores";

const ORDEN_CLS: Record<EstadoOrden, string> = {
  pendiente: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  recibida: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  cancelada: "bg-foreground/10 text-muted",
};

export function ProveedoresView({ embedded = false }: { embedded?: boolean }) {
  const [sel, setSel] = useState<Proveedor | null>(null);

  const pendientes = PROVEEDORES.filter((p) => p.pagos === "pendiente").length;
  const porPagar = PROVEEDORES.reduce((s, p) => s + p.balancePendiente, 0);

  return (
    <>
      <Stagger className={embedded ? "space-y-6" : "mx-auto max-w-5xl space-y-6"}>
        {!embedded && (
          <StaggerItem>
            <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Proveedores
            </h1>
            <p className="mt-1 text-sm text-muted">
              Compras, pagos y órdenes de compra
            </p>
          </StaggerItem>
        )}

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Proveedores", value: PROVEEDORES.length, prefix: "", cls: "text-foreground" },
            { label: "Con pago pendiente", value: pendientes, prefix: "", cls: "text-amber-600 dark:text-amber-400" },
            { label: "Por pagar", value: porPagar, prefix: "RD$ ", cls: "text-primary" },
          ].map((k) => (
            <StaggerItem key={k.label}>
              <GlassCard className="p-4 sm:p-5">
                <p className="text-xs font-medium text-muted">{k.label}</p>
                <p className={`mt-2 text-xl font-bold tabular-nums sm:text-2xl ${k.cls}`}>
                  <CountUp value={k.value} prefix={k.prefix} />
                </p>
              </GlassCard>
            </StaggerItem>
          ))}
        </div>

        <Stagger className="grid gap-3 sm:grid-cols-2">
          {PROVEEDORES.map((p) => (
            <StaggerItem key={p.id}>
              <Magnetic strength={0.08} glow={false}>
                <button
                  onClick={() => setSel(p)}
                  className="flex w-full items-center gap-3 rounded-2xl border border-foreground/5 bg-foreground/[0.03] p-4 text-left transition-colors hover:border-primary/30"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/15 font-display text-lg font-semibold text-primary">
                    {p.nombre.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{p.nombre}</p>
                    <p className="truncate text-xs text-muted">{p.categoria} · {p.telefono}</p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      p.pagos === "al_dia"
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                        : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                    }`}
                  >
                    {p.pagos === "al_dia" ? "Al día" : "Pendiente"}
                  </span>
                </button>
              </Magnetic>
            </StaggerItem>
          ))}
        </Stagger>

        {/* Comparativa de precios */}
        <StaggerItem>
          <GlassCard className="p-5">
            <h2 className="mb-4 font-display text-lg font-semibold">
              Comparación de precios
            </h2>
            <div className="space-y-4">
              {COMPARATIVA.map((c) => {
                const min = Math.min(...c.opciones.map((o) => o.precio));
                return (
                  <div key={c.producto}>
                    <p className="mb-1.5 text-sm font-medium">{c.producto}</p>
                    <div className="flex flex-wrap gap-2">
                      {c.opciones.map((o) => (
                        <span
                          key={o.proveedor}
                          className={`rounded-lg border px-2.5 py-1 text-xs ${
                            o.precio === min
                              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : "border-foreground/10 text-muted"
                          }`}
                        >
                          {o.proveedor}: <span className="tabular-nums font-medium">{fmtRD(o.precio)}</span>
                          {o.precio === min ? " ✓" : ""}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </StaggerItem>
      </Stagger>

      <Modal
        open={sel !== null}
        onClose={() => setSel(null)}
        title={sel?.nombre ?? ""}
        subtitle={sel ? sel.categoria : undefined}
      >
        {sel && (
          <div className="space-y-5">
            <div className="space-y-2 text-sm">
              <Campo label="Contacto" valor={sel.contacto} />
              <Campo label="Teléfono" valor={sel.telefono} />
              <Campo
                label="Estado de pago"
                valor={sel.pagos === "al_dia" ? "Al día" : `Pendiente · ${fmtRD(sel.balancePendiente)}`}
              />
            </div>

            <div>
              <p className="mb-2 text-xs font-medium text-muted">Historial de compras</p>
              <div className="space-y-1.5">
                {sel.compras.map((c, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border border-foreground/5 bg-foreground/[0.03] px-3 py-2 text-sm">
                    <span className="min-w-0 truncate">{c.fecha} · {c.item}</span>
                    <span className="tabular-nums font-medium">{fmtRD(c.monto)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-medium text-muted">Órdenes de compra</p>
              <div className="space-y-1.5">
                {sel.ordenes.map((o) => (
                  <div key={o.id} className="flex items-center justify-between rounded-lg border border-foreground/5 bg-foreground/[0.03] px-3 py-2 text-sm">
                    <span className="min-w-0 truncate">{o.descripcion}</span>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${ORDEN_CLS[o.estado]}`}>
                        {o.estado}
                      </span>
                      <span className="tabular-nums font-medium">{fmtRD(o.monto)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

function Campo({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-foreground/5 pb-2">
      <span className="text-muted">{label}</span>
      <span className="text-right font-medium">{valor}</span>
    </div>
  );
}
