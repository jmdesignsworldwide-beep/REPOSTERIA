"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAcceso } from "@/lib/auth/acceso";
import { emailDeUsuario, slugUsuario } from "@/lib/auth/usuario";

type Result = { ok: true } | { ok: false; error: string };

async function requireAdmin() {
  const { rol } = await getAcceso();
  return rol === "admin";
}

/**
 * Cambia la contraseña de la PROPIA cuenta de admin que está en sesión.
 * El id se toma de la sesión validada por el middleware (headers x-ac-*),
 * nunca del cliente, así que un admin solo puede cambiar su propia clave.
 * La nueva contraseña la hashea GoTrue; nunca se guarda ni se loguea en claro.
 */
export async function cambiarMiPassword(input: {
  password: string;
}): Promise<Result> {
  const { rol, userId } = await getAcceso();
  if (rol !== "admin" || !userId) return { ok: false, error: "No autorizado." };
  if (input.password.length < 8)
    return { ok: false, error: "La contraseña debe tener al menos 8 caracteres." };

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(userId, {
    password: input.password,
  });
  if (error) return { ok: false, error: error.message };

  return { ok: true };
}

function expiraDesde(base: Date, dias: number | null): string | null {
  if (dias === null) return null;
  return new Date(base.getTime() + dias * 86400000).toISOString();
}

export async function crearCuenta(input: {
  username: string;
  password: string;
  dias: number | null;
}): Promise<Result> {
  if (!(await requireAdmin())) return { ok: false, error: "No autorizado." };

  const username = slugUsuario(input.username);
  if (username.length < 3)
    return { ok: false, error: "Usuario inválido (mínimo 3 caracteres, sin espacios)." };
  if (input.password.length < 6)
    return { ok: false, error: "La contraseña debe tener al menos 6 caracteres." };
  if (input.dias !== null && (!Number.isFinite(input.dias) || input.dias <= 0))
    return { ok: false, error: "Los días deben ser un número mayor a 0." };

  const admin = createAdminClient();
  const expira_at = expiraDesde(new Date(), input.dias);

  const { data, error } = await admin.auth.admin.createUser({
    email: emailDeUsuario(username),
    password: input.password,
    email_confirm: true,
    app_metadata: { rol: "cliente", username, activo: true, expira_at },
    user_metadata: { name: username },
  });
  if (error || !data.user) {
    const dup = (error?.message ?? "").toLowerCase().includes("already");
    return { ok: false, error: dup ? "Ese usuario ya existe." : error?.message ?? "Error" };
  }

  const { error: insErr } = await admin.from("cuentas").insert({
    user_id: data.user.id,
    username,
    rol: "cliente",
    activo: true,
    expira_at,
  });
  if (insErr) return { ok: false, error: insErr.message };

  revalidatePath("/admin");
  return { ok: true };
}

export async function renovarCuenta(
  cuentaId: string,
  dias: number,
): Promise<Result> {
  if (!(await requireAdmin())) return { ok: false, error: "No autorizado." };
  if (!Number.isFinite(dias) || dias <= 0)
    return { ok: false, error: "Días inválidos." };

  const admin = createAdminClient();
  const { data: cuenta, error } = await admin
    .from("cuentas")
    .select("user_id, username, expira_at")
    .eq("id", cuentaId)
    .single();
  if (error || !cuenta) return { ok: false, error: "Cuenta no encontrada." };

  const actual = cuenta.expira_at ? new Date(cuenta.expira_at) : null;
  const base = actual && actual.getTime() > Date.now() ? actual : new Date();
  const expira_at = expiraDesde(base, dias);

  const up = await admin
    .from("cuentas")
    .update({ expira_at, activo: true })
    .eq("id", cuentaId);
  if (up.error) return { ok: false, error: up.error.message };

  await admin.auth.admin.updateUserById(cuenta.user_id, {
    app_metadata: { rol: "cliente", username: cuenta.username, activo: true, expira_at },
  });

  revalidatePath("/admin");
  return { ok: true };
}

export async function cambiarActivoCuenta(
  cuentaId: string,
  activo: boolean,
): Promise<Result> {
  if (!(await requireAdmin())) return { ok: false, error: "No autorizado." };

  const admin = createAdminClient();
  const { data: cuenta, error } = await admin
    .from("cuentas")
    .select("user_id, username, expira_at")
    .eq("id", cuentaId)
    .single();
  if (error || !cuenta) return { ok: false, error: "Cuenta no encontrada." };

  const up = await admin.from("cuentas").update({ activo }).eq("id", cuentaId);
  if (up.error) return { ok: false, error: up.error.message };

  await admin.auth.admin.updateUserById(cuenta.user_id, {
    app_metadata: {
      rol: "cliente",
      username: cuenta.username,
      activo,
      expira_at: cuenta.expira_at,
    },
  });

  revalidatePath("/admin");
  return { ok: true };
}
