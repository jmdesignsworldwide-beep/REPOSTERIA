import { createClient } from "@/lib/supabase/server";
import { PagosView } from "@/components/pagos/pagos-view";
import { PAGOS_MOCK, type MetodoPago, type Pago } from "@/lib/data/pagos";

export const dynamic = "force-dynamic";

type Row = {
  id: string;
  monto: number;
  metodo: MetodoPago;
  fecha: string;
  pedido: { numero: number; cliente: { nombre: string } | null } | null;
};

export default async function PagosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let pagos: Pago[] = PAGOS_MOCK;

  if (user) {
    const { data } = await supabase
      .from("movimientos_caja")
      .select("id,monto,metodo,fecha,pedido:pedidos(numero,cliente:clientes(nombre))")
      .eq("tipo", "ingreso")
      .eq("anulado", false)
      .order("created_at", { ascending: false });
    const rows = (data ?? []) as unknown as Row[];
    if (rows.length > 0) {
      pagos = rows.map((r) => ({
        id: r.id,
        cliente: r.pedido?.cliente?.nombre ?? "Mostrador",
        pedidoRef: r.pedido ? `#${r.pedido.numero}` : null,
        monto: Number(r.monto),
        metodo: r.metodo,
        voucher:
          r.metodo === "transferencia"
            ? `TRX-${r.id.slice(0, 6).toUpperCase()}`
            : r.metodo === "tarjeta"
              ? `APR-${r.id.slice(0, 6).toUpperCase()}`
              : null,
        fecha: r.fecha,
        estado: "verificado",
      }));
    }
  }

  return <PagosView pagos={pagos} />;
}
