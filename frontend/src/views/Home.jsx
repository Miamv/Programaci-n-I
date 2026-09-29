import { useState, useEffect } from 'react';
import Hero from '../components/Hero';
import About from '../components/About';
import Team from '../components/Team';
import BrandsCarousel from '../components/BrandsCarousel';
import ProjectCards from '../components/ProjectCards';
import ContactSection from '../components/ContactSection';
import LoadingSpinner from '../components/LoadingSpinner';
import { getProjects, getBrands } from '../services/api';

export default function Home() {
  const [projects, setProjects] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [projectsError, setProjectsError] = useState(null);
  const [brandsError, setBrandsError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const [projectsRes, brandsRes] = await Promise.allSettled([getProjects(), getBrands()]);

      if (cancelled) return;

      if (projectsRes.status === 'fulfilled') {
        const data = projectsRes.value.data;
        setProjects(Array.isArray(data) ? data : (data.results ?? []));
      } else {
        const msg = projectsRes.reason?.response?.data?.detail || projectsRes.reason?.message || 'Error al cargar proyectos.';
        setProjectsError(msg);
      }

      if (brandsRes.status === 'fulfilled') {
        const data = brandsRes.value.data;
        setBrands(Array.isArray(data) ? data : (data.results ?? []));
      } else {
        const msg = brandsRes.reason?.response?.data?.detail || brandsRes.reason?.message || 'Error al cargar marcas.';
        setBrandsError(msg);
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
      <Team />
      <BrandsCarousel brands={brands} error={brandsError} />
      <ProjectCards projects={projects} error={projectsError} />
      <ContactSection title="Contanos tu proyecto" />
    </>
  );
}
