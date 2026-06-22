// Recetas (mock realista). Costo y margen se DERIVAN de los ingredientes.

export interface IngredienteReceta {
  nombre: string;
  cantidad: string;
  costo: number; // RD$ para esa cantidad
}

export interface Receta {
  id: string;
  nombre: string;
  producto: string;
  emoji: string;
  rendimiento: string; // ej. "15 porciones"
  ingredientes: IngredienteReceta[];
  precioVenta: number;
}

export const RECETAS: Receta[] = [
  {
    id: "r-biz-tl",
    nombre: "Bizcocho tres leches (15 porciones)",
    producto: "Bizcocho dominicano",
    emoji: "🎂",
    rendimiento: "15 porciones",
    precioVenta: 3200,
    ingredientes: [
      { nombre: "Harina de trigo", cantidad: "500 g", costo: 60 },
      { nombre: "Huevos", cantidad: "8 uds.", costo: 96 },
      { nombre: "Azúcar", cantidad: "400 g", costo: 40 },
      { nombre: "Mantequilla", cantidad: "250 g", costo: 150 },
      { nombre: "Leche evaporada", cantidad: "1 lata", costo: 75 },
      { nombre: "Leche condensada", cantidad: "1 lata", costo: 110 },
      { nombre: "Crema de leche", cantidad: "1 taza", costo: 90 },
      { nombre: "Vainilla", cantidad: "1 cda.", costo: 20 },
    ],
  },
  {
    id: "r-cupcakes",
    nombre: "Cupcakes de chocolate (24 uds.)",
    producto: "Cupcakes",
    emoji: "🧁",
    rendimiento: "24 unidades",
    precioVenta: 2000,
    ingredientes: [
      { nombre: "Harina de trigo", cantidad: "400 g", costo: 48 },
      { nombre: "Cacao en polvo", cantidad: "100 g", costo: 120 },
      { nombre: "Huevos", cantidad: "4 uds.", costo: 48 },
      { nombre: "Azúcar", cantidad: "300 g", costo: 30 },
      { nombre: "Mantequilla", cantidad: "200 g", costo: 120 },
      { nombre: "Capacillos", cantidad: "24 uds.", costo: 60 },
    ],
  },
  {
    id: "r-suspiros",
    nombre: "Suspiros (50 uds.)",
    producto: "Suspiros",
    emoji: "🍥",
    rendimiento: "50 unidades",
    precioVenta: 1000,
    ingredientes: [
      { nombre: "Claras de huevo", cantidad: "6 uds.", costo: 72 },
      { nombre: "Azúcar glas", cantidad: "300 g", costo: 75 },
      { nombre: "Colorante vegetal", cantidad: "c/n", costo: 25 },
    ],
  },
  {
    id: "r-flan",
    nombre: "Flan dominicano (familiar)",
    producto: "Flan dominicano",
    emoji: "🍮",
    rendimiento: "10 porciones",
    precioVenta: 1400,
    ingredientes: [
      { nombre: "Huevos", cantidad: "6 uds.", costo: 72 },
      { nombre: "Leche evaporada", cantidad: "1 lata", costo: 75 },
      { nombre: "Leche condensada", cantidad: "1 lata", costo: 110 },
      { nombre: "Azúcar (caramelo)", cantidad: "200 g", costo: 20 },
      { nombre: "Vainilla", cantidad: "1 cda.", costo: 20 },
    ],
  },
  {
    id: "r-brownies",
    nombre: "Brownies (16 uds.)",
    producto: "Brownies",
    emoji: "🍫",
    rendimiento: "16 unidades",
    precioVenta: 1300,
    ingredientes: [
      { nombre: "Chocolate semiamargo", cantidad: "300 g", costo: 240 },
      { nombre: "Mantequilla", cantidad: "200 g", costo: 120 },
      { nombre: "Huevos", cantidad: "4 uds.", costo: 48 },
      { nombre: "Azúcar", cantidad: "250 g", costo: 25 },
      { nombre: "Harina de trigo", cantidad: "150 g", costo: 18 },
      { nombre: "Nueces", cantidad: "100 g", costo: 130 },
    ],
  },
];

export function costoReceta(r: Receta): number {
  return r.ingredientes.reduce((s, i) => s + i.costo, 0);
}
export function margenReceta(r: Receta): number {
  const costo = costoReceta(r);
  if (r.precioVenta <= 0) return 0;
  return Math.round(((r.precioVenta - costo) / r.precioVenta) * 100);
}
