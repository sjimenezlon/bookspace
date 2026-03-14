import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, CheckCircle, XCircle, Clock, Warning, Users, Buildings, CalendarCheck } from '@phosphor-icons/react';
import { getPendingReservations, getReservations, approveReservation, rejectReservationAdmin, getMetrics } from '../store/reservations';
import './AdminPanel.css';

export default function AdminPanel({ user, onRefresh }) {
  const [rejectId, setRejectId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const pending = useMemo(() => getPendingReservations(), []);
  const all = useMemo(() => getReservations(), []);
  const metrics = useMemo(() => getMetrics(), []);

  const handleApprove = (id) => {
    approveReservation(id, user.name);
    onRefresh();
  };

  const handleReject = (id) => {
    if (rejectId === id && rejectReason.trim()) {
      rejectReservationAdmin(id, user.name, rejectReason);
      setRejectId(null);
      setRejectReason('');
      onRefresh();
    } else {
      setRejectId(id);
    }
  };

  const recentActivity = useMemo(() => {
    return [...all]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 8);
  }, [all]);

  return (
    <div className="admin-page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Panel de Administración</h1>
          <p className="page-subtitle">Aprobaciones, control y supervisión del sistema</p>
        </div>
        <div className="admin-badge">
          <ShieldCheck size={18} weight="fill" />
          <span>Super Admin</span>
        </div>
      </header>

      {/* Quick stats */}
      <div className="admin-stats">
        <div className="admin-stat">
          <Clock size={20} style={{ color: 'var(--eafit-yellow)' }} />
          <div>
            <span className="admin-stat-val">{metrics.pending}</span>
            <span className="admin-stat-label">Pendientes</span>
          </div>
        </div>
        <div className="admin-stat">
          <CalendarCheck size={20} style={{ color: 'var(--green)' }} />
          <div>
            <span className="admin-stat-val">{metrics.active}</span>
            <span className="admin-stat-label">Confirmadas</span>
          </div>
        </div>
        <div className="admin-stat">
          <XCircle size={20} style={{ color: 'var(--red)' }} />
          <div>
            <span className="admin-stat-val">{metrics.rejected}</span>
            <span className="admin-stat-label">Rechazadas</span>
          </div>
        </div>
        <div className="admin-stat">
          <Users size={20} style={{ color: 'var(--eafit-blue-light)' }} />
          <div>
            <span className="admin-stat-val">{metrics.total}</span>
            <span className="admin-stat-label">Total</span>
          </div>
        </div>
      </div>

      {/* Approval queue */}
      <div className="admin-section">
        <h2 className="admin-section-title">
          <Clock size={18} weight="bold" />
          Cola de aprobación
          {pending.length > 0 && <span className="pending-count">{pending.length}</span>}
        </h2>
        <p className="admin-section-desc">
          Salas de 25+ personas requieren aprobación manual (Human-in-the-Loop)
        </p>

        {pending.length === 0 ? (
          <div className="admin-empty">
            <CheckCircle size={40} weight="thin" />
            <p>No hay reservas pendientes de aprobación</p>
          </div>
        ) : (
          <div className="approval-list">
            <AnimatePresence>
              {pending.map((res, i) => (
                <motion.div
                  key={res.id}
                  className="approval-card"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div className="approval-left">
                    <div className="approval-status-icon">
                      <Warning size={20} weight="fill" />
                    </div>
                    <div className="approval-info">
                      <div className="approval-title">{res.title}</div>
                      <div className="approval-meta">
                        <span><Buildings size={13} /> {res.roomName || res.roomId}</span>
                        <span className="approval-sep">&bull;</span>
                        <span>{res.date}</span>
                        <span className="approval-sep">&bull;</span>
                        <span>{res.startTime} - {res.endTime}</span>
                      </div>
                      <div className="approval-detail">
                        <span>Organizador: <strong>{res.organizer}</strong></span>
                        <span className="approval-sep">&bull;</span>
                        <span>Equipo: {res.team}</span>
                        <span className="approval-sep">&bull;</span>
                        <span><Users size={12} /> {res.attendees} pers.</span>
                      </div>
                      <div className="approval-timestamp">
                        Solicitada: {new Date(res.createdAt).toLocaleString('es-CO')}
                      </div>
                    </div>
                  </div>

                  <div className="approval-actions">
                    <button className="approve-btn" onClick={() => handleApprove(res.id)}>
                      <CheckCircle size={16} weight="bold" />
                      Aprobar
                    </button>
                    <button className="reject-btn" onClick={() => handleReject(res.id)}>
                      <XCircle size={16} weight="bold" />
                      Rechazar
                    </button>
                  </div>

                  {rejectId === res.id && (
                    <motion.div
                      className="reject-reason-box"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                    >
                      <input
                        type="text"
                        placeholder="Motivo del rechazo..."
                        value={rejectReason}
                        onChange={e => setRejectReason(e.target.value)}
                        autoFocus
                      />
                      <button
                        className="reject-confirm-btn"
                        onClick={() => handleReject(res.id)}
                        disabled={!rejectReason.trim()}
                      >
                        Confirmar rechazo
                      </button>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Recent activity feed */}
      <div className="admin-section">
        <h2 className="admin-section-title">
          <CalendarCheck size={18} weight="bold" />
          Actividad reciente
        </h2>
        <div className="activity-feed">
          {recentActivity.map((res, i) => {
            const statusColors = {
              confirmada: { color: 'var(--green)', bg: 'var(--green-dim)' },
              pendiente: { color: 'var(--eafit-yellow)', bg: 'var(--amber-glow)' },
              rechazada: { color: 'var(--red)', bg: 'var(--red-dim)' },
              cancelada: { color: 'var(--text-dim)', bg: 'rgba(61,80,112,0.15)' },
            };
            const sc = statusColors[res.status] || statusColors.confirmada;
            return (
              <div key={res.id} className="activity-item">
                <div className="activity-dot" style={{ background: sc.color }} />
                <div className="activity-content">
                  <span className="activity-title">{res.title}</span>
                  <span className="activity-badge" style={{ background: sc.bg, color: sc.color }}>{res.status}</span>
                </div>
                <div className="activity-right">
                  <span className="activity-user">{res.organizer}</span>
                  <span className="activity-time">{new Date(res.createdAt).toLocaleDateString('es-CO')}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
