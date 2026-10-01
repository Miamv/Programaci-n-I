import { useEffect, useMemo, useRef, useState } from 'react';
import ProjectCard from './ProjectCard';

function Chevron({ dir = 'left' }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d={dir === 'left' ? 'M15 18 L9 12 L15 6' : 'M9 18 L15 12 L9 6'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function ProjectCards({ projects, error }) {
  const safeProjects = useMemo(() => (Array.isArray(projects) ? projects : []), [projects]);
  const [activeIndex, setActiveIndex] = useState(0);
  const viewportRef = useRef(null);
  const trackRef = useRef(null);

  const hasProjects = safeProjects.length > 0;

  const clampedIndex = hasProjects ? Math.min(activeIndex, safeProjects.length - 1) : 0;
  const activeId = useMemo(() => safeProjects[clampedIndex]?.id ?? null, [safeProjects, clampedIndex]);

  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track || !hasProjects) return;
    const active = track.querySelector(`[data-project-id="${activeId}"]`);
    if (!active) return;
    const left = active.offsetLeft - viewport.clientWidth / 2 + active.clientWidth / 2;
    viewport.scrollTo({ left, behavior: 'smooth' });
  }, [activeId, hasProjects]);

  function prev() {
    setActiveIndex((i) => (i > 0 ? i - 1 : safeProjects.length - 1));
  }

  function next() {
    setActiveIndex((i) => (i < safeProjects.length - 1 ? i + 1 : 0));
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
              {safeProjects.map((project, index) => (
                <div
                  key={project.id}
                  data-project-id={project.id}
                  className={`vertice-projects__item ${index === clampedIndex ? 'is-active' : 'is-idle'}`}
                  onClick={() => setActiveIndex(index)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') setActiveIndex(index);
                  }}
                  aria-label={`Ver ${project.title}`}
                >
                  <ProjectCard project={project} />
                </div>
              ))}
            </div>
          </div>

          <button type="button" className="vertice-projects__arrow vertice-projects__arrow--next" onClick={next} aria-label="Proyecto siguiente">
            <Chevron dir="right" />
          </button>
        </div>
      )}
    </section>
  );
}
