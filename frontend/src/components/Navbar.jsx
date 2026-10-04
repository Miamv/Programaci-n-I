import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import useScrollTo from '../hooks/useScrollTo';
import studio from '../config/studio';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const scrollTo = useScrollTo();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const roleLabel = user?.role ?? user?.username;

  useEffect(() => {
    if (!menuOpen) return;

    function handlePointerDown(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }

    function handleKey(e) {
      if (e.key === 'Escape') setMenuOpen(false);
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKey);
    };
  }, [menuOpen]);

  function handleAnchorClick(e, href) {
    if (href.startsWith('/#')) {
      e.preventDefault();
      scrollTo(href.slice(2));
    }
  }

  function handleLogout() {
    logout();
    setMenuOpen(false);
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

              {user ? (
                <>
                  <li
                    className="nav-item d-flex align-items-center ms-lg-3 my-2 my-lg-0 vertice-userbox"
                    ref={menuRef}
                  >
                    <button
                      type="button"
                      className="vertice-navbar__user vertice-userbox__btn"
                      aria-haspopup="menu"
                      aria-expanded={menuOpen}
                      aria-label="Cuenta de usuario"
                      title="Cuenta de usuario"
                      onClick={() => setMenuOpen((v) => !v)}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <circle cx="12" cy="8" r="4.2" stroke="currentColor" strokeWidth="1.6" />
                        <path d="M5 20 C6.8 15.2 17.2 15.2 19 20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                      </svg>
                    </button>
                    <span className="nav-link px-0 ms-2 text-capitalize fw-semibold">
                      {roleLabel}
                    </span>
                    {menuOpen && (
                      <div className="vertice-userbox__menu" role="menu">
                        <div className="vertice-userbox__meta">
                          <div className="vertice-userbox__name text-capitalize">{user.username}</div>
                          {user.email && <div className="vertice-userbox__mail">{user.email}</div>}
                        </div>
                        <div className="vertice-userbox__divider" aria-hidden="true" />
                        <button
                          type="button"
                          className="vertice-userbox__item"
                          role="menuitem"
                          onClick={handleLogout}
                        >
                          Cerrar sesión
                        </button>
                      </div>
                    )}
                  </li>
                  <li className="nav-item ms-lg-2">
                    <button
                      type="button"
                      className="btn btn-outline-dark btn-sm rounded-pill px-3"
                      style={{ fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}
                      onClick={handleLogout}
                    >
                      Cerrar sesión
                    </button>
                  </li>
                </>
              ) : (
                <li className="nav-item ms-lg-2 vertice-userbox" ref={menuRef}>
                  <button
                    type="button"
                    className="vertice-navbar__user vertice-userbox__btn"
                    aria-haspopup="menu"
                    aria-expanded={menuOpen}
                    aria-label="Acceso a la plataforma"
                    title="Acceso a la plataforma"
                    onClick={() => setMenuOpen((v) => !v)}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <circle cx="12" cy="8" r="4.2" stroke="currentColor" strokeWidth="1.6" />
                      <path d="M5 20 C6.8 15.2 17.2 15.2 19 20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                  </button>
                  {menuOpen && (
                    <div className="vertice-userbox__menu" role="menu">
                      <Link
                        className="vertice-userbox__item"
                        role="menuitem"
                        to="/login"
                        onClick={() => setMenuOpen(false)}
                      >
                        Iniciar sesión
                      </Link>
                      <Link
                        className="vertice-userbox__item"
                        role="menuitem"
                        to="/registro"
                        onClick={() => setMenuOpen(false)}
                      >
                        Crear cuenta
                      </Link>
                      <div className="vertice-userbox__divider" aria-hidden="true" />
                      <div className="vertice-userbox__hint">Nuevas cuentas acceden como Viewer</div>
                    </div>
                  )}
                </li>
              )}
            </ul>
          </div>
        </div>
      </nav>
      <div className="vertice-navbar__rule container" aria-hidden="true" />
    </header>
  );
}
