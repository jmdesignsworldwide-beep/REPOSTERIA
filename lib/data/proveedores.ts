export type EstadoOrden = "pendiente" | "recibida" | "cancelada";

export interface OrdenCompra {
  id: string;
  fecha: string;
  descripcion: string;
  monto: number;
  estado: EstadoOrden;
}

export interface CompraProv {
  fecha: string;
  item: string;
  monto: number;
}

export interface Proveedor {
  id: string;
  nombre: string;
  contacto: string;
  telefono: string;
  categoria: "Ingredientes" | "Empaques" | "Decoración";
  pagos: "al_dia" | "pendiente";
  balancePendiente: number;
  compras: CompraProv[];
  ordenes: OrdenCompra[];
}

export const PROVEEDORES: Proveedor[] = [
  {
    id: "pv-famosa",
    nombre: "Distribuidora La Famosa",
    contacto: "Ana Beltré",
    telefono: "809-540-1122",
    categoria: "Ingredientes",
    pagos: "al_dia",
    balancePendiente: 0,
    compras: [
      { fecha: "2026-06-20", item: "Harina (5 sacos)", monto: 4500 },
      { fecha: "2026-06-12", item: "Leche evaporada (24 latas)", monto: 1800 },
    ],
    ordenes: [
      { id: "oc-101", fecha: "2026-06-22", descripcion: "Harina + azúcar", monto: 6200, estado: "pendiente" },
    ],
  },
  {
    id: "pv-nacional",
    nombre: "Supermercado Nacional",
    contacto: "Departamento de ventas",
    telefono: "809-565-7777",
    categoria: "Ingredientes",
    pagos: "pendiente",
    balancePendiente: 3200,
    compras: [
      { fecha: "2026-06-18", item: "Mantequilla (6 lb)", monto: 900 },
      { fecha: "2026-06-10", item: "Azúcar (3 sacos)", monto: 2700 },
    ],
    ordenes: [
      { id: "oc-102", fecha: "2026-06-19", descripcion: "Mantequilla y crema", monto: 3200, estado: "recibida" },
    ],
  },
  {
    id: "pv-cocos",
    nombre: "Granja Los Cocos",
    contacto: "Ramón Tavárez",
    telefono: "829-330-4456",
    categoria: "Ingredientes",
    pagos: "al_dia",
    balancePendiente: 0,
    compras: [
      { fecha: "2026-06-19", item: "Huevos (10 cartones)", monto: 3600 },
      { fecha: "2026-06-13", item: "Huevos (8 cartones)", monto: 2880 },
    ],
    ordenes: [
      { id: "oc-103", fecha: "2026-06-21", descripcion: "Huevos (12 cartones)", monto: 4320, estado: "pendiente" },
    ],
  },
  {
    id: "pv-cibao",
    nombre: "Empaques del Cibao",
    contacto: "Wilkin Reyes",
    telefono: "849-260-9988",
    categoria: "Empaques",
    pagos: "pendiente",
    balancePendiente: 1500,
    compras: [
      { fecha: "2026-06-15", item: "Cajas para bizcocho (50)", monto: 2500 },
      { fecha: "2026-06-05", item: "Capacillos (20 paq.)", monto: 1200 },
    ],
    ordenes: [
      { id: "oc-104", fecha: "2026-06-20", descripcion: "Cajas + capacillos", monto: 1500, estado: "pendiente" },
    ],
  },
  {
    id: "pv-repdom",
    nombre: "Repostería Dominicana SRL",
    contacto: "Mariela Santos",
    telefono: "809-412-3030",
    categoria: "Decoración",
    pagos: "al_dia",
    balancePendiente: 0,
    compras: [
      { fecha: "2026-06-14", item: "Perlas comestibles (6 frascos)", monto: 1080 },
      { fecha: "2026-06-08", item: "Colorante vegetal (10)", monto: 850 },
    ],
    ordenes: [
      { id: "oc-105", fecha: "2026-06-17", descripcion: "Decoración variada", monto: 1930, estado: "recibida" },
    ],
  },
];

// Comparación de precios del mismo insumo entre proveedores.
export const COMPARATIVA: { producto: string; opciones: { proveedor: string; precio: number }[] }[] = [
  {
    producto: "Harina (saco)",
    opciones: [
      { proveedor: "Distribuidora La Famosa", precio: 900 },
      { proveedor: "Supermercado Nacional", precio: 980 },
      { proveedor: "Mercado Modelo", precio: 870 },
    ],
  },
  {
    producto: "Huevos (cartón)",
    opciones: [
      { proveedor: "Granja Los Cocos", precio: 360 },
      { proveedor: "Supermercado Nacional", precio: 395 },
    ],
  },
  {
    producto: "Mantequilla (libra)",
    opciones: [
      { proveedor: "Supermercado Nacional", precio: 150 },
      { proveedor: "Distribuidora La Famosa", precio: 140 },
    ],
  },
];
