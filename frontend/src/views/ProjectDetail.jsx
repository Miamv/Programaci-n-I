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
  const [plano, setPlano] = useState(PLAN_KEYS[0]);
  const [sheet, setSheet] = useState('compact');

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
      setMode('info');
      setSheet('expanded');
      return;
    }
    setMode(key);
    setSheet('compact');
  }

  function expandSheet() {
    setSheet('expanded');
  }

  function collapseSheet() {
    setSheet('compact');
    if (mode === 'info') setMode('renders');
  }

  function selectPlano(key) {
    setPlano(key);
    setMode('planos');
    setSheet('compact');
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
          />
        )}

        <ProjectTopBar
          title={project.titulo}
          category={project.categoria}
          onBack={() => navigate('/')}
        />

        {showLocation && <ProjectLocation project={project} />}
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
