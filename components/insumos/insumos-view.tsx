"use client";

import { ViewSwitcher } from "@/components/ui/view-switcher";
import { InventarioView } from "@/components/inventario/inventario-view";
import { ProveedoresView } from "@/components/proveedores/proveedores-view";

/**
 * Inventario — un solo módulo que une el antiguo "Inventario" (stock) y
 * "Proveedores".
 * Dos pestañas con un flujo conectado: una COMPRA a un proveedor repone el
 * STOCK del ingrediente. Stock conserva alertas de bajo stock y vencimientos;
 * Proveedores conserva historial de compras, órdenes y pagos.
 */
export function InsumosView() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Inventario
        </h1>
        <p className="mt-1 text-sm text-muted">
          Stock de ingredientes y proveedores — una compra a un proveedor
          repone el stock.
        </p>
      </div>

      <ViewSwitcher
        views={[
          { id: "stock", label: "📦 Stock", content: <InventarioView embedded /> },
          {
            id: "proveedores",
            label: "🚚 Proveedores y compras",
            content: <ProveedoresView embedded />,
          },
        ]}
      />
    </div>
  );
}
