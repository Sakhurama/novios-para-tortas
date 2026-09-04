// Comprueba que el build de dist/ es realmente estático y publicable.
//
// Se ejecuta encadenado a `npm run build`, así que un build degradado rompe el
// despliegue en vez de publicarse con las fotos rotas.
//
// El motivo es un fallo real en producción: Cloudflare compiló sin `sharp`
// disponible y Astro, en vez de fallar, degradó las 21 fotos a URLs del
// endpoint de optimización bajo demanda —/_image?href=…&f=webp—. Ese endpoint
// solo existe si hay un servidor detrás; en un hosting estático devuelve 404.
// El build "pasó", se desplegó, y el sitio salió sin una sola foto.
//
// De ahí las cuatro comprobaciones: que no queden URLs /_image, que todo
// /_astro referenciado exista de verdad como archivo, y que cada foto de
// src/assets tenga su variante optimizada.

import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative, basename, extname } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const assets = join(root, 'src/assets');

const SOURCE_IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif']);

/** Todos los archivos bajo `dir` que cumplan `keep`, recursivamente. */
function walk(dir, keep) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return walk(full, keep);
    return keep(full) ? [full] : [];
  });
}

const errors = [];

if (!existsSync(dist) || !statSync(dist).isDirectory()) {
  console.error('✗ No existe dist/. ¿Se ejecutó `astro build`?');
  process.exit(1);
}

const pages = walk(dist, (f) => f.endsWith('.html'));
if (pages.length === 0) {
  errors.push('dist/ no contiene ninguna página .html.');
}

// Las URLs de /_astro/ no llevan query string, así que basta con cortar en el
// primer carácter que no puede formar parte de la ruta.
const ASTRO_URL = /\/_astro\/[^"'\s,)>]+/g;

const referenced = new Set();
let webpRefs = 0;

for (const page of pages) {
  const html = readFileSync(page, 'utf8');
  const where = relative(root, page);

  // 1. El síntoma exacto del fallo de producción.
  const onDemand = html.match(/\/_image\?/g);
  if (onDemand) {
    errors.push(
      `${where}: ${onDemand.length} imágenes apuntan al endpoint /_image en vez de estar ` +
        'pre-generadas. El build no pudo optimizarlas (normalmente porque `sharp` no está ' +
        'instalado en el entorno) y en un hosting estático esas URLs dan 404.'
    );
  }

  for (const url of html.matchAll(ASTRO_URL)) {
    const path = url[0];
    referenced.add(path);
    if (path.endsWith('.webp')) webpRefs++;
  }
}

// 2. Nada referenciado puede faltar en el disco.
for (const path of referenced) {
  if (!existsSync(join(dist, path.slice(1)))) {
    errors.push(`Referenciado pero ausente de dist/: ${path}`);
  }
}

// 3. Cada foto de src/assets debe tener al menos una variante generada. Astro
//    conserva el nombre base: 01-clasicos.jpg → 01-clasicos.<hash>_<hash>.webp
const sources = walk(assets, (f) => SOURCE_IMAGE_EXT.has(extname(f).toLowerCase()));
const generated = walk(join(dist, '_astro'), (f) => f.endsWith('.webp')).map((f) => basename(f));

for (const source of sources) {
  const stem = basename(source, extname(source));
  if (!generated.some((g) => g.startsWith(`${stem}.`))) {
    errors.push(`Sin variante optimizada en dist/_astro/: ${relative(root, source)}`);
  }
}

// 4. Red de seguridad por si el sitio se quedara sin ninguna imagen procesada.
if (sources.length > 0 && webpRefs === 0) {
  errors.push('Ninguna página referencia un .webp de /_astro/, habiendo fotos en src/assets/.');
}

if (errors.length > 0) {
  console.error('✗ Build no publicable:\n');
  for (const error of errors) console.error(`  · ${error}`);
  console.error('');
  process.exit(1);
}

console.log(
  `✓ Build verificado — ${pages.length} páginas, ${referenced.size} assets de /_astro/, ` +
    `${sources.length} fotos optimizadas, 0 URLs /_image.`
);
