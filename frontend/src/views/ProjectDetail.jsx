import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ProjectTopBar from '../components/ProjectTopBar';
import ProjectDock from '../components/ProjectDock';
import ProjectPlansNav from '../components/ProjectPlansNav';
import ProjectCanvasGallery from '../components/ProjectCanvasGallery';
import ProjectSheet from '../components/ProjectSheet';
import ProjectLocation from '../components/ProjectLocation';
import LoadingSpinner from '../components/LoadingSpinner';
import { getProject, getMedia, resolveMediaUrl } from '../services/api';
import { PLAN_KEYS, PLAN_LABELS, generatePlanoPlaceholder } from '../config/plans';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [is404, setIs404] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

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

  useEffect(() => {
    let cancelled = false;

    async function loadProjectData() {
      try {
        const res = await getProject(id);
        if (cancelled) return;

        const data = res.data;
        let list = Array.isArray(data.media) ? data.media : [];

        // Si el proyecto no trae media anidada, consultamos el endpoint /media/?project=<id>
        if (list.length === 0) {
          try {
            const mRes = await getMedia(id);
            const mData = Array.isArray(mRes.data) ? mRes.data : (mRes.data?.results ?? []);
            if (mData.length > 0) list = mData;
          } catch {
            // Continuar con los datos base del proyecto
          }
        }

        if (!cancelled) {
          setProject({ ...data, mediaList: list });
          setError(null);
          setIs404(false);
        }
      } catch (err) {
        if (!cancelled) {
          const status = err?.response?.status;
          setIs404(status === 404);
          setError(
            status === 404
              ? 'El proyecto que estás buscando no existe o fue dado de baja.'
              : err?.response?.data?.detail ||
                err?.message ||
                'No se pudo conectar con el servidor para obtener los datos del proyecto.'
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProjectData();

    return () => {
      cancelled = true;
    };
  }, [id, reloadKey]);

  const projectTitle = project?.title || project?.titulo || 'Proyecto';
  const projectCategory = project?.category || project?.categoria || 'Arquitectura';
  const projectSubtitle = project?.subtitulo || (project?.category ? String(project.category).toUpperCase() : 'Proyecto del estudio');
  const projectDescription = project?.description || project?.memoriaDescriptiva || 'Sin descripción disponible.';

  const mediaList = useMemo(() => {
    return project?.mediaList || project?.media || [];
  }, [project]);

  // Renders y fotos generales (excluyendo planos técnicos explícitos)
  const renderFiles = useMemo(() => {
    return mediaList
      .filter((m) => m.media_type === 'render' || (m.media_type === 'image' && !m.plan_type))
      .map((m) => resolveMediaUrl(m.file || m.url))
      .filter(Boolean);
  }, [mediaList]);

  const renders = useMemo(() => {
    if (renderFiles.length > 0) return renderFiles;
    return [generatePlanoPlaceholder(projectTitle, 'Render preliminar')];
  }, [renderFiles, projectTitle]);

  // Colección de planos por categoría técnica
  const planosMap = useMemo(() => {
    const map = {};
    for (const key of PLAN_KEYS) {
      const match = mediaList.filter(
        (m) => m.plan_type === key || (m.media_type === 'image' && m.zone === key)
      );
      if (match.length > 0) {
        map[key] = match.map((m) => resolveMediaUrl(m.file || m.url)).filter(Boolean);
      } else {
        map[key] = [
          generatePlanoPlaceholder(
            PLAN_LABELS[key] || key.toUpperCase(),
            `${projectTitle} · Esc 1:50`
          ),
        ];
      }
    }
    return map;
  }, [mediaList, projectTitle]);

  const galleryImages = useMemo(() => {
    if (mode === 'planos') return planosMap[plano] ?? renders;
    return renders;
  }, [mode, plano, planosMap, renders]);

  const normalizedProject = useMemo(() => {
    if (!project) return null;
    return {
      ...project,
      titulo: projectTitle,
      categoria: projectCategory,
      subtitulo: projectSubtitle,
      memoriaDescriptiva: projectDescription,
      ubicacionTexto: project.ubicacionTexto || 'Mendoza, Argentina',
      googleEarthUrl:
        project.googleEarthUrl ||
        `https://earth.google.com/web/search/${encodeURIComponent(projectTitle + ' Mendoza')}`,
      specs: project.specs || null,
    };
  }, [project, projectTitle, projectCategory, projectSubtitle, projectDescription]);

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

  if (loading) {
    return (
      <div className="pv pv--loading">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !normalizedProject) {
    return (
      <div className="pv pv--error">
        <div className="pv-error-card">
          <span className="pv-error-badge">{is404 ? '404' : 'ERROR'}</span>
          <h2 className="pv-error-title">
            {is404 ? 'Proyecto no encontrado' : 'No se pudo cargar el proyecto'}
          </h2>
          <p className="pv-error-desc">
            {error || 'El proyecto solicitado no está disponible.'}
          </p>
          <div className="pv-error-actions">
            {!is404 && (
              <button
                type="button"
                className="pv-btn pv-btn--outline"
                onClick={() => {
                  setLoading(true);
                  setError(null);
                  setReloadKey((k) => k + 1);
                }}
              >
                Reintentar
              </button>
            )}
            <button
              type="button"
              className="pv-btn pv-btn--primary"
              onClick={() => navigate('/')}
            >
              Volver a la Home
            </button>
          </div>
        </div>
      </div>
    );
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
            title={normalizedProject.titulo}
            hint={mode === 'planos' ? 'Zoom / pan · deslizar' : 'Explorar · deslizar'}
            onSwipeUp={expandSheet}
          />
        )}

        <ProjectTopBar
          title={normalizedProject.titulo}
          category={normalizedProject.categoria}
          onBack={() => navigate('/')}
        />

        {showLocation && <ProjectLocation project={normalizedProject} onSwipeUp={expandSheet} />}
      </div>

      {!sheetExpanded && mode === 'planos' && (
        <ProjectPlansNav active={plano} onSelect={selectPlano} />
      )}

      {!sheetExpanded && <ProjectDock mode={mode} onSelect={selectDock} />}

      <ProjectSheet
        project={normalizedProject}
        state={sheet}
        onExpand={expandSheet}
        onCollapse={collapseSheet}
      />
    </div>
  );
}
