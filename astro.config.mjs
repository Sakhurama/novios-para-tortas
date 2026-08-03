// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // ⚠️ TODO: dominio real donde se publique el sitio.
  // De aquí salen el canonical, el sitemap y las URLs absolutas de Open Graph
  // (WhatsApp y Facebook ignoran las relativas, así que sin esto no hay
  // vista previa al compartir el enlace).
  site: 'https://noviosparatortas.com',

  integrations: [sitemap()],

  vite: {
    plugins: [tailwindcss()]
  }
});
