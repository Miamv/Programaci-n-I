import { useRef } from 'react';

const DRAG_THRESHOLD = 48;

function dormLabel(n) {
  return `${n} dorm`;
}

function banosLabel(n) {
  return `${n} ${n === 1 ? 'baño' : 'baños'}`;
}

function sheetSummary(project) {
  const s = project.specs;
  return `${s.superficie} · ${dormLabel(s.dormitorios)} · ${banosLabel(s.banos)} · ${s.estado}`;
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
    if (delta > DRAG_THRESHOLD) onSwipeUp();
    else if (delta < -DRAG_THRESHOLD) onSwipeDown();
  }

  return { handlePointerDown, handlePointerUp };
}

export default function ProjectSheet({ project, state, onExpand, onCollapse }) {
  const compactDrag = useDrag(onExpand, () => {});
  const expandedDrag = useDrag(() => {}, onCollapse);

  if (state === 'compact') {
    return (
      <div className="pv-sheet is-compact">
        <button
          type="button"
          className="pv-sheet__compact-hit"
          onClick={onExpand}
          onPointerDown={compactDrag.handlePointerDown}
          onPointerUp={compactDrag.handlePointerUp}
          aria-label="Expandir memoria descriptiva"
        >
          <span className="pv-sheet__handle" aria-hidden="true" />
          <span className="pv-sheet__compact-row">
            <span className="pv-sheet__compact-title">Memoria descriptiva</span>
            <span className="pv-sheet__compact-action">— expandir</span>
          </span>
          <span className="pv-sheet__compact-summary">{sheetSummary(project)}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="pv-sheet is-expanded" role="dialog" aria-modal="false" aria-label={`Información de ${project.titulo}`}>
      <div
        className="pv-sheet__grab"
        onPointerDown={expandedDrag.handlePointerDown}
        onPointerUp={expandedDrag.handlePointerUp}
        onClick={(e) => {
          if (e.target.closest('.pv-sheet__scroll')) return;
          onCollapse();
        }}
        aria-label="Arrastrar hacia abajo para compactar"
      >
        <span className="pv-sheet__handle pv-sheet__handle--grip" aria-hidden="true" />
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
  );
}
