import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProjects, deleteProject, resolveMediaUrl } from '../services/api';
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

export default function AdminDashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [filterQuery, setFilterQuery] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  async function fetchProjects() {
    setLoading(true);
    setError(null);
    try {
      const res = await getProjects();
      const data = Array.isArray(res.data) ? res.data : (res.data?.results ?? []);
      setProjects(data);
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
        err?.message ||
        'No se pudieron cargar los proyectos desde el servidor.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProjects();
  }, []);

  async function handleDelete(project) {
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

  const filtered = useMemo(() => {
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
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4 pb-3 border-bottom">
        <div>
          <span className="badge bg-dark rounded-pill px-3 py-1 mb-2 text-uppercase letter-spacing-1">
            Administración
          </span>
          <h1 className="h3 fw-bold mb-1" style={{ color: 'var(--color-ink)' }}>
            Gestión de Proyectos
          </h1>
          <p className="text-muted small mb-0">
            Panel para crear, actualizar y remover proyectos del catálogo público.
          </p>
        </div>
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
      </div>

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

      {loading ? (
        <div className="text-center py-5">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <div className="alert alert-danger rounded-4 text-center py-4">
          <p className="mb-3 fw-medium">{error}</p>
          <button
            type="button"
            className="btn btn-outline-danger rounded-pill px-4"
            onClick={fetchProjects}
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
              Total: <strong>{filtered.length}</strong> de {projects.length} proyectos
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
                {filtered.map((project) => {
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
                          ID: #{project.id}
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
                            onClick={() => handleDelete(project)}
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
    </div>
  );
}
