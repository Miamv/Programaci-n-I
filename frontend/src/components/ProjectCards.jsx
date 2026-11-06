import { useEffect, useMemo, useRef, useState } from 'react';
import ProjectCard from './ProjectCard';

function Chevron({ dir = 'left' }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d={dir === 'left' ? 'M15 18 L9 12 L15 6' : 'M9 18 L15 12 L9 6'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const COPIES = 3;
const RESET_DELAY = 420;

function ProjectCarouselStage({ projects, covers, studioSlug }) {
  const viewportRef = useRef(null);
  const slideRefs = useRef([]);
  const instantRef = useRef(false);
  const resetTimer = useRef(null);

  const n = projects.length;

  const slides = useMemo(() => {
    const arr = [];
    for (let c = 0; c < COPIES; c += 1) {
      for (const project of projects) {
        arr.push({ project, key: `${project.id}-c${c}` });
      }
    }
    return arr;
  }, [projects]);

  const [activeIndex, setActiveIndex] = useState(n);
  const [prevProjects, setPrevProjects] = useState(projects);
  if (prevProjects !== projects) {
    setPrevProjects(projects);
    setActiveIndex(projects.length);
  }

  const total = slides.length;
  const safeIndex = total > 0 ? Math.min(Math.max(activeIndex, 0), total - 1) : 0;
  const prevTotalRef = useRef(total);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || total === 0) return;
    const active = slideRefs.current[safeIndex];
    if (!active) return;
    const totalChanged = prevTotalRef.current !== total;
    prevTotalRef.current = total;
    const left = active.offsetLeft - viewport.clientWidth / 2 + active.clientWidth / 2;
    const farJump = Math.abs(viewport.scrollLeft - left) > viewport.clientWidth;
    viewport.scrollTo({
      left,
      behavior: instantRef.current || totalChanged || farJump ? 'auto' : 'smooth',
    });
    instantRef.current = false;

    if (safeIndex < n || safeIndex >= 2 * n) {
      const target = safeIndex < n ? safeIndex + n : safeIndex - n;
      resetTimer.current = setTimeout(() => {
        instantRef.current = true;
        setActiveIndex(target);
      }, RESET_DELAY);
    }
    return () => clearTimeout(resetTimer.current);
  }, [safeIndex, total, n]);

  function step(delta) {
    clearTimeout(resetTimer.current);
    const nextIdx = safeIndex + delta;
    if (nextIdx < 0 || nextIdx >= total) {
      instantRef.current = true;
      setActiveIndex((((nextIdx % n) + n) % n) + n);
    } else {
      setActiveIndex(nextIdx);
    }
  }

  function prev() {
    step(-1);
  }

  function next() {
    step(1);
  }

  function select(index) {
    clearTimeout(resetTimer.current);
    if (Math.abs(index - safeIndex) > 1) instantRef.current = true;
    setActiveIndex(index);
  }

  return (
    <div className="vertice-projects__stage">
      <button
        type="button"
        className="vertice-projects__arrow vertice-projects__arrow--prev"
        onClick={prev}
        aria-label="Proyecto anterior"
      >
        <Chevron dir="left" />
      </button>

      <div className="vertice-projects__viewport" ref={viewportRef}>
        <div className="vertice-projects__track">
          {slides.map(({ project, key }, index) => (
            <div
              key={key}
              ref={(el) => {
                slideRefs.current[index] = el;
              }}
              className={`vertice-projects__item ${index === safeIndex ? 'is-active' : 'is-idle'}`}
              onClick={() => select(index)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') select(index);
              }}
              aria-label={`Ver ${project.title}`}
            >
              <ProjectCard
                project={project}
                coverUrl={covers?.[project.id]}
                studioSlug={studioSlug}
              />
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        className="vertice-projects__arrow vertice-projects__arrow--next"
        onClick={next}
        aria-label="Proyecto siguiente"
      >
        <Chevron dir="right" />
      </button>
    </div>
  );
}

export default function ProjectCards({
  projects,
  covers,
  error,
  mediaError,
  onRetry,
  studioSlug,
}) {
  const safeProjects = useMemo(() => (Array.isArray(projects) ? projects : []), [projects]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const hasProjects = safeProjects.length > 0;

  const filteredProjects = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    if (!query) return safeProjects;

    return safeProjects.filter((project) => {
      return (
        (project.title && project.title.toLowerCase().includes(query)) ||
        (project.description && project.description.toLowerCase().includes(query)) ||
        (project.category && project.category.toLowerCase().includes(query))
      );
    });
  }, [safeProjects, debouncedSearch]);

  return (
    <section id="proyectos" className="vertice-projects">
      <div className="container vertice-projects__header">
        <h2 className="vertice-projects__title">Proyectos</h2>
      </div>

      {hasProjects && (
        <div className="vertice-projects__controls">
          <div className="vertice-projects__search-box">
            <span className="vertice-projects__search-icon" aria-hidden="true">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              type="text"
              className="vertice-projects__search-input"
              placeholder="Buscar proyectos por título o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Buscar proyectos"
            />
            {searchTerm && (
              <button
                type="button"
                className="vertice-projects__search-clear"
                onClick={() => setSearchTerm('')}
                aria-label="Limpiar búsqueda"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}

      {!hasProjects ? (
        <div className="container">
          <div className="vertice-projects__empty">
            {error ? (
              <>
                <p className="vertice-projects__empty-title">No se pudieron cargar los proyectos.</p>
                <p className="vertice-projects__empty-desc">{error}</p>
                {onRetry && (
                  <button type="button" className="vertice-projects__action-btn" onClick={onRetry}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polyline points="23 4 23 10 17 10" />
                      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                    </svg>
                    Reintentar conexión
                  </button>
                )}
              </>
            ) : (
              <>
                <p className="vertice-projects__empty-title">Aún no hay proyectos publicados en este estudio.</p>
                <p className="vertice-projects__empty-desc">Cuando el estudio publique proyectos en su portfolio, aparecerán aquí.</p>
              </>
            )}
          </div>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="container">
          <div className="vertice-projects__empty">
            <p className="vertice-projects__empty-title">No se encontraron proyectos.</p>
            <p className="vertice-projects__empty-desc">
              No hay proyectos que coincidan con &ldquo;{searchTerm}&rdquo;.
            </p>
            <button
              type="button"
              className="vertice-projects__action-btn"
              onClick={() => setSearchTerm('')}
            >
              Limpiar búsqueda
            </button>
          </div>
        </div>
      ) : (
        <ProjectCarouselStage
          key={studioSlug || 'default'}
          projects={filteredProjects}
          covers={covers}
          studioSlug={studioSlug}
        />
      )}

      {hasProjects && mediaError && (
        <p className="container vertice-projects__media-note">
          No se pudieron cargar las imágenes de portada. {mediaError}
        </p>
      )}
    </section>
  );
}
