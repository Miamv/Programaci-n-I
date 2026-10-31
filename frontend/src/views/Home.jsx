import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Hero from '../components/Hero';
import About from '../components/About';
import Team from '../components/Team';
import BrandsCarousel from '../components/BrandsCarousel';
import ProjectCards from '../components/ProjectCards';
import ContactSection from '../components/ContactSection';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  getProjects,
  getBrands,
  getProfiles,
  getStudio,
  getMedia,
  getAbout,
  getTeam,
} from '../services/api';

function toList(data) {
  if (Array.isArray(data)) return data;
  return data?.results ?? [];
}

function errorMessage(reason, fallback) {
  return reason?.response?.data?.detail || reason?.message || fallback;
}

const IMAGE_FILE_RE = /\.(avif|webp|jpe?g|png|gif|bmp|svg)(\?.*)?$/i;

function buildCovers(items) {
  const byType = {};
  const byExtension = {};

  for (const item of items) {
    const projectId = item?.project;
    const file = item?.file;
    if (projectId == null || !file) continue;

    if (item.media_type === 'image' || item.media_type === 'render') {
      if (!byType[projectId]) byType[projectId] = file;
    } else if (!byType[projectId] && !byExtension[projectId] && IMAGE_FILE_RE.test(file)) {
      byExtension[projectId] = file;
    }
  }

  return { ...byExtension, ...byType };
}

export default function Home() {
  const { slug } = useParams();

  const [projects, setProjects] = useState([]);
  const [brands, setBrands] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [activeProfile, setActiveProfile] = useState(null);
  const [studioNotFound, setStudioNotFound] = useState(false);
  const [covers, setCovers] = useState({});
  const [aboutData, setAboutData] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [projectsError, setProjectsError] = useState(null);
  const [brandsError, setBrandsError] = useState(null);
  const [teamError, setTeamError] = useState(null);
  const [mediaError, setMediaError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setStudioNotFound(false);
      setLoading(true);

      try {
        // 1. Obtener la lista de todos los estudios registrados
        const profilesRes = await getProfiles();
        if (cancelled) return;
        const allProfiles = toList(profilesRes.data);
        setProfiles(allProfiles);

        // 2. Determinar el estudio a mostrar:
        let selectedStudio = null;
        if (slug) {
          // Búsqueda por slug en la lista cargada
          selectedStudio = allProfiles.find(
            (p) => (p.slug && p.slug.toLowerCase() === slug.toLowerCase()) || String(p.id) === slug
          );

          // Si no está en la lista inicial, intentar petición directa por slug o ID
          if (!selectedStudio) {
            try {
              const singleRes = await getStudio(slug);
              selectedStudio = singleRes.data;
            } catch (err) {
              if (!cancelled) {
                setStudioNotFound(true);
                setLoading(false);
              }
              return;
            }
          }
        } else {
          // Sin parámetro en la URL: tomar el primer estudio configurado
          selectedStudio = allProfiles[0] || null;
        }

        if (cancelled) return;
        setActiveProfile(selectedStudio);

        // 3. Consultar datos filtrados exclusivamente para el estudio activo
        const studioFilter = selectedStudio?.id ? { profile: selectedStudio.id } : undefined;

        const [projectsRes, brandsRes, mediaRes, aboutRes, teamRes] = await Promise.allSettled([
          getProjects(studioFilter),
          getBrands(),
          getMedia(),
          getAbout(studioFilter),
          getTeam(studioFilter),
        ]);

        if (cancelled) return;

        if (projectsRes.status === 'fulfilled') {
          setProjects(toList(projectsRes.value.data));
        } else {
          setProjectsError(errorMessage(projectsRes.reason, 'Error al cargar los proyectos del estudio.'));
        }

        if (brandsRes.status === 'fulfilled') {
          setBrands(toList(brandsRes.value.data));
        } else {
          setBrandsError(errorMessage(brandsRes.reason, 'Error al cargar marcas.'));
        }

        if (mediaRes.status === 'fulfilled') {
          setCovers(buildCovers(toList(mediaRes.value.data)));
        } else {
          setMediaError(errorMessage(mediaRes.reason, 'Error al cargar las imágenes de los proyectos.'));
        }

        if (aboutRes.status === 'fulfilled') {
          const aList = toList(aboutRes.value.data);
          if (aList.length > 0) {
            setAboutData(aList[0]);
          } else if (selectedStudio?.description) {
            setAboutData({
              title: `Sobre ${selectedStudio.name}`,
              description: selectedStudio.description,
            });
          } else {
            setAboutData(null);
          }
        }

        if (teamRes.status === 'fulfilled') {
          setTeamMembers(toList(teamRes.value.data));
        }
      } catch (err) {
        if (!cancelled) {
          setProjectsError(errorMessage(err, 'Error de conexión con el servidor.'));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [slug, reloadKey]);

  function handleRetry() {
    setLoading(true);
    setProjectsError(null);
    setBrandsError(null);
    setTeamError(null);
    setMediaError(null);
    setReloadKey((k) => k + 1);
  }

  if (loading) return <LoadingSpinner />;

  // Estado cuando se solicita un estudio inexistente por URL (/estudios/:slug)
  if (studioNotFound) {
    return (
      <div className="container py-5 text-center my-5">
        <div className="badge bg-danger rounded-pill px-3 py-2 mb-3">404 — Estudio No Encontrado</div>
        <h1 className="h3 fw-bold mb-3" style={{ color: 'var(--color-ink)' }}>
          El portfolio "{slug}" no existe
        </h1>
        <p className="text-muted mb-4" style={{ maxWidth: '480px', margin: '0 auto' }}>
          No se encontró ningún estudio de arquitectura registrado con el identificador{' '}
          <code>/estudios/{slug}</code>. Verificá la URL ingresada.
        </p>
        <div className="d-flex justify-content-center gap-2 flex-wrap">
          <Link to="/" className="btn btn-dark rounded-pill px-4">
            Ir al Estudio Principal
          </Link>
          {profiles.length > 0 && (
            <Link
              to={profiles[0].slug ? `/estudios/${profiles[0].slug}` : '/'}
              className="btn btn-outline-dark rounded-pill px-4"
            >
              Ver {profiles[0].name}
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Barra de selector multi-estudio cuando existen varios estudios registrados */}
      {profiles.length > 1 && (
        <div
          className="py-2 px-3 border-bottom d-flex align-items-center justify-content-between flex-wrap gap-2"
          style={{ background: '#0f1b2a', color: '#fff', fontSize: '0.8rem' }}
        >
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-secondary rounded-pill px-2 py-1 text-uppercase" style={{ fontSize: '0.65rem' }}>
              Plataforma Multi-Estudio
            </span>
            <span>
              Mostrando portfolio de: <strong>{activeProfile?.name || 'VÉRTICE'}</strong>
            </span>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span className="opacity-75 d-none d-sm-inline">Cambiar de estudio:</span>
            <div className="btn-group btn-group-sm">
              {profiles.map((p) => {
                const isCurrent = activeProfile?.id === p.id;
                return (
                  <Link
                    key={p.id}
                    to={p.slug ? `/estudios/${p.slug}` : `/`}
                    className={`btn btn-sm ${isCurrent ? 'btn-light text-dark fw-bold' : 'btn-outline-light'}`}
                    style={{ fontSize: '0.75rem' }}
                  >
                    {p.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <Hero profile={activeProfile} />
      <About data={aboutData} />
      <Team members={teamMembers} profiles={activeProfile ? [activeProfile] : profiles} error={teamError} />
      <BrandsCarousel brands={brands} error={brandsError} />
      <ProjectCards
        projects={projects}
        covers={covers}
        error={projectsError}
        mediaError={mediaError}
        onRetry={handleRetry}
      />
      <ContactSection title="Contanos tu proyecto" profileId={activeProfile?.id} />
    </>
  );
}
