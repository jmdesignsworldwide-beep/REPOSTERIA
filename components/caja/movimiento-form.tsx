"use client";

import { useState } from "react";
import {
  METODOS,
  categoriaLabel,
  type CategoriaMov,
  type MetodoPago,
  type TipoMov,
} from "@/lib/caja/types";
import { crearMovimiento } from "@/app/(app)/caja/actions";

const CATS: Record<TipoMov, CategoriaMov[]> = {
  ingreso: ["venta_directa", "otro"],
  egreso: ["gasto_operativo", "compra_insumos", "otro"],
};

const inputCls =
  "w-full rounded-xl border border-foreground/15 bg-background/60 px-3 py-2.5 text-sm outline-none backdrop-blur transition-colors focus:border-primary";

export function MovimientoForm({
  tipoInicial,
  onDone,
}: {
  tipoInicial: TipoMov;
  onDone: () => void;
}) {
  const [tipo, setTipo] = useState<TipoMov>(tipoInicial);
  const [monto, setMonto] = useState<number>(0);
  const [concepto, setConcepto] = useState("");
  const [categoria, setCategoria] = useState<CategoriaMov>(CATS[tipoInicial][0]);
  const [metodo, setMetodo] = useState<MetodoPago>("efectivo");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function cambiarTipo(t: TipoMov) {
    setTipo(t);
    setCategoria(CATS[t][0]);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const res = await crearMovimiento({
      tipo,
      monto: Number(monto),
      concepto,
      categoria,
      metodo,
    });
    if (!res.ok) {
      setError(res.error);
      setSaving(false);
      return;
    }
    onDone();
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {/* Tipo */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => cambiarTipo("ingreso")}
          className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
            tipo === "ingreso"
              ? "bg-emerald-600 text-white"
              : "border border-foreground/15 bg-glass/60 text-muted"
          }`}
        >
          ↑ Entrada
        </button>
        <button
          type="button"
          onClick={() => cambiarTipo("egreso")}
          className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
            tipo === "egreso"
              ? "bg-red-600 text-white"
              : "border border-foreground/15 bg-glass/60 text-muted"
          }`}
        >
          ↓ Salida
        </button>
      </div>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium">Monto (RD$)</span>
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
        <span className="text-sm font-medium">Concepto</span>
        <input
          className={inputCls}
          value={concepto}
          onChange={(e) => setConcepto(e.target.value)}
          placeholder={tipo === "ingreso" ? "Venta de mostrador…" : "Compra de ingredientes…"}
          required
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Categoría</span>
          <select
            className={inputCls}
            value={categoria}
            onChange={(e) => setCategoria(e.target.value as CategoriaMov)}
          >
            {CATS[tipo].map((c) => (
              <option key={c} value={c}>
                {categoriaLabel(c)}
              </option>
            ))}
          </select>
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Método</span>
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
      </div>

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
        {saving ? "Guardando…" : "Registrar"}
      </button>
    </form>
  );
}
