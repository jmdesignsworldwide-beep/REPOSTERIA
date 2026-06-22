import { createClient } from "@/lib/supabase/server";
import { getAcceso } from "@/lib/auth/acceso";
import { ClientesView } from "@/components/clientes/clientes-view";
import type { Cliente } from "@/lib/clientes/types";

export const dynamic = "force-dynamic";

export default async function ClientesPage() {
  // El middleware ya garantizó la sesión (sin segunda llamada de red aquí).
  const { username, email } = await getAcceso();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("clientes")
    .select("*")
    .order("activo", { ascending: false })
    .order("nombre", { ascending: true });

  return (
    <ClientesView
      initial={(data ?? []) as Cliente[]}
      userEmail={username || email || ""}
      loadError={error?.message ?? null}
    />
  );
}
