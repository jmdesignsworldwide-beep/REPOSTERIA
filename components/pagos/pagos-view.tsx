"use client";

import { useState } from "react";
import { Stagger, StaggerItem } from "@/components/ui/stagger";
import { Magnetic } from "@/components/ui/magnetic";
import { GlassCard } from "@/components/ui/glass-card";
import { Modal } from "@/components/ui/modal";
import { CountUp } from "@/components/ui/count-up";
import { Disclaimer } from "@/components/ui/disclaimer";
import { fmtRD } from "@/lib/data/mock";
import { METODO_PAGO_LABEL, type Pago } from "@/lib/data/pagos";

export function PagosView({ pagos }: { pagos: Pago[] }) {
  const [sel, setSel] = useState<Pago | null>(null);

  const totalCobrado = pagos.filter((p) => p.estado === "verificado").reduce((s, p) => s + p.monto, 0);
  const pendientes = pagos.filter((p) => p.estado === "pendiente").length;

  return (
    <>
      <Stagger className="mx-auto max-w-5xl space-y-6">
        <StaggerItem>
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Pagos
          </h1>
          <p className="mt-1 text-sm text-muted">
            Cobros, vouchers y recibos
          </p>
        </StaggerItem>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {[
            { label: "Cobrado", value: totalCobrado, prefix: "RD$ ", cls: "text-emerald-600 dark:text-emerald-400" },
            { label: "Pagos", value: pagos.length, prefix: "", cls: "text-foreground" },
            { label: "Pendientes", value: pendientes, prefix: "", cls: "text-amber-600 dark:text-amber-400" },
          ].map((k) => (
            <StaggerItem key={k.label}>
              <GlassCard className="p-4 sm:p-5">
                <p className="text-xs font-medium text-muted">{k.label}</p>
                <p className={`mt-2 font-display text-xl font-bold tabular-nums sm:text-2xl ${k.cls}`}>
                  <CountUp value={k.value} prefix={k.prefix} />
                </p>
              </GlassCard>
            </StaggerItem>
          ))}
        </div>

        {pendientes > 0 && (
          <StaggerItem>
            <Disclaimer>
              Hay {pendientes} pago(s) por verificar. La verificación de voucher
              es simulada para demostración (sin integración bancaria real).
            </Disclaimer>
          </StaggerItem>
        )}

        <Stagger className="space-y-2">
          {pagos.map((p) => (
            <StaggerItem key={p.id}>
              <Magnetic strength={0.08} glow={false}>
                <button
                  onClick={() => setSel(p)}
                  className="flex w-full items-center gap-3 rounded-2xl border border-foreground/5 bg-foreground/[0.03] p-4 text-left transition-colors hover:border-primary/30"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                    💵
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{p.cliente}</p>
                    <p className="truncate text-xs text-muted">
                      {METODO_PAGO_LABEL[p.metodo]}
                      {p.pedidoRef ? ` · ${p.pedidoRef}` : ""}
                      {p.voucher ? ` · ${p.voucher}` : ""}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="tabular-nums font-semibold">{fmtRD(p.monto)}</p>
                    <span
                      className={`text-[10px] font-semibold ${
                        p.estado === "verificado"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      {p.estado === "verificado" ? "✓ Verificado" : "⏳ Pendiente"}
                    </span>
                  </div>
                </button>
              </Magnetic>
            </StaggerItem>
          ))}
        </Stagger>
      </Stagger>

      <Modal
        open={sel !== null}
        onClose={() => setSel(null)}
        title={sel ? `Recibo · ${sel.cliente}` : ""}
        subtitle={sel?.fecha}
      >
        {sel && (
          <div className="space-y-4">
            {/* Recibo de ejemplo */}
            <div className="rounded-2xl border border-foreground/10 bg-foreground/[0.03] p-4">
              <div className="flex items-center justify-between border-b border-foreground/10 pb-3">
                <span className="font-display font-semibold">🍮 Azúcar &amp; Canela</span>
                <span className="text-xs text-muted">Recibo de pago</span>
              </div>
              <div className="space-y-2 py-3 text-sm">
                <Campo label="Cliente" valor={sel.cliente} />
                {sel.pedidoRef && <Campo label="Pedido" valor={sel.pedidoRef} />}
                <Campo label="Método" valor={METODO_PAGO_LABEL[sel.metodo]} />
                {sel.voucher && <Campo label="Voucher / Ref." valor={sel.voucher} />}
                <Campo label="Fecha" valor={sel.fecha} />
              </div>
              <div className="flex items-center justify-between border-t border-foreground/10 pt-3">
                <span className="font-medium">Total</span>
                <span className="font-display text-xl font-bold tabular-nums text-primary">
                  {fmtRD(sel.monto)}
                </span>
              </div>
            </div>

            {sel.voucher && (
              <Disclaimer>
                Verificación de voucher simulada (sin integración bancaria real).
                No se detectaron duplicados.
              </Disclaimer>
            )}
            <Disclaimer>
              Documento de ejemplo generado para demostración. No es un recibo
              fiscal certificado.
            </Disclaimer>
          </div>
        )}
      </Modal>
    </>
  );
}

function Campo({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted">{label}</span>
      <span className="font-medium">{valor}</span>
    </div>
  );
}
