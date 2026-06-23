"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Stagger, StaggerItem } from "@/components/ui/stagger";
import { Magnetic } from "@/components/ui/magnetic";
import { GlassCard } from "@/components/ui/glass-card";
import { Modal } from "@/components/ui/modal";
import { SearchInput, Chips } from "@/components/ui/controls";
import { fmtRD } from "@/lib/data/mock";
import { RECETAS, costoReceta, margenReceta } from "@/lib/data/recetas";
import type { Receta } from "@/lib/data/recetas";

type FiltroMargen = "todos" | "alto" | "medio" | "bajo";

function margenCls(m: number) {
  if (m >= 60) return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400";
  if (m >= 40) return "bg-amber-500/15 text-amber-600 dark:text-amber-400";
  return "bg-red-500/15 text-red-600 dark:text-red-400";
}

export function RecetasView() {
  const [sel, setSel] = useState<Receta | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState<FiltroMargen>("todos");

  const lista = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return RECETAS.filter((r) => {
      const m = margenReceta(r);
      const banda =
        filtro === "todos" ||
        (filtro === "alto" && m >= 60) ||
        (filtro === "medio" && m >= 40 && m < 60) ||
        (filtro === "bajo" && m < 40);
      const match =
        !q ||
        r.nombre.toLowerCase().includes(q) ||
        r.ingredientes.some((i) => i.nombre.toLowerCase().includes(q));
      return banda && match;
    });
  }, [busqueda, filtro]);

  const FILTROS: { id: FiltroMargen; label: string; dot?: string }[] = [
    { id: "todos", label: "Todos" },
    { id: "alto", label: "Margen alto", dot: "bg-emerald-500" },
    { id: "medio", label: "Medio", dot: "bg-amber-500" },
    { id: "bajo", label: "Bajo", dot: "bg-red-500" },
  ];

  return (
    <>
      <Stagger className="mx-auto max-w-5xl space-y-5">
        <StaggerItem>
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Recetas
          </h1>
          <p className="mt-1 text-sm text-muted">
            Costos, rendimiento y margen por receta
          </p>
        </StaggerItem>

        <StaggerItem>
          <div className="space-y-3">
            <SearchInput
              value={busqueda}
              onChange={setBusqueda}
              placeholder="Buscar receta o ingrediente…"
            />
            <Chips options={FILTROS} value={filtro} onChange={setFiltro} />
          </div>
        </StaggerItem>

        {lista.length === 0 && (
          <StaggerItem>
            <GlassCard className="p-10 text-center text-sm text-muted">
              No hay recetas que coincidan.
            </GlassCard>
          </StaggerItem>
        )}

        <Stagger className="grid gap-3 sm:grid-cols-2">
          {lista.map((r) => {
            const costo = costoReceta(r);
            const margen = margenReceta(r);
            return (
              <StaggerItem key={r.id}>
                <Magnetic strength={0.08} glow={false}>
                  <button
                    onClick={() => setSel(r)}
                    className="flex w-full items-center gap-3 rounded-2xl border border-foreground/5 bg-foreground/[0.03] p-4 text-left transition-colors hover:border-primary/30"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-2xl">
                      {r.emoji}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{r.nombre}</p>
                      <p className="truncate text-xs text-muted">
                        {r.rendimiento} · costo {fmtRD(costo)}
                      </p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${margenCls(margen)}`}>
                      {margen}%
                    </span>
                  </button>
                </Magnetic>
              </StaggerItem>
            );
          })}
        </Stagger>
      </Stagger>

      <Modal
        open={sel !== null}
        onClose={() => setSel(null)}
        title={sel?.nombre ?? ""}
        subtitle={sel ? `Rinde ${sel.rendimiento}` : undefined}
      >
        {sel && (
          <div className="space-y-5">
            <div>
              <p className="mb-2 text-xs font-medium text-muted">Ingredientes</p>
              <div className="space-y-1.5">
                {sel.ingredientes.map((i) => (
                  <div
                    key={i.nombre}
                    className="flex items-center justify-between rounded-lg border border-foreground/5 bg-foreground/[0.03] px-3 py-2 text-sm"
                  >
                    <span>
                      {i.nombre} <span className="text-muted">· {i.cantidad}</span>
                    </span>
                    <span className="tabular-nums font-medium">{fmtRD(i.costo)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl border border-foreground/10 bg-foreground/[0.03] p-3">
                <p className="text-xs text-muted">Costo</p>
                <p className="tabular-nums font-semibold">{fmtRD(costoReceta(sel))}</p>
              </div>
              <div className="rounded-xl border border-foreground/10 bg-foreground/[0.03] p-3">
                <p className="text-xs text-muted">Precio venta</p>
                <p className="tabular-nums font-semibold text-primary">{fmtRD(sel.precioVenta)}</p>
              </div>
              <div className="rounded-xl border border-foreground/10 bg-foreground/[0.03] p-3">
                <p className="text-xs text-muted">Margen</p>
                <p className="tabular-nums font-semibold text-emerald-600 dark:text-emerald-400">
                  {margenReceta(sel)}%
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-foreground/10 bg-primary/[0.06] p-3 text-sm">
              <p className="mb-1 text-xs font-medium text-muted">Precio sugerido</p>
              Con un margen saludable (~60%), el precio sugerido sería{" "}
              <span className="font-semibold tabular-nums">
                {fmtRD(Math.round((costoReceta(sel) / 0.4) / 50) * 50)}
              </span>
              .
            </div>

            {/* Organismo: una receta ≈ un producto del catálogo; sus
                ingredientes salen del stock de Insumos. */}
            <div className="flex flex-wrap gap-2">
              <Link
                href="/catalogo"
                className="flex-1 rounded-xl border border-foreground/15 bg-glass/60 px-3 py-2 text-center text-sm font-medium backdrop-blur transition-colors hover:border-primary/40"
              >
                🍰 Ver en Catálogo
              </Link>
              <Link
                href="/inventario"
                className="flex-1 rounded-xl border border-foreground/15 bg-glass/60 px-3 py-2 text-center text-sm font-medium backdrop-blur transition-colors hover:border-primary/40"
              >
                📦 Ingredientes en Inventario
              </Link>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
