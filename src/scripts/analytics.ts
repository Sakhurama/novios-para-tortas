// Medición de la única conversión que tiene el sitio: abrir WhatsApp.
//
// Un solo listener delegado en `document` en vez de tocar los ocho y pico CTAs
// repartidos por la página. Los enlaces que se añadan después quedan medidos
// solos, sin acordarse de nada.
//
// No hace falta comprobar si GA está cargado más allá de `typeof gtag`: si el
// ID no está configurado, `Analytics.astro` no inyecta nada y esto no hace más
// que un par de comprobaciones baratas por clic.

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * De dónde salió el clic. Sirve para saber qué sección convierte: el hero, el
 * catálogo, el cierre… o el botón flotante, que no vive dentro de ninguna.
 */
function origen(link: HTMLAnchorElement): string {
  if (link.closest('[data-wa-fab]')) return 'boton-flotante';
  if (link.closest('header')) return 'navbar';
  if (link.closest('footer')) return 'footer';
  return link.closest('section[id]')?.id ?? 'desconocido';
}

export function initWhatsAppTracking() {
  document.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const link = target.closest<HTMLAnchorElement>('a[href*="wa.me"]');
    if (!link) return;

    window.gtag?.('event', 'click_whatsapp', { origen: origen(link) });
  });
}
