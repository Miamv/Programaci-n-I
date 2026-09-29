import { useState } from 'react';

export default function ProjectTopBar({ title, category, onBack }) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, text: title, url });
        return;
      }
      throw new Error('no-share');
    } catch {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      } catch {
        setCopied(false);
      }
    }
  }

  return (
    <div className="pv-topbar">
      <button type="button" className="pv-circle-btn" onClick={onBack} aria-label="Volver a la Home">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M19 12 H5 M12 19 L5 12 L12 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div className="pv-title-pill" aria-live="polite">
        <span className="pv-title-pill__title">{title}</span>
        {category && <span className="pv-title-pill__cat">{category}</span>}
      </div>

      <button type="button" className="pv-circle-btn" onClick={handleShare} aria-label="Compartir proyecto">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="18" cy="5" r="2.6" stroke="currentColor" strokeWidth="1.7" />
          <circle cx="6" cy="12" r="2.6" stroke="currentColor" strokeWidth="1.7" />
          <circle cx="18" cy="19" r="2.6" stroke="currentColor" strokeWidth="1.7" />
          <path d="M8.3 10.8 L15.7 6.2 M8.3 13.2 L15.7 17.8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      </button>

      {copied && <span className="pv-share-toast">Enlace copiado</span>}
    </div>
  );
}
