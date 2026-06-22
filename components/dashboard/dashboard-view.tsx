"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Stagger, StaggerItem } from "@/components/ui/stagger";
import { Magnetic } from "@/components/ui/magnetic";
import { CountUp } from "@/components/ui/count-up";
import { GlassCard } from "@/components/ui/glass-card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { LiveDot } from "@/components/ui/live-dot";
import { Modal } from "@/components/ui/modal";
import { fmtRD } from "@/lib/data/mock";
import type { DashboardData, EstadoPedido } from "@/lib/data/types";

const ESTADO: Record<EstadoPedido, { label: string; cls: string }> = {
  pendiente: { label: "Pendiente", cls: "bg-amber-500/15 text-amber-600 dark:text-amber-400" },
  en_produccion: { label: "En producción", cls: "bg-sky-500/15 text-sky-600 dark:text-sky-400" },
  listo: { label: "Listo", cls: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" },
  entregado: { label: "Entregado", cls: "bg-foreground/10 text-muted" },
};

function EstadoBadge({ estado }: { estado: EstadoPedido }) {
  const e = ESTADO[estado];
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${e.cls}`}>
      {e.label}
    </span>
  );
}

function saludoPorHora(h: number) {
  if (h < 12) return "Buen día";
  if (h < 19) return "Buenas tardes";
  return "Buenas noches";
}

type ModalState =
  | { type: "kpi"; titulo: string; valor: string; render: React.ReactNode }
  | null;

export function DashboardView({
  data,
  isReal,
  cajaHref,
}: {
  data: DashboardData;
  isReal: boolean;
  cajaHref?: string;
}) {
  const [modal, setModal] = useState<ModalState>(null);
  const [saludo, setSaludo] = useState("Hola");

  useEffect(() => {
    setSaludo(saludoPorHora(new Date().getHours()));
  }, []);

  const metaPct =
    data.metaDia > 0
      ? Math.min(100, Math.round((data.ventasHoy / data.metaDia) * 100))
      : 0;

  const kpis = [
    {
      label: "Caja del día",
      value: data.cajaDelDia,
      prefix: "RD$ ",
      live: false,
      render: (
        <div className="space-y-2">
          <p className="text-sm text-muted">Abonos cobrados hoy, por pedido:</p>
          {data.pedidosHoy.length === 0 && (
            <p className="text-sm text-muted">No hay pedidos para hoy.</p>
          )}
          {data.pedidosHoy.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between rounded-lg border border-foreground/5 bg-foreground/[0.03] px-3 py-2 text-sm"
            >
              <span className="text-muted">
                {p.codigo} · {p.cliente}
              </span>
              <span className="tabular-nums font-medium">{fmtRD(p.abono)}</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      label: "Pedidos de hoy",
      value: data.conteos.pedidosHoy,
      prefix: "",
      live: false,
      render: (
        <div className="space-y-2">
          {data.pedidosHoy.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between rounded-lg border border-foreground/5 bg-foreground/[0.03] px-3 py-2 text-sm"
            >
              <span>
                {p.codigo} · {p.producto}
              </span>
              <EstadoBadge estado={p.estado} />
            </div>
          ))}
        </div>
      ),
    },
    {
      label: "Entregas próximas",
      value: data.conteos.entregasProximas,
      prefix: "",
      live: true,
      render: (
        <div className="space-y-2">
          {data.entregasProximas.map((e) => (
            <div
              key={e.id}
              className="rounded-lg border border-foreground/5 bg-foreground/[0.03] px-3 py-2 text-sm"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{e.cliente}</span>
                <span className="tabular-nums text-primary">{e.hora}</span>
              </div>
              <p className="text-muted">{e.direccion}</p>
            </div>
          ))}
        </div>
      ),
    },
    {
      label: "En producción ahora",
      value: data.conteos.enProduccion,
      prefix: "",
      live: true,
      render: (
        <div className="space-y-2">
          {data.enProduccion.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between rounded-lg border border-foreground/5 bg-foreground/[0.03] px-3 py-2 text-sm"
            >
              <span>
                {p.codigo} · {p.producto} ({p.sabor})
              </span>
              <span className="tabular-nums text-muted">{p.horaEntrega}</span>
            </div>
          ))}
        </div>
      ),
    },
  ];

  return (
    <>
      <Stagger className="mx-auto max-w-6xl space-y-6">
        <StaggerItem>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm text-muted">{saludo} 👋</p>
              <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                Sala de Mando
              </h1>
            </div>
            <LiveDot
              label={isReal ? "Datos en vivo" : "Demo"}
              className="text-primary"
            />
          </div>
        </StaggerItem>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {kpis.map((k) => {
            const esCaja = k.label === "Caja del día" && cajaHref;
            const card = (
              <GlassCard className="p-5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-muted">{k.label}</p>
                  {k.live && <LiveDot className="text-primary" />}
                </div>
                <p className="mt-2 text-2xl font-bold tabular-nums sm:text-3xl">
                  <CountUp value={k.value} prefix={k.prefix} />
                </p>
                <p className="mt-1 text-xs text-muted">
                  {esCaja ? "Ir a la caja →" : "Ver detalle →"}
                </p>
              </GlassCard>
            );
            return (
              <StaggerItem key={k.label}>
                <Magnetic>
                  {esCaja ? (
                    <Link href={cajaHref!} className="block" aria-label="Ir a la caja">
                      {card}
                    </Link>
                  ) : (
                    <button
                      onClick={() =>
                        setModal({
                          type: "kpi",
                          titulo: k.label,
                          valor:
                            k.prefix === "RD$ " ? fmtRD(k.value) : String(k.value),
                          render: k.render,
                        })
                      }
                      className="w-full text-left"
                      aria-label={`Ver detalle de ${k.label}`}
                    >
                      {card}
                    </button>
                  )}
                </Magnetic>
              </StaggerItem>
            );
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <StaggerItem className="lg:col-span-2">
            <GlassCard className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold">
                  Pedidos para hoy
                </h2>
                <span className="text-xs text-muted">
                  {data.pedidosHoy.length} pedidos
                </span>
              </div>
              {data.pedidosHoy.length === 0 ? (
                <p className="text-sm text-muted">
                  No hay pedidos con entrega hoy.
                </p>
              ) : (
                <Stagger className="space-y-2">
                  {data.pedidosHoy.map((p) => (
                    <StaggerItem key={p.id}>
                      <div className="flex items-center gap-3 rounded-xl border border-foreground/5 bg-foreground/[0.03] p-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-lg">
                          🧁
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="truncate font-medium">
                              {p.cliente}
                            </span>
                            <span className="shrink-0 text-xs text-muted">
                              {p.codigo}
                            </span>
                          </div>
                          <p className="truncate text-sm text-muted">
                            {p.producto} · {p.ocasion}
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <div className="tabular-nums font-semibold">
                            {fmtRD(p.monto)}
                          </div>
                          <div className="mt-1 flex items-center justify-end gap-2">
                            <span className="tabular-nums text-xs text-muted">
                              {p.horaEntrega}
                            </span>
                            <EstadoBadge estado={p.estado} />
                          </div>
                        </div>
                      </div>
                    </StaggerItem>
                  ))}
                </Stagger>
              )}
            </GlassCard>
          </StaggerItem>

          <StaggerItem className="space-y-6">
            <GlassCard className="p-5">
              <h2 className="mb-1 font-display text-lg font-semibold">
                Meta del día
              </h2>
              <p className="mb-4 text-sm text-muted">
                <span className="tabular-nums font-medium text-foreground">
                  {fmtRD(data.ventasHoy)}
                </span>{" "}
                de {fmtRD(data.metaDia)}
              </p>
              <ProgressBar value={metaPct} label="Avance" />
            </GlassCard>

            <GlassCard className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold">
                  Entregas próximas
                </h2>
                <LiveDot label="En vivo" className="text-primary" />
              </div>
              {data.entregasProximas.length === 0 ? (
                <p className="text-sm text-muted">Sin entregas próximas.</p>
              ) : (
                <Stagger className="space-y-2">
                  {data.entregasProximas.map((e) => (
                    <StaggerItem key={e.id}>
                      <div className="flex items-center gap-3 rounded-xl border border-foreground/5 bg-foreground/[0.03] p-2.5">
                        <span className="tabular-nums text-sm font-semibold text-primary">
                          {e.hora}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {e.cliente}
                          </p>
                          <p className="truncate text-xs text-muted">
                            {e.direccion}
                          </p>
                        </div>
                      </div>
                    </StaggerItem>
                  ))}
                </Stagger>
              )}
            </GlassCard>
          </StaggerItem>
        </div>
      </Stagger>

      <Modal
        open={modal?.type === "kpi"}
        onClose={() => setModal(null)}
        title={modal?.type === "kpi" ? modal.titulo : ""}
        subtitle={modal?.type === "kpi" ? modal.valor : undefined}
      >
        {modal?.type === "kpi" && modal.render}
      </Modal>
    </>
  );
}
