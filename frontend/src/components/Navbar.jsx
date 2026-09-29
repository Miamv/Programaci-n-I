import { Link } from 'react-router-dom';
import useScrollTo from '../hooks/useScrollTo';
import studio from '../config/studio';

export default function Navbar() {
  const scrollTo = useScrollTo();

  function handleAnchorClick(e, href) {
    if (href.startsWith('/#')) {
      e.preventDefault();
      scrollTo(href.slice(2));
    }
  }

  return (
    <header className="vertice-navbar">
      <nav className="navbar navbar-expand-lg vertice-navbar__nav">
        <div className="container vertice-navbar__container">
          <Link className="vertice-navbar__brand" to="/" aria-label={`${studio.name} — inicio`}>
            <span className="vertice-navbar__brand-mark" aria-hidden="true">
              <svg width="34" height="26" viewBox="0 0 98 72" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 68 V18 L28 8 L28 68" stroke="currentColor" strokeWidth="2.8" fill="none" />
                <path d="M26 68 V28 L44 16 L44 68" stroke="currentColor" strokeWidth="2.8" fill="none" />
                <path d="M42 68 V38 L60 26 L60 68" stroke="currentColor" strokeWidth="2.8" fill="none" />
              </svg>
            </span>
            <span className="vertice-navbar__brand-name">{studio.name}</span>
          </Link>

          <button
            className="navbar-toggler vertice-navbar__toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarContent"
            aria-controls="navbarContent"
            aria-expanded="false"
            aria-label="Abrir navegación"
          >
            <span className="navbar-toggler-icon" />
          </button>

          <div className="collapse navbar-collapse" id="navbarContent">
            <ul className="navbar-nav ms-auto align-items-lg-center vertice-navbar__links">
              {studio.navLinks.map((link) => (
                <li className="nav-item" key={link.href}>
                  {link.href.startsWith('/#') ? (
                    <a className="nav-link" href={link.href} onClick={(e) => handleAnchorClick(e, link.href)}>
                      {link.label}
                    </a>
                  ) : (
                    <Link className="nav-link" to={link.href}>
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
              <li className="nav-item d-flex align-items-center ms-lg-2">
                <span className="vertice-navbar__user" aria-label="Acceso personal (próximamente)" title="Acceso personal — próximamente">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle cx="12" cy="8" r="4.2" stroke="currentColor" strokeWidth="1.6" />
                    <path d="M5 20 C6.8 15.2 17.2 15.2 19 20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </span>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      <div className="vertice-navbar__rule container" aria-hidden="true" />
    </header>
  );
}
