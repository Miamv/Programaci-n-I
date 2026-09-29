import heroImg from '../assets/hero.png';

function planoPlaceholder(label, sub = 'Módulo Chakal · Esc 1:50') {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">`
    + `<rect width="1200" height="800" fill="#EDEAE2"/>`
    + `<rect x="40" y="40" width="1120" height="720" fill="none" stroke="#0F1B2A" stroke-width="2" opacity="0.85"/>`
    + `<rect x="60" y="60" width="1080" height="680" fill="none" stroke="#0F1B2A" stroke-width="1" opacity="0.3"/>`
    + `<g stroke="#0F1B2A" stroke-width="2" fill="none" opacity="0.9">`
    + `<rect x="220" y="240" width="420" height="300"/><rect x="660" y="240" width="320" height="300"/>`
    + `<line x1="220" y1="390" x2="640" y2="390"/><line x1="430" y1="240" x2="430" y2="540"/>`
    + `<circle cx="760" cy="390" r="60"/><line x1="660" y1="540" x2="980" y2="540"/></g>`
    + `<g font-family="monospace" fill="#0F1B2A"><text x="80" y="110" font-size="34" letter-spacing="6">${label}</text>`
    + `<text x="80" y="145" font-size="18" opacity="0.6">${sub}</text></g>`
    + `</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

const MEMORIA_CHAKAL = `La vivienda se resuelve en dos volúmenes superpuestos: una planta baja de mampostería blanca que aloja los espacios sociales, y un volumen superior revestido en chapa corrugada sage que contiene el sector privado. Una escalera metálica exterior vista conecta ambos niveles con el jardín existente, evitando intervenir la vegetación preexistente. Los grandes paños vidriados orientados al norte garantizan luz natural constante en el living principal, mientras que el volumen superior se retrae para generar una galería semicubierta que actúa como transición climática entre interior y exterior.`;

export const MOCK_PROJECTS = [
  {
    id: 1,
    slug: 'modulo-chakal',
    titulo: 'Módulo Chakal',
    subtitulo: 'Vivienda unifamiliar de dos niveles en chapa y vidrio',
    categoria: 'EXTERIORES',
    ubicacionTexto: 'Mendoza',
    memoriaDescriptiva: MEMORIA_CHAKAL,
    specs: {
      superficie: '180 m²',
      dormitorios: 1,
      banos: 2,
      estado: 'Disponible',
    },
    media: {
      renders: [heroImg, heroImg, heroImg],
      planos: {
        planimetria: [planoPlaceholder('PLANIMETRÍA')],
        planta: [planoPlaceholder('PLANTA')],
        cortes: [planoPlaceholder('CORTES')],
        vistas: [planoPlaceholder('VISTAS')],
        detalleConstructivo: [planoPlaceholder('DETALLE', 'Detalle constructivo · Esc 1:10')],
      },
    },
    googleEarthUrl: 'https://earth.google.com/',
  },
  {
    id: 2,
    slug: 'diseno-interior',
    titulo: 'Diseño Interior',
    subtitulo: 'Reforma interior cálida en madera y luz natural',
    categoria: 'INTERIORES',
    ubicacionTexto: 'Mendoza',
    memoriaDescriptiva:
      'Intervención interior que reorganiza el estar en torno a la luz natural: tabiquería liviana, madera clara y textiles neutros para un ambiente sereno y continuo.',
    specs: {
      superficie: '95 m²',
      dormitorios: 2,
      banos: 1,
      estado: 'En obra',
    },
    media: {
      renders: [heroImg],
      planos: {
        planimetria: [planoPlaceholder('PLANIMETRÍA', 'Diseño Interior · Esc 1:50')],
        planta: [planoPlaceholder('PLANTA', 'Diseño Interior · Esc 1:50')],
        cortes: [planoPlaceholder('CORTES', 'Diseño Interior · Esc 1:50')],
        vistas: [planoPlaceholder('VISTAS', 'Diseño Interior · Esc 1:50')],
        detalleConstructivo: [planoPlaceholder('DETALLE', 'Diseño Interior · Esc 1:10')],
      },
    },
    googleEarthUrl: 'https://earth.google.com/',
  },
];

export function getMockProject(idOrSlug) {
  const key = String(idOrSlug ?? '').toLowerCase();
  return (
    MOCK_PROJECTS.find((p) => String(p.id) === key || p.slug === key) ?? MOCK_PROJECTS[0]
  );
}

export const PLAN_KEYS = ['planimetria', 'planta', 'cortes', 'vistas', 'detalleConstructivo'];

export const PLAN_LABELS = {
  planimetria: 'Planimetría',
  planta: 'Planta',
  cortes: 'Cortes',
  vistas: 'Vistas',
  detalleConstructivo: 'Detalle',
};
