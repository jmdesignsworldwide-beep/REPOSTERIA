// Mapeo usuario → email interno (el cliente nunca ve un email).
export const DOMINIO_INTERNO = "acceso.azucarycanela.app";

export function slugUsuario(u: string): string {
  return u.trim().toLowerCase().replace(/[^a-z0-9._-]/g, "");
}

export function emailDeUsuario(u: string): string {
  return `${slugUsuario(u)}@${DOMINIO_INTERNO}`;
}
