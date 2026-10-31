import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getProjects,
  deleteProject,
  resolveMediaUrl,
  getTeam,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
  getAbout,
  createAbout,
  updateAbout,
} from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

function formatCategory(cat) {
  if (!cat) return 'General';
  const labels = {
    architecture: 'Arquitectura',
    design: 'Diseño',
    interior_design: 'Diseño Interior',
    photography: 'Fotografía',
    render: 'Render',
    other: 'Otro',
  };
  return labels[cat.toLowerCase()] || cat.replace(/_/g, ' ');
}

function toList(data) {
  if (Array.isArray(data)) return data;
  return data?.results ?? [];
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('projects'); // 'projects' | 'team' | 'about'

  // Proyectos State
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [errorProjects, setErrorProjects] = useState(null);
  const [filterQuery, setFilterQuery] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  // Equipo State
  const [team, setTeam] = useState([]);
  const [loadingTeam, setLoadingTeam] = useState(true);
  const [editingMember, setEditingMember] = useState(null);
  const [memberForm, setMemberForm] = useState({ full_name: '', role: '', order: 0 });
  const [memberAvatarFile, setMemberAvatarFile] = useState(null);
  const [savingMember, setSavingMember] = useState(false);
  const [showMemberForm, setShowMemberForm] = useState(false);

  // Nosotros (About) State
  const [aboutRecord, setAboutRecord] = useState(null);
  const [aboutForm, setAboutForm] = useState({ title: '', description: '' });
  const [aboutImageFile, setAboutImageFile] = useState(null);
  const [loadingAbout, setLoadingAbout] = useState(true);
  const [savingAbout, setSavingAbout] = useState(false);

  // Feedback State
  const [feedback, setFeedback] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Load Proyectos
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await getProjects();
        if (cancelled) return;
        setProjects(toList(res.data));
      } catch (err) {
        if (!cancelled) {
          setErrorProjects(
            err?.response?.data?.detail ||
            err?.message ||
            'No se pudieron cargar los proyectos desde el servidor.'
          );
        }
      } finally {
        if (!cancelled) setLoadingProjects(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [reloadKey]);

  // Load Equipo
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await getTeam();
        if (cancelled) return;
        setTeam(toList(res.data));
      } catch (err) {
        // Silently capture or log
      } finally {
        if (!cancelled) setLoadingTeam(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [reloadKey]);

  // Load About
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await getAbout();
        if (cancelled) return;
        const list = toList(res.data);
        if (list.length > 0) {
          const first = list[0];
          setAboutRecord(first);
          setAboutForm({
            title: first.title || '',
            description: first.description || '',
          });
        }
      } catch (err) {
        // Silently capture
      } finally {
        if (!cancelled) setLoadingAbout(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [reloadKey]);

  // Eliminar Proyecto
  async function handleDeleteProject(project) {
    const confirmed = window.confirm(
      `¿Estás seguro de que deseás eliminar el proyecto "${project.title}"? Esta acción no se puede deshacer.`
    );
    if (!confirmed) return;

    setDeletingId(project.id);
    setFeedback(null);
    try {
      await deleteProject(project.id);
      setProjects((prev) => prev.filter((p) => p.id !== project.id));
      setFeedback({
        type: 'success',
        message: `El proyecto "${project.title}" fue eliminado exitosamente.`,
      });
    } catch (err) {
      setFeedback({
        type: 'danger',
        message:
          err?.response?.data?.detail ||
          err?.message ||
          'No se pudo eliminar el proyecto. Verificá tus permisos.',
      });
    } finally {
      setDeletingId(null);
    }
  }

  // Guardar Miembro de Equipo (Crear o Editar)
  async function handleSaveMember(e) {
    e.preventDefault();
    if (!memberForm.full_name.trim()) {
      setFeedback({ type: 'warning', message: 'El nombre del integrante es obligatorio.' });
      return;
    }
    setSavingMember(true);
    setFeedback(null);

    try {
      const data = new FormData();
      data.append('full_name', memberForm.full_name);
      data.append('role', memberForm.role || '');
      data.append('order', memberForm.order || 0);
      if (memberAvatarFile) {
        data.append('avatar', memberAvatarFile);
      }

      if (editingMember) {
        const res = await updateTeamMember(editingMember.id, data);
        setTeam((prev) => prev.map((m) => (m.id === editingMember.id ? res.data : m)));
        setFeedback({ type: 'success', message: 'Integrante de equipo actualizado con éxito.' });
      } else {
        const res = await createTeamMember(data);
        setTeam((prev) => [...prev, res.data].sort((a, b) => a.order - b.order));
        setFeedback({ type: 'success', message: 'Integrante agregado exitosamente.' });
      }

      setMemberForm({ full_name: '', role: '', order: 0 });
      setMemberAvatarFile(null);
      setEditingMember(null);
      setShowMemberForm(false);
    } catch (err) {
      setFeedback({
        type: 'danger',
        message: err?.response?.data?.detail || 'Error al guardar el integrante.',
      });
    } finally {
      setSavingMember(false);
    }
  }

  // Eliminar Miembro de Equipo
  async function handleDeleteMember(member) {
    const confirmed = window.confirm(`¿Eliminar a ${member.full_name} del equipo?`);
    if (!confirmed) return;

    setFeedback(null);
    try {
      await deleteTeamMember(member.id);
      setTeam((prev) => prev.filter((m) => m.id !== member.id));
      setFeedback({ type: 'success', message: `Integrante eliminado exitosamente.` });
    } catch (err) {
      setFeedback({ type: 'danger', message: 'Error al eliminar el integrante.' });
    }
  }

  function handleStartEditMember(member) {
    setEditingMember(member);
    setMemberForm({
      full_name: member.full_name || '',
      role: member.role || '',
      order: member.order || 0,
    });
    setMemberAvatarFile(null);
    setShowMemberForm(true);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  }

  function handleCancelMemberForm() {
    setEditingMember(null);
    setMemberForm({ full_name: '', role: '', order: 0 });
    setMemberAvatarFile(null);
    setShowMemberForm(false);
  }

  // Guardar Sección Nosotros (About)
  async function handleSaveAbout(e) {
    e.preventDefault();
    setSavingAbout(true);
    setFeedback(null);

    try {
      const data = new FormData();
      data.append('title', aboutForm.title);
      data.append('description', aboutForm.description);
      if (aboutImageFile) {
        data.append('image', aboutImageFile);
      }

      if (aboutRecord && aboutRecord.id) {
        const res = await updateAbout(aboutRecord.id, data);
        setAboutRecord(res.data);
        setFeedback({ type: 'success', message: 'Sección "Nosotros" actualizada con éxito.' });
      } else {
        const res = await createAbout(data);
        setAboutRecord(res.data);
        setFeedback({ type: 'success', message: 'Sección "Nosotros" guardada exitosamente.' });
      }
      setAboutImageFile(null);
    } catch (err) {
      setFeedback({
        type: 'danger',
        message: err?.response?.data?.detail || 'Error al guardar la sección institucional.',
      });
    } finally {
      setSavingAbout(false);
    }
  }

  // Filtro de proyectos
  const filteredProjects = useMemo(() => {
    const q = filterQuery.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter(
      (p) =>
        (p.title && p.title.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q))
    );
  }, [projects, filterQuery]);

  return (
    <div className="container py-4 py-md-5">
      {/* Header General */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4 pb-3 border-bottom">
        <div>
          <span className="badge bg-dark rounded-pill px-3 py-1 mb-2 text-uppercase letter-spacing-1">
            Panel de Administración
          </span>
          <h1 className="h3 fw-bold mb-1" style={{ color: 'var(--color-ink)' }}>
            Gestión Integral del Estudio
          </h1>
          <p className="text-muted small mb-0">
            Administra proyectos, catálogo técnico de planos, integrantes del equipo y contenido institucional.
          </p>
        </div>

        {activeTab === 'projects' && (
          <div>
            <Link
              to="/admin/proyectos/nuevo"
              className="btn btn-dark rounded-pill px-4 py-2 fw-semibold d-inline-flex align-items-center gap-2"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Nuevo Proyecto
            </Link>
          </div>
        )}

        {activeTab === 'team' && !showMemberForm && (
          <div>
            <button
              type="button"
              className="btn btn-dark rounded-pill px-4 py-2 fw-semibold d-inline-flex align-items-center gap-2"
              onClick={() => {
                setEditingMember(null);
                setMemberForm({ full_name: '', role: '', order: team.length });
                setMemberAvatarFile(null);
                setShowMemberForm(true);
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Nuevo Integrante
            </button>
          </div>
        )}
      </div>

      {/* Tabs de Navegación */}
      <ul className="nav nav-pills mb-4 gap-2 border-bottom pb-3">
        <li className="nav-item">
          <button
            type="button"
            className={`nav-link rounded-pill px-4 py-2 fw-semibold ${activeTab === 'projects' ? 'active bg-dark text-white' : 'text-dark'}`}
            onClick={() => setActiveTab('projects')}
          >
            Proyectos ({projects.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            type="button"
            className={`nav-link rounded-pill px-4 py-2 fw-semibold ${activeTab === 'team' ? 'active bg-dark text-white' : 'text-dark'}`}
            onClick={() => setActiveTab('team')}
          >
            Nuestro Equipo ({team.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            type="button"
            className={`nav-link rounded-pill px-4 py-2 fw-semibold ${activeTab === 'about' ? 'active bg-dark text-white' : 'text-dark'}`}
            onClick={() => setActiveTab('about')}
          >
            Sección Nosotros
          </button>
        </li>
      </ul>

      {/* Alertas y Feedback */}
      {feedback && (
        <div
          className={`alert alert-${feedback.type} alert-dismissible fade show rounded-4 mb-4`}
          role="alert"
        >
          {feedback.message}
          <button
            type="button"
            className="btn-close"
            onClick={() => setFeedback(null)}
            aria-label="Cerrar"
          />
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 1: PROYECTOS */}
      {/* ============================================================== */}
      {activeTab === 'projects' && (
        <>
          {loadingProjects ? (
            <div className="text-center py-5">
              <LoadingSpinner />
            </div>
          ) : errorProjects ? (
            <div className="alert alert-danger rounded-4 text-center py-4">
              <p className="mb-3 fw-medium">{errorProjects}</p>
              <button
                type="button"
                className="btn btn-outline-danger rounded-pill px-4"
                onClick={() => {
                  setLoadingProjects(true);
                  setErrorProjects(null);
                  setReloadKey((k) => k + 1);
                }}
              >
                Reintentar
              </button>
            </div>
          ) : projects.length === 0 ? (
            <div
              className="text-center py-5 px-3 rounded-4"
              style={{ background: '#fff', border: '1px dashed rgba(15,27,42,0.18)' }}
            >
              <div className="mb-3 text-muted">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
              </div>
              <h2 className="h5 fw-bold mb-2">No hay proyectos registrados</h2>
              <p className="text-muted small mb-4" style={{ maxWidth: '420px', margin: '0 auto' }}>
                Aún no has creado proyectos en el sistema. Comienza cargando tu primera obra.
              </p>
              <Link
                to="/admin/proyectos/nuevo"
                className="btn btn-dark rounded-pill px-4 py-2 fw-semibold"
              >
                Crear primer proyecto
              </Link>
            </div>
          ) : (
            <>
              <div className="d-flex justify-content-between align-items-center mb-3 gap-3 flex-wrap">
                <div className="position-relative" style={{ maxWidth: '320px', width: '100%' }}>
                  <input
                    type="text"
                    className="form-control rounded-pill ps-4 py-2"
                    placeholder="Filtrar por título o categoría..."
                    value={filterQuery}
                    onChange={(e) => setFilterQuery(e.target.value)}
                    style={{ fontSize: '0.85rem' }}
                  />
                  {filterQuery && (
                    <button
                      type="button"
                      className="btn btn-sm btn-link position-absolute end-0 top-50 translate-middle-y text-muted pe-3 text-decoration-none"
                      onClick={() => setFilterQuery('')}
                    >
                      ✕
                    </button>
                  )}
                </div>
                <span className="text-muted small">
                  Total: <strong>{filteredProjects.length}</strong> de {projects.length} proyectos
                </span>
              </div>

              <div
                className="table-responsive rounded-4 shadow-sm"
                style={{ background: '#fff', border: '1px solid rgba(15,27,42,0.08)' }}
              >
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr style={{ fontSize: '0.8rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                      <th scope="col" style={{ width: '80px', paddingLeft: '1.25rem' }}>Portada</th>
                      <th scope="col">Título</th>
                      <th scope="col">Categoría</th>
                      <th scope="col" className="d-none d-md-table-cell">Descripción</th>
                      <th scope="col" className="text-end" style={{ paddingRight: '1.25rem' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProjects.map((project) => {
                      const cover = resolveMediaUrl(project.cover_image || project.coverImage);
                      const isDeleting = deletingId === project.id;

                      return (
                        <tr key={project.id}>
                          <td style={{ paddingLeft: '1.25rem' }}>
                            {cover ? (
                              <img
                                src={cover}
                                alt=""
                                className="rounded-3"
                                style={{ width: '56px', height: '42px', objectFit: 'cover' }}
                              />
                            ) : (
                              <div
                                className="rounded-3 d-flex align-items-center justify-content-center text-muted"
                                style={{ width: '56px', height: '42px', background: '#f1f3f5', fontSize: '0.7rem' }}
                              >
                                Sin foto
                              </div>
                            )}
                          </td>
                          <td>
                            <span className="fw-semibold text-dark d-block">
                              {project.title}
                            </span>
                            <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                              ID: #{project.id} {project.profile_name ? ` · Estudio: ${project.profile_name}` : ''}
                            </span>
                          </td>
                          <td>
                            <span className="badge rounded-pill bg-light text-dark border px-2 py-1" style={{ fontSize: '0.75rem' }}>
                              {formatCategory(project.category)}
                            </span>
                          </td>
                          <td className="d-none d-md-table-cell text-muted small" style={{ maxWidth: '300px' }}>
                            <span className="text-truncate d-block">
                              {project.description || '—'}
                            </span>
                          </td>
                          <td className="text-end" style={{ paddingRight: '1.25rem' }}>
                            <div className="btn-group btn-group-sm">
                              <Link
                                to={`/proyecto/${project.id}`}
                                className="btn btn-outline-secondary rounded-start-pill px-3"
                                title="Ver en pantalla inmersiva"
                              >
                                Ver
                              </Link>
                              <Link
                                to={`/admin/proyectos/${project.id}/editar`}
                                className="btn btn-outline-dark px-3"
                                title="Editar proyecto"
                              >
                                Editar
                              </Link>
                              <button
                                type="button"
                                className="btn btn-outline-danger rounded-end-pill px-3"
                                onClick={() => handleDeleteProject(project)}
                                disabled={isDeleting}
                                title="Eliminar proyecto"
                              >
                                {isDeleting ? '...' : 'Eliminar'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}

      {/* ============================================================== */}
      {/* TAB 2: NUESTRO EQUIPO */}
      {/* ============================================================== */}
      {activeTab === 'team' && (
        <div>
          {/* Formulario de Alta / Edición de Integrante */}
          {showMemberForm && (
            <div className="card border-0 shadow-sm rounded-4 mb-4 p-4" style={{ background: '#fff' }}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="h5 fw-bold mb-0">
                  {editingMember ? `Editar Integrante: ${editingMember.full_name}` : 'Nuevo Integrante del Estudio'}
                </h2>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary rounded-pill px-3"
                  onClick={handleCancelMemberForm}
                >
                  Cancelar
                </button>
              </div>

              <form onSubmit={handleSaveMember}>
                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <label className="form-label small fw-semibold">Nombre y Apellido *</label>
                    <input
                      type="text"
                      className="form-control rounded-3"
                      placeholder="Ej. Arq. Sofía Bianchi"
                      value={memberForm.full_name}
                      onChange={(e) => setMemberForm({ ...memberForm, full_name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="col-12 col-md-4">
                    <label className="form-label small fw-semibold">Cargo / Especialidad *</label>
                    <input
                      type="text"
                      className="form-control rounded-3"
                      placeholder="Ej. Dirección de Obra & BIM"
                      value={memberForm.role}
                      onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value })}
                    />
                  </div>

                  <div className="col-12 col-md-2">
                    <label className="form-label small fw-semibold">Orden Visual</label>
                    <input
                      type="number"
                      className="form-control rounded-3"
                      value={memberForm.order}
                      onChange={(e) => setMemberForm({ ...memberForm, order: parseInt(e.target.value, 10) || 0 })}
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label small fw-semibold">Foto de Perfil (Avatar)</label>
                    <input
                      type="file"
                      accept="image/*"
                      className="form-control rounded-3"
                      onChange={(e) => setMemberAvatarFile(e.target.files[0] || null)}
                    />
                    {editingMember && editingMember.avatar && !memberAvatarFile && (
                      <div className="mt-2 d-flex align-items-center gap-2">
                        <img
                          src={resolveMediaUrl(editingMember.avatar)}
                          alt=""
                          className="rounded-circle"
                          style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                        />
                        <span className="small text-muted">Foto actual en uso</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="d-flex justify-content-end gap-2 mt-4">
                  <button
                    type="button"
                    className="btn btn-outline-secondary rounded-pill px-4"
                    onClick={handleCancelMemberForm}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-dark rounded-pill px-4"
                    disabled={savingMember}
                  >
                    {savingMember ? 'Guardando...' : editingMember ? 'Guardar Cambios' : 'Crear Integrante'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Grilla / Lista de Miembros Actuales */}
          {loadingTeam ? (
            <div className="text-center py-5">
              <LoadingSpinner />
            </div>
          ) : team.length === 0 ? (
            <div
              className="text-center py-5 px-3 rounded-4"
              style={{ background: '#fff', border: '1px dashed rgba(15,27,42,0.18)' }}
            >
              <h2 className="h5 fw-bold mb-2">No hay integrantes registrados en el equipo</h2>
              <p className="text-muted small mb-4" style={{ maxWidth: '420px', margin: '0 auto' }}>
                Configura los miembros que se presentarán en la sección "Equipo" de la Home.
              </p>
              <button
                type="button"
                className="btn btn-dark rounded-pill px-4 py-2 fw-semibold"
                onClick={() => {
                  setEditingMember(null);
                  setMemberForm({ full_name: '', role: '', order: 0 });
                  setMemberAvatarFile(null);
                  setShowMemberForm(true);
                }}
              >
                Cargar primer integrante
              </button>
            </div>
          ) : (
            <div
              className="table-responsive rounded-4 shadow-sm"
              style={{ background: '#fff', border: '1px solid rgba(15,27,42,0.08)' }}
            >
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr style={{ fontSize: '0.8rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                    <th scope="col" style={{ width: '70px', paddingLeft: '1.25rem' }}>Foto</th>
                    <th scope="col">Nombre y Apellido</th>
                    <th scope="col">Cargo / Rol</th>
                    <th scope="col" style={{ width: '90px' }}>Orden</th>
                    <th scope="col" className="text-end" style={{ paddingRight: '1.25rem' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {team.map((member) => {
                    const avatarUrl = resolveMediaUrl(member.avatar);
                    const initials = (member.full_name || '')
                      .split(' ')
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((p) => p[0]?.toUpperCase())
                      .join('') || 'EQ';

                    return (
                      <tr key={member.id}>
                        <td style={{ paddingLeft: '1.25rem' }}>
                          {avatarUrl ? (
                            <img
                              src={avatarUrl}
                              alt={member.full_name}
                              className="rounded-circle"
                              style={{ width: '42px', height: '42px', objectFit: 'cover' }}
                            />
                          ) : (
                            <div
                              className="rounded-circle d-flex align-items-center justify-content-center text-muted fw-bold"
                              style={{ width: '42px', height: '42px', background: '#e9ecef', fontSize: '0.8rem' }}
                            >
                              {initials}
                            </div>
                          )}
                        </td>
                        <td>
                          <span className="fw-semibold text-dark d-block">
                            {member.full_name}
                          </span>
                        </td>
                        <td>
                          <span className="text-muted small">
                            {member.role || '—'}
                          </span>
                        </td>
                        <td>
                          <span className="badge rounded-pill bg-light text-dark border px-2 py-1">
                            #{member.order}
                          </span>
                        </td>
                        <td className="text-end" style={{ paddingRight: '1.25rem' }}>
                          <div className="btn-group btn-group-sm">
                            <button
                              type="button"
                              className="btn btn-outline-dark rounded-start-pill px-3"
                              onClick={() => handleStartEditMember(member)}
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              className="btn btn-outline-danger rounded-end-pill px-3"
                              onClick={() => handleDeleteMember(member)}
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: SECCIÓN NOSOTROS */}
      {/* ============================================================== */}
      {activeTab === 'about' && (
        <div className="card border-0 shadow-sm rounded-4 p-4" style={{ background: '#fff' }}>
          <div className="mb-4">
            <h2 className="h5 fw-bold mb-1">Configuración de la Sección Institucional</h2>
            <p className="text-muted small mb-0">
              Modifica el título, el manifiesto y el boceto arquitectónico lateral que se muestra en la sección "Nosotros".
            </p>
          </div>

          {loadingAbout ? (
            <div className="text-center py-5">
              <LoadingSpinner />
            </div>
          ) : (
            <form onSubmit={handleSaveAbout}>
              <div className="row g-4">
                <div className="col-12">
                  <label className="form-label small fw-semibold">Título Principal *</label>
                  <input
                    type="text"
                    className="form-control rounded-3"
                    placeholder="Ej. DISEÑAMOS EL ESPACIO QUE TRANSFORMA TU VIDA"
                    value={aboutForm.title}
                    onChange={(e) => setAboutForm({ ...aboutForm, title: e.target.value })}
                    required
                  />
                </div>

                <div className="col-12">
                  <label className="form-label small fw-semibold">Cuerpo / Manifiesto del Estudio *</label>
                  <textarea
                    rows={6}
                    className="form-control rounded-3"
                    placeholder="Describe la visión, metodología y trayectoria del estudio..."
                    value={aboutForm.description}
                    onChange={(e) => setAboutForm({ ...aboutForm, description: e.target.value })}
                    required
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold">Boceto Arquitectónico Lateral (Imagen)</label>
                  <input
                    type="file"
                    accept="image/*"
                    className="form-control rounded-3"
                    onChange={(e) => setAboutImageFile(e.target.files[0] || null)}
                  />
                  <small className="text-muted d-block mt-1">
                    Formatos recomendados: JPG, PNG o WebP. Se adapta al marco técnico de la sección.
                  </small>
                </div>

                {aboutRecord && aboutRecord.image && (
                  <div className="col-12 col-md-6">
                    <label className="form-label small fw-semibold d-block">Imagen Actual</label>
                    <div
                      className="rounded-3 p-2 border d-inline-block"
                      style={{ background: '#f8f9fa', maxWidth: '240px' }}
                    >
                      <img
                        src={resolveMediaUrl(aboutRecord.image)}
                        alt="Boceto actual"
                        className="img-fluid rounded"
                        style={{ maxHeight: '160px', objectFit: 'contain' }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="d-flex justify-content-end mt-4 pt-3 border-top">
                <button
                  type="submit"
                  className="btn btn-dark rounded-pill px-4 py-2 fw-semibold"
                  disabled={savingAbout}
                >
                  {savingAbout ? 'Guardando cambios...' : 'Guardar Información Institucional'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
