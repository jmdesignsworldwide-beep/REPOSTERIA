"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Pedido, PedidoInput } from "@/lib/pedidos/types";

type Result = { ok: true; id?: string } | { ok: false; error: string };

const SELECT =
  "*, cliente:clientes(id,nombre,telefono,direccion), items:pedido_items(id,producto,tamano,sabor,cantidad,precio,orden), pagos:movimientos_caja(monto,anulado,tipo)";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

function validar(input: PedidoInput): string | null {
  if (!input.cliente_id) return "Debes elegir un cliente.";
  if (!input.fecha_entrega) return "La fecha de entrega es obligatoria.";
  const items = input.items.filter((i) => i.producto.trim());
  if (items.length === 0) return "Agrega al menos un renglón con producto.";
  for (const it of items) {
    if (it.cantidad <= 0) return "La cantidad de cada renglón debe ser mayor a 0.";
    if (it.precio < 0) return "El precio no puede ser negativo.";
  }
  if (input.adelanto < 0) return "El adelanto no puede ser negativo.";
  return null;
}

function calcTotal(input: PedidoInput) {
  return input.items
    .filter((i) => i.producto.trim())
    .reduce((s, i) => s + i.cantidad * i.precio, 0);
}

async function guardarItems(
  supabase: Awaited<ReturnType<typeof createClient>>,
  pedidoId: string,
  input: PedidoInput,
) {
  const rows = input.items
    .filter((i) => i.producto.trim())
    .map((i, idx) => ({
      pedido_id: pedidoId,
      producto: i.producto.trim(),
      tamano: i.tamano?.trim() || null,
      sabor: i.sabor?.trim() || null,
      cantidad: i.cantidad,
      precio: i.precio,
      orden: idx,
    }));
  return supabase.from("pedido_items").insert(rows);
}

export async function crearPedido(input: PedidoInput): Promise<Result> {
  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Debes iniciar sesión." };
  const err = validar(input);
  if (err) return { ok: false, error: err };

  const { data, error } = await supabase
    .from("pedidos")
    .insert({
      cliente_id: input.cliente_id,
      descripcion: input.descripcion?.trim() || null,
      ocasion: input.ocasion?.trim() || null,
      fecha_entrega: input.fecha_entrega,
      hora_entrega: input.hora_entrega?.trim() || null,
      estado: input.estado,
      total: calcTotal(input),
      adelanto: 0,
      notas: input.notas?.trim() || null,
      fotos: input.fotos,
    })
    .select("id, numero")
    .single();

  if (error || !data) return { ok: false, error: error?.message ?? "Error" };

  const itemsRes = await guardarItems(supabase, data.id, input);
  if (itemsRes.error) return { ok: false, error: itemsRes.error.message };

  // Abono inicial → ingreso de caja enlazado (un solo origen para el dinero).
  if (input.adelanto > 0) {
    await supabase.from("movimientos_caja").insert({
      tipo: "ingreso",
      monto: input.adelanto,
      concepto: `Abono inicial pedido #${data.numero}`,
      categoria: "pago_pedido",
      metodo: "efectivo",
      pedido_id: data.id,
    });
  }

  revalidatePath("/pedidos");
  revalidatePath("/calendario");
  revalidatePath("/");
  revalidatePath("/clientes");
  revalidatePath("/caja");
  return { ok: true, id: data.id };
}

export async function actualizarPedido(
  id: string,
  input: PedidoInput,
): Promise<Result> {
  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Debes iniciar sesión." };
  const err = validar(input);
  if (err) return { ok: false, error: err };

  const { error } = await supabase
    .from("pedidos")
    .update({
      cliente_id: input.cliente_id,
      descripcion: input.descripcion?.trim() || null,
      ocasion: input.ocasion?.trim() || null,
      fecha_entrega: input.fecha_entrega,
      hora_entrega: input.hora_entrega?.trim() || null,
      estado: input.estado,
      total: calcTotal(input),
      notas: input.notas?.trim() || null,
      fotos: input.fotos,
    })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  // Reemplazar renglones
  const del = await supabase.from("pedido_items").delete().eq("pedido_id", id);
  if (del.error) return { ok: false, error: del.error.message };
  const itemsRes = await guardarItems(supabase, id, input);
  if (itemsRes.error) return { ok: false, error: itemsRes.error.message };

  revalidatePath("/pedidos");
  revalidatePath("/calendario");
  revalidatePath("/");
  revalidatePath("/clientes");
  return { ok: true, id };
}

export async function cambiarEstadoPedido(
  id: string,
  estado: Pedido["estado"],
): Promise<Result> {
  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Debes iniciar sesión." };
  const { error } = await supabase
    .from("pedidos")
    .update({ estado })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/pedidos");
  revalidatePath("/calendario");
  revalidatePath("/");
  return { ok: true, id };
}

export async function cambiarActivoPedido(
  id: string,
  activo: boolean,
): Promise<Result> {
  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Debes iniciar sesión." };
  const { error } = await supabase
    .from("pedidos")
    .update({ activo, deleted_at: activo ? null : new Date().toISOString() })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/pedidos");
  revalidatePath("/calendario");
  revalidatePath("/");
  return { ok: true, id };
}

/** Historial real de pedidos de un cliente (para la ficha — organismo). */
export async function getPedidosDeCliente(clienteId: string): Promise<Pedido[]> {
  const { supabase, user } = await requireUser();
  if (!user) return [];
  const { data } = await supabase
    .from("pedidos")
    .select(SELECT)
    .eq("cliente_id", clienteId)
    .eq("activo", true)
    .order("fecha_entrega", { ascending: false });
  return (data ?? []) as unknown as Pedido[];
}
