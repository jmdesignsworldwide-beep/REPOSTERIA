// Forma del cliente tal como vive en la tabla public.clientes.

export interface FechaImportante {
  tipo: string; // Cumpleaños | Aniversario | Boda | Bautizo | Otro
  fecha: string; // YYYY-MM-DD
}

export interface Cliente {
  id: string;
  nombre: string;
  cedula: string | null;
  telefono: string;
  correo: string | null;
  direccion: string | null;
  alergias: string[];
  preferencias: string[];
  fechas_importantes: FechaImportante[];
  notas: string | null;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export type ClienteInput = {
  nombre: string;
  cedula?: string;
  telefono: string;
  correo?: string;
  direccion?: string;
  alergias: string[];
  preferencias: string[];
  fechas_importantes: FechaImportante[];
  notas?: string;
};

export type ActionResult = { ok: true } | { ok: false; error: string };
