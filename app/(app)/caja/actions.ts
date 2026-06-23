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

/**
 * Venta rápida de mostrador (POS). Reúne uno o varios productos del catálogo
 * en UN ingreso real de caja con categoría `venta_directa` (mostrador), para
 * distinguirla del `pago_pedido`. El dinero sigue teniendo un solo origen:
 * vive en movimientos_caja y alimenta el Dashboard y el arqueo igual que todo.
 */
export async function cobrarVentaPOS(input: {
  concepto: string;
  monto: number;
  metodo: MovimientoInput["metodo"];
}): Promise<Result> {
  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Debes iniciar sesión." };
  if (!(input.monto > 0)) return { ok: false, error: "Agrega productos a la venta." };

  const { error } = await supabase.from("movimientos_caja").insert({
    tipo: "ingreso",
    monto: input.monto,
    concepto: input.concepto.trim() || "Venta de mostrador",
    categoria: "venta_directa",
    metodo: input.metodo,
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
