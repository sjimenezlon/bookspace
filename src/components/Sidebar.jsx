import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CalendarPlus, ChartBar, ClockCounterClockwise, Buildings, SignOut, ShieldCheck } from '@phosphor-icons/react';
import { getPendingReservations } from '../store/reservations';
import './Sidebar.css';

const USER_NAV = [
  { id: 'reserve', label: 'Nueva Reserva', icon: CalendarPlus },
  { id: 'dashboard', label: 'Dashboard', icon: ChartBar },
  { id: 'log', label: 'Historial', icon: ClockCounterClockwise },
  { id: 'map', label: 'Mapa de Salas', icon: Buildings },
];
const ADMIN_NAV = [
  { id: 'admin', label: 'Administración', icon: ShieldCheck },
  ...USER_NAV,
];

export default function Sidebar({ active, onChange, user, onLogout }) {
  const isAdmin = user?.isAdmin;
  const navItems = isAdmin ? ADMIN_NAV : USER_NAV;
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (isAdmin) getPendingReservations().then(p => setPendingCount(p.length));
  }, [isAdmin, active]);

  return (
    <>
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark">
            <div className="brand-stripes"><span className="bstripe bstripe-y" /><span className="bstripe bstripe-b" /><span className="bstripe bstripe-y" /><span className="bstripe bstripe-b" /></div>
            <div><span className="brand-r">BOOK</span><span className="brand-c">SPACE</span></div>
          </div>
          <span className="brand-sub">Universidad EAFIT &bull; Nodo</span>
        </div>
        <nav className="sidebar-nav">
          <span className="nav-label">{isAdmin ? 'Administrador' : 'Sistema'}</span>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = active === item.id;
            return (
              <button key={item.id} className={`nav-item ${isActive ? 'active' : ''}`} onClick={() => onChange(item.id)}>
                {isActive && <motion.div className="nav-active-bg" layoutId="activeNav" transition={{ type: 'spring', stiffness: 380, damping: 30 }} />}
                <Icon size={20} weight={isActive ? 'fill' : 'regular'} className="nav-icon" />
                <span>{item.label}</span>
                {item.id === 'admin' && pendingCount > 0 && <span className="nav-badge">{pendingCount}</span>}
              </button>
            );
          })}
        </nav>
        {user && (
          <div className="sidebar-user">
            <div className="user-avatar">{user.avatar}</div>
            <div className="user-info"><span className="user-name">{user.name}</span><span className="user-role">{user.role} &bull; {user.dept}{isAdmin && <span className="admin-indicator"> &bull; ADMIN</span>}</span></div>
            <button className="logout-btn" onClick={onLogout} title="Cerrar sesión"><SignOut size={16} /></button>
          </div>
        )}
        <div className="sidebar-created">
          <span>Created by</span>
          <img src="/insignia-logo.png" alt="InsignIA" className="sidebar-insignia" />
        </div>
        <div className="sidebar-footer"><div className="status-dot" /><span>Supabase conectado</span></div>
      </aside>
      <nav className="mobile-nav">
        {navItems.map(item => { const Icon = item.icon; return (
          <button key={item.id} className={`mobile-nav-item ${active === item.id ? 'active' : ''}`} onClick={() => onChange(item.id)}><Icon size={22} weight={active === item.id ? 'fill' : 'regular'} /><span>{item.label}</span></button>
        ); })}
      </nav>
    </>
  );
}
