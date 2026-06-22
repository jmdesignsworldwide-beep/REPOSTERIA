export type EstadoPedido =
  | "pendiente"
  | "en_proceso"
  | "listo"
  | "entregado";

export interface PedidoItem {
  id?: string;
  producto: string;
  tamano: string;
  sabor: string;
  cantidad: number;
  precio: number;
}

export interface ClienteRef {
  id: string;
  nombre: string;
  telefono: string;
  direccion: string | null;
}

export interface PagoRef {
  monto: number;
  anulado: boolean;
  tipo: string;
}

export interface Pedido {
  id: string;
  numero: number;
  cliente_id: string;
  descripcion: string | null;
  ocasion: string | null;
  fecha_entrega: string; // YYYY-MM-DD
  hora_entrega: string | null;
  estado: EstadoPedido;
  total: number;
  adelanto: number;
  notas: string | null;
  fotos: string[];
  activo: boolean;
  created_at: string;
  updated_at: string;
  cliente: ClienteRef | null;
  items: PedidoItem[];
  pagos?: PagoRef[];
}

/** Abonado REAL = suma de ingresos de caja enlazados, no anulados (un solo origen). */
export function abonadoDe(p: Pedido): number {
  return (p.pagos ?? [])
    .filter((x) => !x.anulado && x.tipo === "ingreso")
    .reduce((s, x) => s + Number(x.monto), 0);
}

export function balanceDe(p: Pedido): number {
  return Number(p.total) - abonadoDe(p);
}

export type PedidoInput = {
  cliente_id: string;
  descripcion?: string;
  ocasion?: string;
  fecha_entrega: string;
  hora_entrega?: string;
  estado: EstadoPedido;
  adelanto: number;
  notas?: string;
  fotos: string[];
  items: PedidoItem[];
};

export const ESTADOS: { id: EstadoPedido; label: string; cls: string }[] = [
  {
    id: "pendiente",
    label: "Pendiente",
    cls: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  },
  {
    id: "en_proceso",
    label: "En proceso",
    cls: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
  },
  {
    id: "listo",
    label: "Listo",
    cls: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  },
  {
    id: "entregado",
    label: "Entregado",
    cls: "bg-foreground/10 text-muted",
  },
];

export function estadoMeta(estado: EstadoPedido) {
  return ESTADOS.find((e) => e.id === estado) ?? ESTADOS[0];
}
