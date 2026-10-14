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

export default function Home() {
  const [projects, setProjects] = useState([]);
  const [brands, setBrands] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [covers, setCovers] = useState({});
  const [loading, setLoading] = useState(true);
  const [projectsError, setProjectsError] = useState(null);
  const [brandsError, setBrandsError] = useState(null);
  const [teamError, setTeamError] = useState(null);

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
        const items = toList(mediaRes.value.data);
        const byProject = {};
        for (const item of items) {
          const pid = item?.project;
          if (pid == null || byProject[pid] || !item?.file) continue;
          byProject[pid] = item.file;
        }
        setCovers(byProject);
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
      <Hero />
      <About />
      <Team profiles={profiles} error={teamError} />
      <BrandsCarousel brands={brands} error={brandsError} />
      <ProjectCards projects={projects} covers={covers} error={projectsError} />
      <ContactSection title="Contanos tu proyecto" />
    </>
  );
}
