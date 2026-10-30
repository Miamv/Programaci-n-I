import { Navigate, Outlet, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

export default function AdminRoute() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5" style={{ minHeight: '60vh' }}>
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const role = (user?.role || '').toLowerCase();
  const isAdminOrOwner = role === 'admin' || role === 'owner';

  if (!isAdminOrOwner) {
    return (
      <div className="container py-5 my-md-5">
        <div
          className="mx-auto p-4 p-md-5 text-center"
          style={{
            maxWidth: '540px',
            background: '#fff',
            borderRadius: '24px',
            border: '1px solid rgba(15, 27, 42, 0.1)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <span
            className="badge rounded-pill mb-3 px-3 py-2 fw-bold"
            style={{ background: '#e03131', color: '#fff', fontSize: '0.75rem', letterSpacing: '0.1em' }}
          >
            403 · ACCESO DENEGADO
          </span>
          <h2 className="h4 fw-bold mb-3" style={{ color: 'var(--color-ink)' }}>
            No tenés permisos de administración
          </h2>
          <p className="text-muted small mb-4" style={{ lineHeight: 1.6 }}>
            Tu cuenta actual (<strong>{user.username}</strong>) está registrada con el rol de <strong>{role.toUpperCase()}</strong>.
            Esta sección de gestión de proyectos requiere rol de <strong>ADMINISTRADOR</strong> o <strong>PROPIETARIO</strong>.
          </p>
          <Link to="/" className="btn btn-dark rounded-pill px-4 py-2 fw-semibold">
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
