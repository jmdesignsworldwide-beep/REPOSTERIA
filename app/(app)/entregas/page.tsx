import { createClient } from "@/lib/supabase/server";
import { EntregasView } from "@/components/entregas/entregas-view";
import {
  ENTREGAS_MOCK,
  MOTORISTAS,
  type Entrega,
  type EstadoEntrega,
} from "@/lib/data/entregas";

export const dynamic = "force-dynamic";

type Row = {
  id: string;
  numero: number;
  estado: string;
  fecha_entrega: string;
  hora_entrega: string | null;
  cliente: { nombre: string; direccion: string | null } | null;
};

function mapEstado(e: string): EstadoEntrega {
  if (e === "entregado") return "entregado";
  if (e === "listo") return "en_camino";
  return "preparando";
}

export default async function EntregasPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let entregas: Entrega[] = ENTREGAS_MOCK;

  if (user) {
    const { data } = await supabase
      .from("pedidos")
      .select("id,numero,estado,fecha_entrega,hora_entrega,cliente:clientes(nombre,direccion)")
      .eq("activo", true)
      .order("fecha_entrega", { ascending: true });
    const rows = (data ?? []) as unknown as Row[];
    if (rows.length > 0) {
      entregas = rows.map((r, i) => {
        const dir = r.cliente?.direccion ?? null;
        const metodo = dir ? "delivery" : "tienda";
        return {
          id: r.id,
          pedidoRef: `#${r.numero}`,
          cliente: r.cliente?.nombre ?? "Cliente",
          metodo,
          motorista: metodo === "delivery" ? MOTORISTAS[i % MOTORISTAS.length] : null,
          estado: mapEstado(r.estado),
          direccion: dir ?? "Recoge en tienda",
          fecha: r.fecha_entrega,
          hora: r.hora_entrega,
        };
      });
    }
  }

  return <EntregasView entregas={entregas} />;
}
