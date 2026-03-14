import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClockCounterClockwise, CheckCircle, XCircle, Prohibit, Trash, Funnel, HourglassMedium } from '@phosphor-icons/react';
import { getReservations, cancelReservation, clearAllReservations } from '../store/reservations';
import './ReservationLog.css';

const STATUS_CONFIG = {
  confirmada: { icon: CheckCircle, color: 'var(--green)', bg: 'var(--green-dim)', label: 'Confirmada' },
  pendiente: { icon: HourglassMedium, color: 'var(--eafit-yellow)', bg: 'var(--amber-glow)', label: 'Pendiente' },
  rechazada: { icon: XCircle, color: 'var(--red)', bg: 'var(--red-dim)', label: 'Rechazada' },
  cancelada: { icon: Prohibit, color: 'var(--text-dim)', bg: 'rgba(74,81,104,0.15)', label: 'Cancelada' },
};

export default function ReservationLog({ onRefresh }) {
  const [filter, setFilter] = useState('all');
  const reservations = useMemo(() => getReservations().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)), []);

  const filtered = filter === 'all' ? reservations : reservations.filter(r => r.status === filter);

  const handleCancel = (id) => {
    if (cancelReservation(id)) {
      onRefresh();
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Esto eliminara todo el historial de reservas. ¿Continuar?')) {
      clearAllReservations();
      onRefresh();
    }
  };

  return (
    <div className="log-page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Historial</h1>
          <p className="page-subtitle">Registro auditable de todas las reservas</p>
        </div>
        <button className="btn-danger-sm" onClick={handleClearAll}>
          <Trash size={14} />
          Limpiar todo
        </button>
      </header>

      <div className="log-filters">
        <Funnel size={16} />
        {['all', 'confirmada', 'pendiente', 'rechazada', 'cancelada'].map(f => (
          <button
            key={f}
            className={`filter-btn ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'Todas' : STATUS_CONFIG[f].label}
            <span className="filter-count">
              {f === 'all' ? reservations.length : reservations.filter(r => r.status === f).length}
            </span>
          </button>
        ))}
      </div>

      <div className="log-list">
        <AnimatePresence>
          {filtered.length === 0 ? (
            <motion.div className="log-empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <ClockCounterClockwise size={48} weight="thin" />
              <p>No hay reservas registradas</p>
            </motion.div>
          ) : (
            filtered.map((res, i) => {
              const cfg = STATUS_CONFIG[res.status] || STATUS_CONFIG.confirmada;
              const Icon = cfg.icon;
              return (
                <motion.div
                  key={res.id}
                  className="log-item"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <div className="log-status" style={{ background: cfg.bg }}>
                    <Icon size={18} weight="fill" style={{ color: cfg.color }} />
                  </div>

                  <div className="log-info">
                    <div className="log-title-row">
                      <span className="log-title">{res.title || 'Sin titulo'}</span>
                      <span className="log-badge" style={{ background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                    </div>
                    <div className="log-meta">
                      <span>{res.roomName || res.roomId}</span>
                      <span className="log-sep">|</span>
                      <span>{res.date}</span>
                      <span className="log-sep">|</span>
                      <span>{res.startTime} - {res.endTime}</span>
                      <span className="log-sep">|</span>
                      <span>{res.organizer}</span>
                      <span className="log-sep">|</span>
                      <span>{res.team}</span>
                      <span className="log-sep">|</span>
                      <span>{res.attendees} pers.</span>
                    </div>
                    {res.approvedBy && (
                      <div className="log-reason">Aprobada por: {res.approvedBy}</div>
                    )}
                    {res.rejectedBy && (
                      <div className="log-reason">Rechazada por: {res.rejectedBy}</div>
                    )}
                    {res.reason && (
                      <div className="log-reason">Motivo: {res.reason}</div>
                    )}
                    <div className="log-id">
                      ID: {res.id?.slice(0, 8).toUpperCase()} &bull; {new Date(res.createdAt).toLocaleString('es-CO')}
                    </div>
                  </div>

                  {res.status === 'confirmada' && (
                    <button className="cancel-btn" onClick={() => handleCancel(res.id)} title="Cancelar reserva">
                      <XCircle size={18} />
                    </button>
                  )}
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
