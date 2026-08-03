// Lógica común de los carruseles de la web (fotos del hero y testimonios).
//
// El desplazamiento lo hace el navegador con scroll-snap: aquí solo se añaden
// las flechas, los puntos y el autoplay, que se pausa solo cuando alguien está
// mirando o navegando. Sin scroll-snap seguiría siendo usable a dedo.
//
// El marcado que espera cada raíz:
//   [data-track]  contenedor con overflow-x y scroll-snap
//   [data-slide]  cada diapositiva, del ancho del track
//   [data-prev] / [data-next] / [data-dot]  controles (opcionales)
//   [data-play-toggle]  botón de pausa/reanudar (opcional), con dos iconos
//                       hijos marcados .icon-pause y .icon-play

interface CarouselOptions {
  autoplayMs?: number;
}

export function initCarousels(rootSelector: string, { autoplayMs = 5000 }: CarouselOptions = {}) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  // Se monta por instancia (no por id) para que el componente pueda repetirse.
  document.querySelectorAll<HTMLElement>(rootSelector).forEach((root) => {
    const track = root.querySelector<HTMLElement>('[data-track]');
    if (!track) return;

    const slides = Array.from(track.querySelectorAll<HTMLElement>('[data-slide]'));
    const dots = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-dot]'));
    if (slides.length < 2) return;

    let index = 0;
    let timer: number | undefined;
    let hovering = false;
    let focused = false;
    // Pausa pedida a mano. Va aparte de `hovering`/`focused` porque esas son
    // pausas temporales: al quitar el ratón el autoplay vuelve. Esta no vuelve
    // hasta que se pulse otra vez.
    let userPaused = false;

    function markActive(i: number) {
      index = i;
      dots.forEach((dot, n) => {
        if (n === i) dot.setAttribute('aria-current', 'true');
        else dot.removeAttribute('aria-current');
      });
    }

    function goTo(i: number) {
      const next = (i + slides.length) % slides.length;
      track!.scrollTo({
        left: next * track!.clientWidth,
        behavior: reduced.matches ? 'auto' : 'smooth',
      });
      markActive(next);
    }

    // El punto activo se deriva del scroll real: tras un swipe manual, el
    // índice interno no basta para saber qué slide se está viendo.
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) markActive(slides.indexOf(entry.target as HTMLElement));
        });
      },
      { root: track, threshold: 0.6 }
    );
    slides.forEach((slide) => observer.observe(slide));

    function stop() {
      if (timer !== undefined) {
        clearInterval(timer);
        timer = undefined;
      }
    }

    function start() {
      stop();
      if (reduced.matches || userPaused || hovering || focused || document.hidden) return;
      timer = window.setInterval(() => goTo(index + 1), autoplayMs);
    }

    // WCAG 2.2.2: cualquier movimiento automático de más de 5s necesita un
    // control explícito para detenerlo. Pausar al pasar el ratón no basta —
    // en táctil no hay ratón, y con teclado el foco puede estar en otro sitio.
    const playToggle = root.querySelector<HTMLButtonElement>('[data-play-toggle]');

    function syncToggle() {
      if (!playToggle) return;
      playToggle.setAttribute('aria-pressed', String(userPaused));
      playToggle.setAttribute(
        'aria-label',
        userPaused ? 'Reanudar el paso automático' : 'Pausar el paso automático'
      );
      playToggle.querySelector('.icon-pause')?.classList.toggle('hidden', userPaused);
      playToggle.querySelector('.icon-play')?.classList.toggle('hidden', !userPaused);
    }

    playToggle?.addEventListener('click', () => {
      userPaused = !userPaused;
      syncToggle();
      if (userPaused) stop();
      else start();
    });

    syncToggle();

    root.querySelector('[data-prev]')?.addEventListener('click', () => goTo(index - 1));
    root.querySelector('[data-next]')?.addEventListener('click', () => goTo(index + 1));
    dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));

    // Pausa mientras alguien está mirando o navegando el carrusel.
    // Solo en dispositivos con hover real: en táctil, `pointerenter` dispara al
    // tocar y `pointerleave` puede no llegar nunca, dejando el autoplay muerto.
    if (window.matchMedia('(hover: hover)').matches) {
      root.addEventListener('pointerenter', () => {
        hovering = true;
        stop();
      });
      root.addEventListener('pointerleave', () => {
        hovering = false;
        start();
      });
    }

    root.addEventListener('focusin', () => {
      focused = true;
      stop();
    });
    root.addEventListener('focusout', (e) => {
      if (root.contains(e.relatedTarget as Node)) return;
      focused = false;
      start();
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stop();
      else start();
    });

    reduced.addEventListener('change', start);

    // Al cambiar el ancho, el offset guardado deja de ser válido
    window.addEventListener('resize', () => {
      track.scrollTo({ left: index * track.clientWidth, behavior: 'auto' });
    });

    start();
  });
}
