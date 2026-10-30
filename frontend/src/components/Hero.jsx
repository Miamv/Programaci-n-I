import { useState } from 'react';
import studio from '../config/studio';
import { resolveMediaUrl } from '../services/api';

function VerticeMark() {
  return (
    <svg width="78" height="58" viewBox="0 0 98 72" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M12 68 V18 L28 8 L28 68" stroke="currentColor" strokeWidth="2.8" fill="none" />
      <path d="M26 68 V28 L44 16 L44 68" stroke="currentColor" strokeWidth="2.8" fill="none" />
      <path d="M42 68 V38 L60 26 L60 68" stroke="currentColor" strokeWidth="2.8" fill="none" />
    </svg>
  );
}

export default function Hero({ profile }) {
  const [brokenMedia, setBrokenMedia] = useState(false);
  const avatarUrl = resolveMediaUrl(profile?.avatar);
  const heroImage = (!brokenMedia && avatarUrl) ? avatarUrl : studio.heroImage;
  const studioTitle = profile?.name || studio.name || 'VÉRTICE';

  return (
    <section id="inicio" className="vertice-hero">
      <div className="vertice-hero__media" aria-hidden="true">
        <img
          src={heroImage}
          alt=""
          onError={() => setBrokenMedia(true)}
        />
        <span className="vertice-hero__wash" />
      </div>

      <div className="vertice-hero__inner container">
        <div className="vertice-hero__lockup">
          <span className="vertice-hero__mark">
            <VerticeMark />
          </span>
          <div className="vertice-hero__titles">
            <h1 className="vertice-hero__title">{studioTitle.toUpperCase()}</h1>
          </div>
        </div>

        <a href="#proyectos" className="vertice-hero__cta">
          Explorar proyectos
        </a>
      </div>
    </section>
  );
}
