// Preguntas frecuentes.
//
// Viven aquí y no dentro de Faq.astro porque las consumen dos sitios: la
// sección visible y el JSON-LD de tipo FAQPage del Layout, que es lo que Google
// necesita para mostrarlas como resultado enriquecido. Si se duplicaran, el
// esquema acabaría diciendo algo distinto de lo que ve el usuario, que es
// exactamente lo que Google penaliza.

export interface Faq {
  q: string;
  a: string;
}

export const faqs: Faq[] = [
  {
    q: '¿Puedo personalizar los novios para que se parezcan a nosotros?',
    a: '¡Claro! Es nuestra especialidad. Nos cuentas por WhatsApp cómo son ustedes —peinado, traje, vestido, colores y detalles— y los modelamos a su semejanza.',
  },
  {
    q: '¿Cuánto tiempo tarda la elaboración?',
    a: 'Normalmente es de 6 días hábiles. Te confirmamos el tiempo exacto al aprobar tu pedido, así que te recomendamos escribirnos con anticipación.',
  },
  {
    q: '¿Hacen envíos a toda Colombia?',
    a: 'Sí. Empacamos cada figura de forma segura para que llegue perfecta y enviamos a todo el país a través de transportadora.',
  },
  {
    q: '¿Cómo cotizo y realizo el pago?',
    a: 'Todo lo coordinamos por WhatsApp de forma cercana. Allí te pasamos la cotización según lo que necesites y las opciones de pago disponibles.',
  },
  {
    q: '¿Hacen figuras para otras celebraciones?',
    a: 'Sí, además de bodas elaboramos decoraciones para aniversarios, quince años, bautizos y ocasiones especiales. Cuéntanos tu idea.',
  },
];
