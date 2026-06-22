import { createClient } from "@/lib/supabase/server";

// Se evalúa en cada petición para reflejar el estado real de la conexión.
export const dynamic = "force-dynamic";

type Estado = { ok: boolean; titulo: string; detalle: string };

async function comprobarConexion(): Promise<Estado> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const tieneAnon = Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  if (!url || !tieneAnon) {
    return {
      ok: false,
      titulo: "Faltan variables de entorno",
      detalle:
        "Configura NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.getSession();
    if (error) throw error;
    return {
      ok: true,
      titulo: "Conectado a Supabase",
      detalle: `Proyecto: ${new URL(url).host}`,
    };
  } catch {
    return {
      ok: false,
      titulo: "No se pudo conectar a Supabase",
      detalle: "Revisa que las claves en Vercel sean correctas.",
    };
  }
}

export default async function DashboardPage() {
  const estado = await comprobarConexion();

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bienvenida 🧁</h1>
        <p className="mt-1 text-muted">
          Panel base de tu repostería. Aquí irán productos, pedidos y clientes.
        </p>
      </div>

      <div
        className={`rounded-xl border p-5 ${
          estado.ok ? "border-border bg-surface" : "border-border bg-surface"
        }`}
      >
        <p className="text-lg font-semibold">
          {estado.ok ? "✅ " : "⚠️ "}
          {estado.titulo}
        </p>
        <p className="mt-1 text-sm text-muted">{estado.detalle}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { t: "Productos", d: "Catálogo de tu repostería", i: "🧁" },
          { t: "Pedidos", d: "Gestión de pedidos", i: "🧾" },
          { t: "Clientes", d: "Tu lista de clientes", i: "👥" },
        ].map((c) => (
          <div
            key={c.t}
            className="rounded-xl border border-border bg-surface p-5"
          >
            <div className="text-2xl">{c.i}</div>
            <div className="mt-2 font-semibold">{c.t}</div>
            <div className="text-sm text-muted">{c.d}</div>
            <div className="mt-3 inline-block rounded-md bg-background px-2 py-0.5 text-xs text-muted">
              Próximamente
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
