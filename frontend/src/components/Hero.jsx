import { Link } from 'react-router-dom';
import studio from '../config/studio';

function VerticeMark() {
  return (
    <svg width="98" height="72" viewBox="0 0 98 72" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M12 68 V18 L28 8 L28 68" stroke="currentColor" strokeWidth="2.6" fill="none" />
      <path d="M26 68 V28 L44 16 L44 68" stroke="currentColor" strokeWidth="2.6" fill="none" />
      <path d="M42 68 V38 L60 26 L60 68" stroke="currentColor" strokeWidth="2.6" fill="none" />
      <path d="M8 10 L14 4 L14 12" stroke="currentColor" strokeWidth="1.6" fill="none" />
    </svg>
  );
}

export default function Hero() {
  return (
    <section id="inicio" className="vertice-hero">
      <div className="vertice-hero__media" aria-hidden="true">
        <img src={studio.heroImage} alt="" />
        <span className="vertice-hero__wash" />
      </div>

      <div className="vertice-hero__inner container">
        <div className="vertice-hero__lockup">
          <span className="vertice-hero__mark">
            <VerticeMark />
          </span>
          <div className="vertice-hero__titles">
            <h1 className="vertice-hero__title">VÉRTICE</h1>
            <p className="vertice-hero__subtitle">ESTUDIO DE DISEÑO INDUSTRIAL</p>
          </div>
        </div>

        <Link to="/#proyectos" className="vertice-hero__cta">
          Explorar proyectos
        </Link>
      </div>
    </section>
  );
}
