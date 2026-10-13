import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();
  const redirectTimer = useRef(null);

  useEffect(() => {
    return () => {
      if (redirectTimer.current) clearTimeout(redirectTimer.current);
    };
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    const result = register(form);

    if (result.success) {
      setStatus('success');
      setForm({ username: '', email: '', password: '' });
      // Muestra el mensaje de éxito y luego lleva al login (decisión UX acordada).
      redirectTimer.current = setTimeout(() => navigate('/login', { replace: true }), 1500);
    } else {
      setStatus('error');
      setErrorMessage(result.error || 'Error al crear cuenta. Intentá de nuevo.');
    }
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-4">
          <h2 className="text-center fw-bold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
            Crear Cuenta
          </h2>
          <p className="text-center text-muted mb-4" style={{ fontSize: '0.8rem' }}>
            Las cuentas nuevas se crean con rol <strong>Viewer</strong> (solo lectura). La administración se asigna internamente.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <input
                type="text"
                name="username"
                className="form-control"
                placeholder="Usuario"
                value={form.username}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <input
                type="email"
                name="email"
                className="form-control"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <input
                type="password"
                name="password"
                className="form-control"
                placeholder="Contraseña"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <button
              type="submit"
              className="btn text-white w-100 rounded-pill"
              style={{ backgroundColor: 'var(--color-primary)' }}
              disabled={status === 'loading' || status === 'success'}
            >
              {status === 'loading' ? 'Creando...' : 'Crear cuenta'}
            </button>
          </form>

          {status === 'success' && (
            <div className="alert alert-success mt-3">
              Cuenta creada con éxito.{' '}
              <Link to="/login" style={{ color: 'var(--color-accent)' }}>
                Iniciá sesión
              </Link>
            </div>
          )}
          {status === 'error' && (
            <div className="alert alert-danger mt-3">
              {errorMessage || 'Error al crear cuenta. Intentá de nuevo.'}
            </div>
          )}

          <p className="text-center mt-4">
            ¿Ya tenés cuenta?{' '}
            <Link to="/login" style={{ color: 'var(--color-accent)' }}>
              Iniciá sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
