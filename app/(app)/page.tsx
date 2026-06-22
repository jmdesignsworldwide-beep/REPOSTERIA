import { createClient } from "@/lib/supabase/server";
import { pedidosToDashboard } from "@/lib/data/from-pedidos";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import type { Pedido } from "@/lib/pedidos/types";

export const dynamic = "force-dynamic";

const SELECT =
  "*, cliente:clientes(id,nombre,telefono,direccion), items:pedido_items(id,producto,tamano,sabor,cantidad,precio,orden), pagos:movimientos_caja(monto,anulado,tipo)";

export default async function HomePage() {
  // El middleware ya garantizó la sesión → siempre datos reales (organismo).
  const supabase = await createClient();

  const hoy = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const hoyStr = `${hoy.getFullYear()}-${pad(hoy.getMonth() + 1)}-${pad(hoy.getDate())}`;

  const [pedidosRes, cajaRes] = await Promise.all([
    supabase.from("pedidos").select(SELECT).eq("activo", true),
    supabase
      .from("movimientos_caja")
      .select("tipo,monto,anulado,fecha")
      .eq("fecha", hoyStr)
      .eq("anulado", false),
  ]);

  const pedidos = (pedidosRes.data ?? []) as unknown as Pedido[];
  const data = pedidosToDashboard(pedidos);

  // Caja del día = neto real de la caja (ingresos − egresos) de hoy.
  const movs = cajaRes.data ?? [];
  data.cajaDelDia = movs.reduce(
    (s, m) => s + (m.tipo === "ingreso" ? Number(m.monto) : -Number(m.monto)),
    0,
  );

  return <DashboardView data={data} isReal cajaHref="/caja" />;
}
