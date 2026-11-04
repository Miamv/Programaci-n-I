import studio from '../config/studio';

export default function WhatsAppButton({ phone, studioName }) {
  const cleanPhone = (phone || '').replace(/[^0-9]/g, '');
  if (!cleanPhone) {
    return null;
  }

  const rawMessage = studioName
    ? `Hola ${studioName}, me gustaría consultar por un proyecto.`
    : studio.contact.whatsappMessage;

  const message = encodeURIComponent(rawMessage);
  const url = `https://wa.me/${cleanPhone}?text=${message}`;

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="vertice-whatsapp">
      Mensaje directo <span aria-hidden="true">→</span>
    </a>
  );
}
