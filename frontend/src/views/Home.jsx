import { useState, useEffect } from 'react';
import Hero from '../components/Hero';
import About from '../components/About';
import Team from '../components/Team';
import BrandsCarousel from '../components/BrandsCarousel';
import ProjectCards from '../components/ProjectCards';
import ContactSection from '../components/ContactSection';
import LoadingSpinner from '../components/LoadingSpinner';
import { getProjects, getBrands, getProfiles, getAbout, getTeam } from '../services/api';

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
  const [aboutData, setAboutData] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [projectsError, setProjectsError] = useState(null);
  const [brandsError, setBrandsError] = useState(null);
  const [aboutError, setAboutError] = useState(null);
  const [teamError, setTeamError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const [projectsRes, brandsRes, profilesRes, aboutRes, teamRes] = await Promise.allSettled([
        getProjects(),
        getBrands(),
        getProfiles(),
        getAbout(),
        getTeam(),
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
        setTeamError(errorMessage(profilesRes.reason, 'Error al cargar el perfil del estudio.'));
      }

      if (aboutRes.status === 'fulfilled') {
        const aList = toList(aboutRes.value.data);
        setAboutData(aList[0] || null);
      } else {
        setAboutError(errorMessage(aboutRes.reason, 'Error al cargar la sección institucional.'));
      }

      if (teamRes.status === 'fulfilled') {
        setTeamMembers(toList(teamRes.value.data));
      } else {
        setTeamError((prev) => prev || errorMessage(teamRes.reason, 'Error al cargar el equipo.'));
      }

      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  function handleRetry() {
    setLoading(true);
    setProjectsError(null);
    setBrandsError(null);
    setAboutError(null);
    setTeamError(null);
    setReloadKey((k) => k + 1);
  }

  if (loading) return <LoadingSpinner />;

  const primaryProfile = profiles[0] || null;

  return (
    <>
      <Hero profile={primaryProfile} />
      <About data={aboutData} profile={primaryProfile} error={aboutError} />
      <Team members={teamMembers} profiles={profiles} error={teamError} />
      <BrandsCarousel brands={brands} error={brandsError} />
      <ProjectCards
        projects={projects}
        error={projectsError}
        onRetry={handleRetry}
      />
      <ContactSection title="Contanos tu proyecto" profileId={primaryProfile?.id ?? null} />
    </>
  );
}
