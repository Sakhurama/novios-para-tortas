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
// De ahí las cuatro primeras comprobaciones: que no queden URLs /_image, que
// todo /_astro referenciado exista de verdad como archivo, y que cada foto de
// src/assets tenga su variante optimizada.
//
// La quinta vigila la imagen de Open Graph, por otro fallo real: salió como
// JPEG progresivo y el enlace se compartía en WhatsApp sin vista previa. Nada
// en el sitio se veía roto —la imagen cargaba perfectamente en el navegador—,
// así que el único síntoma era que el negocio perdía las tarjetas al compartir.

import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative, basename, extname } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const assets = join(root, 'src/assets');

const SOURCE_IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif']);

// Imagen de Open Graph. El nombre lo produce scripts/generate-og.mjs.
const OG_IMAGE = 'og-2.jpg';
const OG_WIDTH = 1200;
const OG_HEIGHT = 630;
// Por encima de ~300 KB WhatsApp deja de generar la vista previa del enlace.
const OG_MAX_BYTES = 300 * 1024;

/**
 * Dimensiones y modo de codificación de un JPEG, leyendo sus marcadores.
 *
 * A mano y no con `sharp` a propósito: este script existe justamente para
 * detectar builds donde `sharp` no estaba disponible, así que importarlo aquí
 * lo haría reventar en el único escenario que tiene que diagnosticar.
 *
 * Recorre los segmentos hasta dar con el SOF, que es quien declara el tamaño y
 * el modo: 0xFFC0 es baseline y 0xFFC2 progresivo.
 *
 * @returns {{progressive: boolean, width: number, height: number} | null}
 */
function readJpegSof(buffer) {
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) return null;

  let i = 2;
  while (i + 8 < buffer.length) {
    if (buffer[i] !== 0xff) return null; // fuera de sincronía: JPEG corrupto
    const marker = buffer[i + 1];

    // Relleno, y marcadores sueltos que no llevan payload.
    if (marker === 0xff) {
      i++;
      continue;
    }
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      i += 2;
      continue;
    }
    // Fin de imagen o inicio del scan: ya no va a aparecer un SOF.
    if (marker === 0xd9 || marker === 0xda) return null;

    // SOFn es 0xC0-0xCF menos DHT (0xC4), JPG (0xC8) y DAC (0xCC), que caen en
    // ese rango sin ser marcadores de trama.
    if (
      marker >= 0xc0 &&
      marker <= 0xcf &&
      marker !== 0xc4 &&
      marker !== 0xc8 &&
      marker !== 0xcc
    ) {
      // Tras el marcador: longitud (2B) y precisión (1B), luego alto y ancho.
      return {
        progressive: marker === 0xc2,
        height: buffer.readUInt16BE(i + 5),
        width: buffer.readUInt16BE(i + 7),
      };
    }

    i += 2 + buffer.readUInt16BE(i + 2);
  }
  return null;
}

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
let ogRefs = 0;

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

  // El `"` de cierre tras og:image evita que cuele og:image:secure_url.
  const ogTag = new RegExp(`property="og:image"[^>]*/${OG_IMAGE.replace('.', '\\.')}"`);
  if (ogTag.test(html)) ogRefs++;
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

// 5. La imagen de Open Graph, que es lo que WhatsApp muestra al compartir el
//    enlace. Se valida entera porque cada requisito ya falló alguna vez o es
//    trivial de romper sin que nada más en el sitio se resienta.
const ogPath = join(dist, OG_IMAGE);
if (!existsSync(ogPath)) {
  errors.push(
    `Falta dist/${OG_IMAGE}. Es la imagen de las vistas previas al compartir; ` +
      'se genera con `npm run og` y se commitea en public/.'
  );
} else {
  const og = readFileSync(ogPath);

  if (og.length > OG_MAX_BYTES) {
    errors.push(
      `dist/${OG_IMAGE} pesa ${Math.round(og.length / 1024)} KB. Por encima de ` +
        `${OG_MAX_BYTES / 1024} KB WhatsApp deja de generar la vista previa.`
    );
  }

  const sof = readJpegSof(og);
  if (!sof) {
    errors.push(`dist/${OG_IMAGE} no es un JPEG legible: no se encontró su marcador SOF.`);
  } else {
    if (sof.progressive) {
      errors.push(
        `dist/${OG_IMAGE} es un JPEG progresivo. El scraper de Meta —el que alimenta las ` +
          'vistas previas de WhatsApp— falla con ellos y el enlace se comparte sin imagen. ' +
          'Suele ser por reactivar `mozjpeg: true` en scripts/generate-og.mjs, que fuerza ' +
          'el modo progresivo aunque se le pase `progressive: false`.'
      );
    }
    if (sof.width !== OG_WIDTH || sof.height !== OG_HEIGHT) {
      errors.push(
        `dist/${OG_IMAGE} mide ${sof.width}x${sof.height} y las etiquetas og:image:width/height ` +
          `declaran ${OG_WIDTH}x${OG_HEIGHT}. Si no coinciden, la tarjeta sale recortada.`
      );
    }
  }
}

if (pages.length > 0 && ogRefs !== pages.length) {
  errors.push(
    `Solo ${ogRefs} de ${pages.length} páginas declaran <meta property="og:image"> apuntando ` +
      `a /${OG_IMAGE}. Todas deben hacerlo: cualquiera puede acabar compartida.`
  );
}

if (errors.length > 0) {
  console.error('✗ Build no publicable:\n');
  for (const error of errors) console.error(`  · ${error}`);
  console.error('');
  process.exit(1);
}

console.log(
  `✓ Build verificado — ${pages.length} páginas, ${referenced.size} assets de /_astro/, ` +
    `${sources.length} fotos optimizadas, 0 URLs /_image, ` +
    `${OG_IMAGE} baseline ${OG_WIDTH}x${OG_HEIGHT} en las ${ogRefs} páginas.`
);
