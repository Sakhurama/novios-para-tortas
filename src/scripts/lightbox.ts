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

export function initLightbox(rootSelector: string) {
  const root = document.querySelector<HTMLElement>(rootSelector);
  if (!root) return;

  const dialog = root.querySelector<HTMLDialogElement>('[data-lightbox]');
  const openers = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-lightbox-open]'));
  const slides = Array.from(root.querySelectorAll<HTMLElement>('[data-lightbox-slide]'));
  const counter = root.querySelector<HTMLElement>('[data-lightbox-counter]');

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
