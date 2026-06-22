import { headers } from "next/headers";

/**
 * Lee la identidad ya validada por el middleware desde los headers de la
 * petición (sin llamadas de red). El middleware valida el JWT una sola vez.
 */
export type Acceso = {
  userId: string | null;
  rol: "admin" | "cliente" | null;
  username: string | null;
  email: string | null;
};

export async function getAcceso(): Promise<Acceso> {
  const h = await headers();
  const rol = h.get("x-ac-rol");
  return {
    userId: h.get("x-ac-user-id") || null,
    rol: rol === "admin" || rol === "cliente" ? rol : null,
    username: h.get("x-ac-username") || null,
    email: h.get("x-ac-email") || null,
  };
}

export async function esAdmin(): Promise<boolean> {
  return (await getAcceso()).rol === "admin";
}
