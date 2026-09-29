import { useState } from 'react';
import { sendContact } from '../services/api';

export default function ContactForm({ profileId }) {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('idle');

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('loading');
    try {
      await sendContact({ ...form, profile: profileId });
      setStatus('success');
      setForm({ name: '', email: '', message: '' });
    } catch {
      setStatus('error');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="vertice-contact-form">
      <div className="vertice-field">
        <label htmlFor="contact-name">Nombre</label>
        <input id="contact-name" type="text" name="name" value={form.name} onChange={handleChange} required />
      </div>
      <div className="vertice-field">
        <label htmlFor="contact-email">Email</label>
        <input id="contact-email" type="email" name="email" value={form.email} onChange={handleChange} required />
      </div>
      <div className="vertice-field vertice-field--full">
        <label htmlFor="contact-message">Mensaje</label>
        <textarea
          id="contact-message"
          name="message"
          rows="4"
          placeholder="Contanos cómo podemos asesorarte"
          value={form.message}
          onChange={handleChange}
          required
        />
      </div>
      <div className="vertice-contact-form__actions">
        <button type="submit" className="vertice-btn vertice-btn--dark" disabled={status === 'loading'}>
          {status === 'loading' ? 'Enviando…' : 'Enviar →'}
        </button>
      </div>
      {status === 'success' && <p className="vertice-form-feedback is-success">Mensaje enviado correctamente.</p>}
      {status === 'error' && <p className="vertice-form-feedback is-error">No se pudo enviar. Intentá nuevamente.</p>}
      {!profileId && <p className="vertice-form-hint">Se enviará al perfil principal del estudio.</p>}
    </form>
  );
}
