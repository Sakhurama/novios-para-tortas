# Novios para Tortas

Sitio web de una sola página para un taller artesanal colombiano que fabrica a
mano las figuras de novios que coronan la torta de matrimonio.

Hecho con [Astro](https://astro.build) y [Tailwind CSS v4](https://tailwindcss.com).
Sin framework de UI, sin base de datos y sin formularios: todo el contacto va a
WhatsApp.

## Empezar

```sh
npm install
npm run dev      # http://localhost:4321
```

| Comando           | Qué hace                                                |
| ----------------- | ------------------------------------------------------- |
| `npm run dev`     | Servidor de desarrollo                                  |
| `npm run build`   | Compila a `dist/`                                       |
| `npm run preview` | Sirve `dist/` como en producción                        |
| `npm run og`      | Regenera `public/og.jpg`, la vista previa al compartir   |
| `npm run check`   | Verifica que `dist/` es publicable (va dentro del build) |

## Antes de publicar

Hay valores marcados con `⚠️ TODO` que deben reemplazarse por los reales:

| Qué                  | Dónde                                             |
| -------------------- | ------------------------------------------------- |
| Número de WhatsApp   | `src/config.ts` → `WHATSAPP_NUMBER`               |
| Ciudad del taller    | `src/config.ts` → `site.city`                     |
| Instagram y Facebook | `src/config.ts` → `site.instagram` / `.facebook`  |
| Precios "desde"      | `src/data/products.ts` → `priceFrom`              |
| Google Analytics     | `.env` → `PUBLIC_GA_ID` (ver `.env.example`)      |

Mientras estén sin poner, el sitio funciona igual: los precios no se pintan, las
redes no se declaran en los datos estructurados y la analítica no se inyecta.
Nada de esto rompe el build.

## Despliegue (Cloudflare Pages)

El sitio es estático: Cloudflare solo sirve los archivos de `dist/`. Ajustes del
proyecto en **Workers & Pages → Settings → Build**:

| Ajuste                          | Valor                  |
| ------------------------------- | ---------------------- |
| Build command                   | `npm ci && npm run build` |
| Build output directory          | `dist`                 |
| Variable `NODE_VERSION`         | `22.19.0` (igual que `.nvmrc`) |
| Variable `PUBLIC_GA_ID`         | el ID de GA4, si se quiere analítica |

**`npm ci` no es opcional.** Con `npm install`, npm puede saltarse las
dependencias opcionales por plataforma cuando el `package-lock.json` se generó
en otro sistema operativo. La que se salta aquí es `@img/sharp-linux-x64`, y sin
`sharp` Astro no puede generar los `.webp` durante el build: degrada las fotos a
URLs del endpoint `/_image`, que en un hosting estático devuelve 404. Fue
exactamente lo que rompió el primer despliegue: la página se veía entera pero sin
una sola foto. `npm ci` obliga a respetar el lockfile y a instalar las mismas
versiones que en local.

Como segunda red, `npm run build` termina ejecutando `scripts/check-build.mjs`,
que comprueba que no queda ninguna URL `/_image`, que todo lo referenciado en
`/_astro/` existe de verdad y que cada foto de `src/assets/` tiene su variante
optimizada. Si algo de eso falla, el build falla y Cloudflare no publica.

## Estructura

```
src/
├─ pages/       index.astro (la landing) y 404.astro
├─ layouts/     Layout.astro — <head>, metadatos, Open Graph y JSON-LD
├─ components/  una sección por archivo (Hero, Catalog, Gallery, Faq…)
├─ data/        faqs.ts y products.ts — contenido que leen a la vez la sección
│               visible y los datos estructurados del Layout
├─ scripts/     carousel.ts, lightbox.ts, reveal.ts, analytics.ts
├─ styles/      global.css — tokens de marca en @theme
├─ assets/      fotos procesadas por astro:assets (hero, galería, catálogo)
└─ config.ts    datos de la marca, navegación, textos alternativos, waLink()

public/         iconos, logos, og.jpg, robots.txt, site.webmanifest y _headers
scripts/        generate-og.mjs — compone la imagen para compartir
                check-build.mjs — valida dist/ al terminar el build
```

### Añadir fotos

El hero y la galería se llenan solos: basta con soltar los archivos en
`src/assets/hero/` o `src/assets/galeria/`. Se ordenan por nombre, así que se
usa un prefijo numérico (`05-si-acepta.jpg`) para fijar el orden.

Lo único que hay que registrar a mano es el texto alternativo, en
`heroImageAlts` / `galleryImageAlts` de `src/config.ts`. Sin entrada la foto
sigue apareciendo, pero con una descripción genérica.

### Movimiento y accesibilidad

Las secciones aparecen al asomarse en pantalla (`reveal.ts` + `global.css`).
Todo el movimiento cuelga de `prefers-reduced-motion`, los carruseles tienen
botón de pausa y la galería se puede recorrer con teclado. Si el JS fallara, una
animación de respaldo muestra el contenido a los 2,5 s: nada queda invisible.
