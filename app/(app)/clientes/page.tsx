import { createClient } from "@/lib/supabase/server";
import { getAcceso } from "@/lib/auth/acceso";
import { ClientesView } from "@/components/clientes/clientes-view";
import type { Cliente } from "@/lib/clientes/types";
import type { ClienteStats } from "@/components/clientes/clientes-view";

export const dynamic = "force-dynamic";

type PedidoRow = {
  cliente_id: string;
  total: number;
  estado: string;
  pagos: { monto: number; anulado: boolean; tipo: string }[] | null;
};

export default async function ClientesPage() {
  // El middleware ya garantizó la sesión (sin segunda llamada de red aquí).
  const { username, email } = await getAcceso();
  const supabase = await createClient();

  const [clientesRes, pedidosRes] = await Promise.all([
    supabase
      .from("clientes")
      .select("*")
      .order("activo", { ascending: false })
      .order("nombre", { ascending: true }),
    supabase
      .from("pedidos")
      .select("cliente_id,total,estado,pagos:movimientos_caja(monto,anulado,tipo)")
      .eq("activo", true),
  ]);

  // Estadísticas reales por cliente (mismo origen del dinero: movimientos_caja).
  const stats: Record<string, ClienteStats> = {};
  for (const p of (pedidosRes.data ?? []) as unknown as PedidoRow[]) {
    const abonado = (p.pagos ?? [])
      .filter((x) => !x.anulado && x.tipo === "ingreso")
      .reduce((s, x) => s + Number(x.monto), 0);
    const balance = Number(p.total) - abonado;
    const s = stats[p.cliente_id] ?? { saldo: 0, pendientes: 0 };
    if (balance > 0) s.saldo += balance;
    if (p.estado !== "entregado") s.pendientes += 1;
    stats[p.cliente_id] = s;
  }

  return (
    <ClientesView
      initial={(clientesRes.data ?? []) as Cliente[]}
      stats={stats}
      userEmail={username || email || ""}
      loadError={clientesRes.error?.message ?? null}
    />
  );
}
