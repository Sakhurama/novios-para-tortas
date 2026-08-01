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
 * Carrusel del Hero.
 * Las fotos se sueltan en `src/assets/hero/` y aparecen solas, ordenadas por
 * nombre de archivo. No hay que registrarlas aquí.
 *
 * Este mapa es solo para el texto alternativo: la clave es el nombre del
 * archivo tal cual. Lo que no esté listado usa HERO_ALT_FALLBACK.
 */
export const heroImageAlts: Record<string, string> = {
  // 'novios-clasicos.jpg': 'Figura de novios clásicos sobre una torta blanca',
};

export const HERO_ALT_FALLBACK =
  "Figuras artesanales de novios sobre una torta de matrimonio";

/** Slides punteados que se muestran mientras no haya fotos reales. */
export const HERO_PLACEHOLDER_SLIDES = 3;

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
