"use client";

import { useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useReducedMotion } from "framer-motion";
import { Stagger, StaggerItem } from "@/components/ui/stagger";
import { GlassCard } from "@/components/ui/glass-card";
import { Modal } from "@/components/ui/modal";
import { CountUp } from "@/components/ui/count-up";
import { useTheme } from "@/components/theme-provider";
import { fmtRD } from "@/lib/data/mock";
import {
  CLIENTES_FRECUENTES,
  COLORES,
  INGREDIENTES_USO,
  PEDIDOS_OCASION,
  TOP_PRODUCTOS,
  VENTAS_MES,
} from "@/lib/data/reportes";

type Desglose = { titulo: string; lineas: { label: string; valor: string }[] };

export function ReportesView() {
  const reduce = useReducedMotion();
  const { theme } = useTheme();
  const [desglose, setDesglose] = useState<Desglose | null>(null);

  const ejeColor = theme === "dark" ? "#a89890" : "#7c6a5e";
  const gridColor = theme === "dark" ? "rgba(245,237,228,0.08)" : "rgba(43,31,24,0.08)";
  const tipBg = theme === "dark" ? "#1f1714" : "#fffaf4";
  const anim = !reduce;

  const ingresosSemestre = VENTAS_MES.reduce((s, m) => s + m.ingresos, 0);
  const costosSemestre = VENTAS_MES.reduce((s, m) => s + m.costos, 0);
  const margen = Math.round(((ingresosSemestre - costosSemestre) / ingresosSemestre) * 100);
  const totalOcasion = PEDIDOS_OCASION.reduce((s, o) => s + o.valor, 0);

  const tipStyle = {
    background: tipBg,
    border: "1px solid rgba(150,120,90,0.25)",
    borderRadius: 12,
    fontSize: 12,
    color: ejeColor,
  };

  return (
    <>
      <Stagger className="mx-auto max-w-6xl space-y-6">
        <StaggerItem>
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Reportes y estadísticas
          </h1>
          <p className="mt-1 text-sm text-muted">Resumen del semestre</p>
        </StaggerItem>

        {/* KPIs */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Ingresos (6 meses)", value: ingresosSemestre, prefix: "RD$ ", cls: "text-emerald-600 dark:text-emerald-400" },
            { label: "Costos (6 meses)", value: costosSemestre, prefix: "RD$ ", cls: "text-red-600 dark:text-red-400" },
            { label: "Margen", value: margen, prefix: "", suffix: "%", cls: "text-primary" },
          ].map((k) => (
            <StaggerItem key={k.label}>
              <GlassCard className="p-4 sm:p-5">
                <p className="text-xs font-medium text-muted">{k.label}</p>
                <p className={`mt-2 text-lg font-bold tabular-nums sm:text-2xl ${k.cls}`}>
                  <CountUp value={k.value} prefix={k.prefix} suffix={k.suffix} />
                </p>
              </GlassCard>
            </StaggerItem>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Ingresos vs costos */}
          <StaggerItem className="lg:col-span-2">
            <GlassCard className="p-5">
              <h2 className="mb-4 font-display text-lg font-semibold">
                Ingresos por período
              </h2>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={VENTAS_MES} margin={{ left: -10, right: 8, top: 4 }}>
                    <defs>
                      <linearGradient id="gIng" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#C45C7F" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="#C45C7F" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gCost" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#A87C5C" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#A87C5C" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="mes" tick={{ fill: ejeColor, fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: ejeColor, fontSize: 11 }} axisLine={false} tickLine={false} width={48}
                      tickFormatter={(v) => `${(v as number) / 1000}k`} />
                    <Tooltip contentStyle={tipStyle} formatter={(v) => fmtRD(Number(v))} />
                    <Area type="monotone" dataKey="ingresos" stroke="#C45C7F" strokeWidth={2} fill="url(#gIng)" isAnimationActive={anim} name="Ingresos" />
                    <Area type="monotone" dataKey="costos" stroke="#A87C5C" strokeWidth={2} fill="url(#gCost)" isAnimationActive={anim} name="Costos" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          </StaggerItem>

          {/* Top productos */}
          <StaggerItem>
            <GlassCard className="p-5">
              <h2 className="mb-4 font-display text-lg font-semibold">
                Productos más vendidos
              </h2>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={TOP_PRODUCTOS} layout="vertical" margin={{ left: 18, right: 8 }}>
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="nombre" tick={{ fill: ejeColor, fontSize: 11 }} axisLine={false} tickLine={false} width={96} />
                    <Tooltip contentStyle={tipStyle} cursor={{ fill: gridColor }} />
                    <Bar
                      dataKey="ventas"
                      radius={[0, 6, 6, 0]}
                      isAnimationActive={anim}
                      cursor="pointer"
                      onClick={(d) => {
                        const row = (d as unknown as { nombre?: string; ventas?: number });
                        setDesglose({
                          titulo: row.nombre ?? "",
                          lineas: [
                            { label: "Ventas", valor: String(row.ventas ?? 0) },
                            { label: "Categoría", valor: "Top 5 del semestre" },
                          ],
                        });
                      }}
                    >
                      {TOP_PRODUCTOS.map((_, i) => (
                        <Cell key={i} fill={COLORES[i % COLORES.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          </StaggerItem>

          {/* Pedidos por ocasión */}
          <StaggerItem>
            <GlassCard className="p-5">
              <h2 className="mb-4 font-display text-lg font-semibold">
                Pedidos por ocasión
              </h2>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip contentStyle={tipStyle} />
                    <Pie
                      data={PEDIDOS_OCASION}
                      dataKey="valor"
                      nameKey="ocasion"
                      innerRadius={45}
                      outerRadius={80}
                      paddingAngle={2}
                      isAnimationActive={anim}
                      cursor="pointer"
                      onClick={(d) => {
                        const row = (d as unknown as { ocasion?: string; valor?: number });
                        setDesglose({
                          titulo: row.ocasion ?? "",
                          lineas: [
                            { label: "Pedidos", valor: String(row.valor ?? 0) },
                            { label: "Del total", valor: `${Math.round(((row.valor ?? 0) / totalOcasion) * 100)}%` },
                          ],
                        });
                      }}
                    >
                      {PEDIDOS_OCASION.map((_, i) => (
                        <Cell key={i} fill={COLORES[i % COLORES.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted">
                {PEDIDOS_OCASION.map((o, i) => (
                  <span key={o.ocasion} className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full" style={{ background: COLORES[i % COLORES.length] }} />
                    {o.ocasion}
                  </span>
                ))}
              </div>
            </GlassCard>
          </StaggerItem>

          {/* Ingredientes más usados */}
          <StaggerItem>
            <GlassCard className="p-5">
              <h2 className="mb-4 font-display text-lg font-semibold">
                Ingredientes más usados
              </h2>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={INGREDIENTES_USO} margin={{ left: -10, right: 8 }}>
                    <XAxis dataKey="nombre" tick={{ fill: ejeColor, fontSize: 10 }} axisLine={false} tickLine={false} interval={0} />
                    <YAxis hide />
                    <Tooltip contentStyle={tipStyle} cursor={{ fill: gridColor }} />
                    <Bar dataKey="uso" radius={[6, 6, 0, 0]} fill="#C45C7F" isAnimationActive={anim} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          </StaggerItem>

          {/* Clientes frecuentes */}
          <StaggerItem>
            <GlassCard className="p-5">
              <h2 className="mb-4 font-display text-lg font-semibold">
                Clientes más frecuentes
              </h2>
              <div className="space-y-2">
                {CLIENTES_FRECUENTES.map((c) => (
                  <button
                    key={c.nombre}
                    onClick={() =>
                      setDesglose({
                        titulo: c.nombre,
                        lineas: [
                          { label: "Pedidos", valor: String(c.pedidos) },
                          { label: "Total gastado", valor: fmtRD(c.total) },
                        ],
                      })
                    }
                    className="flex w-full items-center justify-between rounded-lg border border-foreground/5 bg-foreground/[0.03] px-3 py-2 text-sm transition-colors hover:border-primary/30"
                  >
                    <span className="truncate">{c.nombre}</span>
                    <span className="shrink-0 text-muted">
                      {c.pedidos} pedidos · <span className="tabular-nums font-medium text-foreground">{fmtRD(c.total)}</span>
                    </span>
                  </button>
                ))}
              </div>
            </GlassCard>
          </StaggerItem>
        </div>
      </Stagger>

      {desglose && (
        <DesgloseModal d={desglose} onClose={() => setDesglose(null)} />
      )}
    </>
  );
}

function DesgloseModal({ d, onClose }: { d: Desglose; onClose: () => void }) {
  return (
    <Modal open onClose={onClose} title={d.titulo} subtitle="Desglose">
      <div className="space-y-2 text-sm">
        {d.lineas.map((l) => (
          <div key={l.label} className="flex items-center justify-between border-b border-foreground/5 pb-2">
            <span className="text-muted">{l.label}</span>
            <span className="font-medium tabular-nums">{l.valor}</span>
          </div>
        ))}
      </div>
    </Modal>
  );
}
