import { createClient } from "@/lib/supabase/server";
import { PosView } from "@/components/pos/pos-view";
import type { Cliente } from "@/lib/clientes/types";

export const dynamic = "force-dynamic";

export default async function PosPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("clientes")
    .select("*")
    .eq("activo", true)
    .order("nombre", { ascending: true });

  return <PosView clientes={(data ?? []) as Cliente[]} />;
}
