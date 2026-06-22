import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type CookieToSet = { name: string; value: string; options: CookieOptions };

// Rutas públicas (sin sesión). Todo lo demás exige sesión válida.
const PUBLICAS = ["/login", "/expirado"];

/**
 * Valida la sesión UNA sola vez por request (refresca token + cookies),
 * inyecta la identidad en headers (las páginas la leen sin más llamadas de
 * red → login y navegación rápidos), y protege en el servidor:
 *  - sin sesión + ruta interna → /login
 *  - cliente vencido/inactivo → /expirado
 *  - /admin solo para rol admin
 */
export async function updateSession(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  let cookiesToApply: CookieToSet[] = [];

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(list: CookieToSet[]) {
          list.forEach(({ name, value }) => request.cookies.set(name, value));
          cookiesToApply = list;
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const esPublica = PUBLICAS.some((p) => path === p || path.startsWith(`${p}/`));

  const aplicar = (res: NextResponse) => {
    cookiesToApply.forEach(({ name, value, options }) =>
      res.cookies.set(name, value, options),
    );
    return res;
  };
  const redir = (to: string) => {
    const url = request.nextUrl.clone();
    url.pathname = to;
    return aplicar(NextResponse.redirect(url));
  };

  // Sin sesión → solo rutas públicas.
  if (!user) {
    if (esPublica) return aplicar(NextResponse.next({ request: { headers: requestHeaders } }));
    return redir("/login");
  }

  const meta = (user.app_metadata ?? {}) as Record<string, unknown>;
  const rol = meta.rol === "admin" ? "admin" : "cliente";
  const activo = meta.activo !== false;
  const expira = typeof meta.expira_at === "string" ? new Date(meta.expira_at) : null;
  const vencido =
    rol !== "admin" && (!activo || (expira !== null && expira.getTime() < Date.now()));

  // Cliente vencido → siempre a /expirado.
  if (vencido) {
    return path === "/expirado"
      ? aplicar(NextResponse.next({ request: { headers: requestHeaders } }))
      : redir("/expirado");
  }

  // Con sesión vigente, no tiene sentido /login ni /expirado.
  if (path === "/login" || path === "/expirado") return redir("/");

  // /admin solo para admin.
  if (path === "/admin" || path.startsWith("/admin/")) {
    if (rol !== "admin") return redir("/");
  }

  // Identidad para las páginas (sin llamadas de red en cada una).
  requestHeaders.set("x-ac-user-id", user.id);
  requestHeaders.set("x-ac-rol", rol);
  requestHeaders.set("x-ac-username", typeof meta.username === "string" ? meta.username : "");
  requestHeaders.set("x-ac-email", user.email ?? "");

  return aplicar(NextResponse.next({ request: { headers: requestHeaders } }));
}
