// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // Dominio de producción. De aquí salen el canonical, el sitemap y las URLs
  // absolutas de Open Graph (WhatsApp y Facebook ignoran las relativas, así que
  // sin esto no hay vista previa al compartir el enlace).
  site: 'https://noviosparatortas.com',

  // El sitio es 100% estático y se sirve como archivos sueltos en Cloudflare
  // Pages. Explícito y no por defecto: si algún día un preset o una versión
  // nueva de Astro cambiara el modo, las fotos volverían a pedirse al endpoint
  // /_image, que en un hosting estático no existe y devuelve 404.
  output: 'static',

  image: {
    // Servicio de imagen declarado a mano por la misma razón: obliga a que las
    // variantes .webp se generen durante el build. Ver scripts/check-build.mjs,
    // que comprueba el resultado antes de dar el build por bueno.
    service: { entrypoint: 'astro/assets/services/sharp' }
  },

  integrations: [sitemap()],

  vite: {
    plugins: [tailwindcss()]
  }
});
