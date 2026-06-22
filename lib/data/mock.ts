// ════════════ Fuente de datos del Dashboard (MOCK) ════════════
// ÚNICO punto de datos del Dashboard. Hoy devuelve datos de ejemplo.
// Cuando conectemos Supabase, se cambia SOLO el cuerpo de getDashboardData()
// por consultas reales; la UI no cambia.

import type { DashboardData, Entrega, Pedido } from "./types";

const PEDIDOS_HOY: Pedido[] = [
  {
    id: "p-1048",
    codigo: "#1048",
    cliente: "Yokasta Reyes",
    telefono: "809-412-7785",
    producto: "Bizcocho dominicano",
    sabor: "Tres leches",
    ocasion: "Cumpleaños",
    cantidad: 1,
    monto: 3200,
    abono: 1600,
    estado: "en_produccion",
    horaEntrega: "14:30",
    notas: "Decoración con flores rosadas. Mensaje: «¡Feliz cumpleaños Mía!»",
  },
  {
    id: "p-1047",
    codigo: "#1047",
    cliente: "Ramón Polanco",
    telefono: "829-330-1142",
    producto: "Tres leches",
    sabor: "Vainilla",
    ocasion: "Bautizo",
    cantidad: 1,
    monto: 2400,
    abono: 2400,
    estado: "listo",
    horaEntrega: "11:00",
    notas: "Retira en tienda.",
  },
  {
    id: "p-1046",
    codigo: "#1046",
    cliente: "Wendy Espinal",
    telefono: "849-208-9963",
    producto: "Cupcakes (24 uds.)",
    sabor: "Chocolate",
    ocasion: "Graduación",
    cantidad: 24,
    monto: 1800,
    abono: 900,
    estado: "en_produccion",
    horaEntrega: "16:00",
    notas: "Toppings azul y dorado.",
  },
  {
    id: "p-1045",
    codigo: "#1045",
    cliente: "José Manuel Cruz",
    telefono: "809-755-3021",
    producto: "Pastel personalizado",
    sabor: "Guayaba",
    ocasion: "Boda",
    cantidad: 1,
    monto: 8500,
    abono: 4250,
    estado: "en_produccion",
    horaEntrega: "18:00",
    notas: "3 pisos, tema dorado. Topper de novios.",
  },
  {
    id: "p-1044",
    codigo: "#1044",
    cliente: "Altagracia Jiménez",
    telefono: "829-661-4408",
    producto: "Suspiros (50 uds.)",
    sabor: "Vainilla",
    ocasion: "Cumpleaños",
    cantidad: 50,
    monto: 900,
    abono: 900,
    estado: "entregado",
    horaEntrega: "10:30",
  },
  {
    id: "p-1043",
    codigo: "#1043",
    cliente: "Francisco Medina",
    telefono: "809-119-7754",
    producto: "Bizcocho",
    sabor: "Piña",
    ocasion: "Aniversario",
    cantidad: 1,
    monto: 2750,
    abono: 1375,
    estado: "pendiente",
    horaEntrega: "13:00",
    notas: "Sin relleno de dulce de leche.",
  },
  {
    id: "p-1042",
    codigo: "#1042",
    cliente: "Carmen Lora",
    telefono: "849-540-2218",
    producto: "Pastel de bodas mini",
    sabor: "Vainilla",
    ocasion: "Pedida de mano",
    cantidad: 1,
    monto: 4600,
    abono: 2300,
    estado: "listo",
    horaEntrega: "17:30",
    notas: "Color blanco con dorado.",
  },
];

const ENTREGAS_PROXIMAS: Entrega[] = [
  {
    id: "e-1043",
    pedidoCodigo: "#1043",
    cliente: "Francisco Medina",
    telefono: "809-119-7754",
    direccion: "Av. 27 de Febrero #112, Santo Domingo",
    hora: "13:00",
    producto: "Bizcocho de piña",
  },
  {
    id: "e-1048",
    pedidoCodigo: "#1048",
    cliente: "Yokasta Reyes",
    telefono: "809-412-7785",
    direccion: "Los Jardines Metropolitanos, Santiago",
    hora: "14:30",
    producto: "Bizcocho tres leches",
  },
  {
    id: "e-1046",
    pedidoCodigo: "#1046",
    cliente: "Wendy Espinal",
    telefono: "849-208-9963",
    direccion: "Gurabo, Santiago",
    hora: "16:00",
    producto: "24 Cupcakes de chocolate",
  },
  {
    id: "e-1042",
    pedidoCodigo: "#1042",
    cliente: "Carmen Lora",
    telefono: "849-540-2218",
    direccion: "Bella Vista, Santo Domingo",
    hora: "17:30",
    producto: "Pastel de bodas mini",
  },
];

/**
 * Punto único de lectura del Dashboard. (Mock por ahora.)
 * Los conteos y totales se DERIVAN de las listas → comportamiento de organismo.
 */
export function getDashboardData(): DashboardData {
  const enProduccion = PEDIDOS_HOY.filter((p) => p.estado === "en_produccion");
  const cajaDelDia = PEDIDOS_HOY.reduce((sum, p) => sum + p.abono, 0);
  const ventasHoy = PEDIDOS_HOY.reduce((sum, p) => sum + p.monto, 0);

  return {
    cajaDelDia,
    ventasHoy,
    metaDia: 35000,
    conteos: {
      pedidosHoy: PEDIDOS_HOY.length,
      entregasProximas: ENTREGAS_PROXIMAS.length,
      enProduccion: enProduccion.length,
    },
    pedidosHoy: PEDIDOS_HOY,
    entregasProximas: ENTREGAS_PROXIMAS,
    enProduccion,
  };
}

export const fmtRD = (n: number) =>
  "RD$ " + n.toLocaleString("es-DO", { maximumFractionDigits: 0 });
