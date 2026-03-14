import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { CalendarPlus, Warning, CheckCircle, Users, Clock, Buildings, Eye, EyeSlash, ShieldCheck } from '@phosphor-icons/react';
import { ROOMS, TEAMS, getRoomsByCapacity } from '../data/rooms';
import { createReservation, getActiveReservations, getAvailableRooms } from '../store/reservations';
import { sendWebhook } from '../utils/webhookPayload';
import './ReservationForm.css';

const INITIAL = {
  title: '',
  organizer: '',
  team: '',
  date: '',
  startTime: '',
  endTime: '',
  attendees: '',
  roomId: '',
};

export default function ReservationForm({ onResult, user }) {
  const [form, setForm] = useState({
    ...INITIAL,
    organizer: user?.name || '',
    team: user?.dept || '',
  });
  const [errors, setErrors] = useState([]);
  const [success, setSuccess] = useState(null);
  const [pendingApproval, setPendingApproval] = useState(false);
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(true);

  const attendeesNum = parseInt(form.attendees) || 0;

  const suggestedRooms = useMemo(() => {
    if (attendeesNum < 1) return ROOMS;
    return getRoomsByCapacity(attendeesNum);
  }, [attendeesNum]);

  // Real-time availability
  const availableRoomIds = useMemo(() => {
    return new Set(getAvailableRooms(form.date, form.startTime, form.endTime));
  }, [form.date, form.startTime, form.endTime]);

  const roomAvailability = useMemo(() => {
    const avail = {};
    ROOMS.forEach(room => {
      avail[room.id] = availableRoomIds.has(room.id);
    });
    return avail;
  }, [availableRoomIds]);

  // Filtered rooms for display
  const displayRooms = useMemo(() => {
    if (!showOnlyAvailable) return ROOMS;
    if (!form.date || !form.startTime || !form.endTime) return ROOMS;
    return ROOMS.filter(r => availableRoomIds.has(r.id));
  }, [showOnlyAvailable, form.date, form.startTime, form.endTime, availableRoomIds]);

  function timeOverlaps(s1, e1, s2, e2) {
    const toMin = t => { const [h,m] = t.split(':').map(Number); return h*60+m; };
    return toMin(s1) < toMin(e2) && toMin(s2) < toMin(e1);
  }

  const handleChange = (field) => (e) => {
    const val = e.target.value;
    setForm(prev => ({ ...prev, [field]: val }));
    setErrors([]);
    setSuccess(null);
    setPendingApproval(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors([]);
    setSuccess(null);
    setPendingApproval(false);

    const data = { ...form, attendees: parseInt(form.attendees) || 0, email: user?.email || '' };
    const result = createReservation(data);

    // Send webhook to n8n for all outcomes
    sendWebhook(result.reservation);

    if (result.success) {
      if (result.needsApproval) {
        setPendingApproval(true);
      } else {
        setSuccess(result.reservation);
      }
      setForm({ ...INITIAL, organizer: user?.name || '', team: user?.dept || '' });
      onResult({ type: result.needsApproval ? 'pending' : 'success', reservation: result.reservation });
    } else {
      setErrors(result.validation.errors);
      onResult({ type: 'rejected', reservation: result.reservation, validation: result.validation });
    }
  };

  const hasTimeSlot = form.date && form.startTime && form.endTime;
  const availableCount = hasTimeSlot ? displayRooms.length : ROOMS.length;

  return (
    <div className="form-page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Nueva Reserva</h1>
          <p className="page-subtitle">Complete los datos para reservar un espacio</p>
        </div>
        <div className="header-badge">
          <CalendarPlus size={20} weight="fill" />
          <span>Tiempo real</span>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="reservation-form">
        <div className="form-grid">
          {/* Meeting info */}
          <div className="form-section">
            <h3 className="section-title">
              <Clock size={16} weight="bold" />
              Detalles de la reunión
            </h3>

            <div className="field">
              <label>Título de la reunión *</label>
              <input type="text" value={form.title} onChange={handleChange('title')} placeholder="Ej: Cierre mensual" />
            </div>

            <div className="field-row">
              <div className="field">
                <label>Organizador *</label>
                <input type="text" value={form.organizer} onChange={handleChange('organizer')} placeholder="Nombre completo" />
              </div>
              <div className="field">
                <label>Área / Equipo *</label>
                <select value={form.team} onChange={handleChange('team')}>
                  <option value="">Seleccionar...</option>
                  {TEAMS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div className="field-row">
              <div className="field">
                <label>Fecha *</label>
                <input type="date" value={form.date} onChange={handleChange('date')} min={new Date().toISOString().split('T')[0]} />
              </div>
              <div className="field">
                <label>Asistentes *</label>
                <input type="number" min="1" max="50" value={form.attendees} onChange={handleChange('attendees')} placeholder="# personas" />
              </div>
            </div>

            <div className="field-row">
              <div className="field">
                <label>Hora inicio *</label>
                <input type="time" value={form.startTime} onChange={handleChange('startTime')} />
              </div>
              <div className="field">
                <label>Hora fin *</label>
                <input type="time" value={form.endTime} onChange={handleChange('endTime')} />
              </div>
            </div>
          </div>

          {/* Room selection */}
          <div className="form-section">
            <h3 className="section-title">
              <Buildings size={16} weight="bold" />
              Selección de sala
              {attendeesNum > 0 && (
                <span className="attendee-badge">
                  <Users size={12} /> {attendeesNum} pers.
                </span>
              )}
            </h3>

            {/* Availability filter toggle */}
            <div className="room-filter-bar">
              <button
                type="button"
                className={`filter-toggle ${showOnlyAvailable ? 'active' : ''}`}
                onClick={() => setShowOnlyAvailable(v => !v)}
              >
                {showOnlyAvailable ? <Eye size={14} /> : <EyeSlash size={14} />}
                {showOnlyAvailable ? 'Solo disponibles' : 'Mostrar todas'}
              </button>
              {hasTimeSlot && (
                <span className="availability-count">
                  {availableCount} de {ROOMS.length} disponibles
                </span>
              )}
            </div>

            <div className="room-grid">
              {displayRooms.length === 0 && (
                <div className="no-rooms-msg">
                  <Warning size={20} />
                  <span>No hay salas disponibles para este horario. Prueba otro horario o muestra todas.</span>
                </div>
              )}
              {displayRooms.map(room => {
                const fits = attendeesNum === 0 || room.capacity >= attendeesNum;
                const available = roomAvailability[room.id] !== false;
                const isSelected = form.roomId === room.id;
                const optimal = fits && suggestedRooms[0]?.id === room.id;
                const needsApproval = room.capacity >= 25;

                return (
                  <motion.button
                    type="button"
                    key={room.id}
                    className={`room-card ${isSelected ? 'selected' : ''} ${!fits ? 'no-capacity' : ''} ${!available ? 'occupied' : ''}`}
                    onClick={() => {
                      if (fits && available) {
                        setForm(prev => ({ ...prev, roomId: room.id }));
                        setErrors([]);
                      }
                    }}
                    whileHover={fits && available ? { scale: 1.02 } : {}}
                    whileTap={fits && available ? { scale: 0.98 } : {}}
                  >
                    <div className="room-card-header">
                      <span className="room-id">{room.id}</span>
                      {optimal && <span className="optimal-badge">Óptima</span>}
                      {needsApproval && <span className="approval-req-badge">Req. aprob.</span>}
                      {!available && <span className="occupied-badge">Ocupada</span>}
                      {!fits && attendeesNum > 0 && <span className="nofit-badge">Cap. insuf.</span>}
                    </div>
                    <div className="room-card-name">{room.name}</div>
                    <div className="room-card-cap">
                      <Users size={14} />
                      <span>{room.capacity} personas</span>
                    </div>
                    <div className="room-card-floor">{room.floor}</div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Alerts */}
        {errors.length > 0 && (
          <motion.div className="form-alert error" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Warning size={20} weight="fill" />
            <div>{errors.map((e, i) => <p key={i}>{e}</p>)}</div>
          </motion.div>
        )}

        {pendingApproval && (
          <motion.div className="form-alert pending" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <ShieldCheck size={20} weight="fill" />
            <div>
              <p>Solicitud enviada. Esta sala requiere <strong>aprobación de un administrador</strong> (Human-in-the-Loop).</p>
              <p className="alert-detail">Recibirás confirmación cuando un administrador apruebe tu reserva.</p>
            </div>
          </motion.div>
        )}

        {success && (
          <motion.div className="form-alert success" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <CheckCircle size={20} weight="fill" />
            <div>
              <p>Reserva confirmada exitosamente.</p>
              <p className="alert-detail">Sala: {success.roomName} | Fecha: {success.date} | {success.startTime} - {success.endTime}</p>
            </div>
          </motion.div>
        )}

        <div className="form-actions">
          <button type="submit" className="btn-primary">
            <CalendarPlus size={18} weight="bold" />
            Reservar Sala
          </button>
          <button type="button" className="btn-secondary" onClick={() => { setForm({ ...INITIAL, organizer: user?.name || '', team: user?.dept || '' }); setErrors([]); setSuccess(null); setPendingApproval(false); }}>
            Limpiar
          </button>
        </div>
      </form>
    </div>
  );
}
