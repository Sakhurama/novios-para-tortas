// Preguntas frecuentes.
//
// Viven aquí y no dentro de Faq.astro porque las consumen dos sitios: la
// sección visible y el JSON-LD de tipo FAQPage del Layout, que es lo que Google
// necesita para mostrarlas como resultado enriquecido. Si se duplicaran, el
// esquema acabaría diciendo algo distinto de lo que ve el usuario, que es
// exactamente lo que Google penaliza.
//
// El orden no es decorativo: es el orden en que aparecen las dudas al decidir
// la compra. Primero lo que engancha (que se parecen a ustedes), enseguida el
// precio —que es lo que más gente deja de preguntar por pereza o por miedo—, y
// justo después de hablar de la transportadora, la pregunta por la pieza rota,
// que es donde se cae la venta si no hay respuesta.

import { formatCOP, hasPrice, PRICE_FROM, priceExtrasText } from './products';

export interface Faq {
  q: string;
  a: string;
}

// La cifra sale de products.ts y no se escribe a mano: es la misma que anuncia
// el catálogo y la que viaja en el JSON-LD. Tres copias del mismo precio son
// tres sitios donde olvidarse de actualizarlo.
const precioA =
  hasPrice && PRICE_FROM !== null
    ? `La pareja básica parte de ${formatCOP(PRICE_FROM)} y de ahí suma cada añadido: ${priceExtrasText}… Cada figura extra se cobra según el detalle que lleve. Cuéntanos por WhatsApp qué quieres que aparezca y te decimos cuánto sale exactamente. Sin compromiso.`
    : 'Depende de cuántas figuras lleve, si incluye mascotas o niños y el nivel de detalle que quieras. Escríbenos por WhatsApp con tu idea y te pasamos la cotización exacta, sin compromiso.';

export const faqs: Faq[] = [
  {
    q: '¿Puedo personalizar los novios para que se parezcan a nosotros?',
    a: 'Es justo lo que hacemos. Mándanos una foto de ustedes por WhatsApp y cuéntanos los detalles —el peinado, el vestido, el traje, los colores— y los modelamos parecidos. Entre más nos cuentes, más se parecen.',
  },
  {
    q: '¿Cuánto cuestan?',
    a: precioA,
  },
  {
    q: '¿De qué están hechos y cuánto miden?',
    a: 'En porcelanicrón, un material que endurece y no se daña con los años. Por eso los novios no se quedan en la torta: cuando termina la fiesta se guardan, y años después siguen en la casa. Miden entre 15 y 20 cm de alto, según el modelo y la pose.',
  },
  {
    q: '¿Cuánto tiempo tarda la elaboración y con cuánta anticipación debo pedirlos?',
    a: 'Unos 6 días hábiles de taller, más lo que tarde el envío a tu ciudad. Como cada pieza se hace a mano y por turnos, escríbenos con tres semanas de margen: así aseguras el cupo para tu fecha y queda tiempo de sobra para ajustar detalles.',
  },
  {
    q: '¿Hacen envíos a toda Colombia?',
    a: 'Sí, a todo el país por transportadora. Cada figura sale con empaque reforzado para que aguante el viaje.',
  },
  {
    // ⚠️ TODO: confirmar la política real antes de publicar.
    //
    // Esta es LA objeción que frena la compra: una pieza frágil, hecha a mano,
    // pagada por adelantado a alguien de otra ciudad y entregada a una
    // transportadora. Una respuesta tibia aquí cuesta ventas de verdad.
    // Si la política es reponer la pieza, hay que decirlo con esas palabras:
    // es la frase que más convierte de toda la página.
    q: '¿Y si la figura llega rota?',
    a: 'Nos escribes por WhatsApp con una foto y lo resolvemos contigo. Son muy poquitas las que sufren en el camino, pero si a la tuya le pasa algo no te dejamos sin tus novios para el día de la boda.',
  },
  {
    q: '¿Atienden pedidos o envíos fuera de Colombia?',
    // Antes esta respuesta cerraba la puerta y ya. Pero mucha gente que
    // escribe desde afuera se casa en Colombia o tiene familia aquí que puede
    // recibir la pieza: no se promete nada, solo se deja la puerta abierta en
    // vez de despedir a alguien que quería comprar.
    a: 'Por ahora solo enviamos dentro de Colombia. Pero si te casas aquí, o si alguien de tu familia puede recibirlos por ti, escríbenos igual y lo miramos.',
  },
  {
    // ⚠️ TODO menor: concretar los medios de pago reales (Nequi, Bancolombia,
    // Daviplata…). El anticipo ya está dicho, que es lo que más pesa; nombrar
    // el medio ahorra todavía una pregunta más en el chat.
    q: '¿Cómo cotizo y realizo el pago?',
    a: 'Todo por WhatsApp, hablando. Nos cuentas qué quieres, te pasamos el valor y las formas de pago. Tu pedido queda apartado con el 50 % y el otro 50 % se paga antes de que salga el envío.',
  },
  {
    q: '¿Hacen figuras para otras celebraciones?',
    a: 'Sí: aniversarios, quince años, bautizos, grados y lo que se celebre. Si se te ocurre algo raro, cuéntanoslo igual, que casi siempre se puede.',
  },
];
