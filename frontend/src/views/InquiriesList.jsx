import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getContacts, deleteContact } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

function formatDate(iso) {
  if (!iso) return 'Reciente';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export default function InquiriesList() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  const role = (user?.role || '').toLowerCase();
  const isAdminOrOwner = role === 'admin' || role === 'owner';

  useEffect(() => {
    let cancelled = false;

    async function loadContacts() {
      try {
        const res = await getContacts();
        if (cancelled) return;
        const data = Array.isArray(res.data) ? res.data : (res.data?.results ?? []);
        setContacts(data);
      } catch (err) {
        if (!cancelled) {
          setError(
            err?.response?.data?.detail ||
            err?.message ||
            'No se pudo cargar el historial de solicitudes.'
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadContacts();

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  function handleRetry() {
    setLoading(true);
    setError(null);
    setReloadKey((k) => k + 1);
  }

  async function handleDelete(contact) {
    const confirmed = window.confirm(
      `¿Deseás eliminar la solicitud de ${contact.name}? Esta acción no se puede deshacer.`
    );
    if (!confirmed) return;

    setDeletingId(contact.id);
    setFeedback(null);
    try {
      await deleteContact(contact.id);
      setContacts((prev) => prev.filter((c) => c.id !== contact.id));
      setFeedback({
        type: 'success',
        message: 'La solicitud fue eliminada correctamente.',
      });
      if (selectedMessage?.id === contact.id) {
        setSelectedMessage(null);
      }
    } catch (err) {
      setFeedback({
        type: 'danger',
        message:
          err?.response?.data?.detail ||
          err?.message ||
          'No se pudo eliminar la solicitud.',
      });
    } finally {
      setDeletingId(null);
    }
  }

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return contacts;
    return contacts.filter(
      (c) =>
        (c.name && c.name.toLowerCase().includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        (c.profile_name && c.profile_name.toLowerCase().includes(q)) ||
        (c.message && c.message.toLowerCase().includes(q))
    );
  }, [contacts, searchQuery]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5" style={{ minHeight: '60vh' }}>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container py-5 my-md-4">
      {/* Encabezado */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4 pb-3 border-bottom">
        <div>
          <span
            className="text-uppercase fw-bold text-muted small"
            style={{ letterSpacing: '0.12em' }}
          >
            {isAdminOrOwner ? 'Panel de Consultas' : 'Mis Gestiones'}
          </span>
          <h1 className="h3 fw-bold mb-1" style={{ color: 'var(--color-ink)' }}>
            {isAdminOrOwner ? 'Bandeja de Solicitudes y Contacto' : 'Historial de Solicitudes'}
          </h1>
          <p className="text-muted small mb-0">
            {isAdminOrOwner
              ? 'Consultas y pedidos de presupuesto recibidos por el estudio.'
              : 'Seguimiento de tus solicitudes de presupuesto y proyectos enviados.'}
          </p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/solicitud" className="btn btn-dark btn-sm rounded-pill px-3 fw-semibold">
            + Nueva Solicitud
          </Link>
          <Link to="/perfil" className="btn btn-outline-dark btn-sm rounded-pill px-3">
            Mi Perfil
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
            aria-label="Cerrar"
            onClick={() => setFeedback(null)}
          />
        </div>
      )}

      {error ? (
        <div
          className="p-5 text-center rounded-4"
          style={{ background: '#fff', border: '1px solid rgba(15, 27, 42, 0.1)' }}
        >
          <h2 className="h5 fw-bold text-danger mb-2">Error de conexión</h2>
          <p className="text-muted small mb-3">{error}</p>
          <button
            type="button"
            className="btn btn-dark rounded-pill px-4"
            onClick={handleRetry}
          >
            Reintentar
          </button>
        </div>
      ) : (
        <>
          {/* Barra de Filtro */}
          {contacts.length > 0 && (
            <div className="mb-4">
              <input
                type="text"
                className="form-control rounded-pill px-4 py-2"
                style={{ maxWidth: '380px' }}
                placeholder="Buscar por nombre, correo o contenido..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          )}

          {contacts.length === 0 ? (
            <div
              className="p-5 text-center rounded-4"
              style={{
                background: '#fff',
                border: '1px dashed rgba(15, 27, 42, 0.2)',
              }}
            >
              <div
                className="d-inline-flex justify-content-center align-items-center rounded-circle mb-3"
                style={{ width: '56px', height: '56px', background: '#f1f3f5', color: '#495057' }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <h2 className="h5 fw-bold mb-2" style={{ color: 'var(--color-ink)' }}>
                No hay solicitudes registradas
              </h2>
              <p className="text-muted small mb-4" style={{ maxWidth: '420px', margin: '0 auto' }}>
                {isAdminOrOwner
                  ? 'Aún no se han recibido consultas a través del formulario de contacto.'
                  : 'Aún no enviaste ninguna solicitud de presupuesto o proyecto. Podés iniciar una cuando quieras.'}
              </p>
              <Link to="/solicitud" className="btn btn-dark rounded-pill px-4 fw-semibold">
                Iniciar Solicitud de Presupuesto
              </Link>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-4 text-center text-muted">
              No se encontraron solicitudes que coincidan con &quot;{searchQuery}&quot;.
            </div>
          ) : (
            <div
              className="table-responsive rounded-4 shadow-sm"
              style={{ background: '#fff', border: '1px solid rgba(15, 27, 42, 0.08)' }}
            >
              <table className="table table-hover align-middle mb-0">
                <thead style={{ background: '#f8f9fa' }}>
                  <tr className="small text-uppercase text-muted" style={{ letterSpacing: '0.06em' }}>
                    <th scope="col" className="py-3 px-3">Fecha</th>
                    <th scope="col" className="py-3 px-3">Destinatario</th>
                    <th scope="col" className="py-3 px-3">Remitente</th>
                    <th scope="col" className="py-3 px-3">Mensaje</th>
                    <th scope="col" className="py-3 px-3 text-center">Estado</th>
                    <th scope="col" className="py-3 px-3 text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => (
                    <tr key={c.id}>
                      <td className="px-3 small text-muted text-nowrap">
                        {formatDate(c.created_at)}
                      </td>
                      <td className="px-3 fw-semibold small text-nowrap">
                        {c.profile_name || `Perfil #${c.profile}`}
                      </td>
                      <td className="px-3">
                        <div className="fw-semibold small">{c.name}</div>
                        <div className="small text-muted">{c.email}</div>
                      </td>
                      <td className="px-3 small text-muted" style={{ maxWidth: '300px' }}>
                        <div
                          className="text-truncate"
                          title={c.message}
                          style={{ cursor: 'pointer' }}
                          onClick={() => setSelectedMessage(c)}
                        >
                          {c.message}
                        </div>
                      </td>
                      <td className="px-3 text-center">
                        <span
                          className="badge rounded-pill px-2 py-1"
                          style={{
                            background: '#d3f9d8',
                            color: '#2b8a3e',
                            fontSize: '0.68rem',
                            letterSpacing: '0.04em',
                          }}
                        >
                          {isAdminOrOwner ? 'RECIBIDA' : 'ENVIADA'}
                        </span>
                      </td>
                      <td className="px-3 text-end text-nowrap">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-dark rounded-pill px-3 me-1"
                          onClick={() => setSelectedMessage(c)}
                        >
                          Ver
                        </button>
                        {isAdminOrOwner && (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger rounded-pill px-2"
                            disabled={deletingId === c.id}
                            onClick={() => handleDelete(c)}
                            title="Eliminar solicitud"
                          >
                            {deletingId === c.id ? '...' : '✕'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Modal / Vista de Detalle de Mensaje */}
      {selectedMessage && (
        <div
          className="modal d-block"
          tabIndex="-1"
          style={{ background: 'rgba(15, 27, 42, 0.65)' }}
          onClick={() => setSelectedMessage(null)}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            style={{ maxWidth: '560px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content rounded-4 border-0 p-3 p-md-4">
              <div className="modal-header border-0 pb-0">
                <div>
                  <span
                    className="badge rounded-pill mb-1 px-3 py-1 fw-bold text-uppercase"
                    style={{ background: '#e9ecef', color: '#495057', fontSize: '0.68rem' }}
                  >
                    SOLICITUD #{selectedMessage.id}
                  </span>
                  <h3 className="h5 fw-bold mb-0" style={{ color: 'var(--color-ink)' }}>
                    Detalle de la Solicitud
                  </h3>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Cerrar"
                  onClick={() => setSelectedMessage(null)}
                />
              </div>

              <div className="modal-body py-3">
                <div className="p-3 bg-light rounded-3 mb-3 small d-flex flex-column gap-1">
                  <div>
                    <strong>Fecha:</strong> {formatDate(selectedMessage.created_at)}
                  </div>
                  <div>
                    <strong>Destinatario:</strong> {selectedMessage.profile_name || `#${selectedMessage.profile}`}
                  </div>
                  <div>
                    <strong>Remitente:</strong> {selectedMessage.name} ({selectedMessage.email})
                  </div>
                </div>

                <div className="small fw-semibold text-muted mb-1 text-uppercase" style={{ letterSpacing: '0.05em' }}>
                  Contenido del Encargo / Mensaje:
                </div>
                <div
                  className="p-3 rounded-3"
                  style={{
                    background: '#f8f9fa',
                    border: '1px solid rgba(15, 27, 42, 0.08)',
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'inherit',
                    fontSize: '0.88rem',
                    lineHeight: 1.6,
                    maxHeight: '260px',
                    overflowY: 'auto',
                  }}
                >
                  {selectedMessage.message}
                </div>
              </div>

              <div className="modal-footer border-0 pt-0 justify-content-end">
                <button
                  type="button"
                  className="btn btn-dark rounded-pill px-4 fw-semibold"
                  onClick={() => setSelectedMessage(null)}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
