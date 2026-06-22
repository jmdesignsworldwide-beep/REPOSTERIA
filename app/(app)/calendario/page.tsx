import { createClient } from "@/lib/supabase/server";
import { CalendarioView } from "@/components/calendario/calendario-view";
import type { Pedido } from "@/lib/pedidos/types";

export const dynamic = "force-dynamic";

const SELECT =
  "*, cliente:clientes(id,nombre,telefono,direccion), items:pedido_items(id,producto,tamano,sabor,cantidad,precio,orden), pagos:movimientos_caja(monto,anulado,tipo)";

export default async function CalendarioPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("pedidos")
    .select(SELECT)
    .eq("activo", true)
    .order("fecha_entrega", { ascending: true });

  return <CalendarioView initial={(data ?? []) as unknown as Pedido[]} />;
}
