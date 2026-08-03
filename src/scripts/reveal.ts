// Aparición suave de las secciones al asomarse en pantalla.
//
// Un único observador para toda la web: los componentes solo marcan el HTML y
// no hay un <script> por componente que mantener.
//
//   data-reveal        el elemento entra por sí mismo
//   data-reveal-group  entran sus hijos directos, escalonados
//
// El estado oculto lo pone global.css y solo bajo <html class="js-anim">, que
// añade el script en línea del Layout: sin JS no se esconde nada.
//
// Invariante: ningún grupo contiene otro objetivo dentro. Cada sección es
// «SectionTitle + bloque de contenido» como hermanos, nunca anidados; si se
// anidaran, el hijo heredaría el --reveal-i del padre y entraría con un
// retardo que no le corresponde.

// Más de 6 pasos y el último hermano llega tan tarde que el grupo deja de
// leerse como un solo gesto. A partir de ahí todos comparten retardo.
const MAX_STEPS = 6;

export function initReveal() {
  const targets = Array.from(
    document.querySelectorAll<HTMLElement>('[data-reveal], [data-reveal-group]')
  );

  // A partir de aquí manda el JS: desactiva el rescate por tiempo del CSS.
  document.documentElement.classList.add('reveal-ready');
  if (targets.length === 0) return;

  const reveal = (el: Element) => el.classList.add('is-in');

  // El índice se calcula aquí y no en cada componente: así montar un grupo es
  // un atributo, y no un style en línea repetido dentro de cada .map().
  targets.forEach((el) => {
    if (!el.hasAttribute('data-reveal-group')) return;
    Array.from(el.children).forEach((child, i) => {
      (child as HTMLElement).style.setProperty('--reveal-i', String(Math.min(i, MAX_STEPS)));
    });
  });

  // Sin IntersectionObserver se muestra todo de una vez: mejor sin animación
  // que con contenido escondido.
  if (!('IntersectionObserver' in window)) {
    targets.forEach(reveal);
    return;
  }

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  // Si el ajuste se desactiva con la página ya abierta, el CSS empezaría a
  // esconder lo que nunca llegó a marcarse: se descubre todo y listo.
  reduced.addEventListener('change', () => {
    if (!reduced.matches) targets.forEach(reveal);
  });

  // Con movimiento reducido el CSS ni siquiera esconde: no hay nada que
  // orquestar y se ahorra el observador entero.
  if (reduced.matches) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        reveal(entry.target);
        // Una sola vez: volver a animar al subir es lo que hace que una web
        // parezca un muestrario de efectos en vez de una web.
        observer.unobserve(entry.target);
      });
    },
    // El margen inferior negativo espera a que el elemento esté de verdad
    // dentro y no rozando el borde de la pantalla. Lo que ya está visible al
    // cargar dispara igualmente en la primera comprobación del observador.
    { rootMargin: '0px 0px -10% 0px', threshold: 0 }
  );

  targets.forEach((el) => observer.observe(el));
}
