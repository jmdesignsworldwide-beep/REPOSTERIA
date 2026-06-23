"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Stagger, StaggerItem } from "@/components/ui/stagger";
import { Magnetic } from "@/components/ui/magnetic";
import { GlassCard } from "@/components/ui/glass-card";
import { Modal } from "@/components/ui/modal";
import { Disclaimer } from "@/components/ui/disclaimer";
import { fmtRD } from "@/lib/data/mock";
import { PRODUCTOS, type Producto } from "@/lib/data/catalogo";
import { METODOS, metodoLabel, type MetodoPago } from "@/lib/caja/types";
import type { Cliente } from "@/lib/clientes/types";
import { cobrarVentaPOS } from "@/app/(app)/caja/actions";

type Linea = {
  key: string;
  nombre: string;
  emoji: string;
  tamano: string;
  precio: number;
  cantidad: number;
};

export function PosView({ clientes }: { clientes: Cliente[] }) {
  const router = useRouter();
  const [cart, setCart] = useState<Linea[]>([]);
  const [picker, setPicker] = useState<Producto | null>(null);
  const [clienteId, setClienteId] = useState<string>("");
  const [metodo, setMetodo] = useState<MetodoPago>("efectivo");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recibo, setRecibo] = useState<{
    lineas: Linea[];
    total: number;
    metodo: MetodoPago;
    cliente: string;
    fecha: string;
  } | null>(null);

  const disponibles = useMemo(
    () => PRODUCTOS.filter((p) => p.disponible),
    [],
  );
  const total = cart.reduce((s, l) => s + l.precio * l.cantidad, 0);
  const clienteNombre =
    clientes.find((c) => c.id === clienteId)?.nombre ?? "Mostrador";

  function agregar(p: Producto, precio: number, tamano: string) {
    const key = `${p.id}-${tamano}`;
    setCart((prev) => {
      const i = prev.findIndex((l) => l.key === key);
      if (i >= 0) {
        const next = [...prev];
        next[i] = { ...next[i], cantidad: next[i].cantidad + 1 };
        return next;
      }
      return [
        ...prev,
        { key, nombre: p.nombre, emoji: p.emoji, tamano, precio, cantidad: 1 },
      ];
    });
  }

  function tocarProducto(p: Producto) {
    if (p.precios.length === 1) {
      agregar(p, p.precios[0].precio, p.precios[0].tamano);
    } else {
      setPicker(p);
    }
  }

  function cambiarCantidad(key: string, delta: number) {
    setCart((prev) =>
      prev
        .map((l) =>
          l.key === key ? { ...l, cantidad: l.cantidad + delta } : l,
        )
        .filter((l) => l.cantidad > 0),
    );
  }

  async function cobrar() {
    if (cart.length === 0) return;
    setError(null);
    setSaving(true);
    const detalle = cart
      .map((l) => `${l.cantidad}× ${l.nombre} (${l.tamano})`)
      .join(", ");
    const concepto =
      clienteId !== ""
        ? `Venta mostrador · ${clienteNombre}: ${detalle}`
        : `Venta mostrador: ${detalle}`;
    const res = await cobrarVentaPOS({ concepto, monto: total, metodo });
    setSaving(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setRecibo({
      lineas: cart,
      total,
      metodo,
      cliente: clienteNombre,
      fecha: new Date().toLocaleDateString("es-DO"),
    });
    setCart([]);
    setClienteId("");
    router.refresh();
  }

  return (
    <>
      <Stagger className="mx-auto max-w-6xl space-y-6">
        <StaggerItem>
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Venta rápida
          </h1>
          <p className="mt-1 text-sm text-muted">
            Cobra del mostrador — entra directo a la Caja del día
          </p>
        </StaggerItem>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* Catálogo */}
          <StaggerItem>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {disponibles.map((p) => (
                <Magnetic key={p.id} strength={0.1} glow={false}>
                  <button
                    onClick={() => tocarProducto(p)}
                    className="flex h-full w-full flex-col items-start gap-1 rounded-2xl border border-foreground/5 bg-foreground/[0.03] p-4 text-left transition-colors hover:border-primary/40"
                  >
                    <span className="text-2xl">{p.emoji}</span>
                    <span className="line-clamp-2 text-sm font-medium leading-tight">
                      {p.nombre}
                    </span>
                    <span className="mt-auto pt-1 text-xs text-muted">
                      desde {fmtRD(Math.min(...p.precios.map((x) => x.precio)))}
                    </span>
                  </button>
                </Magnetic>
              ))}
            </div>
          </StaggerItem>

          {/* Venta actual */}
          <StaggerItem>
            <GlassCard className="sticky top-20 flex flex-col p-5">
              <h2 className="mb-3 font-display text-lg font-semibold">
                Venta actual
              </h2>

              {cart.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted">
                  Toca productos para agregarlos.
                </p>
              ) : (
                <div className="space-y-2">
                  {cart.map((l) => (
                    <div
                      key={l.key}
                      className="flex items-center gap-2 rounded-xl border border-foreground/5 bg-foreground/[0.03] p-2.5"
                    >
                      <span className="text-lg">{l.emoji}</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{l.nombre}</p>
                        <p className="truncate text-xs text-muted">
                          {l.tamano} · {fmtRD(l.precio)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => cambiarCantidad(l.key, -1)}
                          className="flex h-6 w-6 items-center justify-center rounded-full border border-foreground/15 text-sm"
                          aria-label="Quitar uno"
                        >
                          −
                        </button>
                        <span className="w-5 text-center text-sm tabular-nums font-medium">
                          {l.cantidad}
                        </span>
                        <button
                          onClick={() => cambiarCantidad(l.key, 1)}
                          className="flex h-6 w-6 items-center justify-center rounded-full border border-foreground/15 text-sm"
                          aria-label="Agregar uno"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Cliente */}
              <label className="mt-4 block space-y-1.5">
                <span className="text-xs font-medium text-muted">Cliente (opcional)</span>
                <select
                  value={clienteId}
                  onChange={(e) => setClienteId(e.target.value)}
                  className="w-full rounded-xl border border-foreground/15 bg-background/60 px-3 py-2.5 text-sm outline-none backdrop-blur focus:border-primary"
                >
                  <option value="">Mostrador (anónimo)</option>
                  {clientes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </label>

              {/* Método */}
              <div className="mt-3 space-y-1.5">
                <span className="text-xs font-medium text-muted">Método de pago</span>
                <div className="grid grid-cols-3 gap-1.5">
                  {METODOS.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setMetodo(m.id)}
                      className={`rounded-lg px-2 py-2 text-xs font-medium transition-colors ${
                        metodo === m.id
                          ? "bg-primary text-primary-foreground"
                          : "border border-foreground/15 bg-glass/60 text-muted"
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="mt-4 flex items-center justify-between border-t border-foreground/10 pt-3">
                <span className="text-sm font-medium text-muted">Total</span>
                <span className="text-2xl font-bold tabular-nums text-primary">
                  {fmtRD(total)}
                </span>
              </div>

              {error && (
                <div className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">
                  ⚠️ {error}
                </div>
              )}

              <Magnetic strength={0.18}>
                <button
                  onClick={cobrar}
                  disabled={saving || cart.length === 0}
                  className="mt-3 w-full rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-50"
                >
                  {saving ? "Cobrando…" : `💵 Cobrar ${fmtRD(total)}`}
                </button>
              </Magnetic>
            </GlassCard>
          </StaggerItem>
        </div>
      </Stagger>

      {/* Selector de tamaño */}
      <Modal
        open={picker !== null}
        onClose={() => setPicker(null)}
        title={picker?.nombre ?? ""}
        subtitle="Elige el tamaño"
      >
        {picker && (
          <div className="grid gap-2">
            {picker.precios.map((pr) => (
              <button
                key={pr.tamano}
                onClick={() => {
                  agregar(picker, pr.precio, pr.tamano);
                  setPicker(null);
                }}
                className="flex items-center justify-between rounded-xl border border-foreground/10 bg-foreground/[0.03] px-4 py-3 text-left transition-colors hover:border-primary/40"
              >
                <span className="font-medium">{pr.tamano}</span>
                <span className="tabular-nums font-semibold text-primary">
                  {fmtRD(pr.precio)}
                </span>
              </button>
            ))}
          </div>
        )}
      </Modal>

      {/* Recibo tras cobrar */}
      <Modal
        open={recibo !== null}
        onClose={() => setRecibo(null)}
        title="✅ Venta cobrada"
        subtitle="Registrada en la Caja del día"
      >
        {recibo && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-foreground/10 bg-foreground/[0.03] p-5 text-sm">
              <p className="mb-3 text-center font-display text-lg font-semibold">
                🍮 Azúcar &amp; Canela
              </p>
              <div className="space-y-1.5">
                {recibo.lineas.map((l) => (
                  <div key={l.key} className="flex items-center justify-between">
                    <span className="min-w-0 truncate">
                      {l.cantidad}× {l.nombre}{" "}
                      <span className="text-muted">({l.tamano})</span>
                    </span>
                    <span className="tabular-nums font-medium">
                      {fmtRD(l.precio * l.cantidad)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-3 space-y-1 border-t border-foreground/10 pt-3 text-xs text-muted">
                <div className="flex justify-between">
                  <span>Cliente</span>
                  <span>{recibo.cliente}</span>
                </div>
                <div className="flex justify-between">
                  <span>Método</span>
                  <span>{metodoLabel(recibo.metodo)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Fecha</span>
                  <span>{recibo.fecha}</span>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-foreground/10 pt-3 text-base font-semibold">
                <span>Total</span>
                <span className="tabular-nums text-emerald-600 dark:text-emerald-400">
                  {fmtRD(recibo.total)}
                </span>
              </div>
            </div>
            <Disclaimer>
              Recibo de ejemplo para demostración. No es un comprobante fiscal
              certificado.
            </Disclaimer>
            <button
              onClick={() => setRecibo(null)}
              className="w-full rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow"
            >
              Nueva venta
            </button>
          </div>
        )}
      </Modal>
    </>
  );
}
