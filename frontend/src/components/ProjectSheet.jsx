import { useEffect, useRef } from 'react';

const DRAG_THRESHOLD = 40;

function dormLabel(n) {
  return `${n} dorm`;
}

function banosLabel(n) {
  return `${n} ${n === 1 ? 'baño' : 'baños'}`;
}

function useDrag(onSwipeUp, onSwipeDown) {
  const startY = useRef(null);

  function handlePointerDown(e) {
    startY.current = e.clientY;
  }

  function handlePointerUp(e) {
    if (startY.current == null) return;
    const delta = startY.current - e.clientY;
    startY.current = null;
    if (delta > DRAG_THRESHOLD) onSwipeUp?.();
    else if (delta < -DRAG_THRESHOLD) onSwipeDown?.();
  }

  return { handlePointerDown, handlePointerUp };
}

export default function ProjectSheet({ project, state, onCollapse }) {
  const expandedDrag = useDrag(() => {}, onCollapse);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && state === 'expanded') {
        onCollapse?.();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state, onCollapse]);

  if (state !== 'expanded') {
    return null;
  }

  return (
    <>
      <div
        className="pv-sheet-backdrop"
        onClick={onCollapse}
        aria-hidden="true"
      />
      <div
        className="pv-sheet is-expanded"
        role="dialog"
        aria-modal="true"
        aria-label={`Información de ${project.titulo}`}
      >
        <div
          className="pv-sheet__grab"
          onPointerDown={expandedDrag.handlePointerDown}
          onPointerUp={expandedDrag.handlePointerUp}
          aria-label="Arrastrar hacia abajo para cerrar"
        >
          <span className="pv-sheet__handle pv-sheet__handle--grip" aria-hidden="true" />
          <button
            type="button"
            className="pv-sheet__close-btn"
            onClick={onCollapse}
            aria-label="Cerrar memoria descriptiva"
          >
            ✕
          </button>
        </div>

        <div className="pv-sheet__scroll">
          <h2 className="pv-sheet__title">{project.titulo}</h2>
          <p className="pv-sheet__subtitle">{project.subtitulo}</p>
          <p className="pv-sheet__body">{project.memoriaDescriptiva}</p>
        </div>

        <div className="pv-sheet__specs">
          <span>{project.specs.superficie}</span>
          <span aria-hidden="true">·</span>
          <span>{dormLabel(project.specs.dormitorios)}</span>
          <span aria-hidden="true">·</span>
          <span>{banosLabel(project.specs.banos)}</span>
          <span aria-hidden="true">·</span>
          <span>{project.specs.estado}</span>
        </div>
      </div>
    </>
  );
}
