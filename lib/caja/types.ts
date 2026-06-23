export type TipoMov = "ingreso" | "egreso";
export type MetodoPago = "efectivo" | "transferencia" | "tarjeta";
export type CategoriaMov =
  | "pago_pedido"
  | "venta_directa"
  | "gasto_operativo"
  | "compra_insumos"
  | "otro";

export interface Movimiento {
  id: string;
  tipo: TipoMov;
  monto: number;
  concepto: string;
  categoria: CategoriaMov;
  metodo: MetodoPago;
  pedido_id: string | null;
  fecha: string; // YYYY-MM-DD
  anulado: boolean;
  created_at: string;
  pedido?: {
    id: string;
    numero: number;
    cliente?: { nombre: string } | null;
  } | null;
}

export type MovimientoInput = {
  tipo: TipoMov;
  monto: number;
  concepto: string;
  categoria: CategoriaMov;
  metodo: MetodoPago;
};

export const METODOS: { id: MetodoPago; label: string }[] = [
  { id: "efectivo", label: "Efectivo" },
  { id: "transferencia", label: "Transferencia" },
  { id: "tarjeta", label: "Tarjeta" },
];

export const CATEGORIAS: { id: CategoriaMov; label: string; tipo: TipoMov }[] = [
  { id: "venta_directa", label: "Venta directa", tipo: "ingreso" },
  { id: "pago_pedido", label: "Pago de pedido", tipo: "ingreso" },
  { id: "gasto_operativo", label: "Gasto operativo", tipo: "egreso" },
  { id: "compra_insumos", label: "Compra de ingredientes", tipo: "egreso" },
  { id: "otro", label: "Otro", tipo: "ingreso" },
];

export function categoriaLabel(c: CategoriaMov) {
  return CATEGORIAS.find((x) => x.id === c)?.label ?? c;
}
export function metodoLabel(m: MetodoPago) {
  return METODOS.find((x) => x.id === m)?.label ?? m;
}
