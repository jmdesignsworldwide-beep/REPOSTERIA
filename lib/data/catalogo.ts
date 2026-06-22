// Catálogo de productos (mock realista). Solo lectura para el módulo navegable.

export interface PrecioTamano {
  tamano: string;
  precio: number;
}

export interface Producto {
  id: string;
  nombre: string;
  categoria: "Bizcochos" | "Postres" | "Cupcakes" | "Especiales";
  emoji: string;
  tono: number; // índice de gradiente para el placeholder
  descripcion: string;
  disponible: boolean;
  temporada?: string;
  sabores: string[];
  precios: PrecioTamano[];
  personalizaciones: string[];
}

export const PRODUCTOS: Producto[] = [
  {
    id: "biz-dom",
    nombre: "Bizcocho dominicano",
    categoria: "Bizcochos",
    emoji: "🎂",
    tono: 0,
    descripcion:
      "El clásico bizcocho dominicano, esponjoso y húmedo, con suspiro batido a mano.",
    disponible: true,
    sabores: ["Tres leches", "Vainilla", "Chocolate", "Piña", "Guayaba"],
    precios: [
      { tamano: "8 porciones", precio: 1800 },
      { tamano: "15 porciones", precio: 3200 },
      { tamano: "25 porciones", precio: 5000 },
    ],
    personalizaciones: ["Mensaje en glaseado", "Flores de azúcar", "Foto comestible"],
  },
  {
    id: "tres-leches",
    nombre: "Tres leches",
    categoria: "Postres",
    emoji: "🍰",
    tono: 1,
    descripcion:
      "Bizcocho bañado en tres leches con merengue. El favorito de la casa.",
    disponible: true,
    sabores: ["Vainilla", "Chocolate", "Coco"],
    precios: [
      { tamano: "Personal", precio: 250 },
      { tamano: "Mediano (10)", precio: 2200 },
      { tamano: "Grande (20)", precio: 3900 },
    ],
    personalizaciones: ["Frutas frescas", "Mensaje"],
  },
  {
    id: "cupcakes",
    nombre: "Cupcakes",
    categoria: "Cupcakes",
    emoji: "🧁",
    tono: 2,
    descripcion: "Cupcakes decorados a mano, ideales para eventos y detalles.",
    disponible: true,
    sabores: ["Chocolate", "Vainilla", "Red velvet", "Zanahoria"],
    precios: [
      { tamano: "Caja de 6", precio: 600 },
      { tamano: "Caja de 12", precio: 1100 },
      { tamano: "Caja de 24", precio: 2000 },
    ],
    personalizaciones: ["Toppers temáticos", "Colores personalizados", "Logo comestible"],
  },
  {
    id: "suspiros",
    nombre: "Suspiros",
    categoria: "Postres",
    emoji: "🍥",
    tono: 3,
    descripcion: "Suspiros dominicanos crujientes, en colores pastel.",
    disponible: true,
    sabores: ["Vainilla", "Fresa", "Limón"],
    precios: [
      { tamano: "Docena", precio: 300 },
      { tamano: "50 unidades", precio: 1000 },
      { tamano: "100 unidades", precio: 1800 },
    ],
    personalizaciones: ["Colores del evento"],
  },
  {
    id: "pastel-pers",
    nombre: "Pastel personalizado",
    categoria: "Especiales",
    emoji: "🎂",
    tono: 4,
    descripcion:
      "Pasteles de varios pisos diseñados a medida para bodas y grandes eventos.",
    disponible: true,
    sabores: ["Vainilla", "Chocolate", "Tres leches", "Guayaba", "Red velvet"],
    precios: [
      { tamano: "2 pisos", precio: 6500 },
      { tamano: "3 pisos", precio: 9500 },
      { tamano: "4 pisos", precio: 14000 },
    ],
    personalizaciones: ["Diseño temático", "Topper de novios", "Flores naturales", "Detalles dorados"],
  },
  {
    id: "flan",
    nombre: "Flan dominicano",
    categoria: "Postres",
    emoji: "🍮",
    tono: 1,
    descripcion: "Flan cremoso de caramelo, receta tradicional de la abuela.",
    disponible: true,
    sabores: ["Vainilla", "Coco", "Queso"],
    precios: [
      { tamano: "Personal", precio: 180 },
      { tamano: "Familiar", precio: 1400 },
    ],
    personalizaciones: [],
  },
  {
    id: "brownies",
    nombre: "Brownies",
    categoria: "Postres",
    emoji: "🍫",
    tono: 0,
    descripcion: "Brownies de chocolate intenso con nueces.",
    disponible: false,
    sabores: ["Chocolate", "Chocolate con nuez"],
    precios: [
      { tamano: "Caja de 9", precio: 750 },
      { tamano: "Caja de 16", precio: 1300 },
    ],
    personalizaciones: ["Sin nuez"],
  },
  {
    id: "pan-yema",
    nombre: "Pan de yema",
    categoria: "Bizcochos",
    emoji: "🍞",
    tono: 2,
    descripcion: "Pan de yema suave y dorado, perfecto para la merienda.",
    disponible: true,
    sabores: ["Tradicional"],
    precios: [
      { tamano: "Unidad", precio: 90 },
      { tamano: "Media docena", precio: 480 },
    ],
    personalizaciones: [],
  },
  {
    id: "pastel-navidad",
    nombre: "Pastel de frutas navideño",
    categoria: "Especiales",
    emoji: "🎄",
    tono: 3,
    descripcion:
      "Pastel de frutas confitadas, especial de temporada navideña.",
    disponible: false,
    temporada: "Navidad",
    sabores: ["Frutas confitadas"],
    precios: [
      { tamano: "Mediano", precio: 2800 },
      { tamano: "Grande", precio: 4500 },
    ],
    personalizaciones: ["Con o sin licor"],
  },
];

export function rangoPrecio(p: Producto): string {
  const min = Math.min(...p.precios.map((x) => x.precio));
  const max = Math.max(...p.precios.map((x) => x.precio));
  const fmt = (n: number) => "RD$ " + n.toLocaleString("es-DO");
  return min === max ? fmt(min) : `${fmt(min)} – ${fmt(max)}`;
}

export const CATEGORIAS_CAT = [
  "Bizcochos",
  "Postres",
  "Cupcakes",
  "Especiales",
] as const;
