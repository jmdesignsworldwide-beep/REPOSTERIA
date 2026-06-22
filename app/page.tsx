import { createClient } from "@/lib/supabase/server";

// Se evalúa en cada petición (no en el build), para reflejar el estado real
// de la conexión usando las variables de entorno del servidor.
export const dynamic = "force-dynamic";

type Estado = {
  ok: boolean;
  titulo: string;
  detalle: string;
};

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
    // Llamada ligera que no requiere tablas: valida que el cliente responde.
    const { error } = await supabase.auth.getSession();
    if (error) throw error;

    const host = new URL(url).host;
    return {
      ok: true,
      titulo: "Conectado a Supabase",
      detalle: `Proyecto: ${host}`,
    };
  } catch {
    return {
      ok: false,
      titulo: "No se pudo conectar a Supabase",
      detalle: "Revisa que las claves en Vercel sean correctas.",
    };
  }
}

export default async function Home() {
  const estado = await comprobarConexion();

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-8 px-6 py-16 text-center">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">🧁 Repostería</h1>
        <p className="mt-3 text-base text-amber-900/70">
          Proyecto base con Next.js y Supabase.
        </p>
      </div>

      <div
        className={`w-full rounded-xl border p-5 text-left ${
          estado.ok
            ? "border-green-300 bg-green-50"
            : "border-amber-300 bg-amber-50"
        }`}
      >
        <p className="text-lg font-semibold">
          {estado.ok ? "✅ " : "⚠️ "}
          {estado.titulo}
        </p>
        <p className="mt-1 text-sm text-amber-900/70">{estado.detalle}</p>
      </div>

      <p className="text-sm text-amber-900/60">
        Todavía no hay tablas. El siguiente paso es crear el esquema de la base
        de datos (productos, pedidos, clientes…).
      </p>
    </main>
  );
}
