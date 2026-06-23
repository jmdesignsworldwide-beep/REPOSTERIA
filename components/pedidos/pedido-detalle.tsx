"use client";

import { useState } from "react";
import { fmtRD } from "@/lib/data/mock";
import { ESTADOS, estadoMeta, abonadoDe, balanceDe } from "@/lib/pedidos/types";
import type { EstadoPedido, Pedido } from "@/lib/pedidos/types";
import { SignedImg } from "@/components/ui/signed-img";
import { Lightbox } from "@/components/ui/lightbox";
import { linkWhatsAppPedido } from "@/lib/pedidos/whatsapp";

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
  const [lbIndex, setLbIndex] = useState<number | null>(null);
  const abonado = abonadoDe(pedido);
  const balance = balanceDe(pedido);
  const wa = linkWhatsAppPedido(pedido);

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

      {/* Fotos (bucket privado → URL firmada). Clic → ampliar. */}
      {pedido.fotos.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {pedido.fotos.map((path, i) => (
            <button
              key={path}
              type="button"
              onClick={() => setLbIndex(i)}
              aria-label="Ver foto en grande"
              className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-xl border border-foreground/10 bg-foreground/[0.04] p-1 transition-colors hover:border-primary/40"
            >
              <SignedImg src={path} alt="Referencia" className="max-h-full max-w-full rounded-lg object-contain" />
            </button>
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

      {/* Compartir por WhatsApp con el cliente */}
      {wa ? (
        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-sm font-semibold text-emerald-700 dark:text-emerald-400"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
            <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.728-.979zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.247-.694.247-1.289.173-1.413z" />
          </svg>
          Enviar por WhatsApp
        </a>
      ) : (
        <div className="rounded-xl border border-foreground/10 bg-foreground/[0.04] px-4 py-2.5 text-center text-xs text-muted">
          Agrega un teléfono al cliente para enviar el pedido por WhatsApp.
        </div>
      )}

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

      <Lightbox
        paths={pedido.fotos}
        index={lbIndex}
        onClose={() => setLbIndex(null)}
        onIndex={setLbIndex}
      />
    </div>
  );
}
