import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Cliente ADMIN de Supabase — SOLO servidor.
 *
 * Usa la clave service_role, que se SALTA las reglas de seguridad (RLS) y
 * tiene acceso total a la base de datos. El import "server-only" garantiza
 * que este archivo NUNCA se incluya en el bundle del navegador.
 *
 * Úsalo solo para operaciones de servidor de confianza (tareas administrativas,
 * webhooks, etc.). Nunca lo importes desde un componente "use client".
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
