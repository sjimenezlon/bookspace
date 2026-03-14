import { motion } from 'framer-motion';
import { CalendarPlus, ChartBar, ClockCounterClockwise, Buildings, List } from '@phosphor-icons/react';
import './Sidebar.css';

const NAV_ITEMS = [
  { id: 'reserve',  label: 'Nueva Reserva',  icon: CalendarPlus },
  { id: 'dashboard', label: 'Dashboard',      icon: ChartBar },
  { id: 'log',      label: 'Historial',       icon: ClockCounterClockwise },
  { id: 'map',      label: 'Mapa de Salas',   icon: Buildings },
];

export default function Sidebar({ active, onChange }) {
  return (
    <>
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark">
            <span className="brand-r">ROOM</span>
            <span className="brand-c">CONTROL</span>
          </div>
          <span className="brand-sub">Automation Pro Max</span>
        </div>

        <nav className="sidebar-nav">
          <span className="nav-label">Sistema</span>
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const isActive = active === item.id;
            return (
              <button
                key={item.id}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => onChange(item.id)}
              >
                {isActive && (
                  <motion.div
                    className="nav-active-bg"
                    layoutId="activeNav"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon size={20} weight={isActive ? 'fill' : 'regular'} className="nav-icon" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="status-dot" />
          <span>Sistema activo</span>
        </div>
      </aside>

      {/* Mobile nav */}
      <nav className="mobile-nav">
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              className={`mobile-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => onChange(item.id)}
            >
              <Icon size={22} weight={isActive ? 'fill' : 'regular'} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
