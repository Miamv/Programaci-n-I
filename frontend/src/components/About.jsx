import { aboutDescription } from '../content/about';

export default function About() {
  return (
    <section id="nosotros" className="vertice-about">
      <div className="container">
        <div className="row align-items-center g-4 g-lg-5">
          <div className="col-lg-6">
            <h2 className="vertice-about__title">
              Lorem ipsum is simply dummy text of the printing and typesetting industry.
            </h2>
            <p className="vertice-about__body">{aboutDescription}</p>
          </div>
          <div className="col-lg-6">
            <div className="vertice-about__figure" aria-hidden="true">
              <div className="vertice-about__sketch">
                <svg viewBox="0 0 520 340" role="img" aria-label="Boceto interior">
                  <rect x="10" y="10" width="500" height="320" rx="14" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.18" />
                  <path d="M70 260 Q120 120 220 140 Q320 160 400 90 L400 260 Z" fill="none" stroke="currentColor" strokeWidth="1.1" opacity="0.9" />
                  <path d="M120 260 V170 Q180 150 220 170 V260" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.55" />
                  <ellipse cx="320" cy="220" rx="38" ry="16" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.45" />
                  <rect x="340" y="140" width="70" height="88" rx="6" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5" />
                  <path d="M80 300 H430" stroke="currentColor" strokeWidth="1.1" opacity="0.28" />
                </svg>
                <span className="vertice-about__figure-caption">Boceto — estudio</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
