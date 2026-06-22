// Mapea pedidos REALES (tabla pedidos) a la forma DashboardData que ya
// consume la Sala de Mando. Así el Dashboard lee de la fuente única sin
// rehacer su diseño (organismo).

import type {
  DashboardData,
  Entrega,
  EstadoPedido as MockEstado,
  Pedido as MockPedido,
} from "./types";
import type { Pedido as RealPedido } from "@/lib/pedidos/types";

function mapEstado(e: RealPedido["estado"]): MockEstado {
  return e === "en_proceso" ? "en_produccion" : (e as MockEstado);
}

function toMockPedido(p: RealPedido): MockPedido {
  return {
    id: p.id,
    codigo: "#" + p.numero,
    cliente: p.cliente?.nombre ?? "Cliente",
    telefono: p.cliente?.telefono ?? "",
    producto: p.items[0]?.producto ?? p.descripcion ?? "Pedido",
    sabor: p.items[0]?.sabor ?? "",
    ocasion: p.ocasion ?? "",
    cantidad: p.items.reduce((s, i) => s + i.cantidad, 0),
    monto: Number(p.total),
    abono: Number(p.adelanto),
    estado: mapEstado(p.estado),
    horaEntrega: p.hora_entrega ?? "",
    notas: p.notas ?? undefined,
  };
}

export function pedidosToDashboard(pedidos: RealPedido[]): DashboardData {
  const hoy = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const hoyStr = `${hoy.getFullYear()}-${pad(hoy.getMonth() + 1)}-${pad(hoy.getDate())}`;

  const activos = pedidos.filter((p) => p.activo);
  const deHoy = activos.filter((p) => p.fecha_entrega === hoyStr);
  const enProd = activos.filter((p) => p.estado === "en_proceso");
  const proximas = activos
    .filter((p) => p.fecha_entrega >= hoyStr && p.estado !== "entregado")
    .sort(
      (a, b) =>
        a.fecha_entrega.localeCompare(b.fecha_entrega) ||
        (a.hora_entrega ?? "").localeCompare(b.hora_entrega ?? ""),
    )
    .slice(0, 6);

  const entregas: Entrega[] = proximas.map((p) => ({
    id: p.id,
    pedidoCodigo: "#" + p.numero,
    cliente: p.cliente?.nombre ?? "Cliente",
    telefono: p.cliente?.telefono ?? "",
    direccion: p.cliente?.direccion ?? "",
    hora: p.hora_entrega ?? "—",
    producto: p.items[0]?.producto ?? p.descripcion ?? "",
  }));

  return {
    cajaDelDia: deHoy.reduce((s, p) => s + Number(p.adelanto), 0),
    ventasHoy: deHoy.reduce((s, p) => s + Number(p.total), 0),
    metaDia: 35000,
    conteos: {
      pedidosHoy: deHoy.length,
      entregasProximas: entregas.length,
      enProduccion: enProd.length,
    },
    pedidosHoy: deHoy.map(toMockPedido),
    entregasProximas: entregas,
    enProduccion: enProd.map(toMockPedido),
  };
}
