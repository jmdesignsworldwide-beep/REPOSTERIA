// Inventario (mock realista). Solo lectura para el módulo navegable.

export type CategoriaInv = "Insumo" | "Empaque" | "Decoración";

export interface ItemInventario {
  id: string;
  nombre: string;
  categoria: CategoriaInv;
  stock: number;
  unidad: string;
  minimo: number;
  vencimiento: string | null; // YYYY-MM-DD
  proveedor: string;
}

export interface Compra {
  fecha: string;
  proveedor: string;
  item: string;
  cantidad: string;
  costo: number;
}

export interface Merma {
  fecha: string;
  item: string;
  cantidad: string;
  motivo: string;
}

export const INVENTARIO: ItemInventario[] = [
  { id: "i-harina", nombre: "Harina de trigo", categoria: "Insumo", stock: 8, unidad: "sacos", minimo: 3, vencimiento: "2026-12-01", proveedor: "Distribuidora La Famosa" },
  { id: "i-azucar", nombre: "Azúcar", categoria: "Insumo", stock: 2, unidad: "sacos", minimo: 3, vencimiento: "2027-03-15", proveedor: "Supermercado Nacional" },
  { id: "i-huevos", nombre: "Huevos", categoria: "Insumo", stock: 14, unidad: "cartones", minimo: 6, vencimiento: "2026-07-02", proveedor: "Granja Los Cocos" },
  { id: "i-evaporada", nombre: "Leche evaporada", categoria: "Insumo", stock: 30, unidad: "latas", minimo: 12, vencimiento: "2027-01-20", proveedor: "Distribuidora La Famosa" },
  { id: "i-condensada", nombre: "Leche condensada", categoria: "Insumo", stock: 5, unidad: "latas", minimo: 12, vencimiento: "2026-11-10", proveedor: "Distribuidora La Famosa" },
  { id: "i-mantequilla", nombre: "Mantequilla", categoria: "Insumo", stock: 9, unidad: "libras", minimo: 4, vencimiento: "2026-06-30", proveedor: "Supermercado Nacional" },
  { id: "i-chocolate", nombre: "Chocolate semiamargo", categoria: "Insumo", stock: 3, unidad: "kg", minimo: 2, vencimiento: "2026-10-05", proveedor: "Repostería Dominicana SRL" },
  { id: "i-cajas", nombre: "Cajas para bizcocho", categoria: "Empaque", stock: 45, unidad: "uds.", minimo: 20, vencimiento: null, proveedor: "Empaques del Cibao" },
  { id: "i-capacillos", nombre: "Capacillos para cupcakes", categoria: "Empaque", stock: 12, unidad: "paquetes", minimo: 15, vencimiento: null, proveedor: "Empaques del Cibao" },
  { id: "i-velitas", nombre: "Velitas de cumpleaños", categoria: "Decoración", stock: 60, unidad: "uds.", minimo: 25, vencimiento: null, proveedor: "Mercado Modelo" },
  { id: "i-perlas", nombre: "Perlas comestibles", categoria: "Decoración", stock: 4, unidad: "frascos", minimo: 5, vencimiento: "2027-02-01", proveedor: "Repostería Dominicana SRL" },
  { id: "i-colorante", nombre: "Colorante vegetal", categoria: "Decoración", stock: 7, unidad: "frascos", minimo: 4, vencimiento: "2026-09-12", proveedor: "Repostería Dominicana SRL" },
];

export const COMPRAS: Compra[] = [
  { fecha: "2026-06-20", proveedor: "Distribuidora La Famosa", item: "Harina de trigo", cantidad: "5 sacos", costo: 4500 },
  { fecha: "2026-06-19", proveedor: "Granja Los Cocos", item: "Huevos", cantidad: "10 cartones", costo: 3600 },
  { fecha: "2026-06-18", proveedor: "Supermercado Nacional", item: "Mantequilla", cantidad: "6 libras", costo: 900 },
  { fecha: "2026-06-15", proveedor: "Empaques del Cibao", item: "Cajas para bizcocho", cantidad: "50 uds.", costo: 2500 },
];

export const MERMAS: Merma[] = [
  { fecha: "2026-06-21", item: "Huevos", cantidad: "4 uds.", motivo: "Rotos al recibir" },
  { fecha: "2026-06-19", item: "Bizcocho de prueba", cantidad: "1 ud.", motivo: "Horneado fallido" },
  { fecha: "2026-06-17", item: "Crema de leche", cantidad: "1 taza", motivo: "Vencida" },
];

const DIA = 86400000;
export function estadoStock(item: ItemInventario): "bajo" | "ok" {
  return item.stock <= item.minimo ? "bajo" : "ok";
}
export function diasParaVencer(item: ItemInventario): number | null {
  if (!item.vencimiento) return null;
  const v = new Date(item.vencimiento).getTime();
  if (isNaN(v)) return null;
  return Math.round((v - Date.now()) / DIA);
}
export function porVencer(item: ItemInventario): boolean {
  const d = diasParaVencer(item);
  return d !== null && d <= 21;
}
