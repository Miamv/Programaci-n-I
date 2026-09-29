import studio from '../config/studio';

export default function WhatsAppButton() {
  const phone = studio.contact.phone.replace(/[^0-9]/g, '');
  const message = encodeURIComponent(studio.contact.whatsappMessage);
  const url = `https://wa.me/${phone}?text=${message}`;

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="vertice-whatsapp">
      Mensaje directo <span aria-hidden="true">→</span>
    </a>
  );
}
