import { useState } from 'react';
import { motion } from 'framer-motion';
import { EnvelopeSimple, ShieldCheck } from '@phosphor-icons/react';
import './Login.css';

function nameFromEmail(email) {
  const local = email.split('@')[0];
  return local
    .replace(/[._-]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email || !email.includes('@')) {
      setError('Ingresa un correo valido');
      return;
    }

    const displayName = name.trim() || nameFromEmail(email);

    setLoading(true);
    setTimeout(() => {
      onLogin({
        email,
        name: displayName,
        role: isAdmin ? 'Super Admin' : 'Usuario',
        dept: 'General',
        avatar: displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
        isAdmin,
      });
    }, 800);
  };

  return (
    <div className="login-page">
      <div className="login-bg">
        <div className="grid-lines" />
        <div className="glow-orb orb-1" />
        <div className="glow-orb orb-2" />
      </div>

      <motion.div
        className="login-container"
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="login-header">
          <motion.div
            className="login-logo"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="logo-mark">
              <div className="logo-stripes">
                <span className="stripe stripe-yellow" />
                <span className="stripe stripe-blue" />
                <span className="stripe stripe-yellow" />
                <span className="stripe stripe-blue" />
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <h1 className="login-brand">
              <span className="brand-book">BOOK</span>
              <span className="brand-space">SPACE</span>
            </h1>
            <p className="login-tagline">Sistema de Reserva de Salas</p>
            <p className="login-institution">Universidad EAFIT &bull; Nodo</p>
          </motion.div>
        </div>

        <motion.form className="login-form" onSubmit={handleSubmit} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <div className="login-field">
            <label>Correo electronico *</label>
            <div className="input-with-icon">
              <EnvelopeSimple size={18} className="input-icon" />
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                placeholder="tu.correo@ejemplo.com"
                autoComplete="email"
                autoFocus
              />
            </div>
            <span className="field-hint">Las confirmaciones se enviaran a este correo</span>
          </div>

          <div className="login-field">
            <label>Nombre (opcional)</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Se genera automaticamente del correo"
              autoComplete="name"
            />
          </div>

          {/* Admin toggle */}
          <button
            type="button"
            className={`admin-toggle ${isAdmin ? 'active' : ''}`}
            onClick={() => setIsAdmin(v => !v)}
          >
            <ShieldCheck size={16} weight={isAdmin ? 'fill' : 'regular'} />
            <span>Acceder como administrador</span>
            <div className={`toggle-switch ${isAdmin ? 'on' : ''}`}>
              <div className="toggle-knob" />
            </div>
          </button>

          {error && (
            <motion.p className="login-error" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>{error}</motion.p>
          )}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? <span className="login-spinner" /> : 'Acceder'}
          </button>
        </motion.form>

        <motion.p
          className="login-note"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          No se requiere contraseña. Solo ingresa tu correo para comenzar.
        </motion.p>
      </motion.div>

      <motion.div className="login-footer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
        <div className="created-by">
          <span>Created by</span>
          <img src="/insignia-logo.png" alt="InsignIA" className="insignia-logo" />
        </div>
        <p>Automation Pro Max &bull; BECA IA SER ANDI &bull; Universidad EAFIT &ndash; Nodo</p>
      </motion.div>
    </div>
  );
}
