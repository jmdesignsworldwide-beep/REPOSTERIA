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

export function EntregasView({ entregas }: { entregas: Entrega[] }) {
  const [filtro, setFiltro] = useState<Filtro>("todas");
  const [sel, setSel] = useState<Entrega | null>(null);

  const lista = useMemo(
    () => entregas.filter((e) => filtro === "todas" || e.estado === filtro),
    [entregas, filtro],
  );

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
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                Entregas
              </h1>
              <p className="mt-1 flex items-center gap-2 text-sm text-muted">
                <LiveDot label="En vivo" className="text-primary" /> · recoger en tienda o delivery
              </p>
            </div>
          </div>
        </StaggerItem>

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

        <Stagger className="grid gap-3 sm:grid-cols-2">
          {lista.map((e) => {
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
                        <span className="truncate font-medium">{e.cliente}</span>
                        <span className="shrink-0 text-xs text-muted">{e.pedidoRef}</span>
                      </div>
                      <p className="truncate text-xs text-muted">
                        {e.metodo === "delivery" ? e.direccion : "Recoge en tienda"}
                      </p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${meta.cls}`}>
                      {meta.label}
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
              <Campo label="Dirección" valor={sel.metodo === "delivery" ? sel.direccion : "En tienda"} />
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
