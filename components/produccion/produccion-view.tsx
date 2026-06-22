"use client";

import { useState } from "react";
import { Stagger, StaggerItem } from "@/components/ui/stagger";
import { Magnetic } from "@/components/ui/magnetic";
import { GlassCard } from "@/components/ui/glass-card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { LiveDot } from "@/components/ui/live-dot";
import { Modal } from "@/components/ui/modal";
import {
  CAPACIDAD,
  ESTADO_TAREA,
  TAREAS,
  type EstadoTarea,
  type Tarea,
} from "@/lib/data/produccion";

export type PedidoEnProceso = {
  id: string;
  numero: number;
  cliente: string;
  producto: string;
  hora: string | null;
};

const REPOSTEROS = ["Johann Marien", "Yenny Castillo", "Luis Brito"];

export function ProduccionView({
  pedidosReales,
}: {
  pedidosReales: PedidoEnProceso[];
}) {
  const [sel, setSel] = useState<Tarea | null>(null);

  // Pedidos reales "en proceso" entran al tablero como tareas (solo lectura).
  const desdePedidos: Tarea[] = pedidosReales.map((p, i) => ({
    id: `real-${p.id}`,
    producto: p.producto,
    detalle: `${p.cliente}${p.hora ? ` · ${p.hora}` : ""}`,
    repostero: REPOSTEROS[i % REPOSTEROS.length],
    estado: "proceso",
    minutos: 120,
    pedidoRef: `#${p.numero}`,
  }));

  const todas = [...desdePedidos, ...TAREAS];
  const cols: { estado: EstadoTarea; label: string }[] = [
    { estado: "cola", label: "En cola" },
    { estado: "proceso", label: "En proceso" },
    { estado: "listo", label: "Listo" },
  ];

  const capPct = Math.round((CAPACIDAD.usada / CAPACIDAD.maxima) * 100);
  const listos = todas.filter((t) => t.estado === "listo").length;

  return (
    <>
      <Stagger className="mx-auto max-w-6xl space-y-6">
        <StaggerItem>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                Producción
              </h1>
              <p className="mt-1 flex items-center gap-2 text-sm text-muted">
                <LiveDot label="Hoy" className="text-primary" /> · planificación del día
              </p>
            </div>
          </div>
        </StaggerItem>

        {/* Capacidad + listos */}
        <div className="grid gap-4 sm:grid-cols-3">
          <StaggerItem className="sm:col-span-2">
            <GlassCard className="p-5">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold">Capacidad del día</h2>
                <span className="text-sm text-muted tabular-nums">
                  {CAPACIDAD.usada} / {CAPACIDAD.maxima} pedidos
                </span>
              </div>
              <ProgressBar value={capPct} label="Uso de capacidad" />
              {capPct >= 80 && (
                <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                  ⚠️ Capacidad casi al tope. Cuidado al aceptar más pedidos para hoy.
                </p>
              )}
            </GlassCard>
          </StaggerItem>
          <StaggerItem>
            <GlassCard className="flex flex-col justify-center p-5">
              <p className="text-xs font-medium text-muted">Productos listos 🔔</p>
              <p className="mt-1 font-display text-3xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                {listos}
              </p>
            </GlassCard>
          </StaggerItem>
        </div>

        {/* Tablero */}
        <div className="grid gap-4 md:grid-cols-3">
          {cols.map((col) => {
            const items = todas.filter((t) => t.estado === col.estado);
            return (
              <StaggerItem key={col.estado}>
                <GlassCard className="p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-display font-semibold">{col.label}</h3>
                    <span className="rounded-full bg-foreground/10 px-2 py-0.5 text-xs tabular-nums text-muted">
                      {items.length}
                    </span>
                  </div>
                  <Stagger className="space-y-2">
                    {items.map((t) => (
                      <StaggerItem key={t.id}>
                        <Magnetic strength={0.1} glow={false}>
                          <button
                            onClick={() => setSel(t)}
                            className="w-full rounded-xl border border-foreground/5 bg-foreground/[0.03] p-3 text-left transition-colors hover:border-primary/30"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="truncate font-medium">{t.producto}</span>
                              {t.pedidoRef && (
                                <span className="shrink-0 text-xs text-muted">{t.pedidoRef}</span>
                              )}
                            </div>
                            <p className="truncate text-xs text-muted">{t.detalle}</p>
                            <p className="mt-1 text-xs text-muted">👨‍🍳 {t.repostero}</p>
                          </button>
                        </Magnetic>
                      </StaggerItem>
                    ))}
                    {items.length === 0 && (
                      <p className="py-4 text-center text-xs text-muted">Sin tareas</p>
                    )}
                  </Stagger>
                </GlassCard>
              </StaggerItem>
            );
          })}
        </div>
      </Stagger>

      <Modal
        open={sel !== null}
        onClose={() => setSel(null)}
        title={sel?.producto ?? ""}
        subtitle={sel?.pedidoRef ? `Pedido ${sel.pedidoRef}` : "Tarea de producción"}
      >
        {sel && (
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${ESTADO_TAREA[sel.estado].cls}`}>
                {ESTADO_TAREA[sel.estado].label}
              </span>
              <span className="text-muted">⏱️ ~{sel.minutos} min</span>
            </div>
            <Campo label="Detalle" valor={sel.detalle} />
            <Campo label="Repostero asignado" valor={sel.repostero} />
            {sel.pedidoRef && <Campo label="Pedido" valor={sel.pedidoRef} />}
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
