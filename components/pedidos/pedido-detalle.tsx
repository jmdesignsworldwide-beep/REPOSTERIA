"use client";

import { useState } from "react";
import { fmtRD } from "@/lib/data/mock";
import { ESTADOS, estadoMeta, abonadoDe, balanceDe } from "@/lib/pedidos/types";
import type { EstadoPedido, Pedido } from "@/lib/pedidos/types";
import { SignedImg } from "@/components/ui/signed-img";

export function EstadoBadge({ estado }: { estado: EstadoPedido }) {
  const e = estadoMeta(estado);
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${e.cls}`}>
      {e.label}
    </span>
  );
}

export function PedidoDetalle({
  pedido,
  onEstadoChange,
  onCobrar,
}: {
  pedido: Pedido;
  onEstadoChange?: (estado: EstadoPedido) => Promise<void> | void;
  onCobrar?: () => void;
}) {
  const [cambiando, setCambiando] = useState<EstadoPedido | null>(null);
  const abonado = abonadoDe(pedido);
  const balance = balanceDe(pedido);

  async function cambiar(e: EstadoPedido) {
    if (!onEstadoChange || e === pedido.estado) return;
    setCambiando(e);
    await onEstadoChange(e);
    setCambiando(null);
  }

  return (
    <div className="space-y-5">
      {/* Cliente + estado */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium">{pedido.cliente?.nombre ?? "Cliente"}</p>
          <p className="text-sm text-muted">{pedido.cliente?.telefono}</p>
        </div>
        <div className="text-right">
          <EstadoBadge estado={pedido.estado} />
          <p className="mt-1 text-xs text-muted">
            Entrega {pedido.fecha_entrega}
            {pedido.hora_entrega ? ` · ${pedido.hora_entrega}` : ""}
          </p>
        </div>
      </div>

      {/* Cambiar estado */}
      {onEstadoChange && (
        <div className="flex flex-wrap gap-1.5">
          {ESTADOS.map((s) => (
            <button
              key={s.id}
              type="button"
              disabled={cambiando !== null}
              onClick={() => cambiar(s.id)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors disabled:opacity-50 ${
                pedido.estado === s.id
                  ? "bg-primary text-primary-foreground"
                  : "border border-foreground/15 bg-glass/60 text-muted hover:text-foreground"
              }`}
            >
              {cambiando === s.id ? "…" : s.label}
            </button>
          ))}
        </div>
      )}

      {/* Fotos (bucket privado → URL firmada) */}
      {pedido.fotos.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {pedido.fotos.map((path) => (
            <div
              key={path}
              className="h-24 w-24 overflow-hidden rounded-xl border border-foreground/10"
            >
              <SignedImg src={path} alt="Referencia" className="h-full w-full object-cover" />
            </div>
          ))}
        </div>
      )}

      {/* Renglones */}
      <div>
        <p className="mb-2 text-xs font-medium text-muted">Renglones</p>
        <div className="space-y-1.5">
          {pedido.items.map((it, i) => (
            <div
              key={it.id ?? i}
              className="flex items-center justify-between rounded-lg border border-foreground/5 bg-foreground/[0.03] px-3 py-2 text-sm"
            >
              <span>
                {it.cantidad}× {it.producto}
                {it.sabor ? ` · ${it.sabor}` : ""}
                {it.tamano ? ` · ${it.tamano}` : ""}
              </span>
              <span className="tabular-nums font-medium">
                {fmtRD(it.cantidad * it.precio)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Totales */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl border border-foreground/10 bg-foreground/[0.03] p-3">
          <p className="text-xs text-muted">Total</p>
          <p className="tabular-nums font-semibold">{fmtRD(pedido.total)}</p>
        </div>
        <div className="rounded-xl border border-foreground/10 bg-foreground/[0.03] p-3">
          <p className="text-xs text-muted">Abonado</p>
          <p className="tabular-nums font-semibold text-emerald-600 dark:text-emerald-400">
            {fmtRD(abonado)}
          </p>
        </div>
        <div className="rounded-xl border border-foreground/10 bg-foreground/[0.03] p-3">
          <p className="text-xs text-muted">Balance</p>
          <p className="tabular-nums font-semibold text-primary">
            {fmtRD(balance)}
          </p>
        </div>
      </div>

      {/* Cobrar pago → entra a la caja */}
      {onCobrar && balance > 0 && (
        <button
          type="button"
          onClick={onCobrar}
          className="w-full rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-sm font-semibold text-emerald-700 dark:text-emerald-400"
        >
          💵 Cobrar pago ({fmtRD(balance)})
        </button>
      )}

      {/* Notas */}
      {pedido.notas && (
        <div className="rounded-xl border border-foreground/10 bg-primary/[0.06] p-3 text-sm">
          <p className="mb-1 text-xs font-medium text-muted">Notas</p>
          {pedido.notas}
        </div>
      )}
    </div>
  );
}
