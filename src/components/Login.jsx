import { useState } from 'react';
import { motion } from 'framer-motion';
import './Login.css';

const DEMO_USERS = [
  { email: 'ana.garcia@eafit.edu.co', name: 'Ana García', role: 'Coordinadora', dept: 'Contabilidad', avatar: 'AG', isAdmin: false },
  { email: 'carlos.mesa@eafit.edu.co', name: 'Carlos Mesa', role: 'Director', dept: 'Ingeniería', avatar: 'CM', isAdmin: false },
  { email: 'admin@eafit.edu.co', name: 'Administrador', role: 'Super Admin', dept: 'Tecnología', avatar: 'AD', isAdmin: true },
];

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Ingrese correo y contraseña');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const user = DEMO_USERS.find(u => u.email === email);
      if (user && password === 'eafit2026') {
        onLogin(user);
      } else if (email.includes('@') && password.length >= 4) {
        onLogin({
          email,
          name: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, c => c.toUpperCase()),
          role: 'Usuario',
          dept: 'General',
          avatar: email.slice(0, 2).toUpperCase(),
          isAdmin: false,
        });
      } else {
        setError('Credenciales incorrectas');
        setLoading(false);
      }
    }, 1200);
  };

  const handleQuickLogin = (user) => {
    setLoading(true);
    setTimeout(() => onLogin(user), 800);
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
            <label>Correo institucional</label>
            <input type="email" value={email} onChange={e => { setEmail(e.target.value); setError(''); }} placeholder="usuario@eafit.edu.co" autoComplete="email" />
          </div>
          <div className="login-field">
            <label>Contraseña</label>
            <input type="password" value={password} onChange={e => { setPassword(e.target.value); setError(''); }} placeholder="••••••••" autoComplete="current-password" />
          </div>

          {error && (
            <motion.p className="login-error" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>{error}</motion.p>
          )}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? <span className="login-spinner" /> : 'Iniciar sesión'}
          </button>
        </motion.form>

        <motion.div className="quick-access" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
          <p className="quick-label">Acceso rapido (demo)</p>
          <div className="quick-users">
            {DEMO_USERS.map(user => (
              <button key={user.email} className={`quick-user ${user.isAdmin ? 'admin-user' : ''}`} onClick={() => handleQuickLogin(user)} disabled={loading}>
                <span className="quick-avatar">{user.avatar}</span>
                <div className="quick-info">
                  <span className="quick-name">
                    {user.name}
                    {user.isAdmin && <span className="admin-tag">ADMIN</span>}
                  </span>
                  <span className="quick-role">{user.role} &bull; {user.dept}</span>
                </div>
              </button>
            ))}
          </div>
          <p className="quick-hint">Contraseña demo: <code>eafit2026</code></p>
        </motion.div>
      </motion.div>

      <motion.p className="login-footer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
        Automation Pro Max &bull; BECA IA SER ANDI &bull; Universidad EAFIT &ndash; Nodo
      </motion.p>
    </div>
  );
}
