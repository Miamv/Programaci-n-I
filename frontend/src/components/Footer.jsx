import { Link } from 'react-router-dom';
import studio from '../config/studio';

export default function Footer() {
  return (
    <footer className="vertice-footer">
      <div className="container">
        <div className="vertice-footer__grid">
          <div className="vertice-footer__brand">
            <p className="vertice-footer__heading">Brand</p>
            <Link to="/" className="vertice-footer__brand-lockup" aria-label={`${studio.name} inicio`}>
              <span className="vertice-footer__mark" aria-hidden="true">
                <svg width="28" height="22" viewBox="0 0 98 72" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 68 V18 L28 8 L28 68" stroke="currentColor" strokeWidth="2.6" fill="none" />
                  <path d="M26 68 V28 L44 16 L44 68" stroke="currentColor" strokeWidth="2.6" fill="none" />
                  <path d="M42 68 V38 L60 26 L60 68" stroke="currentColor" strokeWidth="2.6" fill="none" />
                </svg>
              </span>
              <span>{studio.name}</span>
            </Link>
          </div>

          <div>
            <p className="vertice-footer__heading">Navegación</p>
            <ul className="vertice-footer__list">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/#nosotros">Nosotros</Link></li>
              <li><Link to="/#proyectos">Proyectos</Link></li>
              <li><a href="#contacto">Contacto</a></li>
            </ul>
          </div>

          <div>
            <p className="vertice-footer__heading">Contacto</p>
            <ul className="vertice-footer__list vertice-footer__list--contact">
              <li>
                <span className="vertice-footer__icon" aria-hidden="true">◷</span>
                <a href={`tel:${studio.contact.phone}`}>{studio.contact.phone}</a>
              </li>
              <li>
                <span className="vertice-footer__icon" aria-hidden="true">✉</span>
                <a href={`mailto:${studio.contact.email}`}>{studio.contact.email}</a>
              </li>
            </ul>
          </div>

          <div>
            <p className="vertice-footer__heading">Redes</p>
            <div className="vertice-footer__social">
              <a href={studio.social.instagram} aria-label="Instagram" className="vertice-footer__social-btn">◎</a>
              <a href={studio.social.facebook} aria-label="Facebook" className="vertice-footer__social-btn">f</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
