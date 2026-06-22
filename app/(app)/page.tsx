"use client";

import { useEffect, useMemo, useState } from "react";
import { Stagger, StaggerItem } from "@/components/ui/stagger";
import { Magnetic } from "@/components/ui/magnetic";
import { CountUp } from "@/components/ui/count-up";
import { GlassCard } from "@/components/ui/glass-card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { LiveDot } from "@/components/ui/live-dot";
import { Modal } from "@/components/ui/modal";
import { fmtRD, getDashboardData } from "@/lib/data/mock";
import type { EstadoPedido, Entrega, Pedido } from "@/lib/data/types";

const ESTADO: Record<EstadoPedido, { label: string; cls: string }> = {
  pendiente: {
    label: "Pendiente",
    cls: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  },
  en_produccion: {
    label: "En producción",
    cls: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
  },
  listo: {
    label: "Listo",
    cls: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  },
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
  | { type: "pedido"; pedido: Pedido }
  | { type: "entrega"; entrega: Entrega }
  | { type: "kpi"; titulo: string; valor: string; render: React.ReactNode }
  | null;

export default function DashboardPage() {
  const data = useMemo(() => getDashboardData(), []);
  const [modal, setModal] = useState<ModalState>(null);
  const [saludo, setSaludo] = useState("Hola");

  useEffect(() => {
    setSaludo(saludoPorHora(new Date().getHours()));
  }, []);

  const metaPct = Math.round((data.ventasHoy / data.metaDia) * 100);

  const kpis = [
    {
      label: "Caja del día",
      value: data.cajaDelDia,
      prefix: "RD$ ",
      live: false,
      onClick: () =>
        setModal({
          type: "kpi",
          titulo: "Caja del día",
          valor: fmtRD(data.cajaDelDia),
          render: (
            <div className="space-y-2">
              <p className="text-sm text-muted">
                Abonos cobrados hoy, por pedido:
              </p>
              {data.pedidosHoy.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-lg border border-foreground/5 bg-foreground/[0.03] px-3 py-2 text-sm"
                >
                  <span className="text-muted">
                    {p.codigo} · {p.cliente}
                  </span>
                  <span className="tabular-nums font-medium">
                    {fmtRD(p.abono)}
                  </span>
                </div>
              ))}
            </div>
          ),
        }),
    },
    {
      label: "Pedidos de hoy",
      value: data.conteos.pedidosHoy,
      prefix: "",
      live: false,
      onClick: () =>
        setModal({
          type: "kpi",
          titulo: "Pedidos de hoy",
          valor: String(data.conteos.pedidosHoy),
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
        }),
    },
    {
      label: "Entregas próximas",
      value: data.conteos.entregasProximas,
      prefix: "",
      live: true,
      onClick: () =>
        setModal({
          type: "kpi",
          titulo: "Entregas próximas",
          valor: String(data.conteos.entregasProximas),
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
        }),
    },
    {
      label: "En producción ahora",
      value: data.conteos.enProduccion,
      prefix: "",
      live: true,
      onClick: () =>
        setModal({
          type: "kpi",
          titulo: "En producción ahora",
          valor: String(data.conteos.enProduccion),
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
                  <span className="tabular-nums text-muted">
                    {p.horaEntrega}
                  </span>
                </div>
              ))}
            </div>
          ),
        }),
    },
  ];

  return (
    <>
      <Stagger className="mx-auto max-w-6xl space-y-6">
        {/* Encabezado cálido */}
        <StaggerItem>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm text-muted">{saludo} 👋</p>
              <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                Sala de Mando
              </h1>
            </div>
            <LiveDot label="Sistema conectado" className="text-primary" />
          </div>
        </StaggerItem>

        {/* KPIs — count-up + magnetic + glass + clickeables */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {kpis.map((k) => (
            <StaggerItem key={k.label}>
              <Magnetic>
                <button
                  onClick={k.onClick}
                  className="w-full text-left"
                  aria-label={`Ver detalle de ${k.label}`}
                >
                  <GlassCard className="p-5">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-muted">
                        {k.label}
                      </p>
                      {k.live && <LiveDot className="text-primary" />}
                    </div>
                    <p className="mt-2 font-display text-2xl font-bold sm:text-3xl">
                      <CountUp value={k.value} prefix={k.prefix} />
                    </p>
                    <p className="mt-1 text-xs text-muted">Ver detalle →</p>
                  </GlassCard>
                </button>
              </Magnetic>
            </StaggerItem>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Pedidos para hoy */}
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
              <Stagger className="space-y-2">
                {data.pedidosHoy.map((p) => (
                  <StaggerItem key={p.id}>
                    <Magnetic strength={0.1} glow={false}>
                      <button
                        onClick={() => setModal({ type: "pedido", pedido: p })}
                        className="flex w-full items-center gap-3 rounded-xl border border-foreground/5 bg-foreground/[0.03] p-3 text-left transition-colors hover:border-primary/30"
                      >
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
                            {p.producto} · {p.sabor} · {p.ocasion}
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
                      </button>
                    </Magnetic>
                  </StaggerItem>
                ))}
              </Stagger>
            </GlassCard>
          </StaggerItem>

          {/* Columna derecha */}
          <StaggerItem className="space-y-6">
            {/* Meta del día */}
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

            {/* Entregas próximas */}
            <GlassCard className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold">
                  Entregas próximas
                </h2>
                <LiveDot label="En vivo" className="text-primary" />
              </div>
              <Stagger className="space-y-2">
                {data.entregasProximas.map((e) => (
                  <StaggerItem key={e.id}>
                    <button
                      onClick={() => setModal({ type: "entrega", entrega: e })}
                      className="flex w-full items-center gap-3 rounded-xl border border-foreground/5 bg-foreground/[0.03] p-2.5 text-left transition-colors hover:border-primary/30"
                    >
                      <div className="flex flex-col items-center">
                        <span className="tabular-nums text-sm font-semibold text-primary">
                          {e.hora}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {e.cliente}
                        </p>
                        <p className="truncate text-xs text-muted">
                          {e.direccion}
                        </p>
                      </div>
                    </button>
                  </StaggerItem>
                ))}
              </Stagger>
            </GlassCard>

            {/* En producción ahora */}
            <GlassCard className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold">
                  En producción
                </h2>
                <LiveDot label="Ahora" className="text-primary" />
              </div>
              <Stagger className="space-y-2">
                {data.enProduccion.map((p) => (
                  <StaggerItem key={p.id}>
                    <button
                      onClick={() => setModal({ type: "pedido", pedido: p })}
                      className="flex w-full items-center gap-3 rounded-xl border border-foreground/5 bg-foreground/[0.03] p-2.5 text-left transition-colors hover:border-primary/30"
                    >
                      <span className="text-lg">🔥</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {p.producto}
                        </p>
                        <p className="truncate text-xs text-muted">
                          {p.sabor} · {p.cliente}
                        </p>
                      </div>
                      <span className="tabular-nums text-xs text-muted">
                        {p.horaEntrega}
                      </span>
                    </button>
                  </StaggerItem>
                ))}
              </Stagger>
            </GlassCard>
          </StaggerItem>
        </div>
      </Stagger>

      {/* ════════ Modales (patrón MONSTER) ════════ */}
      <Modal
        open={modal?.type === "pedido"}
        onClose={() => setModal(null)}
        title={modal?.type === "pedido" ? modal.pedido.cliente : ""}
        subtitle={
          modal?.type === "pedido"
            ? `${modal.pedido.codigo} · ${modal.pedido.ocasion}`
            : undefined
        }
        footer={
          <div className="flex gap-2">
            <button className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow">
              Marcar como listo
            </button>
            <button className="rounded-xl border border-foreground/15 bg-glass/60 px-4 py-2.5 text-sm font-semibold backdrop-blur">
              Llamar
            </button>
          </div>
        }
      >
        {modal?.type === "pedido" && (
          <PedidoDetalle pedido={modal.pedido} />
        )}
      </Modal>

      <Modal
        open={modal?.type === "entrega"}
        onClose={() => setModal(null)}
        title={modal?.type === "entrega" ? modal.entrega.cliente : ""}
        subtitle={
          modal?.type === "entrega"
            ? `Entrega ${modal.entrega.pedidoCodigo} · ${modal.entrega.hora}`
            : undefined
        }
        footer={
          <button className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow">
            Ver en el mapa
          </button>
        }
      >
        {modal?.type === "entrega" && (
          <div className="space-y-3 text-sm">
            <Campo label="Producto" valor={modal.entrega.producto} />
            <Campo label="Dirección" valor={modal.entrega.direccion} />
            <Campo label="Teléfono" valor={modal.entrega.telefono} />
            <Campo label="Hora de entrega" valor={modal.entrega.hora} />
          </div>
        )}
      </Modal>

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

function Campo({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-foreground/5 pb-2">
      <span className="text-muted">{label}</span>
      <span className="text-right font-medium">{valor}</span>
    </div>
  );
}

function PedidoDetalle({ pedido }: { pedido: Pedido }) {
  const restante = pedido.monto - pedido.abono;
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <EstadoBadge estado={pedido.estado} />
        <span className="tabular-nums text-xs text-muted">
          Entrega {pedido.horaEntrega}
        </span>
      </div>

      <div className="space-y-3 text-sm">
        <Campo label="Producto" valor={`${pedido.producto} (${pedido.cantidad})`} />
        <Campo label="Sabor" valor={pedido.sabor} />
        <Campo label="Ocasión" valor={pedido.ocasion} />
        <Campo label="Teléfono" valor={pedido.telefono} />
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl border border-foreground/10 bg-foreground/[0.03] p-3">
          <p className="text-xs text-muted">Total</p>
          <p className="tabular-nums font-semibold">{fmtRD(pedido.monto)}</p>
        </div>
        <div className="rounded-xl border border-foreground/10 bg-foreground/[0.03] p-3">
          <p className="text-xs text-muted">Abonado</p>
          <p className="tabular-nums font-semibold text-emerald-600 dark:text-emerald-400">
            {fmtRD(pedido.abono)}
          </p>
        </div>
        <div className="rounded-xl border border-foreground/10 bg-foreground/[0.03] p-3">
          <p className="text-xs text-muted">Resta</p>
          <p className="tabular-nums font-semibold text-primary">
            {fmtRD(restante)}
          </p>
        </div>
      </div>

      {pedido.notas && (
        <div className="rounded-xl border border-foreground/10 bg-primary/[0.06] p-3 text-sm">
          <p className="mb-1 text-xs font-medium text-muted">Notas</p>
          {pedido.notas}
        </div>
      )}
    </div>
  );
}
