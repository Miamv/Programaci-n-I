import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getProfiles, getProject, sendContact } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const SERVICES = [
  'Proyecto Arquitectónico Integral',
  'Diseño de Interiores y Equipamiento',
  'Documentación Técnica y Planos Ejecutivos',
  'Renders y Visualización 3D',
  'Asesoramiento y Dirección de Obra',
  'Otro requerimiento personalizado',
];

export default function QuoteRequest() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('project');

  const [profiles, setProfiles] = useState([]);
  const [referencedProject, setReferencedProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successData, setSuccessData] = useState(null);

  const [formData, setFormData] = useState({
    profile: '',
    name: user?.username ? (user.username.charAt(0).toUpperCase() + user.username.slice(1)) : '',
    email: user?.email || '',
    serviceType: SERVICES[0],
    scope: '',
    message: '',
  });

  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const [profilesRes, projRes] = await Promise.all([
          getProfiles(),
          projectId ? getProject(projectId) : Promise.resolve(null),
        ]);

        if (cancelled) return;

        const pData = Array.isArray(profilesRes.data) ? profilesRes.data : (profilesRes.data?.results ?? []);
        setProfiles(pData);

        if (projRes?.data) {
          setReferencedProject(projRes.data);
          // Si el proyecto tiene un profile asociado, preseleccionarlo
          if (projRes.data.profile) {
            setFormData((prev) => ({ ...prev, profile: projRes.data.profile }));
          }
        } else if (pData.length > 0) {
          setFormData((prev) => ({ ...prev, profile: prev.profile || pData[0].id }));
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err?.response?.data?.detail ||
            err?.message ||
            'No se pudieron cargar los datos necesarios para iniciar la solicitud.'
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    init();

    return () => {
      cancelled = true;
    };
  }, [projectId]);

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
    if (!formData.profile) errors.profile = 'Seleccioná el profesional o estudio destinatario.';
    if (!formData.name.trim()) errors.name = 'Ingresá tu nombre o empresa.';
    if (!formData.email.trim()) errors.email = 'El correo electrónico es obligatorio.';
    if (!formData.message.trim()) errors.message = 'Describí brevemente tu encargo o consulta.';

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      const compiledMessage = [
        `[Servicio requerido]: ${formData.serviceType}`,
        referencedProject ? `[Proyecto de referencia]: ${referencedProject.title} (#${referencedProject.id})` : null,
        formData.scope ? `[Alcance / Plazos estimados]: ${formData.scope}` : null,
        `\n[Detalle del requerimiento]:\n${formData.message.trim()}`,
      ]
        .filter(Boolean)
        .join('\n');

      const payload = {
        profile: Number(formData.profile),
        name: formData.name.trim(),
        email: formData.email.trim(),
        message: compiledMessage,
      };

      const res = await sendContact(payload);
      setSuccessData({
        ...res.data,
        profileObj: profiles.find((p) => p.id === Number(formData.profile)),
      });
    } catch (err) {
      const data = err?.response?.data;
      if (err?.response?.status === 400 && data) {
        const bErrors = {};
        if (data.name) bErrors.name = Array.isArray(data.name) ? data.name[0] : data.name;
        if (data.email) bErrors.email = Array.isArray(data.email) ? data.email[0] : data.email;
        if (data.profile) bErrors.profile = Array.isArray(data.profile) ? data.profile[0] : data.profile;
        if (data.message) bErrors.message = Array.isArray(data.message) ? data.message[0] : data.message;
        setFieldErrors(bErrors);
        setError(data.non_field_errors?.[0] || 'Por favor, verificá los datos ingresados.');
      } else {
        setError(
          err?.response?.data?.detail ||
          err?.message ||
          'No se pudo enviar la solicitud. Por favor, intentá nuevamente.'
        );
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

  // Pantalla de Confirmación de Solicitud (Checkout exitoso)
  if (successData) {
    return (
      <div className="container py-5 my-md-5" style={{ maxWidth: '640px' }}>
        <div
          className="p-4 p-md-5 text-center rounded-4"
          style={{
            background: '#fff',
            border: '1px solid rgba(15, 27, 42, 0.1)',
            boxShadow: 'var(--shadow-md, 0 12px 30px rgba(0,0,0,0.06))',
          }}
        >
          <div
            className="d-inline-flex justify-content-center align-items-center rounded-circle mb-3"
            style={{ width: '64px', height: '64px', background: '#d3f9d8', color: '#2b8a3e' }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          <span
            className="badge rounded-pill mb-2 px-3 py-1 fw-bold text-uppercase"
            style={{ background: '#e9ecef', color: '#495057', fontSize: '0.72rem', letterSpacing: '0.08em' }}
          >
            SOLICITUD REGISTRADA #{successData.id}
          </span>

          <h2 className="h4 fw-bold mb-3" style={{ color: 'var(--color-ink)' }}>
            ¡Tu solicitud fue enviada con éxito!
          </h2>

          <p className="text-muted small mb-4" style={{ lineHeight: 1.6 }}>
            El equipo de <strong>{successData.profileObj?.name || 'Estudio Vértice'}</strong> ha recibido tu
            requerimiento. Nos contactaremos a la brevedad al correo <strong>{formData.email}</strong>.
          </p>

          <div className="d-flex flex-column flex-sm-row justify-content-center gap-2 pt-2">
            <Link to="/solicitudes" className="btn btn-dark rounded-pill px-4 fw-semibold">
              Ver mis solicitudes
            </Link>
            <button
              type="button"
              className="btn btn-outline-dark rounded-pill px-4 fw-semibold"
              onClick={() => navigate('/')}
            >
              Volver al inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5 my-md-4" style={{ maxWidth: '820px' }}>
      {/* Encabezado */}
      <div className="mb-4 pb-3 border-bottom">
        <Link
          to="/"
          className="text-decoration-none small text-muted d-inline-flex align-items-center gap-1 mb-2"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Volver al portfolio
        </Link>
        <h1 className="h3 fw-bold mb-1" style={{ color: 'var(--color-ink)' }}>
          Solicitud de Presupuesto y Contratación
        </h1>
        <p className="text-muted small mb-0">
          Completá el siguiente formulario con las especificaciones de tu proyecto para recibir una cotización formal.
        </p>
      </div>

      {referencedProject && (
        <div className="alert alert-secondary d-flex align-items-center gap-3 rounded-4 mb-4">
          <div className="small">
            <span className="fw-bold d-block">Proyecto de referencia:</span>
            <span>{referencedProject.title}</span> ({referencedProject.category})
          </div>
        </div>
      )}

      {error && (
        <div className="alert alert-danger rounded-4 mb-4" role="alert">
          {error}
        </div>
      )}

      <div
        className="p-4 p-md-5 rounded-4"
        style={{
          background: '#fff',
          border: '1px solid rgba(15, 27, 42, 0.08)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <form onSubmit={handleSubmit} noValidate>
          <div className="row g-3 mb-3">
            <div className="col-12 col-md-6">
              <label htmlFor="profile" className="form-label small fw-semibold">
                Destinatario / Estudio <span className="text-danger">*</span>
              </label>
              <select
                id="profile"
                name="profile"
                className={`form-select rounded-pill ${fieldErrors.profile ? 'is-invalid' : ''}`}
                value={formData.profile}
                onChange={handleChange}
                required
              >
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.specialty ? `— ${p.specialty}` : ''}
                  </option>
                ))}
              </select>
              {fieldErrors.profile && (
                <div className="invalid-feedback">{fieldErrors.profile}</div>
              )}
            </div>

            <div className="col-12 col-md-6">
              <label htmlFor="serviceType" className="form-label small fw-semibold">
                Tipo de Servicio Solicitado
              </label>
              <select
                id="serviceType"
                name="serviceType"
                className="form-select rounded-pill"
                value={formData.serviceType}
                onChange={handleChange}
              >
                {SERVICES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="row g-3 mb-3">
            <div className="col-12 col-md-6">
              <label htmlFor="name" className="form-label small fw-semibold">
                Nombre y Apellido / Organización <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className={`form-control rounded-pill ${fieldErrors.name ? 'is-invalid' : ''}`}
                placeholder="Tu nombre completo"
                value={formData.name}
                onChange={handleChange}
                required
              />
              {fieldErrors.name && (
                <div className="invalid-feedback">{fieldErrors.name}</div>
              )}
            </div>

            <div className="col-12 col-md-6">
              <label htmlFor="email" className="form-label small fw-semibold">
                Correo Electrónico de Contacto <span className="text-danger">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className={`form-control rounded-pill ${fieldErrors.email ? 'is-invalid' : ''}`}
                placeholder="tuemail@ejemplo.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
              {fieldErrors.email && (
                <div className="invalid-feedback">{fieldErrors.email}</div>
              )}
            </div>
          </div>

          <div className="mb-3">
            <label htmlFor="scope" className="form-label small fw-semibold">
              Plazo o Superficie Estimada (Opcional)
            </label>
            <input
              type="text"
              id="scope"
              name="scope"
              className="form-control rounded-pill"
              placeholder="Ej: Obra de 250 m², entrega estimada en 4 meses"
              value={formData.scope}
              onChange={handleChange}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="message" className="form-label small fw-semibold">
              Descripción del Encargo o Necesidades <span className="text-danger">*</span>
            </label>
            <textarea
              id="message"
              name="message"
              rows={5}
              className={`form-control rounded-4 ${fieldErrors.message ? 'is-invalid' : ''}`}
              placeholder="Detallá los requerimientos arquitectónicos, ubicación del lote, objetivos y cualquier consulta específica..."
              value={formData.message}
              onChange={handleChange}
              required
            />
            {fieldErrors.message && (
              <div className="invalid-feedback">{fieldErrors.message}</div>
            )}
          </div>

          <div className="d-flex justify-content-end gap-2 pt-2">
            <button
              type="button"
              className="btn btn-outline-secondary rounded-pill px-4"
              onClick={() => navigate(-1)}
              disabled={submitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-dark rounded-pill px-4 fw-semibold"
              disabled={submitting}
            >
              {submitting ? 'Enviando solicitud...' : 'Enviar Solicitud'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
