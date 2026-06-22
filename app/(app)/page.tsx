"use client";

import { Stagger, StaggerItem } from "@/components/ui/stagger";
import { Magnetic } from "@/components/ui/magnetic";
import { CountUp } from "@/components/ui/count-up";
import { GlassCard } from "@/components/ui/glass-card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Skeleton } from "@/components/ui/skeleton";
import { LiveDot } from "@/components/ui/live-dot";
import { ViewSwitcher } from "@/components/ui/view-switcher";

const KPIS = [
  { label: "Ventas del día", value: 48250, prefix: "RD$ ", decimals: 0 },
  { label: "Pedidos activos", value: 27, prefix: "", decimals: 0 },
  { label: "Ticket promedio", value: 1787.4, prefix: "RD$ ", decimals: 2 },
  { label: "Clientes nuevos", value: 14, prefix: "", decimals: 0 },
];

const TOP = [
  { nombre: "Tres leches", pct: 92 },
  { nombre: "Suspiros", pct: 74 },
  { nombre: "Brownies", pct: 58 },
  { nombre: "Pan de yema", pct: 41 },
];

const ACTIVIDAD = [
  { hora: "10:42", txt: "Nuevo pedido #1042 — Bizcocho de cumpleaños" },
  { hora: "10:31", txt: "Pago recibido — RD$ 2,400" },
  { hora: "10:18", txt: "Cliente nuevo — María Fernández" },
  { hora: "09:55", txt: "Pedido #1039 marcado como entregado" },
];

function ResumenView() {
  return (
    <GlassCard className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold">Top productos</h3>
        <span className="text-xs text-muted">Esta semana</span>
      </div>
      <div className="space-y-4">
        {TOP.map((p) => (
          <ProgressBar key={p.nombre} label={p.nombre} value={p.pct} />
        ))}
      </div>
    </GlassCard>
  );
}

function ActividadView() {
  return (
    <GlassCard className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold">Actividad</h3>
        <LiveDot label="En vivo" className="text-primary" />
      </div>
      <Stagger className="space-y-3">
        {ACTIVIDAD.map((a) => (
          <StaggerItem
            key={a.hora}
            className="flex gap-3 rounded-xl border border-foreground/5 bg-foreground/[0.03] p-3 text-sm"
          >
            <span className="tabular-nums text-muted">{a.hora}</span>
            <span>{a.txt}</span>
          </StaggerItem>
        ))}
      </Stagger>
    </GlassCard>
  );
}

function CargandoView() {
  return (
    <GlassCard className="p-5">
      <h3 className="mb-4 font-display text-lg font-semibold">
        Cargando datos…
      </h3>
      <div className="space-y-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-1/3" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

export default function DashboardPage() {
  return (
    <Stagger className="mx-auto max-w-5xl space-y-8">
      {/* Encabezado */}
      <StaggerItem>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm text-muted">Buenos días 👋</p>
            <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Panel de Azúcar &amp; Canela
            </h1>
          </div>
          <LiveDot label="Sistema conectado" className="text-primary" />
        </div>
      </StaggerItem>

      {/* KPIs — magnetic + count-up + glass */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {KPIS.map((k) => (
          <StaggerItem key={k.label}>
            <Magnetic>
              <GlassCard className="p-5">
                <p className="text-xs font-medium text-muted">{k.label}</p>
                <p className="mt-2 font-display text-2xl font-bold sm:text-3xl">
                  <CountUp
                    value={k.value}
                    prefix={k.prefix}
                    decimals={k.decimals}
                  />
                </p>
              </GlassCard>
            </Magnetic>
          </StaggerItem>
        ))}
      </div>

      {/* Transiciones entre vistas + progreso + skeleton + actividad */}
      <StaggerItem>
        <ViewSwitcher
          views={[
            { id: "resumen", label: "Resumen", content: <ResumenView /> },
            { id: "actividad", label: "Actividad", content: <ActividadView /> },
            { id: "cargando", label: "Cargando", content: <CargandoView /> },
          ]}
        />
      </StaggerItem>

      {/* Botones magnéticos */}
      <StaggerItem>
        <GlassCard className="flex flex-wrap items-center gap-4 p-5">
          <span className="text-sm text-muted">Botones imantados:</span>
          <Magnetic>
            <button className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow">
              Nuevo pedido
            </button>
          </Magnetic>
          <Magnetic glow={false}>
            <button className="rounded-full border border-foreground/15 bg-glass/60 px-5 py-2.5 text-sm font-semibold backdrop-blur">
              Ver catálogo
            </button>
          </Magnetic>
          <span className="ml-auto text-xs text-muted">
            Respeta “reduce motion”.
          </span>
        </GlassCard>
      </StaggerItem>
    </Stagger>
  );
}
