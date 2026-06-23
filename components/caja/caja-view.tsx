"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Stagger, StaggerItem } from "@/components/ui/stagger";
import { Magnetic } from "@/components/ui/magnetic";
import { CountUp } from "@/components/ui/count-up";
import { GlassCard } from "@/components/ui/glass-card";
import { LiveDot } from "@/components/ui/live-dot";
import { Modal } from "@/components/ui/modal";
import { fmtRD } from "@/lib/data/mock";
import {
  METODOS,
  categoriaLabel,
  metodoLabel,
  type Movimiento,
  type TipoMov,
} from "@/lib/caja/types";
import { MovimientoForm } from "./movimiento-form";
import { PagosPanel } from "./pagos-panel";
import { anularMovimiento } from "@/app/(app)/caja/actions";

type Rango = "dia" | "semana" | "mes";

type ModalState =
  | { type: "nuevo"; tipo: TipoMov }
  | { type: "detalle"; mov: Movimiento }
  | { type: "confirmar"; mov: Movimiento }
  | null;

const pad = (n: number) => String(n).padStart(2, "0");
const hoyStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
function desdeStr(rango: Rango) {
  const d = new Date();
  if (rango === "dia") return hoyStr();
  if (rango === "semana") {
    d.setDate(d.getDate() - 6);
  } else {
    d.setDate(1);
  }
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function CajaView({ initial }: { initial: Movimiento[] }) {
  const router = useRouter();
  const [rango, setRango] = useState<Rango>("dia");
  const [vista, setVista] = useState<"movimientos" | "pagos">("movimientos");
  const [modal, setModal] = useState<ModalState>(null);
  const [pending, startTransition] = useTransition();

  const desde = desdeStr(rango);
  const hasta = hoyStr();

  const lista = useMemo(
    () =>
      initial
        .filter((m) => m.fecha >= desde && m.fecha <= hasta)
        .sort((a, b) => b.created_at.localeCompare(a.created_at)),
    [initial, desde, hasta],
  );

  const vivos = lista.filter((m) => !m.anulado);
  const ingresos = vivos.filter((m) => m.tipo === "ingreso").reduce((s, m) => s + Number(m.monto), 0);
  const egresos = vivos.filter((m) => m.tipo === "egreso").reduce((s, m) => s + Number(m.monto), 0);
  const neto = ingresos - egresos;

  // Arqueo por método (neto)
  const arqueo = METODOS.map((m) => {
    const ing = vivos.filter((x) => x.tipo === "ingreso" && x.metodo === m.id).reduce((s, x) => s + Number(x.monto), 0);
    const egr = vivos.filter((x) => x.tipo === "egreso" && x.metodo === m.id).reduce((s, x) => s + Number(x.monto), 0);
    return { ...m, neto: ing - egr };
  });

  function anular(mov: Movimiento) {
    startTransition(async () => {
      await anularMovimiento(mov.id);
      setModal(null);
      router.refresh();
    });
  }

  const RANGOS: { id: Rango; label: string }[] = [
    { id: "dia", label: "Día" },
    { id: "semana", label: "Semana" },
    { id: "mes", label: "Mes" },
  ];

  return (
    <>
      <Stagger className="mx-auto max-w-5xl space-y-6">
        <StaggerItem>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                Caja
              </h1>
              <p className="mt-1 flex items-center gap-2 text-sm text-muted">
                <LiveDot label="En vivo" className="text-primary" /> ·{" "}
                {rango === "dia" ? hoyStr() : `desde ${desde}`}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Magnetic strength={0.2}>
                <Link
                  href="/pos"
                  className="rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow"
                >
                  ⚡ Venta rápida
                </Link>
              </Magnetic>
              <Magnetic strength={0.2} glow={false}>
                <button
                  onClick={() => setModal({ type: "nuevo", tipo: "ingreso" })}
                  className="rounded-full bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white"
                >
                  + Entrada
                </button>
              </Magnetic>
              <Magnetic strength={0.2} glow={false}>
                <button
                  onClick={() => setModal({ type: "nuevo", tipo: "egreso" })}
                  className="rounded-full border border-foreground/15 bg-glass/60 px-4 py-2.5 text-sm font-semibold backdrop-blur"
                >
                  + Salida
                </button>
              </Magnetic>
            </div>
          </div>
        </StaggerItem>

        {/* Balance */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Entradas", value: ingresos, cls: "text-emerald-600 dark:text-emerald-400" },
            { label: "Salidas", value: egresos, cls: "text-red-600 dark:text-red-400" },
            { label: "Saldo del día", value: neto, cls: "text-primary" },
          ].map((b) => (
            <StaggerItem key={b.label}>
              <GlassCard className="p-4 sm:p-5">
                <p className="text-xs font-medium text-muted">{b.label}</p>
                <p className={`mt-2 text-xl font-bold tabular-nums sm:text-2xl ${b.cls}`}>
                  <CountUp value={b.value} prefix="RD$ " />
                </p>
              </GlassCard>
            </StaggerItem>
          ))}
        </div>

        {/* Filtros: rango de fechas + vista */}
        <StaggerItem>
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex rounded-xl border border-foreground/10 bg-glass/50 p-1 backdrop-blur">
              {RANGOS.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setRango(r.id)}
                  className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
                    rango === r.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
            <div className="inline-flex rounded-xl border border-foreground/10 bg-glass/50 p-1 backdrop-blur">
              {(
                [
                  { id: "movimientos", label: "💸 Entradas y salidas" },
                  { id: "pagos", label: "🧾 Pagos y recibos" },
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
        </StaggerItem>

        {vista === "pagos" ? (
          <PagosPanel movimientos={lista} />
        ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Lista */}
          <StaggerItem className="lg:col-span-2">
            <GlassCard className="p-5">
              <h2 className="mb-4 font-display text-lg font-semibold">
                Entradas y salidas
              </h2>
              {lista.length === 0 ? (
                <p className="text-sm text-muted">No hay entradas ni salidas en este rango.</p>
              ) : (
                <Stagger className="space-y-2">
                  {lista.map((m) => (
                    <StaggerItem key={m.id}>
                      <button
                        onClick={() => setModal({ type: "detalle", mov: m })}
                        className={`flex w-full items-center gap-3 rounded-xl border border-foreground/5 bg-foreground/[0.03] p-3 text-left transition-colors hover:border-primary/30 ${
                          m.anulado ? "opacity-50" : ""
                        }`}
                      >
                        <span
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                            m.tipo === "ingreso"
                              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                              : "bg-red-500/15 text-red-600 dark:text-red-400"
                          }`}
                        >
                          {m.tipo === "ingreso" ? "↑" : "↓"}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className={`truncate text-sm font-medium ${m.anulado ? "line-through" : ""}`}>
                            {m.concepto}
                          </p>
                          <p className="truncate text-xs text-muted">
                            {categoriaLabel(m.categoria)} · {metodoLabel(m.metodo)}
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p
                            className={`tabular-nums font-semibold ${
                              m.tipo === "ingreso"
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-red-600 dark:text-red-400"
                            }`}
                          >
                            {m.tipo === "ingreso" ? "+" : "−"}
                            {fmtRD(Number(m.monto))}
                          </p>
                          {m.anulado && (
                            <span className="text-[10px] text-muted">anulado</span>
                          )}
                        </div>
                      </button>
                    </StaggerItem>
                  ))}
                </Stagger>
              )}
            </GlassCard>
          </StaggerItem>

          {/* Arqueo */}
          <StaggerItem>
            <GlassCard className="p-5">
              <h2 className="mb-1 font-display text-lg font-semibold">
                Cierre de caja
              </h2>
              <p className="mb-4 text-xs text-muted">Neto por método</p>
              <div className="space-y-2">
                {arqueo.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between rounded-lg border border-foreground/5 bg-foreground/[0.03] px-3 py-2 text-sm"
                  >
                    <span>{a.label}</span>
                    <span className="tabular-nums font-medium">{fmtRD(a.neto)}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between border-t border-foreground/10 px-3 pt-3 text-sm font-semibold">
                  <span>Total en caja</span>
                  <span className="tabular-nums text-primary">{fmtRD(neto)}</span>
                </div>
              </div>
            </GlassCard>
          </StaggerItem>
        </div>
        )}
      </Stagger>

      {/* Nuevo */}
      <Modal
        open={modal?.type === "nuevo"}
        onClose={() => setModal(null)}
        title="Nueva entrada o salida"
        subtitle="Se guarda en la caja"
      >
        {modal?.type === "nuevo" && (
          <MovimientoForm
            tipoInicial={modal.tipo}
            onDone={() => {
              setModal(null);
              router.refresh();
            }}
          />
        )}
      </Modal>

      {/* Detalle */}
      <Modal
        open={modal?.type === "detalle"}
        onClose={() => setModal(null)}
        title={modal?.type === "detalle" ? modal.mov.concepto : ""}
        subtitle={
          modal?.type === "detalle"
            ? `${modal.mov.tipo === "ingreso" ? "Entrada" : "Salida"} · ${modal.mov.fecha}`
            : undefined
        }
        footer={
          modal?.type === "detalle" && !modal.mov.anulado ? (
            <button
              onClick={() => setModal({ type: "confirmar", mov: modal.mov })}
              className="w-full rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-600 dark:text-red-400"
            >
              Anular
            </button>
          ) : undefined
        }
      >
        {modal?.type === "detalle" && (
          <div className="space-y-3 text-sm">
            <Campo
              label="Monto"
              valor={`${modal.mov.tipo === "ingreso" ? "+" : "−"}${fmtRD(Number(modal.mov.monto))}`}
            />
            <Campo label="Categoría" valor={categoriaLabel(modal.mov.categoria)} />
            <Campo label="Método" valor={metodoLabel(modal.mov.metodo)} />
            <Campo label="Fecha" valor={modal.mov.fecha} />
            {modal.mov.pedido && (
              <Link
                href="/pedidos"
                className="block rounded-xl border border-primary/30 bg-primary/[0.06] px-3 py-2 text-sm font-medium text-primary"
              >
                🧾 Ver pedido #{modal.mov.pedido.numero} →
              </Link>
            )}
            {modal.mov.anulado && (
              <p className="rounded-xl border border-foreground/10 bg-foreground/[0.04] px-3 py-2 text-muted">
                Esta entrada o salida está anulada (no cuenta en el saldo).
              </p>
            )}
          </div>
        )}
      </Modal>

      {/* Confirmar anular */}
      <Modal
        open={modal?.type === "confirmar"}
        onClose={() => setModal(null)}
        title="¿Anular esta entrada o salida?"
      >
        {modal?.type === "confirmar" && (
          <div className="space-y-5">
            <p className="text-sm text-muted">
              <span className="font-medium text-foreground">
                {modal.mov.concepto}
              </span>{" "}
              dejará de contar en el saldo. No se borra: queda registrado como
              anulado para un cierre de caja honesto.
            </p>
            <div className="flex gap-2">
              <button
                disabled={pending}
                onClick={() => anular(modal.mov)}
                className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
              >
                {pending ? "Anulando…" : "Sí, anular"}
              </button>
              <button
                onClick={() => setModal(null)}
                className="rounded-xl border border-foreground/15 bg-glass/60 px-4 py-2.5 text-sm font-semibold backdrop-blur"
              >
                Cancelar
              </button>
            </div>
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
      <span className="text-right font-medium tabular-nums">{valor}</span>
    </div>
  );
}
