import { createClient } from "@/lib/supabase/server";
import { CajaView } from "@/components/caja/caja-view";
import type { Movimiento } from "@/lib/caja/types";

export const dynamic = "force-dynamic";

export default async function CajaPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("movimientos_caja")
    .select("*, pedido:pedidos(id,numero)")
    .order("created_at", { ascending: false })
    .limit(500);

  return <CajaView initial={(data ?? []) as unknown as Movimiento[]} />;
}
