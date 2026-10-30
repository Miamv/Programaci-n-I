import { aboutDescription } from '../content/about';
import { resolveMediaUrl } from '../services/api';

export default function About({ data }) {
  const title = data?.title || 'Arquitectura que define espacios contemporáneos';
  const description = data?.description || aboutDescription;
  const imageUrl = resolveMediaUrl(data?.image);

  return (
    <section id="nosotros" className="vertice-about">
      <div className="container">
        <div className="row align-items-center g-4 g-lg-5">
          <div className="col-lg-6">
            <h2 className="vertice-about__title">{title}</h2>
            <p className="vertice-about__body" style={{ whiteSpace: 'pre-line' }}>{description}</p>
          </div>
          <div className="col-lg-6">
            <div className="vertice-about__figure" aria-hidden="true">
              <div className="vertice-about__sketch">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="Boceto arquitectónico del estudio"
                    style={{
                      width: '100%',
                      height: 'auto',
                      maxHeight: '340px',
                      borderRadius: '12px',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                ) : (
                  <svg viewBox="0 0 520 340" role="img" aria-label="Boceto interior">
                    <rect x="10" y="10" width="500" height="320" rx="14" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.18" />
                    <path d="M70 260 Q120 120 220 140 Q320 160 400 90 L400 260 Z" fill="none" stroke="currentColor" strokeWidth="1.1" opacity="0.9" />
                    <path d="M120 260 V170 Q180 150 220 170 V260" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.55" />
                    <ellipse cx="320" cy="220" rx="38" ry="16" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.45" />
                    <rect x="340" y="140" width="70" height="88" rx="6" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5" />
                    <path d="M80 300 H430" stroke="currentColor" strokeWidth="1.1" opacity="0.28" />
                  </svg>
                )}
                <span className="vertice-about__figure-caption">Boceto — estudio</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
