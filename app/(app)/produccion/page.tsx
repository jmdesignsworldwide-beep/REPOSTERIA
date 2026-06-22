import { createClient } from "@/lib/supabase/server";
import {
  ProduccionView,
  type PedidoEnProceso,
} from "@/components/produccion/produccion-view";

export const dynamic = "force-dynamic";

type Row = {
  id: string;
  numero: number;
  hora_entrega: string | null;
  cliente: { nombre: string } | null;
  items: { producto: string }[];
};

export default async function ProduccionPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let pedidos: PedidoEnProceso[] = [];
  if (user) {
    const { data } = await supabase
      .from("pedidos")
      .select("id,numero,hora_entrega,cliente:clientes(nombre),items:pedido_items(producto)")
      .eq("activo", true)
      .eq("estado", "en_proceso");
    const rows = (data ?? []) as unknown as Row[];
    pedidos = rows.map((p) => ({
      id: p.id,
      numero: p.numero,
      hora: p.hora_entrega,
      cliente: p.cliente?.nombre ?? "Cliente",
      producto: p.items?.[0]?.producto ?? "Pedido",
    }));
  }

  return <ProduccionView pedidosReales={pedidos} />;
}
