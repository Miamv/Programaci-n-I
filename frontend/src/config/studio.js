import heroBundled from '../assets/hero.png';

const studio = {
  name: 'Vértice',
  tagline: 'Estudio de Diseño Industrial',
  logo: '/favicon.svg',
  heroImage: heroBundled,
  contact: {
    // Datos personales del estudio: se leen de variables de entorno
    // (frontend/.env, nunca commiteado). Los valores aquí son solo
    // placeholders para desarrollo sin .env.
    phone: import.meta.env.VITE_STUDIO_PHONE ?? '+540000000000',
    email: import.meta.env.VITE_STUDIO_EMAIL ?? 'contacto@estudio.example',
    whatsappMessage: import.meta.env.VITE_STUDIO_WHATSAPP_MESSAGE ?? 'Hola, me interesa...',
  },
  social: {
    instagram: '#',
    facebook: '#',
  },
  navLinks: [
    { label: 'Home', href: '/' },
    { label: 'Nosotros', href: '/#nosotros' },
    { label: 'Proyectos', href: '/#proyectos' },
    { label: 'Contacto', href: '/#contacto' },
  ],
};

export default studio;
