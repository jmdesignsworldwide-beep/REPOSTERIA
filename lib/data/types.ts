// ════════════ Modelo de datos del Dashboard ════════════
// Tipos compartidos. Cuando conectemos Supabase, estas mismas formas se
// llenarán desde la base de datos sin tocar la UI.

export type EstadoPedido = "pendiente" | "en_produccion" | "listo" | "entregado";

export interface Pedido {
  id: string;
  codigo: string; // p.ej. "#1048"
  cliente: string;
  telefono: string;
  producto: string;
  sabor: string;
  ocasion: string;
  cantidad: number;
  monto: number; // total en RD$
  abono: number; // pagado en RD$
  estado: EstadoPedido;
  horaEntrega: string; // "14:30"
  notas?: string;
}

export interface Entrega {
  id: string;
  pedidoCodigo: string;
  cliente: string;
  telefono: string;
  direccion: string;
  hora: string;
  producto: string;
}

export interface DashboardData {
  cajaDelDia: number; // suma de abonos cobrados hoy
  ventasHoy: number; // suma de montos de pedidos de hoy
  metaDia: number; // objetivo de ventas del día
  conteos: {
    pedidosHoy: number;
    entregasProximas: number;
    enProduccion: number;
  };
  pedidosHoy: Pedido[];
  entregasProximas: Entrega[];
  enProduccion: Pedido[];
}
