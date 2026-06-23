"use client";

import { useMemo, useState } from "react";
import { Stagger, StaggerItem } from "@/components/ui/stagger";
import { GlassCard } from "@/components/ui/glass-card";
import { Modal } from "@/components/ui/modal";
import { Disclaimer } from "@/components/ui/disclaimer";
import { fmtRD } from "@/lib/data/mock";
import { metodoLabel, type Movimiento } from "@/lib/caja/types";

/** Voucher de ejemplo derivado del método (transferencia/tarjeta dejan rastro). */
function voucherDe(m: Movimiento): string | null {
  const ref = m.id.slice(0, 6).toUpperCase();
  if (m.metodo === "transferencia") return `TRX-${ref}`;
  if (m.metodo === "tarjeta") return `APR-${ref}`;
  return null;
}

/**
 * Pagos & recibos — vista enfocada de la Caja: SOLO los ingresos (pagos
 * recibidos), con lo único que la lista de movimientos no muestra: número de
 * voucher por método y un recibo de ejemplo imprimible. El dinero sigue
 * teniendo un solo origen (movimientos_caja); esto es una lente, no otra fuente.
 */
export function PagosPanel({ movimientos }: { movimientos: Movimiento[] }) {
  const [sel, setSel] = useState<Movimiento | null>(null);

  const pagos = useMemo(
    () =>
      movimientos
        .filter((m) => m.tipo === "ingreso" && !m.anulado)
        .sort((a, b) => b.created_at.localeCompare(a.created_at)),
    [movimientos],
  );

  const total = pagos.reduce((s, m) => s + Number(m.monto), 0);
  const conVoucher = pagos.filter((m) => voucherDe(m) !== null).length;

  return (
    <>
      <Stagger className="space-y-6">
        {/* Resumen */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Cobrado", value: fmtRD(total), cls: "text-emerald-600 dark:text-emerald-400" },
            { label: "Pagos", value: String(pagos.length), cls: "text-foreground" },
            { label: "Con voucher", value: String(conVoucher), cls: "text-primary" },
          ].map((k) => (
            <StaggerItem key={k.label}>
              <GlassCard className="p-4 sm:p-5">
                <p className="text-xs font-medium text-muted">{k.label}</p>
                <p className={`mt-2 text-xl font-bold tabular-nums sm:text-2xl ${k.cls}`}>
                  {k.value}
                </p>
              </GlassCard>
            </StaggerItem>
          ))}
        </div>

        {/* Lista de pagos */}
        <StaggerItem>
          <GlassCard className="p-5">
            <h2 className="mb-4 font-display text-lg font-semibold">
              Pagos recibidos
            </h2>
            {pagos.length === 0 ? (
              <p className="text-sm text-muted">
                Aún no hay pagos. Cobra un pedido desde Pedidos o registra una
                entrada en la pestaña Entradas y salidas.
              </p>
            ) : (
              <Stagger className="space-y-2">
                {pagos.map((m) => {
                  const v = voucherDe(m);
                  return (
                    <StaggerItem key={m.id}>
                      <button
                        onClick={() => setSel(m)}
                        className="flex w-full items-center gap-3 rounded-xl border border-foreground/5 bg-foreground/[0.03] p-3 text-left transition-colors hover:border-primary/30"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                          🧾
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {m.pedido?.cliente?.nombre ?? m.concepto}
                          </p>
                          <p className="truncate text-xs text-muted">
                            {metodoLabel(m.metodo)}
                            {m.pedido ? ` · Pedido #${m.pedido.numero}` : ""}
                            {v ? ` · ${v}` : ""}
                          </p>
                        </div>
                        <span className="shrink-0 tabular-nums font-semibold text-emerald-600 dark:text-emerald-400">
                          {fmtRD(Number(m.monto))}
                        </span>
                      </button>
                    </StaggerItem>
                  );
                })}
              </Stagger>
            )}
          </GlassCard>
        </StaggerItem>
      </Stagger>

      {/* Recibo de ejemplo */}
      <Modal
        open={sel !== null}
        onClose={() => setSel(null)}
        title="Recibo"
        subtitle={sel ? sel.fecha : undefined}
      >
        {sel && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-foreground/10 bg-foreground/[0.03] p-5 text-sm">
              <p className="mb-3 text-center font-display text-lg font-semibold">
                🍮 Azúcar &amp; Canela
              </p>
              <Linea label="Cliente" valor={sel.pedido?.cliente?.nombre ?? sel.concepto} />
              {sel.pedido && <Linea label="Pedido" valor={`#${sel.pedido.numero}`} />}
              <Linea label="Método" valor={metodoLabel(sel.metodo)} />
              {voucherDe(sel) && <Linea label="Voucher / Ref." valor={voucherDe(sel)!} />}
              <Linea label="Fecha" valor={sel.fecha} />
              <div className="mt-3 flex items-center justify-between border-t border-foreground/10 pt-3 text-base font-semibold">
                <span>Total</span>
                <span className="tabular-nums text-emerald-600 dark:text-emerald-400">
                  {fmtRD(Number(sel.monto))}
                </span>
              </div>
            </div>
            <Disclaimer>
              Documento de ejemplo generado para demostración. No es un recibo
              fiscal certificado; la verificación de voucher es simulada (sin
              integración bancaria real).
            </Disclaimer>
          </div>
        )}
      </Modal>
    </>
  );
}

function Linea({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="flex items-center justify-between border-b border-foreground/5 py-1.5">
      <span className="text-muted">{label}</span>
      <span className="text-right font-medium">{valor}</span>
    </div>
  );
}
