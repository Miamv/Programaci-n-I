import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    const result = login(form);

    if (result.success) {
      setStatus('success');
      navigate(from, { replace: true });
    } else {
      setStatus('error');
      setErrorMessage(result.error || 'Credenciales incorrectas.');
    }
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-4">
          <h2 className="text-center fw-bold mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
            Iniciar Sesión
          </h2>

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
              disabled={status === 'loading'}
            >
              {status === 'loading' ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>

          {status === 'success' && (
            <div className="alert alert-success mt-3">Sesión iniciada correctamente.</div>
          )}
          {status === 'error' && (
            <div className="alert alert-danger mt-3">{errorMessage || 'Credenciales incorrectas.'}</div>
          )}

          <p className="text-center mt-4">
            ¿No tenés cuenta?{' '}
            <Link to="/registro" style={{ color: 'var(--color-accent)' }}>
              Registrate
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
