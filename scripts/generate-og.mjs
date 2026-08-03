// Genera la imagen de Open Graph (public/og.jpg) que WhatsApp, Facebook y X
// muestran al compartir el enlace.
//
// Se ejecuta a mano —`node scripts/generate-og.mjs`— y el resultado se
// commitea. No va en el build: la imagen solo cambia cuando cambia la marca, y
// así la URL es estable y no cuesta nada en cada despliegue.
//
// Por qué se compone en vez de recortar una foto: todas las fotos del sitio son
// verticales (820x1024) y el formato de Open Graph es 1200x630, casi 2:1.
// Recortar una figura vertical a ese lienzo se come la mitad del muñeco.
// Aquí la foto se queda en un panel vertical a la derecha y el resto es marca.
//
// sharp entra con Astro, no es una dependencia nueva.

import sharp from 'sharp';
import { statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const W = 1200;
const H = 630;

// Tokens de src/styles/global.css
const BRAND = '#490a41';
const ACCENT = '#dd2530';

// Panel de la foto, pegado al borde derecho.
const PHOTO_W = 520;
const STRIPE_W = 6; // filete rojo que separa foto y fondo
const PHOTO_X = W - PHOTO_W;

// Bloque de marca, centrado verticalmente en la mitad izquierda.
const PAD_X = 78;
const LOGO_W = 380;
const LOGO_H = Math.round((226 / 592) * LOGO_W); // proporción real del logo

const HEADLINE = ['El detalle que corona', 'el amor de tu boda'];
const KICKER = 'Hecho a mano · 20 años · Envíos a toda Colombia';

const HEADLINE_SIZE = 52;
const HEADLINE_LEAD = 64;
const KICKER_SIZE = 22;

const blockH = LOGO_H + 46 + HEADLINE.length * HEADLINE_LEAD + 30 + KICKER_SIZE;
const blockY = Math.round((H - blockH) / 2);

const headlineTop = blockY + LOGO_H + 46;
const kickerY = headlineTop + HEADLINE.length * HEADLINE_LEAD + 30;

// Georgia como serif: el sitio usa Cormorant Garamond, pero una fuente web no
// está instalada en el sistema y sharp renderiza el SVG con las fuentes locales.
// Georgia es la serif de sistema que más se le acerca.
const SERIF = "Georgia, 'Times New Roman', serif";
const SANS = "'Segoe UI', Tahoma, sans-serif";

const heartPath =
  'M12 21s-6.716-4.35-9.428-8.06C.86 10.29 1.32 6.9 3.9 5.35c2.02-1.21 4.51-.62 5.86 1.02L12 8.6l2.24-2.23c1.35-1.64 3.84-2.23 5.86-1.02 2.58 1.55 3.04 4.94 1.33 7.59C18.716 16.65 12 21 12 21z';

const overlay = `
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <!-- Corazones de marca al fondo, como en el hero -->
  <g fill="#ffffff" opacity="0.05">
    <g transform="translate(${PAD_X - 30}, ${H - 150}) scale(5)"><path d="${heartPath}"/></g>
    <g transform="translate(${PHOTO_X - 190}, 54) scale(3.4)"><path d="${heartPath}"/></g>
  </g>

  ${HEADLINE.map(
    (line, i) => `
  <text x="${PAD_X}" y="${headlineTop + i * HEADLINE_LEAD}"
        font-family="${SERIF}" font-size="${HEADLINE_SIZE}" font-weight="600"
        fill="#ffffff" dominant-baseline="hanging">${line}</text>`
  ).join('')}

  <g transform="translate(${PAD_X}, ${kickerY - 4})">
    <g fill="${ACCENT}" transform="scale(0.85)"><path d="${heartPath}"/></g>
  </g>
  <text x="${PAD_X + 32}" y="${kickerY}"
        font-family="${SANS}" font-size="${KICKER_SIZE}" font-weight="500"
        fill="#ffffff" opacity="0.75" dominant-baseline="hanging"
        letter-spacing="0.4">${KICKER}</text>
</svg>`;

const photo = await sharp(join(root, 'src/assets/hero/01-clasicos.jpg'))
  .resize(PHOTO_W, H, { fit: 'cover', position: 'centre' })
  .toBuffer();

const logo = await sharp(join(root, 'public/logo-blanco.png'))
  .resize(LOGO_W, LOGO_H, { fit: 'inside' })
  .toBuffer();

await sharp({
  create: { width: W, height: H, channels: 3, background: BRAND },
})
  .composite([
    { input: photo, left: PHOTO_X, top: 0 },
    {
      input: {
        create: { width: STRIPE_W, height: H, channels: 3, background: ACCENT },
      },
      left: PHOTO_X - STRIPE_W,
      top: 0,
    },
    { input: logo, left: PAD_X, top: blockY },
    { input: Buffer.from(overlay), left: 0, top: 0 },
  ])
  .jpeg({ quality: 86, mozjpeg: true })
  .toFile(join(root, 'public/og.jpg'));

// WhatsApp deja de generar la vista previa por encima de ~300 KB.
const { size } = statSync(join(root, 'public/og.jpg'));
console.log(`public/og.jpg — ${W}x${H}, ${Math.round(size / 1024)} KB`);
