"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import { Stagger, StaggerItem } from "@/components/ui/stagger";
import { GlassCard } from "@/components/ui/glass-card";
import { Modal } from "@/components/ui/modal";
import { LiveDot } from "@/components/ui/live-dot";
import { SignedImg } from "@/components/ui/signed-img";
import { PedidoDetalle, EstadoBadge } from "@/components/pedidos/pedido-detalle";
import { CobrarPagoForm } from "@/components/pedidos/cobrar-pago";
import { cambiarEstadoPedido } from "@/app/(app)/pedidos/actions";
import { ESTADOS } from "@/lib/pedidos/types";
import { fmtRD } from "@/lib/data/mock";
import type { EstadoPedido, Pedido } from "@/lib/pedidos/types";

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];
const MES_CORTO = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sep", "oct", "nov", "dic",
];
const DIAS = ["L", "M", "X", "J", "V", "S", "D"];

/** Punto de color por estado (indicador en cada pedido). */
const DOT: Record<EstadoPedido, string> = {
  pendiente: "bg-amber-500",
  en_proceso: "bg-sky-500",
  listo: "bg-emerald-500",
  entregado: "bg-foreground/40",
};

const pad = (n: number) => String(n).padStart(2, "0");
const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const mismaFecha = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

/** Lunes de la semana que contiene a `d`. */
function inicioSemana(d: Date) {
  const r = new Date(d);
  const dow = (r.getDay() + 6) % 7; // 0 = lunes
  r.setDate(r.getDate() - dow);
  r.setHours(0, 0, 0, 0);
  return r;
}

type Vista = "mes" | "semana";
type Filtro = EstadoPedido | "todos";

export function CalendarioView({ initial }: { initial: Pedido[] }) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const hoy = new Date();

  const [cursor, setCursor] = useState<Date>(() => new Date());
  const [vista, setVista] = useState<Vista>("mes");
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [busqueda, setBusqueda] = useState("");

  const [diaSel, setDiaSel] = useState<string | null>(null);
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [cobrar, setCobrar] = useState<Pedido | null>(null);
  const [, startTransition] = useTransition();

  const year = cursor.getFullYear();
  const month = cursor.getMonth();

  // ── Filtrado en vivo (estado + búsqueda de cliente), sobre pedidos reales ──
  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return initial.filter((p) => {
      if (!p.activo) return false;
      if (filtro !== "todos" && p.estado !== filtro) return false;
      if (q && !(p.cliente?.nombre ?? "").toLowerCase().includes(q)) return false;
      return true;
    });
  }, [initial, filtro, busqueda]);

  const porDia = useMemo(() => {
    const map = new Map<string, Pedido[]>();
    for (const p of filtrados) {
      const arr = map.get(p.fecha_entrega) ?? [];
      arr.push(p);
      map.set(p.fecha_entrega, arr);
    }
    // Orden por hora dentro del día.
    for (const arr of map.values()) {
      arr.sort((a, b) => (a.hora_entrega ?? "").localeCompare(b.hora_entrega ?? ""));
    }
    return map;
  }, [filtrados]);

  // ── Días visibles según la vista ──
  const semanaInicio = useMemo(() => inicioSemana(cursor), [cursor]);
  const diasVista = useMemo<Date[]>(() => {
    if (vista === "semana") {
      return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(semanaInicio);
        d.setDate(d.getDate() + i);
        return d;
      });
    }
    const diasMes = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: diasMes }, (_, i) => new Date(year, month, i + 1));
  }, [vista, semanaInicio, year, month]);

  // Celdas de la grilla mensual (con relleno para alinear el lunes).
  const offset = (new Date(year, month, 1).getDay() + 6) % 7;
  const celdasMes: (Date | null)[] = [
    ...Array(offset).fill(null),
    ...diasVista,
  ];

  // Agenda (móvil): solo días con pedidos en el período visible.
  const agenda = diasVista
    .map((d) => ({ d, ps: porDia.get(iso(d)) ?? [] }))
    .filter((x) => x.ps.length > 0);

  function mover(delta: number) {
    const d = new Date(cursor);
    if (vista === "mes") d.setMonth(d.getMonth() + delta);
    else d.setDate(d.getDate() + delta * 7);
    setCursor(d);
  }

  function cambiarEstado(p: Pedido, estado: EstadoPedido) {
    return new Promise<void>((resolve) => {
      startTransition(async () => {
        await cambiarEstadoPedido(p.id, estado);
        router.refresh();
        setPedido((cur) => (cur && cur.id === p.id ? { ...cur, estado } : cur));
        resolve();
      });
    });
  }

  function nuevoPedido(fecha: string) {
    router.push(`/pedidos?nuevo=${fecha}`);
  }

  const etiquetaPeriodo =
    vista === "mes"
      ? `${MESES[month]} ${year}`
      : (() => {
          const fin = new Date(semanaInicio);
          fin.setDate(fin.getDate() + 6);
          const mismoMes = semanaInicio.getMonth() === fin.getMonth();
          return mismoMes
            ? `${semanaInicio.getDate()}–${fin.getDate()} ${MES_CORTO[fin.getMonth()]} ${fin.getFullYear()}`
            : `${semanaInicio.getDate()} ${MES_CORTO[semanaInicio.getMonth()]} – ${fin.getDate()} ${MES_CORTO[fin.getMonth()]}`;
        })();

  const periodoKey = vista === "mes" ? `m-${year}-${month}` : `w-${iso(semanaInicio)}`;
  const totalVisible = filtrados.filter((p) => {
    const d = new Date(p.fecha_entrega + "T00:00:00");
    return diasVista.some((x) => mismaFecha(x, d));
  }).length;

  const FILTROS: { id: Filtro; label: string }[] = [
    { id: "todos", label: "Todos" },
    ...ESTADOS.map((e) => ({ id: e.id as Filtro, label: e.label })),
  ];

  // ── Sub-render: un pedido como "chip" (visual, no botón) ──
  function Chip({ p }: { p: Pedido }) {
    return (
      <div className="flex items-center gap-1 rounded-lg bg-foreground/[0.04] px-1.5 py-1 text-[11px] font-medium">
        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${DOT[p.estado]}`} />
        {p.fotos[0] && (
          <span className="h-4 w-4 shrink-0 overflow-hidden rounded">
            <SignedImg src={p.fotos[0]} alt="" className="h-full w-full object-cover" />
          </span>
        )}
        <span className="truncate">
          {p.hora_entrega ? <span className="text-muted">{p.hora_entrega} </span> : ""}
          {p.cliente?.nombre ?? "Pedido"}
        </span>
      </div>
    );
  }

  const diaSelPedidos = diaSel ? porDia.get(diaSel) ?? [] : [];

  return (
    <>
      <Stagger className="mx-auto max-w-6xl space-y-5">
        {/* Encabezado + navegación */}
        <StaggerItem>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                Calendario de entregas
              </h1>
              <p className="mt-1 flex items-center gap-2 text-sm text-muted">
                <LiveDot label="En vivo" className="text-primary" /> ·{" "}
                {totalVisible} entrega(s) en vista
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => mover(-1)}
                aria-label={vista === "mes" ? "Mes anterior" : "Semana anterior"}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-foreground/10 bg-glass/60 backdrop-blur transition-colors hover:border-primary/40"
              >
                ‹
              </button>
              <span className="min-w-[8.5rem] text-center font-display text-base font-semibold sm:text-lg">
                {etiquetaPeriodo}
              </span>
              <button
                onClick={() => mover(1)}
                aria-label={vista === "mes" ? "Mes siguiente" : "Semana siguiente"}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-foreground/10 bg-glass/60 backdrop-blur transition-colors hover:border-primary/40"
              >
                ›
              </button>
              <button
                onClick={() => setCursor(new Date())}
                className="rounded-full border border-foreground/10 bg-glass/60 px-3 py-1.5 text-sm font-medium backdrop-blur transition-colors hover:border-primary/40"
              >
                Hoy
              </button>
            </div>
          </div>
        </StaggerItem>

        {/* Controles: búsqueda + vista + filtros */}
        <StaggerItem>
          <div className="space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar cliente…"
                className="flex-1 rounded-xl border border-foreground/15 bg-background/60 px-4 py-2.5 text-sm outline-none backdrop-blur transition-colors focus:border-primary"
              />
              <div className="inline-flex rounded-xl border border-foreground/10 bg-glass/50 p-1 backdrop-blur">
                {(
                  [
                    { id: "mes", label: "Mes" },
                    { id: "semana", label: "Semana" },
                  ] as const
                ).map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setVista(v.id)}
                    className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
                      vista === v.id
                        ? "bg-primary text-primary-foreground"
                        : "text-muted hover:text-foreground"
                    }`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {FILTROS.map((f) => {
                const activo = filtro === f.id;
                const dot = f.id !== "todos" ? DOT[f.id as EstadoPedido] : null;
                return (
                  <button
                    key={f.id}
                    onClick={() => setFiltro(f.id)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                      activo
                        ? "bg-primary text-primary-foreground"
                        : "border border-foreground/10 bg-glass/60 text-muted hover:text-foreground"
                    }`}
                  >
                    {dot && (
                      <span className={`h-1.5 w-1.5 rounded-full ${activo ? "bg-primary-foreground" : dot}`} />
                    )}
                    {f.label}
                  </button>
                );
              })}
            </div>
          </div>
        </StaggerItem>

        {/* Transición suave entre períodos */}
        <AnimatePresence mode="wait">
          <motion.div
            key={periodoKey}
            initial={reduce ? { opacity: 0 } : { opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, x: -12 }}
            transition={{ duration: reduce ? 0 : 0.25, ease: "easeOut" }}
          >
            {/* ───── Grilla (escritorio) ───── */}
            <div className="hidden md:block">
              <GlassCard className="p-4">
                <div className="mb-2 grid grid-cols-7 gap-2 text-center text-xs font-medium text-muted">
                  {DIAS.map((d) => (
                    <div key={d}>{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {(vista === "mes" ? celdasMes : diasVista).map((d, i) => {
                    if (d === null)
                      return <div key={`x-${i}`} className="min-h-[6.5rem] rounded-xl" />;
                    const k = iso(d);
                    const ps = porDia.get(k) ?? [];
                    const today = mismaFecha(d, hoy);
                    return (
                      <button
                        key={k}
                        onClick={() => setDiaSel(k)}
                        className={`flex min-h-[6.5rem] w-full flex-col rounded-xl border p-1.5 text-left transition-colors ${
                          vista === "semana" ? "min-h-[14rem]" : ""
                        } ${
                          today
                            ? "border-primary/50 bg-primary/[0.06]"
                            : "border-foreground/5 bg-foreground/[0.02] hover:border-primary/30 hover:bg-foreground/[0.04]"
                        }`}
                      >
                        <div
                          className={`mb-1 flex items-center justify-between text-xs font-medium ${
                            today ? "text-primary" : "text-muted"
                          }`}
                        >
                          <span>{d.getDate()}</span>
                          {ps.length > 0 && (
                            <span className="rounded-full bg-foreground/10 px-1.5 text-[10px] tabular-nums">
                              {ps.length}
                            </span>
                          )}
                        </div>
                        <div className="space-y-1">
                          {ps.slice(0, vista === "semana" ? 6 : 3).map((p) => (
                            <Chip key={p.id} p={p} />
                          ))}
                          {ps.length > (vista === "semana" ? 6 : 3) && (
                            <span className="block px-1 text-[10px] font-medium text-primary">
                              +{ps.length - (vista === "semana" ? 6 : 3)} más
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </GlassCard>
            </div>

            {/* ───── Agenda (móvil) ───── */}
            <div className="md:hidden">
              {agenda.length === 0 ? (
                <GlassCard className="p-8 text-center text-sm text-muted">
                  No hay entregas que coincidan en este período.
                </GlassCard>
              ) : (
                <div className="space-y-3">
                  {agenda.map(({ d, ps }) => {
                    const today = mismaFecha(d, hoy);
                    return (
                      <GlassCard key={iso(d)} className="p-4">
                        <button
                          onClick={() => setDiaSel(iso(d))}
                          className="mb-2 flex w-full items-center gap-2 text-left"
                        >
                          <span
                            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                              today ? "bg-primary text-primary-foreground" : "bg-foreground/10"
                            }`}
                          >
                            {d.getDate()}
                          </span>
                          <span className="text-sm text-muted">
                            {DIAS[(d.getDay() + 6) % 7]} · {ps.length} entrega(s)
                          </span>
                        </button>
                        <div className="space-y-2">
                          {ps.map((p) => (
                            <button
                              key={p.id}
                              onClick={() => setPedido(p)}
                              className="flex w-full items-center gap-3 rounded-xl border border-foreground/5 bg-foreground/[0.03] p-2.5 text-left transition-colors hover:border-primary/30"
                            >
                              <span className={`h-2 w-2 shrink-0 rounded-full ${DOT[p.estado]}`} />
                              <span className="tabular-nums text-sm font-semibold text-primary">
                                {p.hora_entrega ?? "—"}
                              </span>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium">
                                  {p.cliente?.nombre ?? "Pedido"}
                                </p>
                                <p className="truncate text-xs text-muted">
                                  {p.items[0]?.producto ?? p.descripcion ?? ""}
                                </p>
                              </div>
                              <EstadoBadge estado={p.estado} />
                            </button>
                          ))}
                        </div>
                      </GlassCard>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </Stagger>

      {/* Panel del día */}
      <Modal
        open={diaSel !== null}
        onClose={() => setDiaSel(null)}
        title={
          diaSel
            ? new Date(diaSel + "T00:00:00").toLocaleDateString("es-DO", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })
            : ""
        }
        subtitle={
          diaSelPedidos.length
            ? `${diaSelPedidos.length} entrega(s)`
            : "Sin entregas"
        }
        footer={
          diaSel ? (
            <button
              onClick={() => nuevoPedido(diaSel)}
              className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow"
            >
              + Nuevo pedido para este día
            </button>
          ) : undefined
        }
      >
        {diaSel && (
          <div className="space-y-2">
            {diaSelPedidos.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted">
                No hay entregas este día. Crea un pedido con esta fecha.
              </p>
            ) : (
              diaSelPedidos.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setDiaSel(null);
                    setPedido(p);
                  }}
                  className="flex w-full items-center gap-3 rounded-xl border border-foreground/5 bg-foreground/[0.03] p-3 text-left transition-colors hover:border-primary/30"
                >
                  <span className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-primary/15">
                    {p.fotos[0] ? (
                      <SignedImg src={p.fotos[0]} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center">🧁</span>
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {p.hora_entrega ? `${p.hora_entrega} · ` : ""}
                      {p.cliente?.nombre ?? "Pedido"}
                    </p>
                    <p className="truncate text-xs text-muted">
                      {p.items[0]?.producto ?? p.descripcion ?? ""} · {fmtRD(p.total)}
                    </p>
                  </div>
                  <EstadoBadge estado={p.estado} />
                </button>
              ))
            )}
          </div>
        )}
      </Modal>

      {/* Detalle del pedido (mismo del módulo Pedidos) */}
      <Modal
        open={pedido !== null}
        onClose={() => setPedido(null)}
        title={pedido ? `Pedido #${pedido.numero}` : ""}
        subtitle={pedido?.ocasion ?? undefined}
      >
        {pedido && (
          <PedidoDetalle
            pedido={pedido}
            onEstadoChange={(estado) => cambiarEstado(pedido, estado)}
            onCobrar={() => setCobrar(pedido)}
          />
        )}
      </Modal>

      {/* Cobrar pago */}
      <Modal
        open={cobrar !== null}
        onClose={() => setCobrar(null)}
        title="Cobrar pago"
        subtitle={cobrar ? `Pedido #${cobrar.numero}` : undefined}
      >
        {cobrar && (
          <CobrarPagoForm
            pedido={cobrar}
            onDone={() => {
              setCobrar(null);
              setPedido(null);
              router.refresh();
            }}
          />
        )}
      </Modal>
    </>
  );
}
