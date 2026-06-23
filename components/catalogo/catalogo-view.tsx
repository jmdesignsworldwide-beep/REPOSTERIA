"use client";

import { useMemo, useState } from "react";
import { Stagger, StaggerItem } from "@/components/ui/stagger";
import { Magnetic } from "@/components/ui/magnetic";
import { GlassCard } from "@/components/ui/glass-card";
import { Modal } from "@/components/ui/modal";
import { SearchInput, Chips, Segmented } from "@/components/ui/controls";
import { CATEGORIAS_CAT, PRODUCTOS, rangoPrecio } from "@/lib/data/catalogo";
import type { Producto } from "@/lib/data/catalogo";

const TONOS = [
  "from-rose-100 to-rose-200",
  "from-orange-100 to-rose-100",
  "from-rose-50 to-orange-100",
  "from-rose-100 to-amber-100",
  "from-orange-50 to-rose-100",
];

function Foto({ p, className }: { p: Producto; className?: string }) {
  return (
    <div
      className={`flex items-center justify-center bg-gradient-to-br ${
        TONOS[p.tono % TONOS.length]
      } ${className ?? ""}`}
    >
      <span className="text-5xl drop-shadow-sm">{p.emoji}</span>
    </div>
  );
}

type Filtro = "Todos" | (typeof CATEGORIAS_CAT)[number];

export function CatalogoView() {
  const [filtro, setFiltro] = useState<Filtro>("Todos");
  const [soloDisp, setSoloDisp] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [vista, setVista] = useState<"grid" | "lista">("grid");
  const [sel, setSel] = useState<Producto | null>(null);

  const lista = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return PRODUCTOS.filter(
      (p) =>
        (filtro === "Todos" || p.categoria === filtro) &&
        (!soloDisp || p.disponible) &&
        (!q ||
          p.nombre.toLowerCase().includes(q) ||
          p.categoria.toLowerCase().includes(q) ||
          p.sabores.some((s) => s.toLowerCase().includes(q))),
    );
  }, [filtro, soloDisp, busqueda]);

  const FILTROS = ["Todos", ...CATEGORIAS_CAT].map((f) => ({
    id: f as Filtro,
    label: f,
  }));

  return (
    <>
      <Stagger className="mx-auto max-w-6xl space-y-5">
        <StaggerItem>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                Catálogo
              </h1>
              <p className="mt-1 text-sm text-muted">
                {lista.length} de {PRODUCTOS.length} productos · repostería
                artesanal dominicana
              </p>
            </div>
          </div>
        </StaggerItem>

        {/* Controles */}
        <StaggerItem>
          <div className="space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <SearchInput
                value={busqueda}
                onChange={setBusqueda}
                placeholder="Buscar producto o sabor…"
              />
              <button
                onClick={() => setSoloDisp((v) => !v)}
                className={`shrink-0 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${
                  soloDisp
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-foreground/15 bg-glass/60 text-muted backdrop-blur"
                }`}
              >
                {soloDisp ? "✓ Solo disponibles" : "Solo disponibles"}
              </button>
              <Segmented
                value={vista}
                onChange={setVista}
                options={[
                  { id: "grid", label: "▦ Cuadrícula" },
                  { id: "lista", label: "☰ Lista" },
                ]}
              />
            </div>
            <Chips options={FILTROS} value={filtro} onChange={setFiltro} />
          </div>
        </StaggerItem>

        {lista.length === 0 ? (
          <StaggerItem>
            <GlassCard className="p-10 text-center text-sm text-muted">
              No hay productos que coincidan.
            </GlassCard>
          </StaggerItem>
        ) : vista === "grid" ? (
          <Stagger className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {lista.map((p) => (
              <StaggerItem key={p.id}>
                <Magnetic strength={0.1} glow={false}>
                  <button
                    onClick={() => setSel(p)}
                    className="block w-full overflow-hidden rounded-2xl border border-foreground/10 bg-glass/60 text-left shadow-card backdrop-blur-xl transition-colors hover:border-primary/30"
                  >
                    <div className="relative">
                      <Foto p={p} className="h-28 w-full" />
                      <span
                        className={`absolute right-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-semibold shadow-md ${
                          p.disponible
                            ? "bg-emerald-600 text-white"
                            : "bg-black/70 text-white"
                        }`}
                      >
                        {p.disponible ? "Disponible" : "Agotado"}
                      </span>
                      {p.temporada && (
                        <span className="absolute left-2 top-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground shadow-md">
                          {p.temporada}
                        </span>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="truncate font-medium">{p.nombre}</p>
                      <p className="text-xs text-muted">{p.categoria}</p>
                      <p className="mt-1 text-sm font-semibold tabular-nums text-primary">
                        {rangoPrecio(p)}
                      </p>
                    </div>
                  </button>
                </Magnetic>
              </StaggerItem>
            ))}
          </Stagger>
        ) : (
          <Stagger className="space-y-2">
            {lista.map((p) => (
              <StaggerItem key={p.id}>
                <button
                  onClick={() => setSel(p)}
                  className="flex w-full items-center gap-3 rounded-2xl border border-foreground/5 bg-foreground/[0.03] p-3 text-left transition-colors hover:border-primary/30"
                >
                  <Foto p={p} className="h-12 w-12 shrink-0 rounded-xl" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{p.nombre}</p>
                    <p className="truncate text-xs text-muted">
                      {p.categoria}
                      {p.temporada ? ` · ${p.temporada}` : ""}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      p.disponible
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                        : "bg-foreground/10 text-muted"
                    }`}
                  >
                    {p.disponible ? "Disponible" : "Agotado"}
                  </span>
                  <span className="shrink-0 text-sm font-semibold tabular-nums text-primary">
                    {rangoPrecio(p)}
                  </span>
                </button>
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </Stagger>

      <Modal
        open={sel !== null}
        onClose={() => setSel(null)}
        title={sel?.nombre ?? ""}
        subtitle={sel ? sel.categoria : undefined}
      >
        {sel && (
          <div className="space-y-5">
            <div className="relative overflow-hidden rounded-2xl">
              <Foto p={sel} className="h-40 w-full" />
              <span
                className={`absolute right-3 top-3 rounded-full px-2.5 py-0.5 text-xs font-semibold shadow-md ${
                  sel.disponible ? "bg-emerald-600 text-white" : "bg-black/70 text-white"
                }`}
              >
                {sel.disponible ? "Disponible" : "Agotado"}
              </span>
            </div>

            <p className="text-sm text-muted">{sel.descripcion}</p>

            <div>
              <p className="mb-2 text-xs font-medium text-muted">Precios por tamaño</p>
              <div className="space-y-1.5">
                {sel.precios.map((pr) => (
                  <div
                    key={pr.tamano}
                    className="flex items-center justify-between rounded-lg border border-foreground/5 bg-foreground/[0.03] px-3 py-2 text-sm"
                  >
                    <span>{pr.tamano}</span>
                    <span className="tabular-nums font-semibold text-primary">
                      RD$ {pr.precio.toLocaleString("es-DO")}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-medium text-muted">Sabores</p>
              <div className="flex flex-wrap gap-1.5">
                {sel.sabores.map((s) => (
                  <span key={s} className="rounded-full bg-primary/12 px-2.5 py-1 text-xs font-medium text-primary">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {sel.personalizaciones.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-medium text-muted">Personalizaciones</p>
                <div className="flex flex-wrap gap-1.5">
                  {sel.personalizaciones.map((c) => (
                    <span key={c} className="rounded-full border border-foreground/15 px-2.5 py-1 text-xs">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}
