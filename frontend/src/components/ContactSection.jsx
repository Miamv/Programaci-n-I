import { useEffect, useState, useMemo } from 'react';
import studio from '../config/studio';
import WhatsAppButton from './WhatsAppButton';
import ContactForm from './ContactForm';
import { getProfiles } from '../services/api';

export default function ContactSection({ title = 'Contanos tu proyecto', profileId }) {
  const [fetchedProfileId, setFetchedProfileId] = useState(null);

  useEffect(() => {
    if (profileId) return;
    let cancelled = false;
    getProfiles()
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : (res.data.results ?? []);
        if (!cancelled && list.length > 0) setFetchedProfileId(list[0].id);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [profileId]);

  const resolvedProfileId = useMemo(() => profileId ?? fetchedProfileId, [profileId, fetchedProfileId]);

  return (
    <section id="contacto" className="vertice-contact">
      <div className="container">
        <h2 className="vertice-contact__title">{title}</h2>
        <div className="vertice-contact__box">
          <div className="vertice-contact__left">
            <p className="vertice-contact__eyebrow">Conversa con nosotros</p>
            <WhatsAppButton />
            <div className="vertice-contact__meta">
              <a href={`tel:${studio.contact.phone}`}>{studio.contact.phone}</a>
              <a href={`mailto:${studio.contact.email}`}>{studio.contact.email}</a>
            </div>
          </div>
          <div className="vertice-contact__divider" aria-hidden="true" />
          <div className="vertice-contact__right">
            <ContactForm profileId={resolvedProfileId} />
          </div>
        </div>
      </div>
    </section>
  );
}
