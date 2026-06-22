import { createClient } from "@/lib/supabase/server";
import { getDashboardData } from "@/lib/data/mock";
import { pedidosToDashboard } from "@/lib/data/from-pedidos";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import type { Pedido } from "@/lib/pedidos/types";

export const dynamic = "force-dynamic";

const SELECT =
  "*, cliente:clientes(id,nombre,telefono,direccion), items:pedido_items(id,producto,tamano,sabor,cantidad,precio,orden)";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Con sesión → datos reales de la tabla pedidos (organismo).
  if (user) {
    const { data } = await supabase
      .from("pedidos")
      .select(SELECT)
      .eq("activo", true);
    const pedidos = (data ?? []) as unknown as Pedido[];
    return <DashboardView data={pedidosToDashboard(pedidos)} isReal />;
  }

  // Sin sesión → demo mock para que el preview público siga vivo.
  return <DashboardView data={getDashboardData()} isReal={false} />;
}
