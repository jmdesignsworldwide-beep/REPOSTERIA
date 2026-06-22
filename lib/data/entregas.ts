export type MetodoEntrega = "tienda" | "delivery";
export type EstadoEntrega = "preparando" | "en_camino" | "entregado";

export interface Entrega {
  id: string;
  pedidoRef: string;
  cliente: string;
  metodo: MetodoEntrega;
  motorista: string | null;
  estado: EstadoEntrega;
  direccion: string;
  fecha: string;
  hora: string | null;
}

export const MOTORISTAS = [
  "Pedro Encarnación",
  "Manuel de la Rosa",
  "Kelvin Objío",
];

// Fallback mock (sin sesión). Con sesión se mapean los pedidos reales.
export const ENTREGAS_MOCK: Entrega[] = [
  { id: "en-1", pedidoRef: "#1043", cliente: "Francisco Medina", metodo: "delivery", motorista: "Pedro Encarnación", estado: "en_camino", direccion: "Av. 27 de Febrero #112, Santo Domingo", fecha: "2026-06-22", hora: "13:00" },
  { id: "en-2", pedidoRef: "#1048", cliente: "Yokasta Reyes", metodo: "delivery", motorista: "Manuel de la Rosa", estado: "preparando", direccion: "Los Jardines, Santiago", fecha: "2026-06-22", hora: "14:30" },
  { id: "en-3", pedidoRef: "#1047", cliente: "Ramón Polanco", metodo: "tienda", motorista: null, estado: "entregado", direccion: "Recoge en tienda", fecha: "2026-06-22", hora: "11:00" },
  { id: "en-4", pedidoRef: "#1046", cliente: "Wendy Espinal", metodo: "delivery", motorista: "Kelvin Objío", estado: "preparando", direccion: "Gurabo, Santiago", fecha: "2026-06-22", hora: "16:00" },
];

export const ESTADO_ENTREGA_META: Record<EstadoEntrega, { label: string; cls: string }> = {
  preparando: { label: "Preparando", cls: "bg-amber-500/15 text-amber-600 dark:text-amber-400" },
  en_camino: { label: "En camino", cls: "bg-sky-500/15 text-sky-600 dark:text-sky-400" },
  entregado: { label: "Entregado", cls: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" },
};
