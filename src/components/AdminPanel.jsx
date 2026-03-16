import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, CheckCircle, XCircle, Clock, Warning, Users, Buildings, CalendarCheck, FileXls, FileCsv, DownloadSimple } from '@phosphor-icons/react';
import { getPendingReservations, getReservations, approveReservation, rejectReservationAdmin, getMetrics } from '../store/reservations';

import * as XLSX from 'xlsx';
import './AdminPanel.css';

function exportToExcel(data, filename) {
  const rows = data.map(r => ({ 'ID': r.id?.slice(0, 8).toUpperCase(), 'Estado': r.status, 'Título': r.title, 'Organizador': r.organizer, 'Email': r.email || '', 'Área/Equipo': r.team, 'Sala ID': r.roomId, 'Sala Nombre': r.roomName || '', 'Capacidad': r.roomCapacity || '', 'Fecha': r.date, 'Hora Inicio': r.startTime, 'Hora Fin': r.endTime, 'Asistentes': r.attendees, 'Motivo Rechazo': r.reason || '', 'Aprobada Por': r.approvedBy || '', 'Rechazada Por': r.rejectedBy || '', 'Fecha Creación': r.createdAt ? new Date(r.createdAt).toLocaleString('es-CO') : '' }));
  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = Array(17).fill({ wch: 18 });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Reservas');
  XLSX.writeFile(wb, filename);
}

export default function AdminPanel({ user, onRefresh }) {
  const [rejectId, setRejectId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showExport, setShowExport] = useState(false);
  const [pending, setPending] = useState([]);
  const [all, setAll] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    const [p, a, m] = await Promise.all([getPendingReservations(), getReservations(), getMetrics()]);
    setPending(p); setAll(a); setMetrics(m); setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleApprove = async (id) => {
    await approveReservation(id, user.name);
    await loadData();
    onRefresh();
  };

  const handleReject = async (id) => {
    if (rejectId === id && rejectReason.trim()) {
      await rejectReservationAdmin(id, user.name, rejectReason);
      setRejectId(null); setRejectReason('');
      await loadData();
      onRefresh();
    } else {
      setRejectId(id);
    }
  };

  const handleExport = (filter, type) => {
    const data = filter === 'all' ? all : all.filter(r => r.status === filter);
    const date = new Date().toISOString().split('T')[0];
    const fn = `bookspace_reservas_${filter}_${date}`;
    if (type === 'csv') {
      const ws = XLSX.utils.json_to_sheet(data.map(r => ({ ID: r.id?.slice(0,8), Estado: r.status, Titulo: r.title, Organizador: r.organizer, Sala: r.roomName, Fecha: r.date, Inicio: r.startTime, Fin: r.endTime, Asistentes: r.attendees })));
      const csv = XLSX.utils.sheet_to_csv(ws);
      const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = fn + '.csv'; a.click();
    } else {
      exportToExcel(data, fn + '.xlsx');
    }
    setShowExport(false);
  };

  if (loading) return <div style={{ padding: 48, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>Cargando panel admin...</div>;

  const recentActivity = [...all].slice(0, 10);

  return (
    <div className="admin-page">
      <header className="page-header">
        <div><h1 className="page-title">Panel de Administración</h1><p className="page-subtitle">Aprobaciones, control y supervisión (Supabase en vivo)</p></div>
        <div className="header-actions-row">
          <div className="export-wrapper">
            <button className="export-btn" onClick={() => setShowExport(v => !v)}><DownloadSimple size={16} weight="bold" /> Exportar datos</button>
            <AnimatePresence>{showExport && (
              <motion.div className="export-dropdown" initial={{ opacity: 0, y: -8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.95 }}>
                <p className="export-dropdown-title">Excel (.xlsx)</p>
                <button onClick={() => handleExport('all', 'xlsx')}><FileXls size={16} /> Todas las reservas</button>
                <button onClick={() => handleExport('confirmada', 'xlsx')}><FileXls size={16} /> Solo confirmadas</button>
                <button onClick={() => handleExport('pendiente', 'xlsx')}><FileXls size={16} /> Solo pendientes</button>
                <hr className="export-divider" />
                <p className="export-dropdown-title">CSV</p>
                <button onClick={() => handleExport('all', 'csv')}><FileCsv size={16} /> Todas (CSV)</button>
              </motion.div>
            )}</AnimatePresence>
          </div>
          <div className="admin-badge"><ShieldCheck size={18} weight="fill" /><span>Super Admin</span></div>
        </div>
      </header>

      <div className="admin-stats">
        <div className="admin-stat"><Clock size={20} style={{ color: 'var(--eafit-yellow)' }} /><div><span className="admin-stat-val">{metrics?.pending || 0}</span><span className="admin-stat-label">Pendientes</span></div></div>
        <div className="admin-stat"><CalendarCheck size={20} style={{ color: 'var(--green)' }} /><div><span className="admin-stat-val">{metrics?.active || 0}</span><span className="admin-stat-label">Confirmadas</span></div></div>
        <div className="admin-stat"><XCircle size={20} style={{ color: 'var(--red)' }} /><div><span className="admin-stat-val">{metrics?.rejected || 0}</span><span className="admin-stat-label">Rechazadas</span></div></div>
        <div className="admin-stat"><Users size={20} style={{ color: 'var(--eafit-blue-light)' }} /><div><span className="admin-stat-val">{metrics?.total || 0}</span><span className="admin-stat-label">Total</span></div></div>
      </div>

      <div className="admin-section">
        <h2 className="admin-section-title"><Clock size={18} weight="bold" /> Cola de aprobación {pending.length > 0 && <span className="pending-count">{pending.length}</span>}</h2>
        <p className="admin-section-desc">Salas de 25+ personas requieren aprobación manual (Human-in-the-Loop)</p>
        {pending.length === 0 ? (
          <div className="admin-empty"><CheckCircle size={40} weight="thin" /><p>No hay reservas pendientes de aprobación</p></div>
        ) : (
          <div className="approval-list">{pending.map((res, i) => (
            <motion.div key={res.id} className="approval-card" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <div className="approval-left">
                <div className="approval-status-icon"><Warning size={20} weight="fill" /></div>
                <div className="approval-info">
                  <div className="approval-title">{res.title}</div>
                  <div className="approval-meta"><span><Buildings size={13} /> {res.roomName || res.roomId}</span><span className="approval-sep">&bull;</span><span>{res.date}</span><span className="approval-sep">&bull;</span><span>{res.startTime} - {res.endTime}</span></div>
                  <div className="approval-detail"><span>Organizador: <strong>{res.organizer}</strong></span><span className="approval-sep">&bull;</span><span>{res.team}</span><span className="approval-sep">&bull;</span><span><Users size={12} /> {res.attendees} pers.</span></div>
                  <div className="approval-timestamp">Solicitada: {new Date(res.createdAt).toLocaleString('es-CO')}</div>
                </div>
              </div>
              <div className="approval-actions">
                <button className="approve-btn" onClick={() => handleApprove(res.id)}><CheckCircle size={16} weight="bold" /> Aprobar</button>
                <button className="reject-btn" onClick={() => handleReject(res.id)}><XCircle size={16} weight="bold" /> Rechazar</button>
              </div>
              {rejectId === res.id && (
                <motion.div className="reject-reason-box" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                  <input type="text" placeholder="Motivo del rechazo..." value={rejectReason} onChange={e => setRejectReason(e.target.value)} autoFocus />
                  <button className="reject-confirm-btn" onClick={() => handleReject(res.id)} disabled={!rejectReason.trim()}>Confirmar rechazo</button>
                </motion.div>
              )}
            </motion.div>
          ))}</div>
        )}
      </div>

      <div className="admin-section">
        <h2 className="admin-section-title"><CalendarCheck size={18} weight="bold" /> Actividad reciente</h2>
        <div className="activity-feed">{recentActivity.map(res => {
          const sc = { confirmada: { color: 'var(--green)', bg: 'var(--green-dim)' }, pendiente: { color: 'var(--eafit-yellow)', bg: 'var(--amber-glow)' }, rechazada: { color: 'var(--red)', bg: 'var(--red-dim)' }, cancelada: { color: 'var(--text-dim)', bg: 'rgba(61,80,112,0.15)' } }[res.status] || { color: 'var(--text-dim)', bg: 'transparent' };
          return (<div key={res.id} className="activity-item"><div className="activity-dot" style={{ background: sc.color }} /><div className="activity-content"><span className="activity-title">{res.title}</span><span className="activity-badge" style={{ background: sc.bg, color: sc.color }}>{res.status}</span></div><div className="activity-right"><span className="activity-user">{res.organizer}</span><span className="activity-time">{new Date(res.createdAt).toLocaleDateString('es-CO')}</span></div></div>);
        })}</div>
      </div>
    </div>
  );
}
