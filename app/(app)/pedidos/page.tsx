import { createClient } from "@/lib/supabase/server";
import { LoginCTA } from "@/components/ui/login-cta";
import { PedidosView } from "@/components/pedidos/pedidos-view";
import type { Pedido } from "@/lib/pedidos/types";
import type { Cliente } from "@/lib/clientes/types";

export const dynamic = "force-dynamic";

const SELECT =
  "*, cliente:clientes(id,nombre,telefono,direccion), items:pedido_items(id,producto,tamano,sabor,cantidad,precio,orden)";

export default async function PedidosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return <LoginCTA modulo="Pedidos" />;

  const [pedidosRes, clientesRes] = await Promise.all([
    supabase
      .from("pedidos")
      .select(SELECT)
      .eq("activo", true)
      .order("fecha_entrega", { ascending: true }),
    supabase
      .from("clientes")
      .select("*")
      .eq("activo", true)
      .order("nombre", { ascending: true }),
  ]);

  return (
    <PedidosView
      initial={(pedidosRes.data ?? []) as unknown as Pedido[]}
      clientes={(clientesRes.data ?? []) as Cliente[]}
    />
  );
}
