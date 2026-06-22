"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { MovimientoInput } from "@/lib/caja/types";

type Result = { ok: true } | { ok: false; error: string };

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

function revalidar() {
  revalidatePath("/caja");
  revalidatePath("/");
  revalidatePath("/pedidos");
  revalidatePath("/calendario");
  revalidatePath("/clientes");
}

export async function crearMovimiento(
  input: MovimientoInput,
): Promise<Result> {
  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Debes iniciar sesión." };
  if (!input.concepto.trim()) return { ok: false, error: "El concepto es obligatorio." };
  if (!(input.monto > 0)) return { ok: false, error: "El monto debe ser mayor a 0." };

  const { error } = await supabase.from("movimientos_caja").insert({
    tipo: input.tipo,
    monto: input.monto,
    concepto: input.concepto.trim(),
    categoria: input.categoria,
    metodo: input.metodo,
  });
  if (error) return { ok: false, error: error.message };
  revalidar();
  return { ok: true };
}

export async function cobrarPagoPedido(
  pedidoId: string,
  pedidoNumero: number,
  monto: number,
  metodo: MovimientoInput["metodo"],
): Promise<Result> {
  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Debes iniciar sesión." };
  if (!(monto > 0)) return { ok: false, error: "El monto debe ser mayor a 0." };

  const { error } = await supabase.from("movimientos_caja").insert({
    tipo: "ingreso",
    monto,
    concepto: `Pago pedido #${pedidoNumero}`,
    categoria: "pago_pedido",
    metodo,
    pedido_id: pedidoId,
  });
  if (error) return { ok: false, error: error.message };
  revalidar();
  return { ok: true };
}

export async function anularMovimiento(id: string): Promise<Result> {
  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Debes iniciar sesión." };
  const { error } = await supabase
    .from("movimientos_caja")
    .update({ anulado: true, anulado_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidar();
  return { ok: true };
}
