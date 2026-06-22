"use client";

import { useMemo, useState } from "react";
import { Stagger, StaggerItem } from "@/components/ui/stagger";
import { Magnetic } from "@/components/ui/magnetic";
import { GlassCard } from "@/components/ui/glass-card";
import { Modal } from "@/components/ui/modal";
import { CountUp } from "@/components/ui/count-up";
import { fmtRD } from "@/lib/data/mock";
import {
  COMPRAS,
  INVENTARIO,
  MERMAS,
  diasParaVencer,
  estadoStock,
  porVencer,
} from "@/lib/data/inventario";
import type { CategoriaInv, ItemInventario } from "@/lib/data/inventario";

type Filtro = "Todos" | CategoriaInv;

export function InventarioView() {
  const [filtro, setFiltro] = useState<Filtro>("Todos");
  const [sel, setSel] = useState<ItemInventario | null>(null);

  const lista = useMemo(
    () => INVENTARIO.filter((i) => filtro === "Todos" || i.categoria === filtro),
    [filtro],
  );

  const bajos = INVENTARIO.filter((i) => estadoStock(i) === "bajo").length;
  const vencen = INVENTARIO.filter((i) => porVencer(i)).length;

  const FILTROS: Filtro[] = ["Todos", "Insumo", "Empaque", "Decoración"];

  return (
    <>
      <Stagger className="mx-auto max-w-5xl space-y-6">
        <StaggerItem>
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Inventario
          </h1>
          <p className="mt-1 text-sm text-muted">
            Ingredientes, empaques y decoración
          </p>
        </StaggerItem>

        {/* KPIs */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Artículos", value: INVENTARIO.length, cls: "text-foreground" },
            { label: "Stock bajo", value: bajos, cls: "text-red-600 dark:text-red-400" },
            { label: "Por vencer", value: vencen, cls: "text-amber-600 dark:text-amber-400" },
          ].map((k) => (
            <StaggerItem key={k.label}>
              <GlassCard className="p-4 sm:p-5">
                <p className="text-xs font-medium text-muted">{k.label}</p>
                <p className={`mt-2 text-2xl font-bold tabular-nums ${k.cls}`}>
                  <CountUp value={k.value} />
                </p>
              </GlassCard>
            </StaggerItem>
          ))}
        </div>

        {/* Filtro */}
        <StaggerItem>
          <div className="inline-flex flex-wrap gap-1 rounded-xl border border-foreground/10 bg-glass/50 p-1 backdrop-blur">
            {FILTROS.map((f) => (
              <button
                key={f}
                onClick={() => setFiltro(f)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  filtro === f
                    ? "bg-primary text-primary-foreground"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </StaggerItem>

        {/* Lista */}
        <Stagger className="grid gap-3 sm:grid-cols-2">
          {lista.map((i) => {
            const bajo = estadoStock(i) === "bajo";
            const venc = porVencer(i);
            return (
              <StaggerItem key={i.id}>
                <Magnetic strength={0.08} glow={false}>
                  <button
                    onClick={() => setSel(i)}
                    className="flex w-full items-center gap-3 rounded-2xl border border-foreground/5 bg-foreground/[0.03] p-4 text-left transition-colors hover:border-primary/30"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="truncate font-medium">{i.nombre}</span>
                        {bajo && (
                          <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-semibold text-red-600 dark:text-red-400">
                            Stock bajo
                          </span>
                        )}
                        {venc && (
                          <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                            Por vencer
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted">{i.categoria} · {i.proveedor}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className={`tabular-nums font-semibold ${bajo ? "text-red-600 dark:text-red-400" : ""}`}>
                        {i.stock} {i.unidad}
                      </p>
                      <p className="text-[10px] text-muted">mín. {i.minimo}</p>
                    </div>
                  </button>
                </Magnetic>
              </StaggerItem>
            );
          })}
        </Stagger>

        {/* Compras + Mermas */}
        <div className="grid gap-6 lg:grid-cols-2">
          <StaggerItem>
            <GlassCard className="p-5">
              <h2 className="mb-4 font-display text-lg font-semibold">Compras recientes</h2>
              <div className="space-y-2">
                {COMPRAS.map((c, idx) => (
                  <div key={idx} className="flex items-center justify-between rounded-lg border border-foreground/5 bg-foreground/[0.03] px-3 py-2 text-sm">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{c.item}</p>
                      <p className="truncate text-xs text-muted">{c.proveedor} · {c.cantidad} · {c.fecha}</p>
                    </div>
                    <span className="tabular-nums font-medium">{fmtRD(c.costo)}</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </StaggerItem>

          <StaggerItem>
            <GlassCard className="p-5">
              <h2 className="mb-4 font-display text-lg font-semibold">Mermas y desperdicios</h2>
              <div className="space-y-2">
                {MERMAS.map((m, idx) => (
                  <div key={idx} className="flex items-center justify-between rounded-lg border border-foreground/5 bg-foreground/[0.03] px-3 py-2 text-sm">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{m.item}</p>
                      <p className="truncate text-xs text-muted">{m.motivo} · {m.fecha}</p>
                    </div>
                    <span className="shrink-0 text-xs text-muted">{m.cantidad}</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </StaggerItem>
        </div>
      </Stagger>

      {/* Detalle */}
      <Modal
        open={sel !== null}
        onClose={() => setSel(null)}
        title={sel?.nombre ?? ""}
        subtitle={sel ? sel.categoria : undefined}
      >
        {sel && <DetalleItem item={sel} />}
      </Modal>
    </>
  );
}

function DetalleItem({ item }: { item: ItemInventario }) {
  const bajo = estadoStock(item) === "bajo";
  const dias = diasParaVencer(item);
  const compras = COMPRAS.filter((c) => c.item === item.nombre);
  const mermas = MERMAS.filter((m) => m.item === item.nombre);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl border border-foreground/10 bg-foreground/[0.03] p-3">
          <p className="text-xs text-muted">Stock</p>
          <p className={`tabular-nums font-semibold ${bajo ? "text-red-600 dark:text-red-400" : ""}`}>
            {item.stock} {item.unidad}
          </p>
        </div>
        <div className="rounded-xl border border-foreground/10 bg-foreground/[0.03] p-3">
          <p className="text-xs text-muted">Mínimo</p>
          <p className="tabular-nums font-semibold">{item.minimo}</p>
        </div>
        <div className="rounded-xl border border-foreground/10 bg-foreground/[0.03] p-3">
          <p className="text-xs text-muted">Vence</p>
          <p className="tabular-nums font-semibold">
            {item.vencimiento ?? "—"}
          </p>
        </div>
      </div>

      {bajo && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">
          ⚠️ Stock por debajo del mínimo. Conviene reabastecer.
        </div>
      )}
      {dias !== null && dias <= 21 && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-600 dark:text-amber-400">
          ⏳ Vence en {dias} días.
        </div>
      )}

      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between border-b border-foreground/5 pb-2">
          <span className="text-muted">Proveedor</span>
          <span className="font-medium">{item.proveedor}</span>
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium text-muted">Compras de este artículo</p>
        {compras.length === 0 ? (
          <p className="text-sm text-muted">Sin compras recientes registradas.</p>
        ) : (
          <div className="space-y-1.5">
            {compras.map((c, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border border-foreground/5 bg-foreground/[0.03] px-3 py-2 text-sm">
                <span className="text-muted">{c.fecha} · {c.cantidad}</span>
                <span className="tabular-nums font-medium">{fmtRD(c.costo)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {mermas.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium text-muted">Mermas</p>
          <div className="space-y-1.5">
            {mermas.map((m, i) => (
              <div key={i} className="rounded-lg border border-foreground/5 bg-foreground/[0.03] px-3 py-2 text-sm">
                {m.fecha} · {m.cantidad} · <span className="text-muted">{m.motivo}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
