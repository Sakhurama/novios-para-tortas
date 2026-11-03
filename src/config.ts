// ------------------------------------------------------------------
//  Configuración central de la marca — Novios para Tortas
//  Reemplaza los valores placeholder por los datos reales.
// ------------------------------------------------------------------

/**
 * Año en que Amparo empezó a modelar porcelanicrón.
 *
 * Se guarda el año y no la cifra de años a propósito: "20" es un dato que
 * caduca en silencio —el 1 de enero que viene deja de ser verdad y nadie se
 * entera—, mientras que 2006 es un hecho. De aquí salen tanto los "20 años"
 * que se leen en la web como el foundingDate del esquema.
 */
export const FOUNDED_YEAR = 2006;

/** Datos de la marca / negocio */
export const site = {
  name: "Novios para Tortas",
  tagline: "Ustedes dos, en miniatura, encima de la torta",
  foundedYear: FOUNDED_YEAR,
  yearsInMarket: new Date().getFullYear() - FOUNDED_YEAR,
  // Ciudad base del taller. Alimenta el Hero, el footer y el schema de dirección
  // (addressLocality) del Layout: es una de las señales que le dicen a Google que
  // el negocio es de Colombia, no de otro país hispanohablante.
  city: "Bucaramanga",
  region: "Santander", // departamento — va en addressRegion del schema
  regionCode: "CO-SAN", // ISO 3166-2, para el meta geo.region
  instagram: "https://www.instagram.com/noviosparatortas",
  facebook: "https://www.facebook.com/Noviosenporcelanicron.com.co",
} as const;

/**
 * Navegación del sitio. Fuente única para el navbar y el footer: antes estaba
 * duplicada en ambos y se desincronizó (el footer decía "Preguntas frecuentes"
 * y el navbar "Preguntas", y los dos apuntaban a una sección ya retirada).
 *
 * `labelLong` es el texto del footer, donde cabe más; si no está, se usa `label`.
 */
export const navLinks = [
  { href: "#catalogo", label: "Catálogo" },
  { href: "#historia", label: "Nuestra historia" },
  { href: "#galeria", label: "Galería" },
  { href: "#faq", label: "Preguntas", labelLong: "Preguntas frecuentes" },
] as const satisfies ReadonlyArray<{
  href: string;
  label: string;
  labelLong?: string;
}>;

/**
 * Carrusel del Hero.
 * Las fotos se sueltan en `src/assets/hero/` y aparecen solas, ordenadas por
 * nombre de archivo. No hay que registrarlas aquí.
 *
 * Este mapa es solo para el texto alternativo: la clave es el nombre del
 * archivo tal cual. Lo que no esté listado usa HERO_ALT_FALLBACK.
 */
export const heroImageAlts: Record<string, string> = {
  "01-clasicos.jpg":
    "Novios clásicos hechos a mano bajo un arco de rosas, sobre una torta de matrimonio blanca",
  "02-mascotas.jpg":
    "Novios personalizados acompañados de sus dos perros golden retriever",
  "03-up-globos.jpg":
    "Novios inspirados en la película Up, con la casa de globos y un beso de los abuelos",
};

/**
 * Galería. Igual que el Hero: las fotos se sueltan en `src/assets/galeria/` y
 * aparecen solas, ordenadas por nombre de archivo. El prefijo numérico marca
 * el orden en que se quieren mostrar.
 */
export const galleryImageAlts: Record<string, string> = {
  "01-hilo-rojo.jpg":
    "Novios abrazados envueltos en el hilo rojo del destino",
  "02-besos.jpg":
    "Novio con sombrero y la cara llena de besos, mientras la novia lo besa en la mejilla",
  "03-familia.jpg":
    "Figuras de toda la familia: los novios, los abuelos y las niñas con vestidos rojos",
  "04-up-globos.jpg":
    "Novios estilo Up junto a la casa de globos, sobre un pedestal blanco",
  "05-si-acepta.jpg":
    "Novios humorísticos: la novia sonríe con su ramo de rosas rojas mientras lleva atado con una soga al novio, que tiene un cartel con un “Sí” tapándole la boca",
  "06-el-acepta.jpg":
    "La misma pareja humorística de espaldas: la novia con tiara sostiene un letrero que dice “Él… acepta” y arrastra al novio amarrado con una soga",
  "07-besito.jpg":
    "Novia con velo de tul dando un beso en la mejilla al novio, que viste traje azul y corbata celeste",
};

export const GALLERY_ALT_FALLBACK =
  "Decoración artesanal de novios sobre una torta de matrimonio";

export const HERO_ALT_FALLBACK =
  "Figuras artesanales de novios sobre una torta de matrimonio";

/** Slides punteados que se muestran mientras no haya fotos reales. */
export const HERO_PLACEHOLDER_SLIDES = 3;

/**
 * Número de WhatsApp en formato internacional SIN "+", espacios ni guiones.
 * Ejemplo Colombia: 57 + número → "573001234567"
 * Número real del negocio: +57 300 5438227
 */
export const WHATSAPP_NUMBER = "573005438227";

/**
 * El mismo número en formato E.164 (con "+"), que es el que exige schema.org
 * en `telephone`. Se deriva de WHATSAPP_NUMBER para que no haya dos fuentes.
 */
export const WHATSAPP_E164 = `+${WHATSAPP_NUMBER}`;

/**
 * ¿El enlace apunta a un perfil de verdad y no a la portada de la red?
 * `https://instagram.com/` a secas es el placeholder, y mandar ahí a alguien
 * que está a punto de comprar es peor que no enlazar nada.
 */
export function isRealProfile(url: string): boolean {
  return new URL(url).pathname.length > 1;
}

/** Perfiles sociales reales. Vacío mientras sigan siendo los placeholders. */
export const socialProfiles = [site.instagram, site.facebook].filter(isRealProfile);

/** ¿Podemos usar Instagram como prueba social visible? */
export const hasInstagram = isRealProfile(site.instagram);

/**
 * Construye un enlace de WhatsApp (wa.me). El chat se abre en blanco: el
 * mensaje lo escribe el cliente.
 */
export function waLink(): string {
  return `https://wa.me/${WHATSAPP_NUMBER}`;
}
