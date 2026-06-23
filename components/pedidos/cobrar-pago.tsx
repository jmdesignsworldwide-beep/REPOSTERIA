"use client";

import { useState } from "react";
import { fmtRD } from "@/lib/data/mock";
import { balanceDe, type Pedido } from "@/lib/pedidos/types";
import { METODOS, type MetodoPago } from "@/lib/caja/types";
import { cobrarPagoPedido } from "@/app/(app)/caja/actions";

const inputCls =
  "w-full rounded-xl border border-foreground/15 bg-background/60 px-3 py-2.5 text-sm outline-none backdrop-blur transition-colors focus:border-primary";

export function CobrarPagoForm({
  pedido,
  onDone,
}: {
  pedido: Pedido;
  onDone: () => void;
}) {
  const balance = balanceDe(pedido);
  const [monto, setMonto] = useState<number>(balance > 0 ? balance : 0);
  const [metodo, setMetodo] = useState<MetodoPago>("efectivo");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const res = await cobrarPagoPedido(
      pedido.id,
      pedido.numero,
      Number(monto),
      metodo,
    );
    if (!res.ok) {
      setError(res.error);
      setSaving(false);
      return;
    }
    onDone();
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <p className="text-sm text-muted">
        Pendiente por pagar:{" "}
        <span className="font-medium text-foreground">{fmtRD(balance)}</span>.
        El pago entra como entrada en la caja del día.
      </p>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium">Monto a cobrar (RD$)</span>
        <input
          type="number"
          min={1}
          step="0.01"
          className={inputCls}
          value={monto}
          onChange={(e) => setMonto(Number(e.target.value) || 0)}
          required
        />
      </label>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium">Método de pago</span>
        <select
          className={inputCls}
          value={metodo}
          onChange={(e) => setMetodo(e.target.value as MetodoPago)}
        >
          {METODOS.map((m) => (
            <option key={m.id} value={m.id}>
              {m.label}
            </option>
          ))}
        </select>
      </label>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">
          ⚠️ {error}
        </div>
      )}

      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-60"
      >
        {saving ? "Cobrando…" : "Confirmar cobro"}
      </button>
    </form>
  );
}
