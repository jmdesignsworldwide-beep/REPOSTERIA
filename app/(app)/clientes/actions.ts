"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult, ClienteInput } from "@/lib/clientes/types";

// ───────────── Validación (en el SERVIDOR) ─────────────
function validar(input: ClienteInput): string | null {
  if (!input.nombre?.trim()) return "El nombre es obligatorio.";
  const tel = (input.telefono ?? "").trim();
  if (!/^(809|829|849)[-\s]?\d{3}[-\s]?\d{4}$/.test(tel))
    return "Teléfono inválido. Usa 809, 829 o 849 (ej. 809-555-1234).";
  if (input.correo && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(input.correo.trim()))
    return "El correo no tiene un formato válido.";
  return null;
}

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

function limpiar(input: ClienteInput) {
  return {
    nombre: input.nombre.trim(),
    cedula: input.cedula?.trim() || null,
    telefono: input.telefono.trim(),
    correo: input.correo?.trim() || null,
    direccion: input.direccion?.trim() || null,
    alergias: input.alergias.map((a) => a.trim()).filter(Boolean),
    preferencias: input.preferencias.map((p) => p.trim()).filter(Boolean),
    fechas_importantes: input.fechas_importantes.filter((f) => f.fecha),
    notas: input.notas?.trim() || null,
  };
}

export async function crearCliente(input: ClienteInput): Promise<ActionResult> {
  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Debes iniciar sesión." };

  const err = validar(input);
  if (err) return { ok: false, error: err };

  const { error } = await supabase.from("clientes").insert(limpiar(input));
  if (error) return { ok: false, error: error.message };

  revalidatePath("/clientes");
  return { ok: true };
}

export async function actualizarCliente(
  id: string,
  input: ClienteInput,
): Promise<ActionResult> {
  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Debes iniciar sesión." };

  const err = validar(input);
  if (err) return { ok: false, error: err };

  const { error } = await supabase
    .from("clientes")
    .update(limpiar(input))
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/clientes");
  return { ok: true };
}

export async function cambiarActivo(
  id: string,
  activo: boolean,
): Promise<ActionResult> {
  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Debes iniciar sesión." };

  const { error } = await supabase
    .from("clientes")
    .update({ activo, deleted_at: activo ? null : new Date().toISOString() })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/clientes");
  return { ok: true };
}

export async function cerrarSesion(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
}
