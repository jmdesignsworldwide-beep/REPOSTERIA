"use client";

import { useMemo, useState } from "react";
import { fmtRD } from "@/lib/data/mock";
import { PhotoUpload } from "./photo-upload";
import type { EstadoPedido, Pedido, PedidoInput, PedidoItem } from "@/lib/pedidos/types";
import { ESTADOS } from "@/lib/pedidos/types";
import type { Cliente } from "@/lib/clientes/types";

const inputCls =
  "w-full rounded-xl border border-foreground/15 bg-background/60 px-3 py-2.5 text-sm outline-none backdrop-blur transition-colors focus:border-primary";

const itemVacio: PedidoItem = {
  producto: "",
  tamano: "",
  sabor: "",
  cantidad: 1,
  precio: 0,
};

export function PedidoForm({
  clientes,
  pedido,
  onSave,
}: {
  clientes: Cliente[];
  pedido?: Pedido;
  onSave: (input: PedidoInput) => Promise<{ ok: boolean; error?: string }>;
}) {
  const [clienteId, setClienteId] = useState(pedido?.cliente_id ?? "");
  const [ocasion, setOcasion] = useState(pedido?.ocasion ?? "");
  const [fecha, setFecha] = useState(pedido?.fecha_entrega ?? "");
  const [hora, setHora] = useState(pedido?.hora_entrega ?? "");
  const [estado, setEstado] = useState<EstadoPedido>(
    pedido?.estado ?? "pendiente",
  );
  const [adelanto, setAdelanto] = useState(pedido?.adelanto ?? 0);
  const [notas, setNotas] = useState(pedido?.notas ?? "");
  const [fotos, setFotos] = useState<string[]>(pedido?.fotos ?? []);
  const [items, setItems] = useState<PedidoItem[]>(
    pedido?.items?.length ? pedido.items : [{ ...itemVacio }],
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const total = useMemo(
    () => items.reduce((s, i) => s + i.cantidad * i.precio, 0),
    [items],
  );
  const balance = total - adelanto;

  function updateItem(i: number, patch: Partial<PedidoItem>) {
    setItems((arr) => arr.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));
  }
  function addItem() {
    setItems((arr) => [...arr, { ...itemVacio }]);
  }
  function removeItem(i: number) {
    setItems((arr) => (arr.length === 1 ? arr : arr.filter((_, idx) => idx !== i)));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const input: PedidoInput = {
      cliente_id: clienteId,
      ocasion,
      fecha_entrega: fecha,
      hora_entrega: hora,
      estado,
      adelanto: Number(adelanto) || 0,
      notas,
      fotos,
      items,
    };
    const res = await onSave(input);
    if (!res.ok) {
      setError(res.error ?? "No se pudo guardar.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Cliente */}
      <label className="block space-y-1.5">
        <span className="text-sm font-medium">Cliente *</span>
        <select
          className={inputCls}
          value={clienteId}
          onChange={(e) => setClienteId(e.target.value)}
          required
        >
          <option value="">Elige un cliente…</option>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre} · {c.telefono}
            </option>
          ))}
        </select>
      </label>

      {/* Renglones */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Renglones *</span>
          <button
            type="button"
            onClick={addItem}
            className="rounded-lg border border-foreground/15 bg-glass/60 px-2.5 py-1 text-xs font-medium backdrop-blur"
          >
            + Añadir renglón
          </button>
        </div>
        {items.map((it, i) => (
          <div
            key={i}
            className="space-y-2 rounded-xl border border-foreground/10 bg-foreground/[0.02] p-3"
          >
            <div className="flex gap-2">
              <input
                className={inputCls}
                placeholder="Producto (ej. Bizcocho)"
                value={it.producto}
                onChange={(e) => updateItem(i, { producto: e.target.value })}
              />
              <button
                type="button"
                onClick={() => removeItem(i)}
                aria-label="Quitar renglón"
                className="shrink-0 rounded-lg border border-foreground/15 px-3 text-sm"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <input
                className={inputCls}
                placeholder="Tamaño"
                value={it.tamano}
                onChange={(e) => updateItem(i, { tamano: e.target.value })}
              />
              <input
                className={inputCls}
                placeholder="Sabor"
                value={it.sabor}
                onChange={(e) => updateItem(i, { sabor: e.target.value })}
              />
              <input
                type="number"
                min={1}
                className={inputCls}
                placeholder="Cant."
                value={it.cantidad}
                onChange={(e) =>
                  updateItem(i, { cantidad: Number(e.target.value) || 0 })
                }
              />
              <input
                type="number"
                min={0}
                step="0.01"
                className={inputCls}
                placeholder="Precio"
                value={it.precio}
                onChange={(e) =>
                  updateItem(i, { precio: Number(e.target.value) || 0 })
                }
              />
            </div>
          </div>
        ))}
      </div>

      {/* Fecha / hora / estado */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Entrega *</span>
          <input
            type="date"
            className={inputCls}
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            required
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Hora</span>
          <input
            type="time"
            className={inputCls}
            value={hora ?? ""}
            onChange={(e) => setHora(e.target.value)}
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Estado</span>
          <select
            className={inputCls}
            value={estado}
            onChange={(e) => setEstado(e.target.value as EstadoPedido)}
          >
            {ESTADOS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Ocasión / adelanto */}
      <div className="grid grid-cols-2 gap-3">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Ocasión</span>
          <input
            className={inputCls}
            placeholder="Cumpleaños, boda…"
            value={ocasion}
            onChange={(e) => setOcasion(e.target.value)}
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Adelanto (RD$)</span>
          <input
            type="number"
            min={0}
            step="0.01"
            className={inputCls}
            value={adelanto}
            onChange={(e) => setAdelanto(Number(e.target.value) || 0)}
          />
        </label>
      </div>

      {/* Totales */}
      <div className="grid grid-cols-3 gap-2 text-center text-sm">
        <div className="rounded-xl border border-foreground/10 bg-foreground/[0.03] p-2.5">
          <p className="text-xs text-muted">Total</p>
          <p className="tabular-nums font-semibold">{fmtRD(total)}</p>
        </div>
        <div className="rounded-xl border border-foreground/10 bg-foreground/[0.03] p-2.5">
          <p className="text-xs text-muted">Adelanto</p>
          <p className="tabular-nums font-semibold text-emerald-600 dark:text-emerald-400">
            {fmtRD(adelanto)}
          </p>
        </div>
        <div className="rounded-xl border border-foreground/10 bg-foreground/[0.03] p-2.5">
          <p className="text-xs text-muted">Balance</p>
          <p className="tabular-nums font-semibold text-primary">
            {fmtRD(balance)}
          </p>
        </div>
      </div>

      {/* Fotos */}
      <div className="space-y-1.5">
        <span className="text-sm font-medium">Fotos de referencia</span>
        <PhotoUpload value={fotos} onChange={setFotos} />
      </div>

      {/* Notas */}
      <label className="block space-y-1.5">
        <span className="text-sm font-medium">Notas</span>
        <textarea
          className={`${inputCls} min-h-16 resize-y`}
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          placeholder="Detalles de decoración, entrega…"
        />
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
        {saving ? "Guardando…" : pedido ? "Guardar cambios" : "Crear pedido"}
      </button>
    </form>
  );
}
