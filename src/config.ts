// ------------------------------------------------------------------
//  Configuración central de la marca — Novios para Tortas
//  Reemplaza los valores placeholder por los datos reales.
// ------------------------------------------------------------------

/** Datos de la marca / negocio */
export const site = {
  name: "Novios para Tortas",
  tagline: "Decoraciones hechas a mano para la torta de tus sueños",
  yearsInMarket: 20,
  city: "Colombia",
  email: "hola@noviosparatortas.com", // placeholder
  instagram: "https://instagram.com/", // placeholder
  facebook: "https://facebook.com/", // placeholder
} as const;

/**
 * Número de WhatsApp en formato internacional SIN "+", espacios ni guiones.
 * Ejemplo Colombia: 57 + número → "573001234567"
 * ⚠️ PLACEHOLDER: reemplázalo por el número real.
 */
export const WHATSAPP_NUMBER = "573000000000";

/** Mensaje por defecto al abrir el chat */
export const WHATSAPP_DEFAULT_MESSAGE =
  "¡Hola! Vengo desde la página web y quiero cotizar unos novios para mi torta 💍";

/**
 * Construye un enlace de WhatsApp (wa.me) con un mensaje predefinido.
 * @param message Texto que aparecerá escrito en el chat del cliente.
 */
export function waLink(message: string = WHATSAPP_DEFAULT_MESSAGE): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
