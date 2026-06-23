"use client";

import { useMemo, useState } from "react";
import { Stagger, StaggerItem } from "@/components/ui/stagger";
import { Magnetic } from "@/components/ui/magnetic";
import { GlassCard } from "@/components/ui/glass-card";
import { Modal } from "@/components/ui/modal";
import { CountUp } from "@/components/ui/count-up";
import { SearchInput, Chips } from "@/components/ui/controls";
import { fmtRD } from "@/lib/data/mock";
import { ASISTENCIA_META, EMPLEADOS } from "@/lib/data/empleados";
import type { Asistencia, Empleado } from "@/lib/data/empleados";

type FiltroAsist = "todos" | Asistencia;

const TONOS = [
  "bg-amber-500/20 text-amber-700 dark:text-amber-300",
  "bg-rose-500/20 text-rose-700 dark:text-rose-300",
  "bg-sky-500/20 text-sky-700 dark:text-sky-300",
  "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300",
  "bg-violet-500/20 text-violet-700 dark:text-violet-300",
];

function iniciales(nombre: string) {
  return nombre.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase();
}

export function EmpleadosView() {
  const [sel, setSel] = useState<Empleado | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState<FiltroAsist>("todos");

  const presentes = EMPLEADOS.filter((e) => e.asistencia === "presente").length;
  const nomina = EMPLEADOS.reduce((s, e) => s + e.salario, 0);

  const lista = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return EMPLEADOS.filter(
      (e) =>
        (filtro === "todos" || e.asistencia === filtro) &&
        (!q ||
          e.nombre.toLowerCase().includes(q) ||
          e.rol.toLowerCase().includes(q)),
    );
  }, [busqueda, filtro]);

  const FILTROS: { id: FiltroAsist; label: string; dot?: string }[] = [
    { id: "todos", label: "Todos" },
    { id: "presente", label: "Presentes", dot: "bg-emerald-500" },
    { id: "tarde", label: "Tarde", dot: "bg-amber-500" },
    { id: "ausente", label: "Ausentes", dot: "bg-red-500" },
  ];

  return (
    <>
      <Stagger className="mx-auto max-w-5xl space-y-6">
        <StaggerItem>
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Empleados
          </h1>
          <p className="mt-1 text-sm text-muted">
            Equipo, asistencia y nómina
          </p>
        </StaggerItem>

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Equipo", value: EMPLEADOS.length, prefix: "", cls: "text-foreground" },
            { label: "Presentes hoy", value: presentes, prefix: "", cls: "text-emerald-600 dark:text-emerald-400" },
            { label: "Nómina mensual", value: nomina, prefix: "RD$ ", cls: "text-primary" },
          ].map((k) => (
            <StaggerItem key={k.label}>
              <GlassCard className="p-4 sm:p-5">
                <p className="text-xs font-medium text-muted">{k.label}</p>
                <p className={`mt-2 text-xl font-bold tabular-nums sm:text-2xl ${k.cls}`}>
                  <CountUp value={k.value} prefix={k.prefix} />
                </p>
              </GlassCard>
            </StaggerItem>
          ))}
        </div>

        {/* Controles */}
        <StaggerItem>
          <div className="space-y-3">
            <SearchInput
              value={busqueda}
              onChange={setBusqueda}
              placeholder="Buscar por nombre o rol…"
            />
            <Chips options={FILTROS} value={filtro} onChange={setFiltro} />
          </div>
        </StaggerItem>

        {lista.length === 0 && (
          <StaggerItem>
            <GlassCard className="p-10 text-center text-sm text-muted">
              No hay empleados que coincidan.
            </GlassCard>
          </StaggerItem>
        )}

        <Stagger className="grid gap-3 sm:grid-cols-2">
          {lista.map((e) => {
            const a = ASISTENCIA_META[e.asistencia];
            return (
              <StaggerItem key={e.id}>
                <Magnetic strength={0.08} glow={false}>
                  <button
                    onClick={() => setSel(e)}
                    className="flex w-full items-center gap-3 rounded-2xl border border-foreground/5 bg-foreground/[0.03] p-4 text-left transition-colors hover:border-primary/30"
                  >
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-display text-sm font-semibold ${TONOS[e.tono % TONOS.length]}`}>
                      {iniciales(e.nombre)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{e.nombre}</p>
                      <p className="truncate text-xs text-muted">{e.rol}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${a.cls}`}>
                      {a.label}
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
        subtitle={sel?.rol}
      >
        {sel && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className={`flex h-14 w-14 items-center justify-center rounded-full font-display text-lg font-semibold ${TONOS[sel.tono % TONOS.length]}`}>
                {iniciales(sel.nombre)}
              </div>
              <div>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${ASISTENCIA_META[sel.asistencia].cls}`}>
                  {ASISTENCIA_META[sel.asistencia].label}
                </span>
                <p className="mt-1 text-sm text-muted">{sel.telefono}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="rounded-xl border border-foreground/10 bg-foreground/[0.03] p-3">
                <p className="text-xs text-muted">Salario</p>
                <p className="tabular-nums font-semibold">
                  {sel.salario > 0 ? fmtRD(sel.salario) : "—"}
                </p>
              </div>
              <div className="rounded-xl border border-foreground/10 bg-foreground/[0.03] p-3">
                <p className="text-xs text-muted">Vacaciones</p>
                <p className="tabular-nums font-semibold">{sel.vacacionesDias} días</p>
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-medium text-muted">Permisos</p>
              <div className="flex flex-wrap gap-1.5">
                {sel.permisos.map((p) => (
                  <span key={p} className="rounded-full bg-primary/12 px-2.5 py-1 text-xs font-medium text-primary">
                    {p}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-medium text-muted">Actividad reciente</p>
              <div className="space-y-1.5">
                {sel.actividad.map((act, i) => (
                  <div key={i} className="flex gap-3 rounded-lg border border-foreground/5 bg-foreground/[0.03] px-3 py-2 text-sm">
                    <span className="tabular-nums text-muted">{act.fecha}</span>
                    <span>{act.texto}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
