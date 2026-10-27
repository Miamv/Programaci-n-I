import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ProjectTopBar from '../components/ProjectTopBar';
import ProjectDock from '../components/ProjectDock';
import ProjectPlansNav from '../components/ProjectPlansNav';
import ProjectCanvasGallery from '../components/ProjectCanvasGallery';
import ProjectSheet from '../components/ProjectSheet';
import ProjectLocation from '../components/ProjectLocation';
import { getMockProject, PLAN_KEYS } from '../content/mockProjects';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const project = useMemo(() => getMockProject(id), [id]);

  const [mode, setMode] = useState('renders');
  const [lastVisualMode, setLastVisualMode] = useState('renders');
  const [plano, setPlano] = useState(PLAN_KEYS[0]);
  const [sheet, setSheet] = useState('closed');

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const renders = project.media.renders;

  const galleryImages = useMemo(() => {
    if (mode === 'planos') return project.media.planos[plano] ?? renders;
    return renders;
  }, [mode, plano, project, renders]);

  const galleryKey = `${mode}:${plano}`;

  function selectDock(key) {
    if (key === 'info') {
      if (sheet === 'expanded') {
        collapseSheet();
        return;
      }
      setMode('info');
      setSheet('expanded');
      return;
    }
    setMode(key);
    setLastVisualMode(key);
    setSheet('closed');
  }

  function expandSheet() {
    setMode('info');
    setSheet('expanded');
  }

  function collapseSheet() {
    setSheet('closed');
    setMode(lastVisualMode || 'renders');
  }

  function selectPlano(key) {
    setPlano(key);
    setMode('planos');
    setLastVisualMode('planos');
    setSheet('closed');
  }

  const showLocation = mode === 'ubicacion';
  const sheetExpanded = sheet === 'expanded';

  return (
    <div className="pv">
      <div className="pv-canvas">
        {showLocation ? (
          <div className="pv-canvas__media pv-canvas__media--location">
            <img key="location-bg" src={renders[0]} alt="" aria-hidden="true" />
            <span className="pv-canvas__scrim" aria-hidden="true" />
          </div>
        ) : (
          <ProjectCanvasGallery
            key={galleryKey}
            images={galleryImages}
            title={project.titulo}
            hint={mode === 'planos' ? 'Zoom / pan · deslizar' : 'Explorar · deslizar'}
            onSwipeUp={expandSheet}
          />
        )}

        <ProjectTopBar
          title={project.titulo}
          category={project.categoria}
          onBack={() => navigate('/')}
        />

        {showLocation && <ProjectLocation project={project} onSwipeUp={expandSheet} />}
      </div>

      {!sheetExpanded && mode === 'planos' && (
        <ProjectPlansNav active={plano} onSelect={selectPlano} />
      )}

      {!sheetExpanded && <ProjectDock mode={mode} onSelect={selectDock} />}

      <ProjectSheet
        project={project}
        state={sheet}
        onExpand={expandSheet}
        onCollapse={collapseSheet}
      />
    </div>
  );
}
