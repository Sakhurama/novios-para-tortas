// Visor ampliado de la galería.
//
// Sobre <dialog> nativo y sin librerías: el navegador ya se encarga de lo
// difícil —capa superior, atrapar el foco dentro, cerrar con Esc, inertizar el
// resto de la página— que es justo donde fallan los lightbox hechos a mano.
//
// El marcado que espera (ver Gallery.astro):
//   [data-lightbox-open]     un botón por miniatura, en el mismo orden
//   [data-lightbox]          el <dialog>
//   [data-lightbox-slide]    una imagen grande por foto, en el mismo orden
//   [data-lightbox-stage]    el contenedor de las imágenes
//   [data-lightbox-prev/next/close]  controles
//   [data-lightbox-counter]  "3 / 7"
//   [data-lightbox-cta]      enlace de WhatsApp; se reapunta a cada foto
//
// El texto del mensaje no vive aquí: cada [data-lightbox-slide] trae el enlace
// ya montado en su `data-wa` (ver Gallery.astro y galleryMessage() en
// config.ts). Este script solo copia el de la foto activa, así que se puede
// cambiar lo que dice el chat sin tocar una línea de JavaScript.

export function initLightbox(rootSelector: string) {
  const root = document.querySelector<HTMLElement>(rootSelector);
  if (!root) return;

  const dialog = root.querySelector<HTMLDialogElement>('[data-lightbox]');
  const openers = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-lightbox-open]'));
  const slides = Array.from(root.querySelectorAll<HTMLElement>('[data-lightbox-slide]'));
  const counter = root.querySelector<HTMLElement>('[data-lightbox-counter]');
  const cta = root.querySelector<HTMLAnchorElement>('[data-lightbox-cta]');

  // Sin <dialog> el navegador no ejecuta showModal: mejor dejar las miniaturas
  // como están que dar un botón que no hace nada.
  if (!dialog || typeof dialog.showModal !== 'function' || slides.length === 0) return;

  let index = 0;
  // A quién le devolvemos el foco al cerrar. Sin esto, el tabulador vuelve al
  // principio de la página y se pierde el sitio donde se estaba mirando.
  let lastOpener: HTMLElement | null = null;

  function show(i: number) {
    index = (i + slides.length) % slides.length;
    slides.forEach((slide, n) => slide.classList.toggle('is-active', n === index));
    if (counter) counter.textContent = `${index + 1} / ${slides.length}`;

    // El CTA tiene que hablar de la foto que se está viendo, no de la que se
    // abrió. Si la diapositiva no trajera enlace, se deja el que ya tenía
    // puesto el servidor antes que dejar un botón que no lleva a ningún sitio.
    const wa = slides[index].dataset.wa;
    if (cta && wa) cta.href = wa;
  }

  openers.forEach((button, i) => {
    button.addEventListener('click', () => {
      lastOpener = button;
      show(i);
      dialog.showModal();
      // showModal no bloquea el scroll de la página por debajo.
      document.documentElement.style.overflow = 'hidden';
    });
  });

  dialog.addEventListener('close', () => {
    document.documentElement.style.overflow = '';
    lastOpener?.focus();
  });

  root.querySelector('[data-lightbox-close]')?.addEventListener('click', () => dialog.close());
  root.querySelector('[data-lightbox-prev]')?.addEventListener('click', () => show(index - 1));
  root.querySelector('[data-lightbox-next]')?.addEventListener('click', () => show(index + 1));

  // Clic fuera de la foto y de los controles = cerrar. Se comprueba contra el
  // contenido y no contra `event.target === dialog`, porque el <dialog> está
  // relleno de envoltorios y ese truco solo funciona si no los hay.
  dialog.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (target.closest('[data-lightbox-stage], button')) return;
    dialog.close();
  });

  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      show(index + 1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      show(index - 1);
    }
  });
}
