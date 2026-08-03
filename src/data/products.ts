// Catálogo.
//
// Igual que las FAQ: viven aquí porque los leen la sección visible y el JSON-LD
// del Layout, y deben decir exactamente lo mismo.

import type { ImageMetadata } from 'astro';
import clasicos from '../assets/catalogo/clasicos.jpg';
import tematicos from '../assets/catalogo/tematicos.jpg';
import aniversarios from '../assets/catalogo/aniversarios.png';

export interface Product {
  name: string;
  desc: string;
  image: ImageMetadata;
  alt: string;
  /**
   * Precio de partida en pesos colombianos, sin decimales.
   *
   * `null` mientras no haya cifra real: en ese caso no se pinta la etiqueta ni
   * se declara la oferta en el esquema. Un precio inventado en producción es
   * peor que no mostrar ninguno — el cliente llega al chat con una expectativa
   * falsa y Google indexa una oferta que no existe.
   */
  priceFrom: number | null;
}

export const products: Product[] = [
  {
    name: 'Novios Clásicos',
    desc: 'La pareja tradicional, elegante y atemporal. El favorito de siempre.',
    image: clasicos,
    alt: 'Novios clásicos hechos a mano bajo un arco de rosas rosadas',
    priceFrom: null, // ⚠️ TODO
  },
  {
    name: 'Temáticos',
    desc: 'Hobbies, profesiones, mascotas… un guiño único a lo que los une.',
    image: tematicos,
    alt: 'Novios personalizados con sus dos perros golden retriever a los pies',
    priceFrom: null, // ⚠️ TODO
  },
  {
    name: 'Aniversarios',
    desc: 'Bodas de plata, oro y más. Para seguir celebrando el amor.',
    image: aniversarios,
    alt: 'Pareja de esposos mayores coronando una torta blanca de aniversario',
    priceFrom: null, // ⚠️ TODO
  },
];

/** ¿Hay al menos un precio real cargado? */
export const hasPrices = products.some((p) => p.priceFrom !== null);

const cop = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

/** 180000 → "$ 180.000" */
export function formatCOP(value: number): string {
  return cop.format(value);
}
