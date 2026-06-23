import { fmtRD } from "@/lib/data/mock";
import { abonadoDe, balanceDe, estadoMeta, type Pedido } from "./types";

/**
 * Normaliza un teléfono dominicano a formato internacional para wa.me:
 * limpia espacios/guiones/paréntesis y antepone el código de país 1.
 * RD usa 10 dígitos (809/829/849 + 7). Devuelve null si no es válido.
 */
export function telefonoWhatsApp(tel: string | null | undefined): string | null {
  if (!tel) return null;
  const d = tel.replace(/\D/g, "");
  if (d.length === 10) return `1${d}`;
  if (d.length === 11 && d.startsWith("1")) return d;
  return null;
}

/** Mensaje cálido y profesional con el resumen del pedido. */
export function mensajePedido(p: Pedido): string {
  const nombre = p.cliente?.nombre ?? "";
  const lineas = p.items
    .map((i) => {
      const extra = [i.sabor, i.tamano].filter(Boolean).join(" · ");
      return `• ${i.cantidad}× ${i.producto}${extra ? ` (${extra})` : ""}`;
    })
    .join("\n");
  const abonado = abonadoDe(p);
  const balance = balanceDe(p);
  const entrega = `${p.fecha_entrega}${p.hora_entrega ? ` · ${p.hora_entrega}` : ""}`;

  return [
    `Hola ${nombre} 👋`,
    `Tu pedido en Azúcar & Canela (#${p.numero}):`,
    lineas,
    "",
    `Total: ${fmtRD(p.total)}`,
    `Abonado: ${fmtRD(abonado)}`,
    `Balance: ${fmtRD(balance)}`,
    `Entrega: ${entrega}`,
    `Estado: ${estadoMeta(p.estado).label}`,
    "",
    "¡Gracias por preferirnos! 🍮",
  ].join("\n");
}

/** Link wa.me listo para abrir, o null si el cliente no tiene teléfono válido. */
export function linkWhatsAppPedido(p: Pedido): string | null {
  const tel = telefonoWhatsApp(p.cliente?.telefono);
  if (!tel) return null;
  return `https://wa.me/${tel}?text=${encodeURIComponent(mensajePedido(p))}`;
}
