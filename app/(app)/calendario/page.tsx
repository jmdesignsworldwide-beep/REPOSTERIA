import { createClient } from "@/lib/supabase/server";
import { LoginCTA } from "@/components/ui/login-cta";
import { CalendarioView } from "@/components/calendario/calendario-view";
import type { Pedido } from "@/lib/pedidos/types";

export const dynamic = "force-dynamic";

const SELECT =
  "*, cliente:clientes(id,nombre,telefono,direccion), items:pedido_items(id,producto,tamano,sabor,cantidad,precio,orden)";

export default async function CalendarioPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return <LoginCTA modulo="Calendario" />;

  const { data } = await supabase
    .from("pedidos")
    .select(SELECT)
    .eq("activo", true)
    .order("fecha_entrega", { ascending: true });

  return <CalendarioView initial={(data ?? []) as unknown as Pedido[]} />;
}
