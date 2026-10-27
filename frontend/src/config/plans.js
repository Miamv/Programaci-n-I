export const PLAN_KEYS = ['planimetria', 'planta', 'cortes', 'vistas', 'detalle'];

export const PLAN_LABELS = {
  planimetria: 'Planimetría',
  planta: 'Planta',
  cortes: 'Cortes',
  vistas: 'Vistas',
  detalle: 'Detalle',
  detalleConstructivo: 'Detalle',
};

export function generatePlanoPlaceholder(label, sub = 'Esc 1:50') {
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
