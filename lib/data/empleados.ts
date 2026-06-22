export type Asistencia = "presente" | "ausente" | "tarde";

export interface Empleado {
  id: string;
  nombre: string;
  rol: string;
  tono: number;
  asistencia: Asistencia;
  telefono: string;
  salario: number; // mensual RD$
  vacacionesDias: number;
  permisos: string[];
  actividad: { fecha: string; texto: string }[];
}

export const EMPLEADOS: Empleado[] = [
  {
    id: "e-johann",
    nombre: "Johann Marien",
    rol: "Dueño · Repostero principal",
    tono: 0,
    asistencia: "presente",
    telefono: "809-412-7785",
    salario: 0,
    vacacionesDias: 0,
    permisos: ["Administración total", "Caja", "Pedidos", "Reportes"],
    actividad: [
      { fecha: "2026-06-22", texto: "Cerró la caja del día anterior" },
      { fecha: "2026-06-22", texto: "Aprobó pedido de boda #1045" },
    ],
  },
  {
    id: "e-yenny",
    nombre: "Yenny Castillo",
    rol: "Decoradora",
    tono: 1,
    asistencia: "presente",
    telefono: "829-330-5521",
    salario: 28000,
    vacacionesDias: 6,
    permisos: ["Pedidos", "Producción"],
    actividad: [
      { fecha: "2026-06-22", texto: "Decoró bizcocho #1048" },
      { fecha: "2026-06-21", texto: "Terminó cupcakes de graduación" },
    ],
  },
  {
    id: "e-pedro",
    nombre: "Pedro Encarnación",
    rol: "Repartidor",
    tono: 2,
    asistencia: "tarde",
    telefono: "849-208-3344",
    salario: 22000,
    vacacionesDias: 10,
    permisos: ["Entregas"],
    actividad: [
      { fecha: "2026-06-21", texto: "Entregó 3 pedidos en Santiago" },
    ],
  },
  {
    id: "e-rosa",
    nombre: "Rosa Méndez",
    rol: "Cajera",
    tono: 3,
    asistencia: "presente",
    telefono: "809-755-9090",
    salario: 24000,
    vacacionesDias: 4,
    permisos: ["Caja", "Clientes"],
    actividad: [
      { fecha: "2026-06-22", texto: "Registró 5 cobros en caja" },
    ],
  },
  {
    id: "e-luis",
    nombre: "Luis Brito",
    rol: "Asistente de cocina",
    tono: 4,
    asistencia: "ausente",
    telefono: "829-661-1212",
    salario: 20000,
    vacacionesDias: 12,
    permisos: ["Producción"],
    actividad: [
      { fecha: "2026-06-20", texto: "Preparó masa para 8 bizcochos" },
    ],
  },
];

export const ASISTENCIA_META: Record<Asistencia, { label: string; cls: string }> = {
  presente: { label: "Presente", cls: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" },
  tarde: { label: "Tarde", cls: "bg-amber-500/15 text-amber-600 dark:text-amber-400" },
  ausente: { label: "Ausente", cls: "bg-red-500/15 text-red-600 dark:text-red-400" },
};
