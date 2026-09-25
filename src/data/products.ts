// Catálogo.
//
// Igual que las FAQ: viven aquí porque los leen la sección visible y el JSON-LD
// del Layout, y deben decir exactamente lo mismo.

import type { ImageMetadata } from 'astro';
import clasicos from '../assets/catalogo/clasicos.jpg';
import tematicos from '../assets/catalogo/tematicos.jpg';
import aniversarios from '../assets/catalogo/aniversarios.png';

/**
 * Precio de partida en pesos colombianos, sin decimales.
 *
 * Va suelto y no dentro de cada producto porque el taller no cobra por
 * categoría: cobra por pieza. Los tres modelos arrancan de la misma pareja
 * básica y lo que los separa es lo que se les añade encima, no la etiqueta.
 * Repetir la misma cifra en las tres tarjetas solo haría ruido; el precio se
 * anuncia una vez, arriba, junto a lo que lo hace subir.
 *
 * `null` mientras no haya cifra real: en ese caso no se pinta el anuncio ni se
 * declara la oferta en el esquema. Un precio inventado en producción es peor
 * que no mostrar ninguno — el cliente llega al chat con una expectativa falsa
 * y Google indexa una oferta que no existe.
 */
export const PRICE_FROM: number | null = 60000;

/**
 * Lo que suma sobre el precio de partida.
 *
 * Decirlo en voz alta hace dos cosas a la vez: evita que el "desde" se lea
 * como precio cerrado, y le enseña al cliente que la pieza puede crecer —que
 * es justo lo que sube el ticket—. Lo leen el catálogo y la FAQ del precio.
 */
export const priceExtras = ['un hijo', 'una mascota', 'un auto'] as const;

/** ¿Hay precio real cargado? */
export const hasPrice = PRICE_FROM !== null;

export interface Product {
  name: string;
  desc: string;
  image: ImageMetadata;
  alt: string;
}

export const products: Product[] = [
  {
    name: 'Novios Clásicos',
    desc: 'Los de toda la vida: traje, vestido y esa pose de foto. El que más nos piden.',
    image: clasicos,
    alt: 'Novios clásicos hechos a mano bajo un arco de rosas rosadas',
  },
  {
    name: 'Temáticos',
    desc: '¿Él no suelta la bicicleta? ¿Ella no sale sin el perro? Eso va en la torta.',
    image: tematicos,
    alt: 'Novios personalizados con sus dos perros golden retriever a los pies',
  },
  {
    name: 'Aniversarios',
    desc: 'Bodas de plata, de oro, de las que sean. Los mismos dos, unos años después.',
    image: aniversarios,
    alt: 'Pareja de esposos mayores coronando una torta blanca de aniversario',
  },
];

const cop = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

/** 180000 → "$ 180.000" */
export function formatCOP(value: number): string {
  return cop.format(value);
}

/** "un hijo, una mascota, un auto" */
export const priceExtrasText = priceExtras.join(', ');
