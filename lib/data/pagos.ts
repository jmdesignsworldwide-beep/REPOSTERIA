export type MetodoPago = "efectivo" | "transferencia" | "tarjeta";
export type EstadoPago = "verificado" | "pendiente";

export interface Pago {
  id: string;
  cliente: string;
  pedidoRef: string | null;
  monto: number;
  metodo: MetodoPago;
  voucher: string | null;
  fecha: string;
  estado: EstadoPago;
}

// Fallback mock (cuando no hay sesión). Con sesión se leen los pagos reales de caja.
export const PAGOS_MOCK: Pago[] = [
  { id: "pg-1", cliente: "Yokasta Reyes", pedidoRef: "#1048", monto: 1600, metodo: "efectivo", voucher: null, fecha: "2026-06-22", estado: "verificado" },
  { id: "pg-2", cliente: "José Manuel Cruz", pedidoRef: "#1045", monto: 4250, metodo: "transferencia", voucher: "TRX-889201", fecha: "2026-06-22", estado: "verificado" },
  { id: "pg-3", cliente: "Wendy Espinal", pedidoRef: "#1046", monto: 900, metodo: "tarjeta", voucher: "APR-553120", fecha: "2026-06-21", estado: "pendiente" },
  { id: "pg-4", cliente: "Carmen Lora", pedidoRef: "#1042", monto: 2300, metodo: "transferencia", voucher: "TRX-441097", fecha: "2026-06-20", estado: "verificado" },
  { id: "pg-5", cliente: "Francisco Medina", pedidoRef: "#1043", monto: 1375, metodo: "efectivo", voucher: null, fecha: "2026-06-20", estado: "verificado" },
];

export const METODO_PAGO_LABEL: Record<MetodoPago, string> = {
  efectivo: "Efectivo",
  transferencia: "Transferencia",
  tarjeta: "Tarjeta",
};
