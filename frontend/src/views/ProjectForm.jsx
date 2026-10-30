import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getProject, createProject, updateProject, getProfiles } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const CATEGORIES = [
  { value: 'architecture', label: 'Arquitectura' },
  { value: 'design', label: 'Diseño' },
  { value: 'interior_design', label: 'Diseño Interior' },
  { value: 'photography', label: 'Fotografía' },
  { value: 'render', label: 'Render' },
  { value: 'other', label: 'Otro' },
];

export default function ProjectForm() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'architecture',
    profile: '',
  });

  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    let cancelled = false;

    async function initialize() {
      setLoading(true);
      setError(null);
      try {
        const [profilesRes, projectRes] = await Promise.all([
          getProfiles(),
          isEditing ? getProject(id) : Promise.resolve(null),
        ]);

        if (cancelled) return;

        const profilesData = Array.isArray(profilesRes.data)
          ? profilesRes.data
          : (profilesRes.data?.results ?? []);
        setProfiles(profilesData);

        if (isEditing && projectRes) {
          const p = projectRes.data;
          setFormData({
            title: p.title || '',
            description: p.description || '',
            category: p.category || 'architecture',
            profile: p.profile || (profilesData[0]?.id ?? ''),
          });
        } else if (profilesData.length > 0) {
          setFormData((prev) => ({
            ...prev,
            profile: prev.profile || profilesData[0].id,
          }));
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err?.response?.data?.detail ||
            err?.message ||
            'Error al cargar los datos del formulario.'
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    initialize();

    return () => {
      cancelled = true;
    };
  }, [id, isEditing]);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const errors = {};
    if (!formData.title.trim()) errors.title = 'El título es obligatorio.';
    if (!formData.description.trim()) errors.description = 'La descripción es obligatoria.';
    if (!formData.category) errors.category = 'Seleccioná una categoría.';
    if (!formData.profile) errors.profile = 'Debés asociar el proyecto a un perfil profesional.';

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setSubmitting(true);
    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      category: formData.category,
      profile: Number(formData.profile),
    };

    try {
      if (isEditing) {
        await updateProject(id, payload);
      } else {
        await createProject(payload);
      }
      navigate('/admin', {
        state: {
          feedback: `Proyecto "${formData.title}" ${isEditing ? 'actualizado' : 'creado'} con éxito.`,
        },
      });
    } catch (err) {
      if (err.response?.status === 400 && err.response.data) {
        setFieldErrors(err.response.data);
      } else if (err.response?.status === 403) {
        setError('No tenés permisos para realizar esta acción sobre este perfil de proyecto.');
      } else {
        setError(
          err.response?.data?.detail ||
          err.message ||
          'Ocurrió un error inesperado al guardar el proyecto.'
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container py-4 py-md-5">
      <div className="mx-auto" style={{ maxWidth: '680px' }}>
        <nav aria-label="breadcrumb" className="mb-3">
          <ol className="breadcrumb small">
            <li className="breadcrumb-item">
              <Link to="/admin" className="text-decoration-none text-muted">
                Administración
              </Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              {isEditing ? 'Editar Proyecto' : 'Nuevo Proyecto'}
            </li>
          </ol>
        </nav>

        <div
          className="p-4 p-md-5 rounded-4 shadow-sm"
          style={{ background: '#fff', border: '1px solid rgba(15,27,42,0.08)' }}
        >
          <div className="mb-4 pb-2 border-bottom">
            <h1 className="h4 fw-bold mb-1" style={{ color: 'var(--color-ink)' }}>
              {isEditing ? `Editar: ${formData.title || 'Proyecto'}` : 'Crear Nuevo Proyecto'}
            </h1>
            <p className="text-muted small mb-0">
              Completá los datos del proyecto para exponerlo en el catálogo y la vista inmersiva.
            </p>
          </div>

          {error && (
            <div className="alert alert-danger rounded-3 small mb-4" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-3">
              <label htmlFor="title" className="form-label small fw-semibold">
                Título del Proyecto <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                className={`form-control rounded-3 ${fieldErrors.title ? 'is-invalid' : ''}`}
                value={formData.title}
                onChange={handleChange}
                placeholder="Ej. Casa Bosque, Módulo Chakal"
                disabled={submitting}
                required
              />
              {fieldErrors.title && (
                <div className="invalid-feedback small">
                  {Array.isArray(fieldErrors.title) ? fieldErrors.title.join(' ') : fieldErrors.title}
                </div>
              )}
            </div>

            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label htmlFor="category" className="form-label small fw-semibold">
                  Categoría <span className="text-danger">*</span>
                </label>
                <select
                  id="category"
                  name="category"
                  className={`form-select rounded-3 ${fieldErrors.category ? 'is-invalid' : ''}`}
                  value={formData.category}
                  onChange={handleChange}
                  disabled={submitting}
                  required
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
                {fieldErrors.category && (
                  <div className="invalid-feedback small">
                    {Array.isArray(fieldErrors.category)
                      ? fieldErrors.category.join(' ')
                      : fieldErrors.category}
                  </div>
                )}
              </div>

              <div className="col-md-6">
                <label htmlFor="profile" className="form-label small fw-semibold">
                  Perfil del Estudio <span className="text-danger">*</span>
                </label>
                <select
                  id="profile"
                  name="profile"
                  className={`form-select rounded-3 ${fieldErrors.profile ? 'is-invalid' : ''}`}
                  value={formData.profile}
                  onChange={handleChange}
                  disabled={submitting}
                  required
                >
                  {profiles.length === 0 ? (
                    <option value="">No hay perfiles disponibles</option>
                  ) : (
                    profiles.map((pr) => (
                      <option key={pr.id} value={pr.id}>
                        {pr.name} (ID #{pr.id})
                      </option>
                    ))
                  )}
                </select>
                {fieldErrors.profile && (
                  <div className="invalid-feedback small">
                    {Array.isArray(fieldErrors.profile)
                      ? fieldErrors.profile.join(' ')
                      : fieldErrors.profile}
                  </div>
                )}
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="description" className="form-label small fw-semibold">
                Memoria Descriptiva / Descripción <span className="text-danger">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                rows="5"
                className={`form-control rounded-3 ${fieldErrors.description ? 'is-invalid' : ''}`}
                value={formData.description}
                onChange={handleChange}
                placeholder="Explicá las características espaciales, materialidad y concepto arquitectónico..."
                disabled={submitting}
                required
              />
              {fieldErrors.description && (
                <div className="invalid-feedback small">
                  {Array.isArray(fieldErrors.description)
                    ? fieldErrors.description.join(' ')
                    : fieldErrors.description}
                </div>
              )}
            </div>

            <div className="d-flex justify-content-end align-items-center gap-2 pt-2 border-top">
              <Link
                to="/admin"
                className="btn btn-outline-secondary rounded-pill px-4"
                tabIndex={submitting ? -1 : 0}
              >
                Cancelar
              </Link>
              <button
                type="submit"
                className="btn btn-dark rounded-pill px-4 fw-semibold d-inline-flex align-items-center gap-2"
                disabled={submitting}
              >
                {submitting && (
                  <span
                    className="spinner-border spinner-border-sm"
                    role="status"
                    aria-hidden="true"
                  />
                )}
                {isEditing ? 'Actualizar Proyecto' : 'Guardar Proyecto'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
