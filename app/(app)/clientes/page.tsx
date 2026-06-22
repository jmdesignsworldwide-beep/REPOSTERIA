import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { GlassCard } from "@/components/ui/glass-card";
import { ClientesView } from "@/components/clientes/clientes-view";
import type { Cliente } from "@/lib/clientes/types";

export const dynamic = "force-dynamic";

export default async function ClientesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="mx-auto max-w-md py-16">
        <GlassCard className="p-8 text-center">
          <div className="text-4xl">🔒</div>
          <h1 className="mt-3 font-display text-2xl font-bold">
            Inicia sesión
          </h1>
          <p className="mt-2 text-sm text-muted">
            El módulo de Clientes guarda datos reales protegidos. Inicia sesión
            para gestionarlos.
          </p>
          <Link
            href="/login"
            className="mt-5 inline-block rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow"
          >
            Ir al login
          </Link>
        </GlassCard>
      </div>
    );
  }

  const { data, error } = await supabase
    .from("clientes")
    .select("*")
    .order("activo", { ascending: false })
    .order("nombre", { ascending: true });

  return (
    <ClientesView
      initial={(data ?? []) as Cliente[]}
      userEmail={user.email ?? ""}
      loadError={error?.message ?? null}
    />
  );
}
