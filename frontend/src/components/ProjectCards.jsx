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

export default function ProjectCards({ projects, covers, error, mediaError }) {
  const safeProjects = useMemo(() => (Array.isArray(projects) ? projects : []), [projects]);
  const viewportRef = useRef(null);
  const trackRef = useRef(null);
  const instantRef = useRef(false);
  const resetTimer = useRef(null);

  const n = safeProjects.length;
  const hasProjects = n > 0;

  // Rueda giratoria: se triplica la lista para que nunca se vean huecos
  // a los costados; la copia del medio es la visible.
  const slides = useMemo(() => {
    const arr = [];
    for (let c = 0; c < COPIES; c += 1) {
      for (const project of safeProjects) arr.push({ project, key: `${project.id}-c${c}` });
    }
    return arr;
  }, [safeProjects]);

  const [activeIndex, setActiveIndex] = useState(n);
  const [prevN, setPrevN] = useState(n);
  if (prevN !== n) {
    setPrevN(n);
    setActiveIndex(n);
  }

  const total = slides.length;
  const safeIndex = total > 0 ? Math.min(Math.max(activeIndex, 0), total - 1) : 0;

  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track || !hasProjects || total === 0) return;
    const active = track.children[safeIndex];
    if (!active) return;
    const left = active.offsetLeft - viewport.clientWidth / 2 + active.clientWidth / 2;
    // Saltos largos (primera carga) van sin animación para no ver barrido.
    const farJump = Math.abs(viewport.scrollLeft - left) > viewport.clientWidth;
    viewport.scrollTo({ left, behavior: instantRef.current || farJump ? 'auto' : 'smooth' });
    instantRef.current = false;

    // Reposicionamiento silencioso a la copia del medio cuando se llega
    // a una copia externa: el contenido es idéntico, no se nota el salto.
    if (safeIndex < n || safeIndex >= 2 * n) {
      const target = safeIndex < n ? safeIndex + n : safeIndex - n;
      resetTimer.current = setTimeout(() => {
        instantRef.current = true;
        setActiveIndex(target);
      }, RESET_DELAY);
    }
    return () => clearTimeout(resetTimer.current);
  }, [safeIndex, hasProjects, total, n]);

  function step(delta) {
    if (!hasProjects) return;
    clearTimeout(resetTimer.current);
    const next = safeIndex + delta;
    if (next < 0 || next >= total) {
      instantRef.current = true;
      setActiveIndex((((next % n) + n) % n) + n);
    } else {
      setActiveIndex(next);
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
    <section id="proyectos" className="vertice-projects">
      <div className="container vertice-projects__header">
        <h2 className="vertice-projects__title">Proyectos</h2>
      </div>

      {!hasProjects ? (
        <div className="container">
          <div className="vertice-projects__empty">
            {error ? (
              <>
                <p className="vertice-projects__empty-title">No se pudieron cargar los proyectos.</p>
                <p className="vertice-projects__empty-desc">{error}</p>
              </>
            ) : (
              <>
                <p className="vertice-projects__empty-title">Aún no hay proyectos para mostrar.</p>
                <p className="vertice-projects__empty-desc">Cuando el estudio publique proyectos, aparecerán aquí.</p>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="vertice-projects__stage">
          <button type="button" className="vertice-projects__arrow vertice-projects__arrow--prev" onClick={prev} aria-label="Proyecto anterior">
            <Chevron dir="left" />
          </button>

          <div className="vertice-projects__viewport" ref={viewportRef}>
            <div className="vertice-projects__track" ref={trackRef}>
              {slides.map(({ project, key }, index) => (
                <div
                  key={key}
                  className={`vertice-projects__item ${index === safeIndex ? 'is-active' : 'is-idle'}`}
                  onClick={() => select(index)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') select(index);
                  }}
                  aria-label={`Ver ${project.title}`}
                >
                  <ProjectCard project={project} coverUrl={covers?.[project.id]} />
                </div>
              ))}
            </div>
          </div>

          <button type="button" className="vertice-projects__arrow vertice-projects__arrow--next" onClick={next} aria-label="Proyecto siguiente">
            <Chevron dir="right" />
          </button>
        </div>
      )}

      {hasProjects && mediaError && (
        <p className="container vertice-projects__media-note">
          No se pudieron cargar las imágenes de portada. {mediaError}
        </p>
      )}
    </section>
  );
}
