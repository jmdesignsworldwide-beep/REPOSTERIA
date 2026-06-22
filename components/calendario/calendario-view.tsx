"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Stagger, StaggerItem } from "@/components/ui/stagger";
import { Magnetic } from "@/components/ui/magnetic";
import { GlassCard } from "@/components/ui/glass-card";
import { Modal } from "@/components/ui/modal";
import { LiveDot } from "@/components/ui/live-dot";
import { PedidoDetalle, EstadoBadge } from "@/components/pedidos/pedido-detalle";
import { CobrarPagoForm } from "@/components/pedidos/cobrar-pago";
import { cambiarEstadoPedido } from "@/app/(app)/pedidos/actions";
import type { EstadoPedido, Pedido } from "@/lib/pedidos/types";

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];
const DIAS = ["L", "M", "X", "J", "V", "S", "D"];

const pad = (n: number) => String(n).padStart(2, "0");
const key = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;

export function CalendarioView({ initial }: { initial: Pedido[] }) {
  const router = useRouter();
  const hoy = new Date();
  const [year, setYear] = useState(hoy.getFullYear());
  const [month, setMonth] = useState(hoy.getMonth());
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [cobrar, setCobrar] = useState<Pedido | null>(null);
  const [, startTransition] = useTransition();

  const porDia = useMemo(() => {
    const map = new Map<string, Pedido[]>();
    for (const p of initial) {
      if (!p.activo) continue;
      const arr = map.get(p.fecha_entrega) ?? [];
      arr.push(p);
      map.set(p.fecha_entrega, arr);
    }
    return map;
  }, [initial]);

  const primerDia = new Date(year, month, 1);
  // 0 = lunes … 6 = domingo
  const offset = (primerDia.getDay() + 6) % 7;
  const diasMes = new Date(year, month + 1, 0).getDate();
  const celdas: (number | null)[] = [
    ...Array(offset).fill(null),
    ...Array.from({ length: diasMes }, (_, i) => i + 1),
  ];

  // Agenda (móvil): solo días con pedidos, ordenados.
  const agenda = useMemo(() => {
    const dias: { dia: number; fecha: string; pedidos: Pedido[] }[] = [];
    for (let d = 1; d <= diasMes; d++) {
      const k = key(year, month, d);
      const ps = porDia.get(k);
      if (ps && ps.length) dias.push({ dia: d, fecha: k, pedidos: ps });
    }
    return dias;
  }, [porDia, year, month, diasMes]);

  function mover(delta: number) {
    let m = month + delta;
    let y = year;
    if (m < 0) {
      m = 11;
      y--;
    } else if (m > 11) {
      m = 0;
      y++;
    }
    setMonth(m);
    setYear(y);
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

  const esHoy = (d: number) =>
    year === hoy.getFullYear() &&
    month === hoy.getMonth() &&
    d === hoy.getDate();

  return (
    <>
      <Stagger className="mx-auto max-w-6xl space-y-6">
        <StaggerItem>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                Calendario de entregas
              </h1>
              <p className="mt-1 flex items-center gap-2 text-sm text-muted">
                <LiveDot label="En vivo" className="text-primary" /> · mismos
                pedidos, por fecha
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => mover(-1)}
                aria-label="Mes anterior"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-foreground/10 bg-glass/60 backdrop-blur"
              >
                ‹
              </button>
              <span className="min-w-40 text-center font-display text-lg font-semibold">
                {MESES[month]} {year}
              </span>
              <button
                onClick={() => mover(1)}
                aria-label="Mes siguiente"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-foreground/10 bg-glass/60 backdrop-blur"
              >
                ›
              </button>
            </div>
          </div>
        </StaggerItem>

        {/* ───── Grilla mensual (escritorio) ───── */}
        <StaggerItem className="hidden md:block">
          <GlassCard className="p-4">
            <div className="mb-2 grid grid-cols-7 gap-2 text-center text-xs font-medium text-muted">
              {DIAS.map((d) => (
                <div key={d}>{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {celdas.map((d, i) => {
                if (d === null)
                  return <div key={i} className="min-h-24 rounded-xl" />;
                const ps = porDia.get(key(year, month, d)) ?? [];
                return (
                  <div
                    key={i}
                    className={`min-h-24 rounded-xl border p-1.5 ${
                      esHoy(d)
                        ? "border-primary/50 bg-primary/[0.06]"
                        : "border-foreground/5 bg-foreground/[0.02]"
                    }`}
                  >
                    <div
                      className={`mb-1 text-xs font-medium ${
                        esHoy(d) ? "text-primary" : "text-muted"
                      }`}
                    >
                      {d}
                    </div>
                    <div className="space-y-1">
                      {ps.map((p) => (
                        <Magnetic key={p.id} strength={0.12} glow={false}>
                          <button
                            onClick={() => setPedido(p)}
                            className="flex w-full items-center gap-1 rounded-lg bg-primary/15 px-1.5 py-1 text-left text-[11px] font-medium hover:bg-primary/25"
                          >
                            <span className="truncate">
                              {p.hora_entrega ? `${p.hora_entrega} ` : ""}
                              {p.cliente?.nombre ?? "Pedido"}
                            </span>
                          </button>
                        </Magnetic>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </StaggerItem>

        {/* ───── Agenda (móvil) ───── */}
        <StaggerItem className="md:hidden">
          {agenda.length === 0 ? (
            <GlassCard className="p-8 text-center text-sm text-muted">
              No hay entregas en {MESES[month]}.
            </GlassCard>
          ) : (
            <Stagger className="space-y-3">
              {agenda.map((g) => (
                <StaggerItem key={g.fecha}>
                  <GlassCard className="p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                          esHoy(g.dia)
                            ? "bg-primary text-primary-foreground"
                            : "bg-foreground/10"
                        }`}
                      >
                        {g.dia}
                      </span>
                      <span className="text-sm text-muted">
                        {DIAS[(new Date(year, month, g.dia).getDay() + 6) % 7]} ·{" "}
                        {g.pedidos.length} entrega(s)
                      </span>
                    </div>
                    <div className="space-y-2">
                      {g.pedidos.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => setPedido(p)}
                          className="flex w-full items-center gap-3 rounded-xl border border-foreground/5 bg-foreground/[0.03] p-2.5 text-left"
                        >
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
                </StaggerItem>
              ))}
            </Stagger>
          )}
        </StaggerItem>
      </Stagger>

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
