import { useState, useEffect } from 'react';
import Hero from '../components/Hero';
import About from '../components/About';
import Team from '../components/Team';
import BrandsCarousel from '../components/BrandsCarousel';
import ProjectCards from '../components/ProjectCards';
import ContactSection from '../components/ContactSection';
import LoadingSpinner from '../components/LoadingSpinner';
import { getProjects, getBrands, getProfiles, getMedia } from '../services/api';

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
  const [projects, setProjects] = useState([]);
  const [brands, setBrands] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [covers, setCovers] = useState({});
  const [loading, setLoading] = useState(true);
  const [projectsError, setProjectsError] = useState(null);
  const [brandsError, setBrandsError] = useState(null);
  const [teamError, setTeamError] = useState(null);
  const [mediaError, setMediaError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const [projectsRes, brandsRes, profilesRes, mediaRes] = await Promise.allSettled([
        getProjects(),
        getBrands(),
        getProfiles(),
        getMedia(),
      ]);

      if (cancelled) return;

      if (projectsRes.status === 'fulfilled') {
        setProjects(toList(projectsRes.value.data));
      } else {
        setProjectsError(errorMessage(projectsRes.reason, 'Error al cargar proyectos.'));
      }

      if (brandsRes.status === 'fulfilled') {
        setBrands(toList(brandsRes.value.data));
      } else {
        setBrandsError(errorMessage(brandsRes.reason, 'Error al cargar marcas.'));
      }

      if (profilesRes.status === 'fulfilled') {
        setProfiles(toList(profilesRes.value.data));
      } else {
        setTeamError(errorMessage(profilesRes.reason, 'Error al cargar el equipo.'));
      }

      if (mediaRes.status === 'fulfilled') {
        setCovers(buildCovers(toList(mediaRes.value.data)));
      } else {
        setMediaError(errorMessage(mediaRes.reason, 'Error al cargar las imágenes de los proyectos.'));
      }

      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <Hero profile={profiles[0]} />
      <About />
      <Team profiles={profiles} error={teamError} />
      <BrandsCarousel brands={brands} error={brandsError} />
      <ProjectCards projects={projects} covers={covers} error={projectsError} mediaError={mediaError} />
      <ContactSection title="Contanos tu proyecto" />
    </>
  );
}
