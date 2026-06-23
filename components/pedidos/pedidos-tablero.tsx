"use client";

import { useMemo } from "react";
import { Stagger, StaggerItem } from "@/components/ui/stagger";
import { Magnetic } from "@/components/ui/magnetic";
import { GlassCard } from "@/components/ui/glass-card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { fmtRD } from "@/lib/data/mock";
import { CAPACIDAD } from "@/lib/data/produccion";
import type { EstadoPedido, Pedido } from "@/lib/pedidos/types";

/** Reposteros para asignación visual (round-robin) en el tablero. */
const REPOSTEROS = ["Johann Marien", "Yenny Castillo", "Luis Brito"];

const COLUMNAS: { estado: EstadoPedido; label: string; dot: string }[] = [
  { estado: "pendiente", label: "En cola", dot: "bg-amber-500" },
  { estado: "en_proceso", label: "En proceso", dot: "bg-sky-500" },
  { estado: "listo", label: "Listo", dot: "bg-emerald-500" },
];

/**
 * Tablero (kanban) de producción DENTRO de Pedidos. Reemplaza al antiguo
 * módulo "Producción": muestra los pedidos reales por estado en columnas
 * (En cola → En proceso → Listo). Tocar una tarjeta abre el detalle del
 * pedido, donde se cambia el estado (mueve la tarjeta de columna).
 */
export function PedidosTablero({
  pedidos,
  onAbrir,
}: {
  pedidos: Pedido[];
  onAbrir: (p: Pedido) => void;
}) {
  // Mapa estable pedido.id → repostero (solo presentación).
  const repostero = useMemo(() => {
    const m = new Map<string, string>();
    pedidos
      .filter((p) => p.estado !== "entregado")
      .forEach((p, i) => m.set(p.id, REPOSTEROS[i % REPOSTEROS.length]));
    return m;
  }, [pedidos]);

  const activos = pedidos.filter((p) => p.estado !== "entregado");
  const listos = activos.filter((p) => p.estado === "listo").length;
  const enColaHoy = activos.length;
  const capPct = Math.round((CAPACIDAD.usada / CAPACIDAD.maxima) * 100);

  return (
    <div className="space-y-6">
      {/* Capacidad del día + listos (lo único que aportaba Producción) */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StaggerItem className="sm:col-span-2">
          <GlassCard className="p-5">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">
                Capacidad del día
              </h2>
              <span className="tabular-nums text-sm text-muted">
                {CAPACIDAD.usada} / {CAPACIDAD.maxima} pedidos
              </span>
            </div>
            <ProgressBar value={capPct} label="Uso de capacidad" />
            {capPct >= 80 && (
              <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                ⚠️ Capacidad casi al tope. Cuidado al aceptar más pedidos para
                hoy.
              </p>
            )}
          </GlassCard>
        </StaggerItem>
        <StaggerItem>
          <GlassCard className="flex flex-col justify-center p-5">
            <p className="text-xs font-medium text-muted">En producción 🔔</p>
            <p className="mt-1 text-3xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
              {listos}
              <span className="text-base font-medium text-muted">
                {" "}
                listos / {enColaHoy}
              </span>
            </p>
          </GlassCard>
        </StaggerItem>
      </div>

      {/* Tablero */}
      <div className="grid gap-4 md:grid-cols-3">
        {COLUMNAS.map((col) => {
          const items = activos.filter((p) => p.estado === col.estado);
          return (
            <StaggerItem key={col.estado}>
              <GlassCard className="p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="flex items-center gap-2 font-display font-semibold">
                    <span className={`h-2 w-2 rounded-full ${col.dot}`} />
                    {col.label}
                  </h3>
                  <span className="rounded-full bg-foreground/10 px-2 py-0.5 text-xs tabular-nums text-muted">
                    {items.length}
                  </span>
                </div>
                <Stagger className="space-y-2">
                  {items.map((p) => (
                    <StaggerItem key={p.id}>
                      <Magnetic strength={0.1} glow={false}>
                        <button
                          onClick={() => onAbrir(p)}
                          className="w-full rounded-xl border border-foreground/5 bg-foreground/[0.03] p-3 text-left transition-colors hover:border-primary/30"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="truncate font-medium">
                              {p.items[0]?.producto ??
                                p.descripcion ??
                                "Pedido"}
                            </span>
                            <span className="shrink-0 text-xs text-muted">
                              #{p.numero}
                            </span>
                          </div>
                          <p className="truncate text-xs text-muted">
                            {p.cliente?.nombre ?? "Cliente"}
                            {p.hora_entrega ? ` · ${p.hora_entrega}` : ""}
                          </p>
                          <div className="mt-1 flex items-center justify-between gap-2">
                            <p className="truncate text-xs text-muted">
                              👨‍🍳 {repostero.get(p.id) ?? REPOSTEROS[0]}
                            </p>
                            <span className="shrink-0 tabular-nums text-xs font-medium">
                              {fmtRD(p.total)}
                            </span>
                          </div>
                        </button>
                      </Magnetic>
                    </StaggerItem>
                  ))}
                  {items.length === 0 && (
                    <p className="py-4 text-center text-xs text-muted">
                      Sin pedidos
                    </p>
                  )}
                </Stagger>
              </GlassCard>
            </StaggerItem>
          );
        })}
      </div>

      <p className="text-center text-xs text-muted">
        Toca una tarjeta para ver el pedido y cambiar su estado. Los pedidos
        entregados salen del tablero.
      </p>
    </div>
  );
}
