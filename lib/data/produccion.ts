export type EstadoTarea = "cola" | "proceso" | "listo";

export interface Tarea {
  id: string;
  producto: string;
  detalle: string;
  repostero: string;
  estado: EstadoTarea;
  minutos: number; // tiempo estimado
  pedidoRef?: string;
}

export const CAPACIDAD = { usada: 14, maxima: 20 };

export const TAREAS: Tarea[] = [
  { id: "t-1", producto: "Bizcocho tres leches", detalle: "15 porciones · flores rosadas", repostero: "Johann Marien", estado: "proceso", minutos: 120, pedidoRef: "#1048" },
  { id: "t-2", producto: "Cupcakes chocolate", detalle: "24 uds. · toppings dorados", repostero: "Yenny Castillo", estado: "cola", minutos: 90, pedidoRef: "#1046" },
  { id: "t-3", producto: "Pastel de boda", detalle: "3 pisos · tema dorado", repostero: "Johann Marien", estado: "cola", minutos: 300, pedidoRef: "#1045" },
  { id: "t-4", producto: "Suspiros", detalle: "50 uds. · colores pastel", repostero: "Luis Brito", estado: "listo", minutos: 60 },
  { id: "t-5", producto: "Flan dominicano", detalle: "Familiar", repostero: "Yenny Castillo", estado: "proceso", minutos: 75 },
  { id: "t-6", producto: "Pan de yema", detalle: "Media docena", repostero: "Luis Brito", estado: "listo", minutos: 45 },
];

export const ESTADO_TAREA: Record<EstadoTarea, { label: string; cls: string }> = {
  cola: { label: "En cola", cls: "bg-amber-500/15 text-amber-600 dark:text-amber-400" },
  proceso: { label: "En proceso", cls: "bg-sky-500/15 text-sky-600 dark:text-sky-400" },
  listo: { label: "Listo", cls: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" },
};
