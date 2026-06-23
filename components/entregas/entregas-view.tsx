"use client";

import { useMemo, useState } from "react";
import { Stagger, StaggerItem } from "@/components/ui/stagger";
import { Magnetic } from "@/components/ui/magnetic";
import { GlassCard } from "@/components/ui/glass-card";
import { LiveDot } from "@/components/ui/live-dot";
import { Modal } from "@/components/ui/modal";
import { Disclaimer } from "@/components/ui/disclaimer";
import { ESTADO_ENTREGA_META, type Entrega, type EstadoEntrega } from "@/lib/data/entregas";

type Filtro = "todas" | EstadoEntrega;

const pad = (n: number) => String(n).padStart(2, "0");
function hoyStr() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function etiquetaDia(fecha: string, hoy: string): string {
  const f = new Date(fecha + "T00:00:00");
  const h = new Date(hoy + "T00:00:00");
  const diff = Math.round((f.getTime() - h.getTime()) / 86400000);
  if (diff === 0) return "Hoy";
  if (diff === 1) return "Mañana";
  if (diff === -1) return "Ayer";
  return f.toLocaleDateString("es-DO", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

/**
 * Entregas — hoja de ruta logística (no repite el calendario mensual ni la
 * lista de pedidos). Toma los pedidos reales y los ordena por día de entrega
 * con lo único de delivery: método (tienda/delivery), motorista asignado,
 * dirección/ruta y confirmación de entrega. Cada tarjeta enlaza a su pedido.
 */
export function EntregasView({ entregas }: { entregas: Entrega[] }) {
  const [filtro, setFiltro] = useState<Filtro>("todas");
  const [sel, setSel] = useState<Entrega | null>(null);
  const hoy = hoyStr();

  const lista = useMemo(
    () => entregas.filter((e) => filtro === "todas" || e.estado === filtro),
    [entregas, filtro],
  );

  // Agrupar por día (ordenado), como una hoja de ruta de despacho.
  const grupos = useMemo(() => {
    const map = new Map<string, Entrega[]>();
    for (const e of lista) {
      const arr = map.get(e.fecha) ?? [];
      arr.push(e);
      map.set(e.fecha, arr);
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [lista]);

  const deliveryHoy = entregas.filter(
    (e) => e.fecha === hoy && e.metodo === "delivery",
  ).length;
  const tiendaHoy = entregas.filter(
    (e) => e.fecha === hoy && e.metodo === "tienda",
  ).length;

  const FILTROS: { id: Filtro; label: string }[] = [
    { id: "todas", label: "Todas" },
    { id: "preparando", label: "Preparando" },
    { id: "en_camino", label: "En camino" },
    { id: "entregado", label: "Entregado" },
  ];

  return (
    <>
      <Stagger className="mx-auto max-w-5xl space-y-6">
        <StaggerItem>
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Entregas
          </h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-muted">
            <LiveDot label="Hoja de ruta" className="text-primary" /> · despacho
            por día: tienda y delivery
          </p>
        </StaggerItem>

        {/* Resumen del día */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Para hoy", value: deliveryHoy + tiendaHoy, cls: "text-foreground" },
            { label: "Delivery 🛵", value: deliveryHoy, cls: "text-primary" },
            { label: "En tienda 🏪", value: tiendaHoy, cls: "text-foreground" },
          ].map((k) => (
            <StaggerItem key={k.label}>
              <GlassCard className="p-4 sm:p-5">
                <p className="text-xs font-medium text-muted">{k.label}</p>
                <p className={`mt-2 text-2xl font-bold tabular-nums ${k.cls}`}>
                  {k.value}
                </p>
              </GlassCard>
            </StaggerItem>
          ))}
        </div>

        <StaggerItem>
          <Disclaimer>
            Seguimiento de entregas simulado para demostración (sin rastreo GPS
            ni integración con mensajería real).
          </Disclaimer>
        </StaggerItem>

        <StaggerItem>
          <div className="inline-flex flex-wrap gap-1 rounded-xl border border-foreground/10 bg-glass/50 p-1 backdrop-blur">
            {FILTROS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFiltro(f.id)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  filtro === f.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </StaggerItem>

        {grupos.length === 0 ? (
          <StaggerItem>
            <GlassCard className="p-10 text-center text-sm text-muted">
              No hay entregas que coincidan.
            </GlassCard>
          </StaggerItem>
        ) : (
          grupos.map(([fecha, items]) => (
            <StaggerItem key={fecha}>
              <div className="mb-2 flex items-center gap-2">
                <h2 className="font-display text-lg font-semibold capitalize">
                  {etiquetaDia(fecha, hoy)}
                </h2>
                <span className="rounded-full bg-foreground/10 px-2 py-0.5 text-xs tabular-nums text-muted">
                  {items.length}
                </span>
              </div>
              <Stagger className="grid gap-3 sm:grid-cols-2">
                {items.map((e) => {
                  const meta = ESTADO_ENTREGA_META[e.estado];
                  return (
                    <StaggerItem key={e.id}>
                      <Magnetic strength={0.08} glow={false}>
                        <button
                          onClick={() => setSel(e)}
                          className="flex w-full items-center gap-3 rounded-2xl border border-foreground/5 bg-foreground/[0.03] p-4 text-left transition-colors hover:border-primary/30"
                        >
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-lg">
                            {e.metodo === "delivery" ? "🛵" : "🏪"}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="truncate font-medium">
                                {e.cliente}
                              </span>
                              <span className="shrink-0 text-xs text-muted">
                                {e.pedidoRef}
                              </span>
                            </div>
                            <p className="truncate text-xs text-muted">
                              {e.metodo === "delivery"
                                ? `${e.motorista ? `${e.motorista} · ` : ""}${e.direccion}`
                                : "Recoge en tienda"}
                              {e.hora ? ` · ${e.hora}` : ""}
                            </p>
                          </div>
                          <span
                            className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${meta.cls}`}
                          >
                            {meta.label}
                          </span>
                        </button>
                      </Magnetic>
                    </StaggerItem>
                  );
                })}
              </Stagger>
            </StaggerItem>
          ))
        )}
      </Stagger>

      <Modal
        open={sel !== null}
        onClose={() => setSel(null)}
        title={sel ? `Entrega ${sel.pedidoRef}` : ""}
        subtitle={sel?.cliente}
      >
        {sel && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${ESTADO_ENTREGA_META[sel.estado].cls}`}>
                {ESTADO_ENTREGA_META[sel.estado].label}
              </span>
              <span className="text-sm text-muted">
                {sel.metodo === "delivery" ? "Delivery 🛵" : "Recoge en tienda 🏪"}
              </span>
            </div>

            <div className="space-y-2 text-sm">
              <Campo label="Dirección / ruta" valor={sel.metodo === "delivery" ? sel.direccion : "En tienda"} />
              <Campo label="Motorista" valor={sel.motorista ?? "—"} />
              <Campo label="Fecha" valor={sel.fecha} />
              {sel.hora && <Campo label="Hora" valor={sel.hora} />}
            </div>

            {/* Confirmación con foto (ejemplo) */}
            <div>
              <p className="mb-2 text-xs font-medium text-muted">Confirmación de entrega</p>
              <div className="flex h-28 items-center justify-center rounded-xl border border-dashed border-foreground/20 bg-foreground/[0.03] text-sm text-muted">
                {sel.estado === "entregado" ? "📷 Foto de entrega (ejemplo)" : "Pendiente de entrega"}
              </div>
            </div>

            <div className="rounded-xl border border-primary/30 bg-primary/[0.06] px-3 py-2 text-sm font-medium text-primary">
              🧾 Pedido {sel.pedidoRef} · gestiona estado y cobro en Pedidos
            </div>

            <Disclaimer>
              Seguimiento y confirmación simulados para demostración.
            </Disclaimer>
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
