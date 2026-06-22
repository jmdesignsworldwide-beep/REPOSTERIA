export interface Cuenta {
  id: string;
  user_id: string;
  username: string;
  rol: "admin" | "cliente";
  activo: boolean;
  expira_at: string | null; // ISO, null = sin vencimiento
  created_at: string;
}

/** Días restantes (null = sin vencimiento; negativo/0 = vencida). */
export function diasRestantes(expira_at: string | null): number | null {
  if (!expira_at) return null;
  const ms = new Date(expira_at).getTime() - Date.now();
  return Math.ceil(ms / 86400000);
}

export function estaVencida(c: Pick<Cuenta, "activo" | "expira_at" | "rol">): boolean {
  if (c.rol === "admin") return false;
  if (!c.activo) return true;
  if (!c.expira_at) return false;
  return new Date(c.expira_at).getTime() < Date.now();
}
