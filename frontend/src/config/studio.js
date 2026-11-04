import heroBundled from '../assets/hero.png';

/**
 * Configuración base de la plataforma Vértice.
 *
 * IMPORTANTE (Arquitectura Multiestudio):
 * La identidad de cada estudio (nombre, especialidad, avatar, teléfono y email de contacto)
 * proviene dinámicamente del backend (`ProfessionalProfile`).
 * Este archivo sólo conserva recursos visuales por defecto de la plantilla base
 * para evitar filtraciones de datos fijos entre distintos estudios.
 */
const studio = {
  platformName: 'Vértice',
  name: 'Vértice',
  tagline: 'Plataforma de Portfolios de Arquitectura y Diseño',
  logo: '/favicon.svg',
  heroImage: heroBundled,
  contact: {
    phone: '',
    email: '',
    whatsappMessage:
      import.meta.env.VITE_STUDIO_WHATSAPP_MESSAGE ??
      'Hola, me gustaría realizar una consulta sobre un proyecto.',
  },
};

export default studio;
