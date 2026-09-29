import { useState } from 'react';
import { Link } from 'react-router-dom';
import { register } from '../services/api';

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [status, setStatus] = useState('idle');

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('loading');

    try {
      await register(form);
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-4">
          <h2 className="text-center fw-bold mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
            Crear Cuenta
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
              disabled={status === 'loading'}
            >
              {status === 'loading' ? 'Creando...' : 'Crear cuenta'}
            </button>
          </form>

          {status === 'success' && (
            <div className="alert alert-success mt-3">
              Cuenta creada.{' '}
              <Link to="/login" style={{ color: 'var(--color-accent)' }}>
                Iniciá sesión
              </Link>
            </div>
          )}
          {status === 'error' && (
            <div className="alert alert-danger mt-3">Error al crear cuenta. Intentá de nuevo.</div>
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
