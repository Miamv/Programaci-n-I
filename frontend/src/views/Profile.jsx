import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getProfile, updateProfile } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function formatDate(iso) {
  if (!iso) return 'No disponible';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}

export default function Profile() {
  const { user, updateUser } = useAuth();

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
  });

  const [accountMeta, setAccountMeta] = useState({
    username: user?.username || '',
    role: user?.role || 'viewer',
    date_joined: null,
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        const res = await getProfile();
        if (cancelled) return;
        const data = res.data;
        setFormData({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          email: data.email || '',
        });
        setAccountMeta({
          username: data.username || '',
          role: data.role || 'viewer',
          date_joined: data.date_joined || null,
        });
      } catch (err) {
        if (!cancelled) {
          setFeedback({
            type: 'danger',
            message:
              err?.response?.data?.detail ||
              err?.message ||
              'No se pudieron cargar los datos de la cuenta.',
          });
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFeedback(null);
    setFieldErrors({});

    const errors = {};
    const cleanEmail = formData.email.trim();

    if (!cleanEmail) {
      errors.email = 'El correo electrónico es obligatorio.';
    } else if (!EMAIL_RE.test(cleanEmail)) {
      errors.email = 'Ingresá un correo electrónico válido.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: cleanEmail,
      };

      const res = await updateProfile(payload);
      const updated = res.data;

      updateUser({
        first_name: updated.first_name,
        last_name: updated.last_name,
        email: updated.email,
      });

      setFeedback({
        type: 'success',
        message: 'Tus datos personales fueron actualizados correctamente.',
      });
    } catch (err) {
      const data = err?.response?.data;
      if (err?.response?.status === 400 && data) {
        const backendErrors = {};
        if (data.email) {
          backendErrors.email = Array.isArray(data.email) ? data.email[0] : data.email;
        }
        if (data.first_name) {
          backendErrors.first_name = Array.isArray(data.first_name) ? data.first_name[0] : data.first_name;
        }
        if (data.last_name) {
          backendErrors.last_name = Array.isArray(data.last_name) ? data.last_name[0] : data.last_name;
        }
        setFieldErrors(backendErrors);
        setFeedback({
          type: 'danger',
          message:
            data.non_field_errors?.[0] ||
            data.detail ||
            'Por favor, revisá los errores en el formulario.',
        });
      } else {
        setFeedback({
          type: 'danger',
          message:
            err?.response?.data?.detail ||
            err?.message ||
            'Ocurrió un error al intentar guardar los cambios.',
        });
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5" style={{ minHeight: '60vh' }}>
        <LoadingSpinner />
      </div>
    );
  }

  const role = accountMeta.role.toLowerCase();
  const isAdminOrOwner = role === 'admin' || role === 'owner';

  return (
    <div className="container py-5 my-md-4" style={{ maxWidth: '820px' }}>
      {/* Encabezado */}
      <div className="flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4 pb-3 border-bottom d-flex">
        <div>
          <span
            className="text-uppercase fw-bold text-muted small"
            style={{ letterSpacing: '0.12em' }}
          >
            Cuenta de Usuario
          </span>
          <h1 className="h3 fw-bold mb-1" style={{ color: 'var(--color-ink)' }}>
            Mi Perfil
          </h1>
          <p className="text-muted small mb-0">
            Administrá tus datos personales y revisá los accesos a la plataforma.
          </p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/solicitudes" className="btn btn-outline-dark btn-sm rounded-pill px-3">
            Mis Solicitudes
          </Link>
          {isAdminOrOwner && (
            <Link to="/admin" className="btn btn-dark btn-sm rounded-pill px-3">
              Panel Admin
            </Link>
          )}
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
            aria-label="Cerrar"
            onClick={() => setFeedback(null)}
          />
        </div>
      )}

      <div className="row g-4">
        {/* Tarjeta de Resumen de Cuenta */}
        <div className="col-12 col-md-5">
          <div
            className="p-4 rounded-4 h-100"
            style={{
              background: '#fff',
              border: '1px solid rgba(15, 27, 42, 0.08)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div className="text-center mb-4">
              <div
                className="d-inline-flex justify-content-center align-items-center rounded-circle mb-3 fw-bold text-white text-uppercase"
                style={{
                  width: '72px',
                  height: '72px',
                  background: 'var(--color-ink)',
                  fontSize: '1.5rem',
                  letterSpacing: '0.05em',
                }}
              >
                {accountMeta.username.slice(0, 2)}
              </div>
              <h2 className="h5 fw-bold mb-1 text-capitalize" style={{ color: 'var(--color-ink)' }}>
                {accountMeta.username}
              </h2>
              <span
                className="badge rounded-pill px-3 py-1 text-uppercase fw-bold"
                style={{
                  background: isAdminOrOwner ? '#0f1b2a' : '#e9ecef',
                  color: isAdminOrOwner ? '#fff' : '#495057',
                  fontSize: '0.7rem',
                  letterSpacing: '0.08em',
                }}
              >
                {accountMeta.role}
              </span>
            </div>

            <hr className="my-3 opacity-10" />

            <div className="small text-muted d-flex flex-column gap-2">
              <div>
                <strong className="text-dark d-block">Identificador de cuenta:</strong>
                <span>@{accountMeta.username}</span>
              </div>
              <div>
                <strong className="text-dark d-block">Tipo de permisos:</strong>
                <span className="text-capitalize">
                  {role === 'admin'
                    ? 'Acceso total a proyectos y administración del sistema'
                    : role === 'owner'
                    ? 'Propietario de perfil y gestión de proyectos asociados'
                    : role === 'collaborator'
                    ? 'Colaborador técnico de proyectos'
                    : 'Visor registrado (exploración y envío de solicitudes)'}
                </span>
              </div>
              {accountMeta.date_joined && (
                <div>
                  <strong className="text-dark d-block">Miembro desde:</strong>
                  <span>{formatDate(accountMeta.date_joined)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Formulario de Edición */}
        <div className="col-12 col-md-7">
          <div
            className="p-4 p-md-5 rounded-4"
            style={{
              background: '#fff',
              border: '1px solid rgba(15, 27, 42, 0.08)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <h3 className="h6 fw-bold mb-3 text-uppercase" style={{ letterSpacing: '0.08em', color: 'var(--color-ink)' }}>
              Datos Personales
            </h3>

            <form onSubmit={handleSubmit} noValidate>
              <div className="mb-3">
                <label htmlFor="username" className="form-label small fw-semibold text-muted">
                  Nombre de Usuario (no editable)
                </label>
                <input
                  type="text"
                  id="username"
                  className="form-control rounded-pill bg-light"
                  value={accountMeta.username}
                  disabled
                  readOnly
                />
              </div>

              <div className="row g-3 mb-3">
                <div className="col-12 col-sm-6">
                  <label htmlFor="first_name" className="form-label small fw-semibold">
                    Nombre
                  </label>
                  <input
                    type="text"
                    id="first_name"
                    name="first_name"
                    className={`form-control rounded-pill ${fieldErrors.first_name ? 'is-invalid' : ''}`}
                    placeholder="Tu nombre"
                    value={formData.first_name}
                    onChange={handleChange}
                  />
                  {fieldErrors.first_name && (
                    <div className="invalid-feedback">{fieldErrors.first_name}</div>
                  )}
                </div>

                <div className="col-12 col-sm-6">
                  <label htmlFor="last_name" className="form-label small fw-semibold">
                    Apellido
                  </label>
                  <input
                    type="text"
                    id="last_name"
                    name="last_name"
                    className={`form-control rounded-pill ${fieldErrors.last_name ? 'is-invalid' : ''}`}
                    placeholder="Tu apellido"
                    value={formData.last_name}
                    onChange={handleChange}
                  />
                  {fieldErrors.last_name && (
                    <div className="invalid-feedback">{fieldErrors.last_name}</div>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="email" className="form-label small fw-semibold">
                  Correo Electrónico <span className="text-danger">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className={`form-control rounded-pill ${fieldErrors.email ? 'is-invalid' : ''}`}
                  placeholder="ejemplo@estudio.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                {fieldErrors.email && (
                  <div className="invalid-feedback">{fieldErrors.email}</div>
                )}
                <div className="form-text small">
                  Se utilizará para notificaciones de tus solicitudes y presupuestos.
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2 pt-2">
                <button
                  type="submit"
                  className="btn btn-dark rounded-pill px-4 fw-semibold"
                  disabled={submitting}
                >
                  {submitting ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
